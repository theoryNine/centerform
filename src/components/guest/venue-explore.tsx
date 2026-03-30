"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { VenueFooter } from "@/components/guest/venue-footer";
import type { NearbyPlace, VenueWithTheme } from "@/types";

interface AreaSection {
  name: string;
  displayOrder: number;
  places: NearbyPlace[];
}

function groupByArea(places: NearbyPlace[]): AreaSection[] {
  const map = new Map<string, AreaSection>();

  for (const place of places) {
    const area = place.area ?? "Nearby";
    if (!map.has(area)) {
      map.set(area, {
        name: area,
        displayOrder: place.area_display_order ?? 0,
        places: [],
      });
    }
    map.get(area)!.places.push(place);
  }

  return Array.from(map.values()).sort((a, b) => a.displayOrder - b.displayOrder);
}

function placeHref(slug: string, place: NearbyPlace): string {
  return place.collection_id
    ? `/${slug}/explore/${place.collection_id}`
    : `/${slug}/explore/place/${place.id}`;
}

function PlaceCardList({ place, slug }: { place: NearbyPlace; slug: string }) {
  return (
    <Link
      href={placeHref(slug, place)}
      className="card-shadow flex items-center gap-4 overflow-hidden rounded-[5px] bg-card no-underline"
    >
      {/* Thumbnail */}
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
            style={{
              background:
                "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 py-3 pr-1">
        <p className="m-0 text-[14px] font-semibold leading-tight text-foreground">
          {place.name}
        </p>
        {place.description && (
          <p className="m-0 mt-1 text-[12px] leading-snug text-muted-foreground">
            {place.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight
        size={16}
        className="mr-4 shrink-0 text-primary"
      />
    </Link>
  );
}

function PlaceCardGrid({ place, slug }: { place: NearbyPlace; slug: string }) {
  return (
    <Link
      href={placeHref(slug, place)}
      className="card-shadow block overflow-hidden rounded-[5px] bg-card no-underline"
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-[5px]">
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={place.name}
            className="size-full object-cover"
          />
        ) : (
          <div
            className="size-full"
            style={{
              background:
                "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A89878 100%)",
            }}
          />
        )}
      </div>

      {/* Text below image */}
      <div className="px-3 py-2.5">
        <p className="m-0 text-[13px] font-semibold leading-tight text-foreground">
          {place.name}
        </p>
        {place.description && (
          <p className="m-0 mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {place.description}
          </p>
        )}
      </div>
    </Link>
  );
}

function AreaSectionView({
  section,
  index,
  slug,
}: {
  section: AreaSection;
  index: number;
  slug: string;
}) {
  const sectionNumber = String(index + 1).padStart(2, "0");
  const { places } = section;

  // First section uses list layout, subsequent sections use grid
  const useListLayout = index === 0;

  // List layout: cap at 4, show "See more" if there are additional items
  const LIST_MAX = 4;
  const visiblePlaces = useListLayout ? places.slice(0, LIST_MAX) : places;
  const hasMore = useListLayout && places.length > LIST_MAX;

  // For grid layout: featured items get full width, rest are 2-column
  const featuredPlace = places.find((p) => p.is_featured);
  const regularPlaces = places.filter((p) => !p.is_featured);

  const areaHref = `/${slug}/explore/area/${encodeURIComponent(section.name)}`;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[12px] font-medium text-primary">
            {sectionNumber}
          </span>
          <span className="text-[8px] text-primary">·</span>
          <h2 className="m-0 mb-2 font-serif text-[20px] font-normal text-foreground">
            {section.name.toLowerCase().startsWith("beyond") ? section.name : `In ${section.name}`}
          </h2>
        </div>
        <div className="-ml-5 h-0.5 w-[calc(60%+20px)] bg-primary" />
      </div>

      {useListLayout ? (
        /* List layout for first section — capped at 4 */
        <div className="flex flex-col gap-3">
          {visiblePlaces.map((place) => (
            <PlaceCardList key={place.id} place={place} slug={slug} />
          ))}
        </div>
      ) : (
        /* Grid layout for other sections */
        <div>
          {/* Featured card — full width */}
          {featuredPlace && (
            <Link
              href={placeHref(slug, featuredPlace)}
              className="card-shadow mb-3 block overflow-hidden rounded-[5px] bg-card no-underline"
            >
              <div className="aspect-[16/9] w-full overflow-hidden rounded-t-[5px]">
                {featuredPlace.image_url ? (
                  <img
                    src={featuredPlace.image_url}
                    alt={featuredPlace.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="size-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A89878 100%)",
                    }}
                  />
                )}
              </div>
              <div className="px-4 py-2.5">
                <p className="m-0 text-[14px] font-semibold text-foreground">
                  {featuredPlace.name}
                </p>
                {featuredPlace.description && (
                  <p className="m-0 mt-0.5 text-[12px] text-muted-foreground">
                    {featuredPlace.description}
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            {regularPlaces.map((place) => (
              <PlaceCardGrid key={place.id} place={place} slug={slug} />
            ))}
          </div>
        </div>
      )}

      {/* See more link — right aligned */}
      {(hasMore || !useListLayout) && (
        <div className="mt-3 flex justify-end">
          <Link
            href={areaHref}
            className="flex items-center gap-1 text-[13px] font-medium text-primary no-underline"
          >
            {section.name.startsWith("Beyond")
              ? `See more ${section.name.replace("Beyond", "beyond")}`
              : `See more in ${section.name}`}
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

interface VenueExplorePageProps {
  slug: string;
  venue: VenueWithTheme;
  places: NearbyPlace[];
}

export function VenueExplorePage({ slug, venue, places }: VenueExplorePageProps) {
  const router = useRouter();
  const venueName = venue.name;
  const cityName = venue.city ?? "the Area";
  const sections = groupByArea(places);

  // Track when page has scrolled past the sentinel to show header border
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sentinel — sits at top of page; when it scrolls out of view, header gets border */}
      <div ref={sentinelRef} className="h-0" />

      {/* Sticky header */}
      <div
        className={`sticky top-0 z-30 pt-safe flex items-center px-5 pb-2 transition-[border-color] duration-200 ${scrolled ? "border-b border-border" : "border-b border-transparent"}`}
        style={{ backgroundColor: "var(--background)" }}
      >
        <Link
          href={`/${slug}`}
          className="shrink-0 text-primary no-underline"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 text-center">
          <Link
            href={`/${slug}`}
            className="font-serif text-[16px] font-normal text-foreground no-underline"
          >
            {venueName}
          </Link>
        </div>
        {/* Spacer to center the title */}
        <div className="w-5 shrink-0" />
      </div>

      {/* Hero section with shaped image */}
      <div className="flex min-h-[200px] items-center pt-6">
        {/* Image — flush left, rounded right */}
        <div className="relative h-[180px] w-[38%] min-w-[130px] max-w-[180px] shrink-0 animate-slide-in-left overflow-hidden rounded-r-[50%]">
          {venue.cover_image_url ? (
            <img
              src={venue.cover_image_url}
              alt={venueName}
              className="size-full object-cover"
            />
          ) : (
            <div
              className="size-full"
              style={{
                background:
                  "linear-gradient(135deg, #3A5A7C 0%, #2C4A6C 40%, #1E3A5C 100%)",
              }}
            />
          )}
        </div>

        {/* Title */}
        <div className="flex flex-1 flex-col justify-center px-5 animate-fade-in">
          <h1 className="m-0 font-serif text-[26px] font-normal leading-tight text-foreground">
            Explore
            <br />
            {cityName} & Beyond
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-10 pt-6">
        {/* Message card */}
        <div className="card-shadow mb-8 rounded-[5px] bg-card px-6 py-5">
          <p className="m-0 text-[14px] leading-relaxed text-muted-foreground">
            These are the places we&apos;d send a friend.
          </p>
        </div>

        {/* Area sections */}
        {sections.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No recommendations yet — check back soon.
          </p>
        ) : (
          sections.map((section, i) => (
            <AreaSectionView key={section.name} section={section} index={i} slug={slug} />
          ))
        )}

        {/* "Or just ask" section */}
        <div className="mb-8 mt-4">
          <h2 className="mb-4 font-serif text-[20px] font-normal text-foreground">
            Or just ask.
          </h2>

          <div className="card-shadow rounded-[5px] bg-card p-5">
            <button
              onClick={() => router.push(`/${slug}/concierge`)}
              className="mb-3 w-full cursor-pointer rounded-[5px] border border-border bg-background px-4 py-3 text-left text-sm text-muted-foreground"
            >
              What are you in the mood for?
            </button>

            <div className="flex flex-wrap gap-2">
              {["I'm hungry", "Something free", "Kid-friendly", "Surprise me"].map(
                (chip) => (
                  <button
                    key={chip}
                    onClick={() => router.push(`/${slug}/concierge`)}
                    className="cursor-pointer whitespace-nowrap rounded-full border border-border bg-transparent px-4 py-2 text-[13px] text-foreground transition-colors duration-150 ease-out hover:bg-secondary"
                  >
                    {chip}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <VenueFooter venueName={venueName} address={venue.address} phone={venue.phone} />

        {/* Bottom safe area */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
