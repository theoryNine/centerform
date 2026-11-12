"use client";

import { Calendar, MapPin, Star } from "lucide-react";
import type { Venue, VenueEvent } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { useStickyNav } from "@/hooks/use-sticky-nav";
import { PageFrame } from "@/components/guest/primitives/page-frame";
import { PageTopBar, SlideDownNav } from "@/components/guest/primitives/page-top-bar";
import { Multiline } from "@/components/guest/primitives/multiline";

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
  heroImageUrl?: string | null;
}

export function VenueEventsPage({ venue, events, slug, pageDescription, heroImageUrl }: VenueEventsPageProps) {
  const { showStickyNav, headerRef } = useStickyNav();
  const venueName = venue.name;

  return (
    <PageFrame>
      {/* Sticky nav */}
      <SlideDownNav
        show={showStickyNav}
        backHref={`/${slug}`}
        backLabel={venueName}
        title={venueName}
        align="start"
      />

      {/* Main header area */}
      <div ref={headerRef}>
        <PageTopBar
          backHref={`/${slug}`}
          backLabel={venueName}
          title={venueName}
          titleHref={`/${slug}`}
          align="start"
        />

        <PageHero
          imageUrl={heroImageUrl ?? venue.cover_image_url}
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
            <Multiline text={pageDescription} />
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

                    {event.booking_url && (
                      <a
                        href={`/api/go?event=${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 rounded-default bg-primary px-3 py-1.5 text-label font-semibold text-primary-foreground no-underline"
                      >
                        Book Now →
                      </a>
                    )}
                  </div>

                  {event.image_url && (
                    <img loading="lazy" decoding="async"
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
    </PageFrame>
  );
}
