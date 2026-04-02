"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CruiseRestaurant, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";

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
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden">
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
        {restaurant.description && (
          <p className="m-0 mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-1">
            {restaurant.description}
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
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

      {/* Sticky header */}
      <div
        className={`sticky top-0 z-30 pt-safe relative flex items-center px-5 pb-2 transition-[border-color] duration-200 ${
          scrolled ? "border-b border-border" : "border-b border-transparent"
        }`}
        style={{ backgroundColor: "var(--background)" }}
      >
        <Link href={`/${slug}`} className="shrink-0 text-primary no-underline">
          <ArrowLeft size={20} />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
          <Link
            href={`/${slug}`}
            className="pointer-events-auto font-serif text-[20px] font-normal text-foreground no-underline"
          >
            {venue.name}
          </Link>
        </div>
        <div className="w-5 shrink-0" />
      </div>

      {/* Content */}
      <div className="px-page pb-10 pt-4">
        {/* Header card */}
        <div className="card-shadow relative mb-2 rounded-[5px] bg-card px-4 py-6 text-center">
          <span
            className="absolute inline-block h-4 w-4 border-l-2 border-t-2 border-foreground/25"
            style={{ top: 10, left: 10 }}
          />
          <span
            className="absolute inline-block h-4 w-4 border-r-2 border-t-2 border-foreground/25"
            style={{ top: 10, right: 10 }}
          />
          <span
            className="absolute inline-block h-4 w-4 border-b-2 border-l-2 border-foreground/25"
            style={{ bottom: 10, left: 10 }}
          />
          <span
            className="absolute inline-block h-4 w-4 border-b-2 border-r-2 border-foreground/25"
            style={{ bottom: 10, right: 10 }}
          />
          <h1 className="m-0 font-serif text-page-title font-normal leading-tight text-foreground">
            Food Onboard
          </h1>
          <div className="mx-auto my-3 h-[1px] w-15 bg-foreground/25" />
          <p className="m-0 text-description text-muted-foreground">Dining venues on {venue.name}</p>
        </div>

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
