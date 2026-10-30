"use client";

import { useState, useCallback } from "react";
import type { NearbyPlace, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { SectionHeader } from "@/components/guest/primitives/section-header";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { NavCard } from "@/components/guest/primitives/nav-card";
import { useStickyScroll, StickyHeader } from "@/components/guest/primitives/sticky-header";
import { formatPrice } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Café",
};

function diningFooter(place: NearbyPlace) {
  const price = formatPrice(place.price_level);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="rounded-chip bg-secondary px-2.5 py-0.5 text-label font-medium capitalize text-muted-foreground">
        {CATEGORY_LABELS[place.category] ?? place.category}
      </span>
      {price && <span className="text-label text-muted-foreground">{price}</span>}
    </div>
  );
}

interface VenueDiningPageProps {
  venue: Venue;
  places: NearbyPlace[];
  slug: string;
  pageDescription?: string | null;
  heroImageUrl?: string | null;
}

export function VenueDiningPage({
  venue,
  places,
  slug,
  pageDescription,
  heroImageUrl,
}: VenueDiningPageProps) {
  const { scrolled, sentinelRef } = useStickyScroll();

  const totalWithImages = places.filter((p) => p.image_url).length;
  const [loadedCount, setLoadedCount] = useState(0);
  const allLoaded = loadedCount >= totalWithImages;
  const handleImageSettle = useCallback(() => setLoadedCount((n) => n + 1), []);

  const onSite = places.filter((p) => p.area === "on-site");
  const nearby = places.filter((p) => p.area !== "on-site");
  const hasBoth = onSite.length > 0 && nearby.length > 0;

  return (
    <div className="min-h-screen bg-background font-sans">
      <div ref={sentinelRef} className="h-0" />
      <StickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        backHref={`/${slug}`}
        nameHref={`/${slug}`}
      />

      <PageHero
        imageUrl={heroImageUrl ?? venue.cover_image_url}
        imageAlt={venue.name}
        fallbackNode={
          <div
            className="flex size-full items-center justify-center"
            style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A09680 100%)" }}
          >
            <span className="font-serif text-[40px] font-light text-white/50">
              {venue.name.charAt(0)}
            </span>
          </div>
        }
        title="Dining & Drinks"
        className="pt-8"
      />

      <div className="px-page pb-10 pt-2">
        {pageDescription && (
          <p className="mb-6 mt-2 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {pageDescription.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}

        {places.length === 0 ? (
          <div className="py-12 text-center text-body text-muted-foreground">
            No dining options listed yet.
          </div>
        ) : (
          <>
            {onSite.length > 0 && (
              <div>
                <SectionHeader number="01" title="At the Hotel" />
                <div className="flex flex-col gap-card-gap">
                  {onSite.map((p) => (
                    <NavCard
                      key={p.id}
                      label={p.name}
                      sublabel={p.tagline ?? ""}
                      href={`/${slug}/explore/place/${p.id}`}
                      imageUrl={p.image_url ?? undefined}
                      onSettle={p.image_url ? handleImageSettle : undefined}
                      footer={diningFooter(p)}
                    />
                  ))}
                </div>
              </div>
            )}

            {nearby.length > 0 && (
              <div>
                <SectionHeader
                  number={hasBoth ? "02" : "01"}
                  title="Nearby Recommendations"
                />
                <div className="flex flex-col gap-card-gap">
                  {nearby.map((p) => (
                    <NavCard
                      key={p.id}
                      label={p.name}
                      sublabel={p.tagline ?? ""}
                      href={`/${slug}/explore/place/${p.id}`}
                      imageUrl={p.image_url ?? undefined}
                      onSettle={p.image_url ? handleImageSettle : undefined}
                      footer={diningFooter(p)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-section">
          <VenueFooter venueName={venue.name} address={venue.address} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>

      {!allLoaded && <LoadingSpinner />}
    </div>
  );
}
