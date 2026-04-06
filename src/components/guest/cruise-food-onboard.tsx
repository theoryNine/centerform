"use client";

import { useStickyScroll, StickyHeader } from "@/components/guest/sticky-header";
import { NavCard } from "@/components/guest/nav-card";
import type { CruiseRestaurant, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";
import { PageHero } from "@/components/guest/page-hero";

function formatPrice(priceLevel: number | null): string | null {
  if (priceLevel === 0) return "FREE";
  if (!priceLevel) return null;
  return "$".repeat(priceLevel);
}

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

  const sitDown = restaurants.filter((r) => r.restaurant_type === "sit_down");
  const walkUp = restaurants.filter((r) => r.restaurant_type === "walk_up");

  const SectionHeader = ({ number, title }: { number: string; title: string }) => (
    <div className="pb-2 pt-6">
      <div className="flex items-baseline gap-2">
        <span className="text-section-number font-medium text-primary">{number}</span>
        <span className="text-section-number text-foreground">·</span>
        <h2 className="m-0 font-serif text-section-heading font-normal text-foreground">{title}</h2>
      </div>
      <div className="-ml-page mt-2 h-px w-[calc(60%+var(--cf-page-padding))] bg-primary" />
    </div>
  );

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
            {pageDescription}
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
    </div>
  );
}
