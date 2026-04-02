"use client";

import {
  useWindowScroll,
  ScrollRevealStickyHeader,
  FloatingBackButton,
} from "@/components/guest/sticky-header";
import { useRouter } from "next/navigation";
import type { CruiseRestaurant, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";

function formatPrice(priceLevel: number | null): string | null {
  if (priceLevel === 0) return "FREE";
  if (!priceLevel) return null;
  return "$".repeat(priceLevel);
}

interface CruiseRestaurantListingProps {
  venue: Venue;
  restaurant: CruiseRestaurant;
  slug: string;
}

export function CruiseRestaurantListing({ venue, restaurant, slug }: CruiseRestaurantListingProps) {
  const router = useRouter();
  const scrolled = useWindowScroll();

  const metaParts = [
    restaurant.cuisine_type ?? null,
    restaurant.deck ? `Deck ${restaurant.deck}` : null,
    formatPrice(restaurant.price_level),
    restaurant.restaurant_type === "walk_up" ? "Walk Up" : "Sit Down",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background font-sans">
      <ScrollRevealStickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        onBack={() => router.back()}
        nameHref={`/${slug}`}
      />
      <FloatingBackButton scrolled={scrolled} onBack={() => router.back()} />

      {/* Hero image */}
      <div className="aspect-[4/3] w-full overflow-hidden">
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
              background: "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 50%, #2980B9 100%)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="px-page pb-10 pt-5">
        {/* Name + meta */}
        <h1 className="m-0 font-serif text-hotel-name font-normal leading-tight text-foreground">
          {restaurant.name}
        </h1>

        {metaParts.length > 0 && (
          <p className="m-0 mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}

        {restaurant.description && (
          <p className="mt-4 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {restaurant.description}
          </p>
        )}

        {/* Details */}
        {(restaurant.hours || restaurant.phone || restaurant.website) && (
          <div className="card-shadow mt-5 rounded-default bg-card">
            {restaurant.hours && (
              <div className="flex items-start justify-between border-b border-border px-4 py-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Hours
                </span>
                <span className="text-right text-body-sm text-foreground">{restaurant.hours}</span>
              </div>
            )}
            {restaurant.deck && (
              <div className="flex items-start justify-between border-b border-border px-4 py-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Deck
                </span>
                <span className="text-body-sm text-foreground">{restaurant.deck}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-start justify-between border-b border-border px-4 py-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </span>
                <a
                  href={`tel:${restaurant.phone.replace(/\D/g, "")}`}
                  className="text-body-sm font-medium text-primary no-underline"
                >
                  {restaurant.phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Reserve CTA */}
        {restaurant.website && (
          <div className="mt-5">
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-default border border-primary px-4 py-3 text-body-sm font-semibold text-primary no-underline"
            >
              Reserve a Table →
            </a>
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
