"use client";

import {
  useWindowScroll,
  ScrollRevealStickyHeader,
  FloatingBackButton,
} from "@/components/guest/primitives/sticky-header";
import { useRouter } from "next/navigation";
import type { CruiseRestaurant, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { formatPrice } from "@/lib/utils";

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

      {/* Hero + floating name card */}
      <div className="relative">
        {restaurant.image_url ? (
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div
            className="h-[240px] w-full"
            style={{
              background: "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 50%, #2980B9 100%)",
            }}
          />
        )}

        {/* Name card — 50% overlaps the bottom of the hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1/2 px-page">
          <div className="rounded-default bg-card px-card py-5 text-center shadow-md">
            <h1 className="m-0 font-serif text-hotel-name font-normal leading-tight text-foreground">
              {restaurant.name}
            </h1>
            {metaParts.length > 0 && (
              <p className="m-0 mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {metaParts.join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content — top padding clears the overlapping card */}
      <div className="bg-background">
        <div className="px-page pb-10 pt-20">
          {/* Description */}
          {restaurant.description && (
            <p className="mt-0 text-body leading-[var(--cf-body-line-height)] text-foreground">
              {restaurant.description}
            </p>
          )}

          {/* Reserve CTA + menu links */}
          {(restaurant.website || restaurant.menu_links?.length) && (
            <div className="mt-5 flex flex-col gap-3">
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center justify-center rounded-default border border-primary px-4 text-body-sm font-semibold text-primary no-underline"
                >
                  Reserve a Table →
                </a>
              )}
              {restaurant.menu_links?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center justify-end text-body-sm text-primary no-underline"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          )}

          {/* Metadata */}
          {(restaurant.hours || restaurant.deck || restaurant.phone) && (
            <>
              {/* Short centered divider */}
              <div className="mt-6 flex justify-center">
                <div className="w-10 border-t border-border" />
              </div>

              <div className="mt-6 flex flex-col">
                {restaurant.hours && (
                  <div className="border-b border-border py-4">
                    <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Hours
                    </p>
                    {restaurant.hours.split("\n").map((line, i) => (
                      <p key={i} className="m-0 text-body-sm text-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {restaurant.phone && (
                  <div className="border-b border-border py-4">
                    <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Phone
                    </p>
                    <a
                      href={`tel:${restaurant.phone.replace(/\D/g, "")}`}
                      className="flex min-h-[44px] items-center text-body-sm text-primary no-underline"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-8">
            <VenueFooter venueName={venue.name} address={venue.ship_name} phone={venue.phone} />
          </div>

          <div className="h-safe-bottom" />
        </div>
      </div>
    </div>
  );

}
