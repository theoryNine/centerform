"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import type { CruiseCrewMember, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";

function CrewMemberCard({ member }: { member: CruiseCrewMember }) {
  return (
    <div className="card-shadow flex items-start gap-4 rounded-[5px] bg-card p-4">
      {/* Avatar */}
      <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-full">
        {member.image_url ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="size-full object-cover"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0E3A5C 0%, #2980B9 100%)",
            }}
          >
            <User size={28} color="rgba(255,255,255,0.5)" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="m-0 font-serif text-[17px] font-semibold leading-tight text-foreground">
          {member.name}
        </p>
        <p className="m-0 mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
          {member.role}
        </p>
        {member.bio && (
          <p className="m-0 mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  );
}

interface CruiseCrewPageProps {
  venue: Venue;
  crew: CruiseCrewMember[];
  slug: string;
}

export function CruiseCrewPage({ venue, crew, slug }: CruiseCrewPageProps) {
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
        <Link href={`/${slug}`} className="shrink-0 text-primary no-underline">
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

      {/* Content */}
      <div className="px-5 pb-10 pt-4">
        {/* Header card */}
        <div className="card-shadow relative mb-6 rounded-[5px] bg-card px-4 py-6 text-center">
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
          <h1 className="m-0 font-serif text-[26px] font-normal leading-tight text-foreground">
            The Crew
          </h1>
          <div className="mx-auto my-3 h-[1px] w-15 bg-foreground/25" />
          <p className="m-0 text-[13px] text-muted-foreground">Meet your group</p>
        </div>

        {crew.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-muted-foreground">
            Crew information coming soon.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {crew.map((member) => (
              <CrewMemberCard key={member.id} member={member} />
            ))}
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
