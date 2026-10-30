"use client";

import { useStickyScroll, StickyHeader } from "@/components/guest/primitives/sticky-header";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { NavCard } from "@/components/guest/primitives/nav-card";
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
            <NavCard
              key={place.id}
              label={place.name}
              sublabel={place.description ?? ""}
              href={placeHref(slug, place)}
              imageUrl={place.image_url ?? undefined}
            />
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
