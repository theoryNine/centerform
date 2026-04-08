"use client";

import {
  useWindowScroll,
  ScrollRevealStickyHeader,
  FloatingBackButton,
} from "@/components/guest/primitives/sticky-header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CruiseItineraryItem, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { useImageLoaded } from "@/hooks/use-image-loaded";

interface CruiseItineraryListingProps {
  venue: Venue;
  item: CruiseItineraryItem;
  slug: string;
  restaurantName?: string | null;
}

export function CruiseItineraryListing({
  venue,
  item,
  slug,
  restaurantName,
}: CruiseItineraryListingProps) {
  const router = useRouter();
  const scrolled = useWindowScroll();
  const { loaded, imgRef, settle } = useImageLoaded(item.image_url);

  return (
    <div className="min-h-screen bg-background font-sans">
      {!loaded && <LoadingSpinner />}
      <ScrollRevealStickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        onBack={() => router.back()}
        nameHref={`/${slug}`}
      />
      <FloatingBackButton scrolled={scrolled} onBack={() => router.back()} />

      {/* Hero + floating name card */}
      <div className="relative">
        {item.image_url ? (
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              ref={imgRef}
              src={item.image_url}
              alt={item.title}
              className="size-full object-cover"
              onLoad={settle}
              onError={settle}
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
              {item.title}
            </h1>
            {(item.time_label || item.location) && (
              <p className="m-0 mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {[item.time_label, item.location].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content — top padding clears the overlapping card */}
      <div className="bg-background">
        <div className="px-page pb-10 pt-20">
          {/* Description */}
          {item.description && (
            <p className="mt-0 text-body leading-[var(--cf-body-line-height)] text-foreground">
              {item.description}
            </p>
          )}

          {/* Link to associated restaurant */}
          {item.restaurant_id && (
            <div className="mt-5">
              <Link
                href={`/${slug}/food-onboard/${item.restaurant_id}`}
                className="flex items-center justify-center rounded-default border border-primary px-4 py-3 text-body-sm font-semibold text-primary no-underline"
              >
                {restaurantName ? `View ${restaurantName} →` : "View Restaurant →"}
              </Link>
            </div>
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
