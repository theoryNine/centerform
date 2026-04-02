"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CruiseItineraryItem, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";

// ─── Day grouping ────────────────────────────────────────────────────────────

interface DayGroup {
  id: string;
  label: string;
  header: CruiseItineraryItem;
  items: CruiseItineraryItem[];
}

function getOrdinal(n: number): string {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatPillLabel(title: string): string {
  // "SAT NOV 11" → "Sat 11th"
  const parts = title.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].charAt(0) + parts[0].slice(1).toLowerCase();
    const num = parseInt(parts[2]);
    if (!isNaN(num)) return `${day} ${num}${getOrdinal(num)}`;
  }
  return title;
}

function groupByDay(items: CruiseItineraryItem[]): DayGroup[] {
  const groups: DayGroup[] = [];
  let current: DayGroup | null = null;

  for (const item of items) {
    if (item.is_start) {
      current = {
        id: item.id,
        label: formatPillLabel(item.title),
        header: item,
        items: [],
      };
      groups.push(current);
    } else if (current) {
      current.items.push(item);
    }
  }

  return groups;
}

// ─── Day header ──────────────────────────────────────────────────────────────

function DayHeader({ group }: { group: DayGroup }) {
  return (
    <div className="mb-5">
      {group.header.location && (
        <p className="m-0 text-label font-semibold uppercase tracking-[var(--cf-text-label-spacing)] text-primary">
          {group.header.location}
        </p>
      )}
      <h2 className="m-0 mt-0.5 font-serif text-card-title-lg font-normal text-foreground">
        {group.header.title
          .split(/\s+/)
          .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
          .join(" ")}
      </h2>
      <div className="-ml-page mt-2 h-px w-[calc(50%+var(--cf-page-padding))] bg-primary/30" />
    </div>
  );
}

// ─── Timeline items ──────────────────────────────────────────────────────────

