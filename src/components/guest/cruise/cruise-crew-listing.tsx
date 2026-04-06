"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FloatingBackButton } from "@/components/guest/primitives/sticky-header";
import type { Venue } from "@/types";
import type { CrewMember } from "@/lib/cruise-crew-data";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { CornerBracketCard } from "@/components/guest/primitives/corner-bracket-card";

interface CruiseCrewListingProps {
  venue: Venue;
  member: CrewMember;
}

function PhotoCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {photos.map((src, i) => (
          <div key={i} className="aspect-[3/4] w-full shrink-0">
            <img src={src} alt={`${name} ${i + 1}`} className="size-full object-cover object-top" />
          </div>
        ))}
      </div>

      {/* Dots — sit above the floating name card */}
      {photos.length > 1 && (
        <div className="absolute bottom-16 inset-x-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="h-1.5 cursor-pointer rounded-full border-none p-0 transition-all duration-200"
              style={{
                width: i === index ? 20 : 6,
                backgroundColor: i === index ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CruiseCrewListing({ venue, member }: CruiseCrewListingProps) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <FloatingBackButton scrolled={false} onBack={() => router.back()} />

      {/* Photo carousel */}
      <PhotoCarousel photos={member.photos} name={member.name} />

      {/* Name card — half over the image, half below */}
      <div className="-mt-12 relative z-10 px-page pb-10">
        <CornerBracketCard className="mb-10">
          <h1 className="m-0 font-serif text-page-title font-normal leading-tight text-foreground">
            {member.name}
          </h1>
          <div className="mx-auto my-3 h-px w-10 bg-foreground/20" />
          <p className="m-0 text-label font-semibold uppercase tracking-[var(--cf-text-label-spacing)] text-muted-foreground">
            The Crew
          </p>
        </CornerBracketCard>

        <VenueFooter venueName={venue.name} address={venue.ship_name} phone={venue.phone} />
      </div>

      <div className="h-safe-bottom" />
    </div>
  );
}
