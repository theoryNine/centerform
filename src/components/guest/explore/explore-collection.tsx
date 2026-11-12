"use client";

import Link from "next/link";
import { useStickyScroll, VenueHeader } from "@/components/guest/primitives/sticky-header";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { ConciergePrompt } from "@/components/guest/primitives/concierge-prompt";
import { CornerBracketCard } from "@/components/guest/primitives/corner-bracket-card";
import { NavCard } from "@/components/guest/primitives/nav-card";
import { formatPrice } from "@/lib/utils";
import { safeHttpUrl } from "@/lib/url";
import type {
  ExploreCollectionWithItems,
  CollectionItemWithPlace,
  ExploreCollection,
  NearbyPlace,
  PlaceCategory,
  VenueWithTheme,
} from "@/types";
import { PageFrame, FrameBody } from "@/components/guest/primitives/page-frame";
import { usePageLabel } from "@/components/guest-nav-history";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCategory(category: PlaceCategory): string {
  const labels: Record<PlaceCategory, string> = {
    restaurant: "RESTAURANT",
    bar: "BAR",
    cafe: "CAFÉ",
    attraction: "ATTRACTION",
    shopping: "SHOPPING",
    entertainment: "ENTERTAINMENT",
    outdoors: "OUTDOORS",
    other: "",
  };
  return labels[category];
}


function getCTALabel(place: NearbyPlace): string {
  if (place.cta_label) return place.cta_label;
  switch (place.category) {
    case "restaurant":
    case "cafe":
      return "Reserve a Table";
    case "bar":
      return "Reserve a Spot";
    case "outdoors":
    case "attraction":
      return "Get Directions";
    default:
      return "Learn More";
  }
}

function getCTAHref(place: NearbyPlace): string | null {
  const website = safeHttpUrl(place.website);
  if (website) return website;
  if (place.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}`;
  }
  return null;
}

// ─── Header card (corner brackets) ──────────────────────────────────────────

function CollectionHeader({
  title,
  subtitle,
  wide,
}: {
  title: string;
  subtitle: string | null;
  wide?: boolean;
}) {
  return (
    <CornerBracketCard className="mb-5">
      <h1
        className={`m-0 font-serif text-page-title font-semibold leading-tight text-foreground${
          wide ? " cmp:text-[32px] lg:text-[36px]" : ""
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <>
          <div className="mx-auto my-3 h-[1.0px] w-15 bg-foreground/25" />
          <p className="m-0 text-body-sm text-muted-foreground">{subtitle}</p>
        </>
      )}
    </CornerBracketCard>
  );
}

// ─── Timeline layout ─────────────────────────────────────────────────────────

function TimelineCard({ item, slug }: { item: CollectionItemWithPlace; slug: string }) {
  const { place } = item;

  if (item.is_start || item.is_end) {
    return (
      <li className="relative pb-5 flex items-center">
        <div aria-hidden="true" className="absolute left-[24px] z-10 h-3 w-3 rounded-full bg-primary" />
        <p className="m-0 pl-[48px] text-label font-semibold tracking-widest text-link">
          {item.is_start ? "START" : "END"} · {place.name.toUpperCase()}
        </p>
      </li>
    );
  }

  return (
    <li className="pb-3">
      {item.time_label && (
        <p className="relative z-10 m-0 mb-2 bg-background text-body-sm font-semibold text-foreground">
          {item.time_label}
        </p>
      )}
      <div className="relative pl-[60px]">
        <div aria-hidden="true" className="absolute left-[26px] top-[10px] z-10 h-2 w-2 rounded-full bg-muted-foreground/60" />
        <div aria-hidden="true" className="absolute left-[34px] top-[13px] h-px w-[26px] bg-muted-foreground/25" />
        <NavCard
          label={place.name}
          sublabel={place.description ?? ""}
          href={`/${slug}/explore/place/${place.id}`}

          sublabelClassName="line-clamp-2 cmp:line-clamp-none"
          hideImage
        />
      </div>
    </li>
  );
}

function TimelineLayout({
  items,
  slug,
}: {
  items: CollectionItemWithPlace[];
  slug: string;
}) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        aria-hidden="true"
        className="absolute top-3 bottom-3 w-px bg-muted-foreground/25"
        style={{ left: "30px" }}
      />
      <ol className="m-0 flex list-none flex-col p-0">
        {items.map((item) => (
          <TimelineCard key={item.id} item={item} slug={slug} />
        ))}
      </ol>
    </div>
  );
}

// ─── Cards layout ─────────────────────────────────────────────────────────────