function TimelineItem({ item, slug }: { item: CruiseItineraryItem; slug: string }) {
  // END marker (is_start items are handled as day headers, not rendered here)
  if (item.is_end) {
    return (
      <div className="pb-4">
        {item.time_label && (
          <p className="m-0 mb-1.5 relative z-10 bg-background text-label font-semibold text-foreground">
            {item.time_label}
          </p>
        )}
        <div className="flex items-center gap-2">
          <div className="relative z-10 h-3 w-3 shrink-0 rounded-full bg-primary" />
          <p className="m-0 text-label font-semibold tracking-widest text-primary">
            END · {item.title.toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      {item.image_url && (
        <div className="h-[80px] w-[80px] shrink-0 overflow-hidden">
          <img src={item.image_url} alt={item.title} className="size-full object-cover" />
        </div>
      )}
      <div className={`min-w-0 flex-1 py-3 pl-3 ${item.restaurant_id ? "pr-2" : "pr-3"}`}>
        <p className="m-0 font-serif text-cta-button font-semibold leading-tight text-foreground">
          {item.title}
        </p>
        {item.location && (
          <p className="m-0 mt-0.5 text-label font-medium uppercase tracking-wide text-primary">
            {item.location}
          </p>
        )}
        {item.description && (
          <p className="m-0 mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
      {item.restaurant_id && <ArrowRight size={15} className="mr-3 shrink-0 text-primary" />}
    </>
  );

  return (
    <div className="pb-3">
      {item.time_label && (
        <p className="m-0 mb-2 relative z-10 bg-background text-label font-semibold text-foreground">
          {item.time_label}
        </p>
      )}
      <div className="flex items-start gap-3">
        <div className="relative z-10 mt-[10px] ml-[2px] h-2 w-2 shrink-0 rounded-full bg-muted-foreground/60" />
        {item.restaurant_id ? (
          <Link
            href={`/${slug}/food-onboard/${item.restaurant_id}`}
            className="card-shadow flex flex-1 items-center gap-3 overflow-hidden rounded-default bg-card no-underline"
          >
            {cardContent}
          </Link>
        ) : (
          <div className="card-shadow flex flex-1 items-center gap-3 overflow-hidden rounded-default bg-card">
            {cardContent}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

interface CruiseGroupPlanPageProps {
  venue: Venue;
  items: CruiseItineraryItem[];
  slug: string;
}

export function CruiseGroupPlanPage({ venue, items, slug }: CruiseGroupPlanPageProps) {
  const dayGroups = groupByDay(items);
  const hasDays = dayGroups.length > 0;

  const [activeDay, setActiveDay] = useState<string>(dayGroups[0]?.id ?? "");
  const [scrolled, setScrolled] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const pillContainerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const headerRef = useRef<HTMLDivElement>(null);
  // Prevent scroll-spy from fighting a programmatic scroll-to
  const isScrollingTo = useRef(false);

  // Border on scroll past header
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll active pill into view whenever activeDay changes
  useEffect(() => {
    const container = pillContainerRef.current;
    const pill = pillRefs.current[activeDay];
    if (!container || !pill) return;
    const targetScroll = pill.offsetLeft - container.clientWidth / 2 + pill.offsetWidth / 2;
    container.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [activeDay]);

  // Scroll-spy: update active pill as sections enter the viewport
  useEffect(() => {
    if (!hasDays) return;

    // Fire when the top of a section enters the top ~40% of the visible area
    // (accounting for the sticky header via rootMargin)
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return;
        // Find the topmost intersecting section
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting.length > 0) {
          const id = (intersecting[0].target as HTMLElement).dataset.dayId;
          if (id) setActiveDay(id);
        }
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 },
    );

    dayGroups.forEach((group) => {
      const el = sectionRefs.current[group.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [hasDays, dayGroups]);

  const scrollToDay = useCallback(
    (groupId: string) => {
      setActiveDay(groupId);
      const section = sectionRefs.current[groupId];
      if (!section) return;

      isScrollingTo.current = true;
      const headerHeight = headerRef.current?.offsetHeight ?? 90;
      const top = section.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: "smooth" });

      // Re-enable scroll-spy after scroll settles
      setTimeout(() => {
        isScrollingTo.current = false;
      }, 900);
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div ref={sentinelRef} className="h-0" />

      {/* Sticky header — venue name + day pills together */}
      <div ref={headerRef} className="sticky top-0 z-30" style={{ backgroundColor: "var(--background)" }}>
        <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          {/* Venue name row */}
          <div className="relative flex items-center px-5 py-2">
            <Link href={`/${slug}`} className="shrink-0 text-primary no-underline">
              <ArrowLeft size={20} />
            </Link>
            <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
              <Link
                href={`/${slug}`}
                className="pointer-events-auto font-serif text-[20px] font-normal text-foreground no-underline"
              >
                {venue.name}
              </Link>
            </div>
            <div className="w-5 shrink-0" />
          </div>

          {/* Day pills */}
          {hasDays && (
            <div
              ref={pillContainerRef}
              className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-none"
            >
              {dayGroups.map((group) => (
                <button
                  key={group.id}
                  ref={(el) => {
                    pillRefs.current[group.id] = el;
                  }}
                  onClick={() => scrollToDay(group.id)}
                  className={`shrink-0 cursor-pointer whitespace-nowrap rounded-chip border-none px-4 py-2 text-description font-medium transition-all duration-200 ease-out ${
                    activeDay === group.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          )}

          {/* Border */}
          <div
            className={`h-px transition-colors duration-200 ${scrolled ? "bg-border" : "bg-transparent"}`}
          />
        </div>
      </div>

      {/* Content — all days on one page */}
      <div className="px-page pb-10 pt-5">
        {items.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-muted-foreground">
            Itinerary coming soon.
          </div>
        ) : hasDays ? (
          <div className="flex flex-col gap-10">
            {dayGroups.map((group) => (
              <div
                key={group.id}
                ref={(el) => {
                  sectionRefs.current[group.id] = el;
                }}
                data-day-id={group.id}
              >
                <DayHeader group={group} />

                {group.items.length === 0 ? (
                  <p className="py-6 text-center text-[14px] text-muted-foreground">
                    Nothing scheduled — enjoy the day.
                  </p>
                ) : (
                  <div className="relative">
                    {/* Vertical line */}
                    <div
                      className="absolute top-3 bottom-3 w-px bg-muted-foreground/25"
                      style={{ left: "6px" }}
                    />
                    <div className="flex flex-col">
                      {group.items.map((item) => (
                        <TimelineItem key={item.id} item={item} slug={slug} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Fallback: flat timeline (no is_start grouping in data) */
          <div className="relative">
            <div
              className="absolute top-3 bottom-3 w-px bg-muted-foreground/25"
              style={{ left: "6px" }}
            />
            <div className="flex flex-col">
              {items.map((item) => (
                <TimelineItem key={item.id} item={item} slug={slug} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.address} phone={venue.phone} />
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
