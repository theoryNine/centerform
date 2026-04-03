"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useStickyScroll, StickyHeader } from "@/components/guest/sticky-header";
import type { Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";
import { CREW } from "@/lib/cruise-crew-data";

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
}

export function CruiseCrewPage({ venue, slug }: CruiseCrewPageProps) {
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
      <div className="flex min-h-[180px] items-center pt-6">
        <div className="relative h-[180px] w-2/5 min-w-[140px] max-w-[180px] shrink-0 overflow-hidden rounded-r-[50%]">
          <img src="/crew/hero.png" alt="The Crew" className="size-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h1 className="m-0 font-serif text-page-title font-normal leading-tight text-foreground">
            The Crew
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-page pb-10 pt-6">
        <div className="grid grid-cols-2 gap-card-gap">
          {CREW.map((member) => (
            <CrewTile
              key={member.slug}
              name={member.name}
              photo={member.photos[0]}
              href={`/${slug}/the-crew/${member.slug}`}
            />
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
