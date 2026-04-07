"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useStickyScroll, StickyHeader } from "@/components/guest/primitives/sticky-header";
import type { Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { CREW } from "@/lib/cruise-crew-data";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";

function CrewTile({
  name,
  photo,
  href,
  onSettle,
}: {
  name: string;
  photo?: string;
  href: string;
  onSettle?: () => void;
}) {
  return (
    <Link href={href} className="card-shadow overflow-hidden rounded-default bg-card no-underline">
      <div className="relative aspect-square w-full overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0E3A5C 0%, #2980B9 100%)" }}
        >
          <User size={32} color="rgba(255,255,255,0.4)" />
        </div>
        {photo && (
          <img
            src={photo}
            alt={name}
            onLoad={onSettle}
            onError={onSettle}
            className="absolute inset-0 size-full object-cover object-top"
          />
        )}
      </div>
      <div className="px-2 py-3 text-center">
        <p className="m-0 font-serif text-cta-button font-normal leading-tight text-foreground">
          {name}
        </p>
      </div>
    </Link>
  );
}

interface CruiseCrewPageProps {
  venue: Venue;
  slug: string;
  pageDescription?: string | null;
  heroImageUrl?: string | null;
}

export function CruiseCrewPage({ venue, slug, pageDescription, heroImageUrl }: CruiseCrewPageProps) {
  const { scrolled, sentinelRef } = useStickyScroll();

  const totalWithPhotos = CREW.filter((m) => m.photos[0]).length;
  const [loadedCount, setLoadedCount] = useState(0);
  const allLoaded = loadedCount >= totalWithPhotos;

  const handleImageLoad = useCallback(() => {
    setLoadedCount((n) => n + 1);
  }, []);

  const featuredCrew = CREW.filter((m) => m.slug === "adam" || m.slug === "ansel");
  const restCrew = CREW.filter((m) => m.slug !== "adam" && m.slug !== "ansel").sort((a, b) =>
    a.name.localeCompare(b.name),
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

      <PageHero
        imageUrl={heroImageUrl ?? "/crew/hero.jpg"}
        imageAlt="Crew Manifest"
        fallbackNode={
          <div
            className="size-full"
            style={{ background: "linear-gradient(135deg, #0E3A5C 0%, #2980B9 100%)" }}
          />
        }
        title="Crew Manifest"
        className="pt-8"
      />

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

        <div className="grid grid-cols-2 gap-card-gap">
          {featuredCrew.map((member) => (
            <CrewTile
              key={member.slug}
              name={member.name}
              photo={member.photos[0]}
              href={`/${slug}/the-crew/${member.slug}`}
              onSettle={handleImageLoad}
            />
          ))}
        </div>

        <div className="my-6 h-px bg-primary" />

        <div className="grid grid-cols-2 gap-card-gap">
          {restCrew.map((member) => (
            <CrewTile
              key={member.slug}
              name={member.name}
              photo={member.photos[0]}
              href={`/${slug}/the-crew/${member.slug}`}
              onSettle={handleImageLoad}
            />
          ))}
        </div>

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.ship_name} phone={venue.phone} />
        </div>
        <div className="h-safe-bottom" />
      </div>

      {!allLoaded && <LoadingSpinner />}
    </div>
  );
}
