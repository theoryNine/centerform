"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";
import type { Venue, VenueEvent } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { useStickyNav } from "@/hooks/use-sticky-nav";

function formatEventDate(startTime: string, endTime: string | null): string {
  const start = new Date(startTime);
  const date = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formatTime = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    const suffix = h >= 12 ? "pm" : "am";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return m === 0 ? `${hour}${suffix}` : `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
  };
  const timeStr = endTime
    ? `${formatTime(start)}–${formatTime(new Date(endTime))}`
    : formatTime(start);
  return `${date} · ${timeStr}`;
}

interface VenueEventsPageProps {
  venue: Venue;
  events: VenueEvent[];
  slug: string;
  pageDescription?: string | null;
}

export function VenueEventsPage({ venue, events, slug, pageDescription }: VenueEventsPageProps) {
  const { showStickyNav, headerRef } = useStickyNav();
  const venueName = venue.name;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sticky nav */}
      <div
        className="fixed inset-x-0 top-0 z-50 bg-background transition-transform duration-300 ease-out"
        style={{
          transform: showStickyNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="flex items-center px-5 py-3">
            <Link href={`/${slug}`} className="mr-3 flex items-center text-primary no-underline">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-serif text-base font-normal text-foreground">{venueName}</span>
          </div>
          <div className="h-px bg-border" />
        </div>
      </div>

      {/* Main header area */}
      <div ref={headerRef}>
        <div
          className="flex items-center px-5"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: 12 }}
        >
          <Link href={`/${slug}`} className="mr-3 flex items-center text-primary no-underline">
            <ArrowLeft size={20} />
          </Link>
          <Link
            href={`/${slug}`}
            className="font-serif text-base font-normal text-foreground no-underline"
          >
            {venueName}
          </Link>
        </div>

        <PageHero
          imageUrl={venue.cover_image_url}
          imageAlt={venueName}
          fallbackNode={
            <div
              className="flex size-full items-center justify-center"
              style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A09680 100%)" }}
            >
              <span className="font-serif text-[40px] font-light text-white/50">
                {venueName.charAt(0)}
              </span>
            </div>
          }
          title="Events & Activities"
          className="pt-8"
        />
      </div>

      {/* Content */}
      <div className="px-page pb-10 pt-6">
        {pageDescription && (
          <p className="mb-6 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {pageDescription.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}

        {events.length === 0 ? (
          <p className="py-12 text-center text-body text-muted-foreground">
            No upcoming events at the moment.
          </p>
        ) : (
          <div className="flex flex-col gap-card-gap">
            {events.map((event) => (
              <div key={event.id} className="card-shadow rounded-default bg-card p-card">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="m-0 font-serif text-[15px] font-medium leading-snug text-foreground">
                        {event.title}
                      </p>
                      {event.is_featured && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-chip bg-primary px-2.5 py-0.5 text-label font-semibold text-primary-foreground">
                          <Star size={10} />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-1.5 text-label text-muted-foreground">
                        <Calendar size={12} className="shrink-0" />
                        {formatEventDate(event.start_time, event.end_time)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1.5 text-label text-muted-foreground">
                          <MapPin size={12} className="shrink-0" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="mb-0 mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="size-16 shrink-0 rounded-[4px] object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-section">
          <VenueFooter venueName={venueName} address={venue.address} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
