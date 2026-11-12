"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStickyScroll, StickyHeader } from "@/components/guest/primitives/sticky-header";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { ConciergePrompt } from "@/components/guest/primitives/concierge-prompt";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { NavCard } from "@/components/guest/primitives/nav-card";
import { SectionHeader } from "@/components/guest/primitives/section-header";
import type { NearbyPlace, VenueWithTheme } from "@/types";
import { PageFrame } from "@/components/guest/primitives/page-frame";
import { usePageLabel } from "@/components/guest-nav-history";

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

function PlaceCardGrid({ place, slug }: { place: NearbyPlace; slug: string }) {
  return (
    <Link
      href={placeHref(slug, place)}
      className="card-shadow block overflow-hidden rounded-default bg-card no-underline"
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-[5px]">
        {place.image_url ? (
          <img loading="lazy" decoding="async"
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
        <p className="m-0 font-serif text-card-title-lg font-normal leading-tight text-foreground">
          {place.name}
        </p>
        {place.description && (
          <p className="m-0 mt-0.5 text-body-sm leading-snug text-muted-foreground">
            {place.description}
          </p>
        )}
      </div>
    </Link>
  );
}

// Wide layouts render a place as a feature card when it is flagged (is_featured, editable in the
// dashboard) or when it is the guide leading its section. Driven by data, not list position alone.
function isFeature(place: NearbyPlace, indexInSection: number): boolean {
  return place.is_featured || (indexInSection === 0 && !!place.collection_id);
}

const WIDE_GRID = "gap-card-gap cmp:grid cmp:grid-cols-2 lg:grid-cols-3";

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
  const showSeeMore = hasMore || !useListLayout;
  const seeMoreLink = (
    <Link
      href={areaHref}
      className="flex items-center gap-1 text-body-sm font-medium text-primary no-underline"
    >
      {`See more in ${section.name}`}
      <ArrowRight size={14} />
    </Link>
  );

  // Featured places first, same as the phone grid.
  const widePlaces = [...places].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  return (
    <div className="mb-section">
      <SectionHeader
        number={sectionNumber}
        title={section.name}
        wide
        action={showSeeMore ? seeMoreLink : undefined}
      />

      {useListLayout ? (
        /* List layout for first section — capped at 4 */
        <div className={`flex flex-col ${WIDE_GRID}`}>
          {visiblePlaces.map((place, i) => (
            <NavCard
              key={place.id}
              href={placeHref(slug, place)}
              label={place.name}
              sublabel={place.description ?? ""}
              imageUrl={place.image_url ?? undefined}
              responsive
              featured={isFeature(place, i)}
            />
          ))}
        </div>
      ) : (
        <>
        {/* Wide (600px+): the same list cards as the first section */}
        <div className={`hidden ${WIDE_GRID}`}>
          {widePlaces.map((place, i) => (
            <NavCard
              key={place.id}
              href={placeHref(slug, place)}
              label={place.name}
              sublabel={place.description ?? ""}
              imageUrl={place.image_url ?? undefined}
              responsive
              lazyImage
              featured={isFeature(place, i)}
            />
          ))}
        </div>

        {/* Grid layout for other sections (phone) */}
        <div className="cmp:hidden">
          {/* Featured card — full width */}
          {featuredPlace && (
            <Link
              href={placeHref(slug, featuredPlace)}
              className="card-shadow mb-3 block overflow-hidden rounded-default bg-card no-underline"
            >
              <div className="aspect-[16/9] w-full overflow-hidden rounded-t-[5px]">
                {featuredPlace.image_url ? (
                  <img loading="lazy" decoding="async"
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
                <p className="m-0 font-serif text-card-title-lg font-normal text-foreground">
                  {featuredPlace.name}
                </p>
                {featuredPlace.description && (
                  <p className="m-0 mt-0.5 text-body-sm leading-snug text-muted-foreground">
                    {featuredPlace.description}
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-card-gap">
            {regularPlaces.map((place) => (
              <PlaceCardGrid key={place.id} place={place} slug={slug} />
            ))}
          </div>
        </div>
        </>
      )}

      {/* See more link — right aligned; from 1024px it sits beside the section title instead */}
      {showSeeMore && <div className="mt-3 flex justify-end lg:hidden">{seeMoreLink}</div>}
    </div>
  );
}

interface VenueExplorePageProps {
  slug: string;
  venue: VenueWithTheme;
  places: NearbyPlace[];
  pageDescription?: string | null;
  heroImageUrl?: string | null;
}

export function VenueExplorePage({ slug, venue, places, pageDescription, heroImageUrl }: VenueExplorePageProps) {
  const venueName = venue.name;
  const cityName = venue.city ?? "the Area";
  const sections = groupByArea(places);

  const { scrolled, sentinelRef } = useStickyScroll();
  usePageLabel("Explore");

  return (
    <PageFrame width="wide">
      <div ref={sentinelRef} className="h-0" />
      <StickyHeader
        venueName={venueName}
        scrolled={scrolled}
        backHref={`/${slug}`}
        nameHref={`/${slug}`}
        wide
        phone={venue.phone}
      />

      {/* Hero section with shaped image */}
      <PageHero
        imageUrl={heroImageUrl ?? venue.cover_image_url}
        imageAlt={venueName}
        fallbackNode={
          <div
            className="size-full"
            style={{ background: "linear-gradient(135deg, #3A5A7C 0%, #2C4A6C 40%, #1E3A5C 100%)" }}
          />
        }
        title={<>Explore<br />{cityName}</>}
        animated
        textAlign="left"
        className="min-h-[200px] pt-8"
        wide
      />

      {/* Content */}
      <div className="px-page pb-10 pt-6">
        {pageDescription && (
          <div className="card-shadow mb-section rounded-default bg-card px-card py-5">
            <p className="m-0 text-body-sm leading-[var(--cf-body-line-height)] text-foreground">
              {pageDescription.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </div>
        )}

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
        <div className="mb-8 mt-4 tab:mt-8 tab:grid tab:grid-cols-2 tab:items-start tab:gap-10">
          <h2 className="mb-4 font-serif text-card-title-md font-medium text-foreground tab:mb-0 tab:text-[28px]">
            Or just ask.
          </h2>

          <ConciergePrompt
            slug={slug}
            placeholder="What are you in the mood for?"
            chips={["I'm hungry", "Something free", "Kid-friendly", "Surprise me"]}
          />
        </div>

        <VenueFooter
          venueName={venueName}
          address={venue.address}
          phone={venue.phone}
          layout="responsive"
        />

        {/* Bottom safe area */}
        <div className="h-safe-bottom" />
      </div>
    </PageFrame>
  );
}
