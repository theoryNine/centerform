"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VenueFooter } from "@/components/guest/venue-footer";
import type { NearbyPlace, VenueWithTheme } from "@/types";

function getCTALabel(category: NearbyPlace["category"]): string {
  switch (category) {
    case "restaurant":
    case "bar":
    case "cafe":
      return "Reserve a Table";
    case "outdoors":
    case "attraction":
      return "Get Directions";
    default:
      return "Learn More";
  }
}

function getCTAHref(place: NearbyPlace): string | null {
  if (place.website) return place.website;
  if (
    (place.category === "outdoors" || place.category === "attraction") &&
    place.address
  ) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}`;
  }
  return null;
}

interface PlaceListingProps {
  slug: string;
  venue: VenueWithTheme;
  place: NearbyPlace;
}

export function PlaceListing({ slug, venue, place }: PlaceListingProps) {
  const [scrolled, setScrolled] = useState(false);
  const heroSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const priceLabel = place.price_level ? "$".repeat(place.price_level) : null;
  const ctaLabel = place.cta_label ?? getCTALabel(place.category);
  const ctaHref = getCTAHref(place);
  const mapsHref = place.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}`
    : null;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sticky header — transparent over hero, solid after scroll */}
      <div
        className={`sticky top-0 z-30 pt-safe flex items-center px-5 pb-2 transition-[background-color,border-color] duration-200 ${
          scrolled ? "border-b border-border" : "border-b border-transparent"
        }`}
        style={{ backgroundColor: scrolled ? "var(--background)" : "transparent" }}
      >
        <Link href={`/${slug}/explore`} className="shrink-0 text-primary no-underline" onClick={(e) => { e.preventDefault(); history.back(); }}>
          <ArrowLeft size={20} />
        </Link>
        <div
          className={`flex-1 text-center transition-opacity duration-200 ${scrolled ? "opacity-100" : "opacity-0"}`}
        >
          <span className="font-serif text-[16px] font-normal text-foreground">
            {place.name}
          </span>
        </div>
        {/* Spacer to balance back arrow */}
        <div className="w-5 shrink-0" />
      </div>

      {/* Hero image */}
      {place.image_url ? (
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={place.image_url}
            alt={place.name}
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div
          className="h-[120px] w-full"
          style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A89878 100%)" }}
        />
      )}

      {/* Sentinel — sits at bottom of hero; triggers header transition */}
      <div ref={heroSentinelRef} className="h-0" />

      {/* Content — slides up slightly over image when image present */}
      <div
        className={`relative z-10 bg-background ${place.image_url ? "-mt-6 rounded-t-xl" : ""}`}
      >
        <div className="px-5 pb-10 pt-6">
          {/* Name + tagline */}
          <h1 className="m-0 font-serif text-[28px] font-normal leading-tight text-foreground">
            {place.name}
          </h1>
          {place.tagline && (
            <p className="m-0 mt-1 text-[13px] text-muted-foreground">{place.tagline}</p>
          )}

          {/* Description */}
          {place.description && (
            <p className="m-0 mt-4 text-[14px] leading-relaxed text-foreground">
              {place.description}
            </p>
          )}

          {/* CTA buttons */}
          {ctaHref && (
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-[5px] bg-primary px-4 py-3 text-[14px] font-medium text-primary-foreground no-underline"
              >
                {ctaLabel} →
              </a>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5">
            {place.address && mapsHref && (
              <div>
                <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Address
                </p>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-primary no-underline"
                >
                  {place.address}
                </a>
              </div>
            )}

            {place.hours && (
              <div>
                <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Hours
                </p>
                <p className="m-0 text-[14px] text-foreground">{place.hours}</p>
              </div>
            )}

            {priceLabel && (
              <div>
                <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Price
                </p>
                <p className="m-0 text-[14px] text-foreground">{priceLabel}</p>
              </div>
            )}

            {place.phone && (
              <div>
                <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Phone
                </p>
                <a
                  href={`tel:${place.phone.replace(/\D/g, "")}`}
                  className="text-[14px] text-primary no-underline"
                >
                  {place.phone}
                </a>
              </div>
            )}
          </div>

          {/* What to know */}
          {place.tips && place.tips.length > 0 && (
            <div className="mt-6">
              <h2 className="m-0 mb-3 font-serif text-[20px] font-normal text-foreground">
                What to know
              </h2>
              <ul className="m-0 list-none p-0">
                {place.tips.map((tip, i) => (
                  <li key={i} className="mb-2 flex gap-2.5 text-[14px] leading-snug text-foreground">
                    <span className="mt-px shrink-0 font-medium text-primary">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <VenueFooter
              venueName={venue.name}
              address={venue.address}
              phone={venue.phone}
            />
          </div>

          <div className="h-safe-bottom" />
        </div>
      </div>
    </div>
  );
}
