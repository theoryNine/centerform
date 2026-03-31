"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

  const metaParts = [
    restaurant.cuisine_type ?? null,
    restaurant.deck ? `Deck ${restaurant.deck}` : null,
    formatPrice(restaurant.price_level),
    restaurant.restaurant_type === "walk_up" ? "Walk Up" : "Sit Down",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div ref={sentinelRef} className="h-0" />

      {/* Sticky header */}
      <div
        className={`sticky top-0 z-30 pt-safe flex items-center px-5 pb-2 transition-[border-color] duration-200 ${
          scrolled ? "border-b border-border" : "border-b border-transparent"
        }`}
        style={{ backgroundColor: "var(--background)" }}
      >
        <button
          onClick={() => router.back()}
          className="shrink-0 cursor-pointer border-none bg-none p-0 text-primary"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <span className="font-serif text-[16px] font-normal text-foreground">{venue.name}</span>
        </div>
        <div className="w-5 shrink-0" />
      </div>

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
      <div className="px-5 pb-10 pt-5">
        {/* Name + meta */}
        <h1 className="m-0 font-serif text-[28px] font-normal leading-tight text-foreground">
          {restaurant.name}
        </h1>

        {metaParts.length > 0 && (
          <p className="m-0 mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}

        {restaurant.description && (
          <p className="mt-4 text-[15px] leading-relaxed text-foreground">
            {restaurant.description}
          </p>
        )}

        {/* Details */}
        {(restaurant.hours || restaurant.phone || restaurant.website) && (
          <div className="card-shadow mt-5 rounded-[5px] bg-card">
            {restaurant.hours && (
              <div className="flex items-start justify-between border-b border-border px-4 py-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Hours
                </span>
                <span className="text-right text-[14px] text-foreground">{restaurant.hours}</span>
              </div>
            )}
            {restaurant.deck && (
              <div className="flex items-start justify-between border-b border-border px-4 py-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Deck
                </span>
                <span className="text-[14px] text-foreground">{restaurant.deck}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-start justify-between border-b border-border px-4 py-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </span>
                <a
                  href={`tel:${restaurant.phone.replace(/\D/g, "")}`}
                  className="text-[14px] font-medium text-primary no-underline"
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
              className="flex items-center justify-center rounded-[5px] border border-primary px-4 py-3 text-[14px] font-semibold text-primary no-underline"
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
