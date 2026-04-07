"use client";

import { useState, useCallback } from "react";
import { useStickyScroll, StickyHeader } from "@/components/guest/primitives/sticky-header";
import { NavCard } from "@/components/guest/primitives/nav-card";
import type { CruiseRestaurant, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { SectionHeader } from "@/components/guest/primitives/section-header";
import { formatPrice } from "@/lib/utils";

function restaurantSubLabel(r: CruiseRestaurant): string {
  return [
    r.cuisine_type ?? null,
    r.deck ? `Deck ${r.deck}` : null,
    formatPrice(r.price_level),
  ]
    .filter(Boolean)
    .join(" · ");
}

interface CruiseFoodOnboardPageProps {
  venue: Venue;
  restaurants: CruiseRestaurant[];
  slug: string;
  pageDescription?: string | null;
  heroImageUrl?: string | null;
}

export function CruiseFoodOnboardPage({ venue, restaurants, slug, pageDescription, heroImageUrl }: CruiseFoodOnboardPageProps) {
  const { scrolled, sentinelRef } = useStickyScroll();

  const totalWithImages = restaurants.filter((r) => r.image_url).length;
  const [loadedCount, setLoadedCount] = useState(0);
  const allLoaded = loadedCount >= totalWithImages;

  const handleImageSettle = useCallback(() => {
    setLoadedCount((n) => n + 1);
  }, []);

  const sitDown = restaurants.filter((r) => r.restaurant_type === "sit_down");
  const walkUp = restaurants.filter((r) => r.restaurant_type === "walk_up");

  return (
    <div className="min-h-screen bg-background font-sans">
      <div ref={sentinelRef} className="h-0" />
      <StickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        backHref={`/${slug}`}
        nameHref={`/${slug}`}
      />

      {/* Mini-hero */}
      <PageHero
        imageUrl={heroImageUrl ?? venue.cover_image_url}
        imageAlt={venue.name}
        fallbackNode={
          <div
            className="size-full"
            style={{ background: "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 50%, #2980B9 100%)" }}
          />
        }
        title="Food Onboard"
        className="pt-8"
      />

      {/* Content */}
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
        {restaurants.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-muted-foreground">
            Dining information coming soon.
          </div>
        ) : (
          <>
            {sitDown.length > 0 && (
              <div>
                <SectionHeader number="01" title="Sit Down Restaurants" />
                <div className="flex flex-col gap-card-gap">
                  {sitDown.map((r) => (
                    <NavCard
                      key={r.id}
                      label={r.name}
                      sublabel={restaurantSubLabel(r)}
                      href={`/${slug}/food-onboard/${r.id}`}
                      imageUrl={r.image_url ?? undefined}
                      onSettle={r.image_url ? handleImageSettle : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {walkUp.length > 0 && (
              <div>
                <SectionHeader
                  number={sitDown.length > 0 ? "02" : "01"}
                  title="Walk Up Eateries"
                />
                <div className="flex flex-col gap-card-gap">
                  {walkUp.map((r) => (
                    <NavCard
                      key={r.id}
                      label={r.name}
                      sublabel={restaurantSubLabel(r)}
                      href={`/${slug}/food-onboard/${r.id}`}
                      imageUrl={r.image_url ?? undefined}
                      onSettle={r.image_url ? handleImageSettle : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.ship_name} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>

      {!allLoaded && <LoadingSpinner />}
    </div>
  );
}