function PlaceCard({ place, slug }: { place: NearbyPlace; slug: string }) {
  const metaParts = [
    formatCategory(place.category),
    place.distance ?? null,
    formatPrice(place.price_level),
  ].filter(Boolean);

  const ctaLabel = getCTALabel(place);
  const ctaHref = getCTAHref(place);
  const isDirections =
    place.category === "outdoors" || place.category === "attraction";

  return (
    <div className="card-shadow overflow-hidden rounded-default bg-card">
      {/* Image */}
      {/* Decorative duplicate of the title link below, so it's out of the tab order and hidden from
          screen readers (a keyboard user would otherwise land on the same card twice). */}
      <Link
        href={`/${slug}/explore/place/${place.id}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block no-underline"
      >
        <div className="aspect-[16/7] w-full overflow-hidden">
          {place.image_url ? (
            <img loading="lazy" decoding="async" src={place.image_url} alt="" className="size-full object-cover" />
          ) : (
            <div
              className="size-full"
              style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A89878 100%)" }}
            />
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="px-4 pb-4 pt-3">
        <Link href={`/${slug}/explore/place/${place.id}`} className="hit-area block no-underline">
          <h2 className="m-0 font-serif text-card-title-md font-medium leading-tight text-foreground">
            {place.name}
          </h2>
        </Link>

        {metaParts.length > 0 && (
          <p className="m-0 mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}

        {place.description && (
          <p className="m-0 mt-2.5 text-body-sm leading-[var(--cf-body-line-height)] text-foreground">
            {place.description}
          </p>
        )}

        {/* CTA */}
        {ctaHref && (
          <div className="mt-3">
            {isDirections ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hit-area flex justify-end text-body-sm font-medium text-link no-underline"
              >
                {ctaLabel} →
              </a>
            ) : (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-default border border-primary px-4 py-2.5 text-body-sm font-medium text-link no-underline"
              >
                {ctaLabel} →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CardsLayout({
  items,
  slug,
}: {
  items: CollectionItemWithPlace[];
  slug: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <PlaceCard key={item.id} place={item.place} slug={slug} />
      ))}
    </div>
  );
}

// ─── Something else? section ──────────────────────────────────────────────────

function SomethingElse({
  slug,
  otherCollections,
  wide,
}: {
  slug: string;
  otherCollections: ExploreCollection[];
  wide?: boolean;
}) {
  // Wide: from 700px a two-column band (heading left, prompt right); the link to other guides sits
  // under the band, and moves into the right column at 1024px.
  return (
    <div
      className={`mt-10${
        wide ? " tab:grid tab:grid-cols-2 tab:items-start tab:gap-x-10 tab:gap-y-6" : ""
      }`}
    >
      <div className={wide ? "tab:text-left lg:row-span-2" : undefined}>
        <h2
          className={`m-0 mb-1 text-center font-serif text-card-title-lg font-medium text-foreground${
            wide ? " tab:text-left tab:text-[28px]" : ""
          }`}
        >
          Something else?
        </h2>
        <p
          className={`m-0 mb-4 text-center text-body-sm text-muted-foreground${
            wide ? " tab:mb-0 tab:text-left" : ""
          }`}
        >
          Tell us what you&apos;re in the mood for.
        </p>
      </div>

      <ConciergePrompt
        slug={slug}
        placeholder="Show me something different..."
        chips={["I'm hungry", "Something free", "Kid-friendly", "Surprise me"]}
      />

      {otherCollections.length > 0 && (
        <div className={`mt-6${wide ? " tab:col-span-2 tab:mt-0 lg:col-span-1 lg:col-start-2" : ""}`}>
          <p
            className={`m-0 mb-3 text-center text-body-sm text-muted-foreground${
              wide ? " tab:text-left" : ""
            }`}
          >
            Or explore something else.
          </p>
          <div
            className={`-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none${
              wide ? " cmp:mx-0 cmp:flex-wrap cmp:overflow-visible cmp:px-0" : ""
            }`}
          >
            {otherCollections.map((c) => (
              <Link
                key={c.id}
                href={`/${slug}/explore/${c.id}`}
                className="shrink-0 whitespace-nowrap rounded-chip border border-border px-4 py-2 text-body-sm text-foreground no-underline cmp:min-h-11"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page component ─────────────────────────────────────────────────────

interface ExploreCollectionPageProps {
  slug: string;
  venue: VenueWithTheme;
  collection: ExploreCollectionWithItems;
  otherCollections: ExploreCollection[];
}

export function ExploreCollectionPage({
  slug,
  venue,
  collection,
  otherCollections,
}: ExploreCollectionPageProps) {
  const { scrolled, sentinelRef } = useStickyScroll();
  usePageLabel(collection.title);

  // Only the timeline guide has a wide design so far; the cards layout keeps the phone column.
  const wide = collection.layout === "timeline";

  return (
    <PageFrame width="wide">
      <div ref={sentinelRef} className="h-0" />
      <VenueHeader
        venue={venue}
        slug={slug}
        scrolled={scrolled}
        backHref={`/${slug}/explore`}
        backLabel="Explore"
      />

      {/* Content. The header above always uses the wide frame so the back button is in the same
          place as on every other page; the cards layout keeps its narrow column underneath. */}
      <FrameBody narrow={!wide} className="px-page pb-10 pt-6">
        {/*
          Wide: title and intro in a left column (sticky at 1024px+), timeline on the right. Only
          these two live in the grid: a sticky element can travel as far as its parent, so the
          "Something else?" band below must sit outside it or the pinned column rides over it.
        */}
        <div
          className={
            wide
              ? "tab:grid tab:grid-cols-[280px_1fr] tab:gap-x-12 lg:grid-cols-[400px_1fr] lg:gap-x-16"
              : undefined
          }
        >
          <div className={wide ? "lg:sticky lg:top-6 lg:self-start" : undefined}>
            <CollectionHeader title={collection.title} subtitle={collection.subtitle} wide={wide} />

            {collection.description && (
              <p className="mb-6 text-body-sm leading-[var(--cf-body-line-height)] text-foreground">
                {collection.description}
              </p>
            )}
          </div>

          <div>
            {collection.layout === "timeline" ? (
              <TimelineLayout items={collection.items} slug={slug} />
            ) : (
              <CardsLayout items={collection.items} slug={slug} />
            )}
          </div>
        </div>

        <SomethingElse slug={slug} otherCollections={otherCollections} wide={wide} />

        <div className="mt-8">
          <VenueFooter
            venueName={venue.name}
            address={venue.address}
            phone={venue.phone}
            layout={wide ? "responsive" : "stack"}
          />
        </div>

        <div className="h-safe-bottom" />
      </FrameBody>
    </PageFrame>
  );
}
