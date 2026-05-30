"use client";

import Link from "next/link";
import { useStickyScroll, StickyHeader } from "@/components/guest/primitives/sticky-header";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { ConciergePrompt } from "@/components/guest/primitives/concierge-prompt";
import { CornerBracketCard } from "@/components/guest/primitives/corner-bracket-card";
import { NavCard } from "@/components/guest/primitives/nav-card";
import { formatPrice } from "@/lib/utils";
import type {
  ExploreCollectionWithItems,
  CollectionItemWithPlace,
  ExploreCollection,
  NearbyPlace,
  PlaceCategory,
  VenueWithTheme,
} from "@/types";

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
  if (place.website) return place.website;
  if (place.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}`;
  }
  return null;
}

// ─── Header card (corner brackets) ──────────────────────────────────────────

function CollectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string | null;
}) {
  return (
    <CornerBracketCard className="mb-5">
      <h1 className="m-0 font-serif text-page-title font-semibold leading-tight text-foreground">
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
      <div className="relative pb-5 flex items-center">
        <div className="absolute left-[24px] z-10 h-3 w-3 rounded-full bg-primary" />
        <p className="m-0 pl-[48px] text-label font-semibold tracking-widest text-primary">
          {item.is_start ? "START" : "END"} · {place.name.toUpperCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-3">
      {item.time_label && (
        <p className="relative z-10 m-0 mb-2 bg-background text-body-sm font-semibold text-foreground">
          {item.time_label}
        </p>
      )}
      <div className="relative pl-[60px]">
        <div className="absolute left-[26px] top-[10px] z-10 h-2 w-2 rounded-full bg-muted-foreground/60" />
        <div className="absolute left-[34px] top-[13px] h-px w-[26px] bg-muted-foreground/25" />
        <NavCard
          label={place.name}
          sublabel={place.description ?? ""}
          href={`/${slug}/explore/place/${place.id}`}

          sublabelClassName="line-clamp-2"
          hideImage
        />
      </div>
    </div>
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
        className="absolute top-3 bottom-3 w-px bg-muted-foreground/25"
        style={{ left: "30px" }}
      />
      <div className="flex flex-col">
        {items.map((item) => (
          <TimelineCard key={item.id} item={item} slug={slug} />
        ))}
      </div>
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
      <Link href={`/${slug}/explore/place/${place.id}`} className="block no-underline">
        <div className="aspect-[16/7] w-full overflow-hidden">
          {place.image_url ? (
            <img src={place.image_url} alt={place.name} className="size-full object-cover" />
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
        <Link href={`/${slug}/explore/place/${place.id}`} className="no-underline">
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
                className="flex justify-end text-body-sm font-medium text-primary no-underline"
              >
                {ctaLabel} →
              </a>
            ) : (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-default border border-primary px-4 py-2.5 text-body-sm font-medium text-primary no-underline"
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
}: {
  slug: string;
  otherCollections: ExploreCollection[];
}) {
  return (
    <div className="mt-10">
      <h2 className="m-0 mb-1 text-center font-serif text-card-title-lg font-medium text-foreground">
        Something else?
      </h2>
      <p className="m-0 mb-4 text-center text-body-sm text-muted-foreground">
        Tell us what you&apos;re in the mood for.
      </p>

      <ConciergePrompt
        slug={slug}
        placeholder="Show me something different..."
        chips={["I'm hungry", "Something free", "Kid-friendly", "Surprise me"]}
      />

      {otherCollections.length > 0 && (
        <div className="mt-6">
          <p className="m-0 mb-3 text-center text-body-sm text-muted-foreground">
            Or explore something else.
          </p>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
            {otherCollections.map((c) => (
              <Link
                key={c.id}
                href={`/${slug}/explore/${c.id}`}
                className="shrink-0 whitespace-nowrap rounded-chip border border-border px-4 py-2 text-body-sm text-foreground no-underline"
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

  return (
    <div className="min-h-screen bg-background font-sans">
      <div ref={sentinelRef} className="h-0" />
      <StickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        backHref={`/${slug}/explore`}
        nameHref={`/${slug}`}
      />

      {/* Content */}
      <div className="px-page pb-10 pt-6">
        <CollectionHeader title={collection.title} subtitle={collection.subtitle} />

        {collection.description && (
          <p className="mb-6 text-body-sm leading-[var(--cf-body-line-height)] text-foreground">
            {collection.description}
          </p>
        )}

        {collection.layout === "timeline" ? (
          <TimelineLayout items={collection.items} slug={slug} />
        ) : (
          <CardsLayout items={collection.items} slug={slug} />
        )}

        <SomethingElse slug={slug} otherCollections={otherCollections} />

        <div className="mt-8">
          <VenueFooter venueName={venue.name} address={venue.address} phone={venue.phone} />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
