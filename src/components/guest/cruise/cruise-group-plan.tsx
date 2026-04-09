"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CruiseItineraryItem, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";

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
  const cardContent = (
    <>
      <div className="min-w-0 flex-1 py-3 pl-3 pr-2">
        <p className="m-0 font-serif text-card-title-lg font-bold text-foreground">
          {item.title}
        </p>
        {item.location && (
          <p className="m-0 mt-0.5 text-label font-medium uppercase tracking-wide text-primary">
            {item.location}
          </p>
        )}
        {item.card_description && (
          <p className="m-0 mt-1 text-body-sm leading-snug text-muted-foreground line-clamp-2">
            {item.card_description}
          </p>
        )}
      </div>
      <ArrowRight size={15} className="mr-3 shrink-0 text-primary" />
    </>
  );

  return (
    <div className="pb-3">
      {item.time_label && (
        <p className="m-0 mb-2 relative z-10 bg-background text-body-sm font-semibold text-foreground">
          {item.time_label}
        </p>
      )}
      <div className="relative pl-[60px]">
        <div className="absolute left-[26px] top-[10px] z-10 h-2 w-2 rounded-full bg-muted-foreground/60" />
        <div className="absolute left-[34px] top-[13px] h-px w-[26px] bg-muted-foreground/25" />
        <Link
          href={
            item.restaurant_id
              ? `/${slug}/food-onboard/${item.restaurant_id}`
              : `/${slug}/group-plan/${item.id}`
          }
          className="card-shadow flex flex-1 items-center gap-3 overflow-hidden rounded-default bg-card no-underline"
        >
          {cardContent}
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

interface CruiseGroupPlanPageProps {
  venue: Venue;
  items: CruiseItineraryItem[];
  slug: string;
  pageDescription?: string | null;
  heroImageUrl?: string | null;
}

export function CruiseGroupPlanPage({ venue, items, slug, pageDescription, heroImageUrl }: CruiseGroupPlanPageProps) {
  const dayGroups = groupByDay(items);
  const hasDays = dayGroups.length > 0;

  const [activeDay, setActiveDay] = useState<string>(dayGroups[0]?.id ?? "");
  const [showStickyNav, setShowStickyNav] = useState(false);

  const mainHeaderRef = useRef<HTMLDivElement>(null);
  const stickyNavRef = useRef<HTMLDivElement>(null);
  const pillContainerRef = useRef<HTMLDivElement>(null);
  const stickyPillContainerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const stickyPillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Prevent scroll-spy from fighting a programmatic scroll-to
  const isScrollingTo = useRef(false);

  // Show sticky nav when main header scrolls out of view
  useEffect(() => {
    const handleScroll = () => {
      if (mainHeaderRef.current) {
        const rect = mainHeaderRef.current.getBoundingClientRect();
        setShowStickyNav(rect.bottom <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll active pill into view whenever activeDay changes (both pill rows)
  useEffect(() => {
    for (const [containerRef, refs] of [
      [pillContainerRef, pillRefs] as const,
      [stickyPillContainerRef, stickyPillRefs] as const,
    ]) {
      const container = containerRef.current;
      const pill = refs.current[activeDay];
      if (!container || !pill) continue;
      const targetScroll = pill.offsetLeft - container.clientWidth / 2 + pill.offsetWidth / 2;
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  }, [activeDay]);

  // Scroll-spy: update active pill as sections enter the viewport
  useEffect(() => {
    if (!hasDays) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return;
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

  const scrollToDay = useCallback((groupId: string) => {
    setActiveDay(groupId);
    const section = sectionRefs.current[groupId];
    if (!section) return;

    isScrollingTo.current = true;
    const stickyHeight = stickyNavRef.current?.offsetHeight ?? 90;
    const top = section.getBoundingClientRect().top + window.scrollY - stickyHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });

    setTimeout(() => {
      isScrollingTo.current = false;
    }, 900);
  }, []);

  const pillRow = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    refs: React.RefObject<Record<string, HTMLButtonElement | null>>,
  ) =>
    hasDays ? (
      <div ref={containerRef} className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-none">
        {dayGroups.map((group) => (
          <button
            key={group.id}
            ref={(el) => {
              refs.current[group.id] = el;
            }}
            onClick={() => scrollToDay(group.id)}
            className={`shrink-0 cursor-pointer whitespace-nowrap rounded-chip border-none px-4 py-2 text-body-sm font-medium transition-all duration-200 ease-out ${
              activeDay === group.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sticky nav — slides in when main header scrolls out of view */}
      <div
        ref={stickyNavRef}
        className="fixed inset-x-0 top-0 z-50 bg-background transition-transform duration-300 ease-out"
        style={{ transform: showStickyNav ? "translateY(0)" : "translateY(-100%)" }}
      >
        <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="relative flex items-center px-5 py-3">
            <Link href={`/${slug}`} className="shrink-0 text-primary no-underline">
              <ArrowLeft size={20} />
            </Link>
            <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
              <span className="font-serif text-[20px] font-normal text-foreground">{venue.name}</span>
            </div>
            <div className="w-5 shrink-0" />
          </div>
          {pillRow(stickyPillContainerRef, stickyPillRefs)}
          <div className="h-px bg-border" />
        </div>
      </div>

      {/* Main header (scrolls with page) */}
      <div ref={mainHeaderRef}>
        <div
          className="relative flex items-center px-5"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
            paddingBottom: 12,
          }}
        >
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

        {/* Hero */}
        <PageHero
          imageUrl={heroImageUrl ?? venue.cover_image_url}
          imageAlt={venue.name}
          fallbackNode={
            <div
              className="flex size-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 40%, #2980B9 70%, #1A3A5C 100%)",
              }}
            >
              <span className="font-serif text-[40px] font-light text-white/50">
                {venue.name.charAt(0)}
              </span>
            </div>
          }
          title="Group Plan"
          className="pt-8"
        />

        {pageDescription && (
          <p className="mb-0 px-page pt-5 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {pageDescription.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}

        {/* Day pills (inline) */}
        <div className="pt-5 pb-1">{pillRow(pillContainerRef, pillRefs)}</div>
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
                      style={{ left: "30px" }}
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
              style={{ left: "30px" }}
            />
            <div className="flex flex-col">
              {items.map((item) => (
                <TimelineItem key={item.id} item={item} slug={slug} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.ship_name} phone={venue.phone} />
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
