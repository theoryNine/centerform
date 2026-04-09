"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStickyScroll, StickyHeader } from "@/components/guest/primitives/sticky-header";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import type { NearbyPlace, VenueWithTheme } from "@/types";

function placeHref(slug: string, place: NearbyPlace): string {
  return place.collection_id
    ? `/${slug}/explore/${place.collection_id}`
    : `/${slug}/explore/place/${place.id}`;
}

interface AreaListingPageProps {
  slug: string;
  venue: VenueWithTheme;
  area: string;
  places: NearbyPlace[];
}

export function AreaListingPage({ slug, venue, area, places }: AreaListingPageProps) {
  const { scrolled, sentinelRef } = useStickyScroll();

  const heading = area.toLowerCase().startsWith("beyond") ? area : `In ${area}`;

  return (
    <div className="min-h-screen bg-background font-sans">
      <div ref={sentinelRef} className="h-0" />
      <StickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        backHref={`/${slug}/explore`}
        nameHref={`/${slug}`}
      />

      <div className="px-page pb-10 pt-6">
        {/* Section heading */}
        <div className="mb-6">
          <h1 className="m-0 font-serif text-page-title font-semibold text-foreground">{heading}</h1>
          <div className="-ml-page mt-2 h-0.5 w-[calc(60%+var(--cf-page-padding))] bg-primary" />
        </div>

        {/* Full place list */}
        <div className="flex flex-col gap-card-gap">
          {places.map((place) => (
            <Link
              key={place.id}
              href={placeHref(slug, place)}
              className="card-shadow flex items-center gap-4 overflow-hidden rounded-default bg-card no-underline"
            >
              <div className="h-[80px] w-[80px] shrink-0 overflow-hidden">
                {place.image_url ? (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="size-full"
                    style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)" }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 py-3 pr-1">
                <p className="m-0 text-body-sm font-semibold leading-tight text-foreground">
                  {place.name}
                </p>
                {place.description && (
                  <p className="m-0 mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-2">
                    {place.description}
                  </p>
                )}
              </div>
              <ArrowRight size={16} className="mr-4 shrink-0 text-primary" />
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.address} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
