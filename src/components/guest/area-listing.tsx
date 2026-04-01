"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { VenueFooter } from "@/components/guest/venue-footer";
import type { NearbyPlace, VenueWithTheme } from "@/types";

function placeHref(slug: string, place: NearbyPlace): string {
  return place.collection_id
    ? `/${slug}/explore/${place.collection_id}`
    : `/${slug}/explore/place/${place.id}`;
}

interface AreaListingPageProps {
  slug: string;
  venue: VenueWithTheme;
  area: string;
  places: NearbyPlace[];
}

export function AreaListingPage({ slug, venue, area, places }: AreaListingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const heading = area.toLowerCase().startsWith("beyond") ? area : `In ${area}`;

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
        <Link href={`/${slug}/explore`} className="shrink-0 text-primary no-underline">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 text-center">
          <Link
            href={`/${slug}`}
            className="font-serif text-[16px] font-normal text-foreground no-underline"
          >
            {venue.name}
          </Link>
        </div>
        <div className="w-5 shrink-0" />
      </div>

      <div className="px-page pb-10 pt-6">
        {/* Section heading */}
        <div className="mb-6">
          <h1 className="m-0 font-serif text-page-title font-normal text-foreground">{heading}</h1>
          <div className="-ml-page mt-2 h-0.5 w-[calc(60%+var(--cf-page-padding))] bg-primary" />
        </div>

        {/* Full place list */}
        <div className="flex flex-col gap-card-gap">
          {places.map((place) => (
            <Link
              key={place.id}
              href={placeHref(slug, place)}
              className="card-shadow flex items-center gap-4 overflow-hidden rounded-default bg-card no-underline"
            >
              <div className="h-[80px] w-[80px] shrink-0 overflow-hidden">
                {place.image_url ? (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="size-full"
                    style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)" }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 py-3 pr-1">
                <p className="m-0 text-body-sm font-semibold leading-tight text-foreground">
                  {place.name}
                </p>
                {place.description && (
                  <p className="m-0 mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-2">
                    {place.description}
                  </p>
                )}
              </div>
              <ArrowRight size={16} className="mr-4 shrink-0 text-primary" />
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.address} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
