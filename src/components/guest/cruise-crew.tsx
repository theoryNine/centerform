"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useStickyScroll, StickyHeader } from "@/components/guest/sticky-header";
import type { Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";
import { CREW } from "@/lib/cruise-crew-data";
import { PageHero } from "@/components/guest/page-hero";

function CrewTile({ name, photo, href }: { name: string; photo?: string; href: string }) {
  return (
    <Link href={href} className="card-shadow overflow-hidden rounded-default bg-card no-underline">
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden">
        {photo ? (
          <img src={photo} alt={name} className="size-full object-cover object-top" />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0E3A5C 0%, #2980B9 100%)",
            }}
          >
            <User size={32} color="rgba(255,255,255,0.4)" />
          </div>
        )}
      </div>

      {/* Name */}
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
}

export function CruiseCrewPage({ venue, slug, pageDescription }: CruiseCrewPageProps) {
  const { scrolled, sentinelRef } = useStickyScroll();

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
        imageUrl="/crew/hero.png"
        imageAlt="The Crew"
        fallbackNode={
          <div
            className="size-full"
            style={{ background: "linear-gradient(135deg, #0E3A5C 0%, #2980B9 100%)" }}
          />
        }
        title="The Crew"
        className="pt-8"
      />

      {/* Content */}
      <div className="px-page pb-10 pt-6">
        {pageDescription && (
          <p className="mb-6 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {pageDescription}
          </p>
        )}
        {/* Featured members */}
        <div className="grid grid-cols-2 gap-card-gap">
          {CREW.filter((m) => m.slug === "adam" || m.slug === "ansel").map((member) => (
            <CrewTile
              key={member.slug}
              name={member.name}
              photo={member.photos[0]}
              href={`/${slug}/the-crew/${member.slug}`}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-primary" />

        {/* Rest of crew (alphabetical) */}
        <div className="grid grid-cols-2 gap-card-gap">
          {CREW.filter((m) => m.slug !== "adam" && m.slug !== "ansel")
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((member) => (
              <CrewTile
                key={member.slug}
                name={member.name}
                photo={member.photos[0]}
                href={`/${slug}/the-crew/${member.slug}`}
              />
            ))}
        </div>

        <div className="mt-10">
          <VenueFooter venueName={venue.name} address={venue.ship_name} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
