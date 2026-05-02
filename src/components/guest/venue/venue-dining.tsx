"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import type { NearbyPlace, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { useStickyNav } from "@/hooks/use-sticky-nav";
import { usePressScale } from "@/hooks/use-press-scale";
import { formatPrice } from "@/lib/utils";

interface VenueDiningPageProps {
  venue: Venue;
  places: NearbyPlace[];
  slug: string;
  pageDescription?: string | null;
  heroImageUrl?: string | null;
}

function placeHref(slug: string, place: NearbyPlace): string {
  return place.collection_id
    ? `/${slug}/explore/${place.collection_id}`
    : `/${slug}/explore/place/${place.id}`;
}

function PlaceCard({ place, slug }: { place: NearbyPlace; slug: string }) {
  const press = usePressScale();

  return (
    <Link
      href={placeHref(slug, place)}
      className="block no-underline transition-transform duration-[var(--cf-press-duration)]"
      {...press}
    >
      <div className="card-shadow rounded-default bg-card p-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="m-0 font-serif text-[15px] font-medium leading-snug text-foreground">
              {place.name}
            </p>
            {place.tagline && (
              <p className="mb-0 mt-1 text-[13px] leading-snug text-muted-foreground">
                {place.tagline}
              </p>
            )}
          </div>
          {place.image_url && (
            <img
              src={place.image_url}
              alt={place.name}
              className="size-14 shrink-0 rounded-[4px] object-cover"
            />
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!place.collection_id && (
            <span className="rounded-chip bg-secondary px-2.5 py-0.5 text-label font-medium capitalize text-muted-foreground">
              {place.category}
            </span>
          )}
          {place.distance && (
            <span className="text-label text-muted-foreground">{place.distance}</span>
          )}
          {place.rating != null && (
            <span className="flex items-center gap-0.5 text-label font-semibold text-foreground">
              {place.rating}
              <Star size={10} fill="var(--accent)" color="var(--accent)" />
            </span>
          )}
          {place.price_level != null && (
            <span className="text-label text-muted-foreground">{formatPrice(place.price_level)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function VenueDiningPage({ venue, places, slug, pageDescription, heroImageUrl }: VenueDiningPageProps) {
  const { showStickyNav, headerRef } = useStickyNav();
  const venueName = venue.name;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sticky nav — slides in after scrolling past hero */}
      <div
        className="fixed inset-x-0 top-0 z-50 bg-background transition-transform duration-300 ease-out"
        style={{
          transform: showStickyNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="flex items-center px-5 py-3">
            <Link href={`/${slug}`} className="mr-3 flex items-center text-primary no-underline">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-serif text-base font-normal text-foreground">{venueName}</span>
          </div>
          <div className="h-px bg-border" />
        </div>
      </div>

      {/* Main header area */}
      <div ref={headerRef}>
        <div
          className="flex items-center px-5"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: 12 }}
        >
          <Link href={`/${slug}`} className="mr-3 flex items-center text-primary no-underline">
            <ArrowLeft size={20} />
          </Link>
          <Link
            href={`/${slug}`}
            className="font-serif text-base font-normal text-foreground no-underline"
          >
            {venueName}
          </Link>
        </div>

        <PageHero
          imageUrl={heroImageUrl ?? venue.cover_image_url}
          imageAlt={venueName}
          fallbackNode={
            <div
              className="flex size-full items-center justify-center"
              style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A09680 100%)" }}
            >
              <span className="font-serif text-[40px] font-light text-white/50">
                {venueName.charAt(0)}
              </span>
            </div>
          }
          title="Dining & Drinks"
          className="pt-8"
        />
      </div>

      {/* Content */}
      <div className="px-page pb-10 pt-6">
        {pageDescription && (
          <p className="mb-6 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {pageDescription.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}

        {places.length === 0 ? (
          <p className="py-12 text-center text-body text-muted-foreground">
            No nearby places listed yet.
          </p>
        ) : (
          <div className="flex flex-col gap-card-gap">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} slug={slug} />
            ))}
          </div>
        )}

        <div className="mt-section">
          <VenueFooter venueName={venueName} address={venue.address} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
