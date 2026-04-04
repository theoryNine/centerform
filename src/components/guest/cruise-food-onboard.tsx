"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStickyScroll, StickyHeader } from "@/components/guest/sticky-header";
import type { CruiseRestaurant, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";
import { PageHero } from "@/components/guest/page-hero";

function formatPrice(priceLevel: number | null): string | null {
  if (priceLevel === 0) return "FREE";
  if (!priceLevel) return null;
  return "$".repeat(priceLevel);
}

function RestaurantRow({ restaurant, slug }: { restaurant: CruiseRestaurant; slug: string }) {
  const metaParts = [
    restaurant.cuisine_type ?? null,
    restaurant.deck ? `Deck ${restaurant.deck}` : null,
    formatPrice(restaurant.price_level),
  ].filter(Boolean);

  return (
    <Link
      href={`/${slug}/food-onboard/${restaurant.id}`}
      className="card-shadow flex items-center gap-3 overflow-hidden rounded-default bg-card no-underline"
    >
      {/* Thumbnail */}
      <div className="h-[72px] w-[25%] shrink-0 overflow-hidden">
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="size-full object-cover"
          />
        ) : (
          <div
            className="size-full"
            style={{
              background: "linear-gradient(135deg, #0E3A5C 0%, #2980B9 100%)",
            }}
          />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 py-3">
        <p className="m-0 font-serif text-card-title-sm font-semibold leading-tight text-foreground">
          {restaurant.name}
        </p>
        {metaParts.length > 0 && (
          <p className="m-0 mt-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}
      </div>

      <ArrowRight size={16} className="mr-4 shrink-0 text-primary" />
    </Link>
  );
}

interface CruiseFoodOnboardPageProps {
  venue: Venue;
  restaurants: CruiseRestaurant[];
  slug: string;
}

export function CruiseFoodOnboardPage({ venue, restaurants, slug }: CruiseFoodOnboardPageProps) {
  const { scrolled, sentinelRef } = useStickyScroll();

  const sitDown = restaurants.filter((r) => r.restaurant_type === "sit_down");
  const walkUp = restaurants.filter((r) => r.restaurant_type === "walk_up");

  const SectionHeader = ({ number, title }: { number: string; title: string }) => (
    <div className="pb-2 pt-6">
      <div className="flex items-baseline gap-2">
        <span className="text-section-number font-medium text-primary">{number}</span>
        <span className="text-section-number text-muted-foreground">·</span>
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
        imageUrl={venue.cover_image_url}
        imageAlt={venue.name}
        fallbackNode={
          <div
            className="size-full"
            style={{ background: "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 50%, #2980B9 100%)" }}
          />
        }
        title="Food Onboard"
        className="pt-6"
      />

      {/* Content */}
      <div className="px-page pb-10 pt-2">
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
                    <RestaurantRow key={r.id} restaurant={r} slug={slug} />
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
                    <RestaurantRow key={r.id} restaurant={r} slug={slug} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.address} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
