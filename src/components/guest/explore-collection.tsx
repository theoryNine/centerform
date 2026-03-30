"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { VenueFooter } from "@/components/guest/venue-footer";
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

function formatPrice(priceLevel: number | null): string | null {
  if (priceLevel === 0) return "FREE";
  if (!priceLevel) return null;
  return "$".repeat(priceLevel);
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
    <div className="relative mx-0 mb-5 px-4 py-6 text-center">
      {/* Corner brackets */}
      <span className="absolute left-0 top-0 inline-block h-4 w-4 border-l border-t border-foreground/25" />
      <span className="absolute right-0 top-0 inline-block h-4 w-4 border-r border-t border-foreground/25" />
      <span className="absolute bottom-0 left-0 inline-block h-4 w-4 border-b border-l border-foreground/25" />
      <span className="absolute bottom-0 right-0 inline-block h-4 w-4 border-b border-r border-foreground/25" />

      <h1 className="m-0 font-serif text-[26px] font-normal leading-tight text-foreground">
        {title}
      </h1>
      {/* Decorative underline */}
      <div className="mx-auto my-3 h-px w-12 bg-foreground/20" />
      {subtitle && (
        <p className="m-0 text-[13px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Timeline layout ─────────────────────────────────────────────────────────

function TimelineCard({ item, slug }: { item: CollectionItemWithPlace; slug: string }) {
  const { place } = item;

  if (item.is_start || item.is_end) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative z-10 h-3 w-3 shrink-0 rounded-full bg-primary" />
        <p className="m-0 text-[11px] font-semibold tracking-widest text-primary">
          {item.is_start ? "START" : "END"} · {place.name.toUpperCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {/* Dot on timeline */}
      <div className="relative z-10 mt-[18px] h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />

      {/* Card */}
      <Link
        href={`/${slug}/explore/place/${place.id}`}
        className="card-shadow mb-3 flex flex-1 items-center gap-3 overflow-hidden rounded-[5px] bg-card no-underline"
      >
        {place.image_url && (
          <div className="h-[80px] w-[80px] shrink-0 overflow-hidden">
            <img src={place.image_url} alt={place.name} className="size-full object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1 py-3 pr-2 pl-3">
          <p className="m-0 font-serif text-[15px] font-semibold leading-tight text-foreground">
            {place.name}
          </p>
          {place.description && (
            <p className="m-0 mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-2">
              {place.description}
            </p>
          )}
        </div>
        <ArrowRight size={15} className="mr-3 shrink-0 text-primary" />
      </Link>
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
    <div className="relative pl-1">
      {/* Vertical line — sits behind dots */}
      <div className="absolute left-[5px] top-3 bottom-3 w-px bg-muted-foreground/25" />

      <div className="flex flex-col gap-2">
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
    <div className="card-shadow overflow-hidden rounded-[5px] bg-card">
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
          <h2 className="m-0 font-serif text-[20px] font-normal leading-tight text-foreground">
            {place.name}
          </h2>
        </Link>

        {metaParts.length > 0 && (
          <p className="m-0 mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}

        {place.description && (
          <p className="m-0 mt-2.5 text-[14px] leading-relaxed text-foreground">
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
                className="flex justify-end text-[13px] font-medium text-primary no-underline"
              >
                {ctaLabel} →
              </a>
            ) : (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-[5px] border border-primary px-4 py-2.5 text-[13px] font-medium text-primary no-underline"
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
  const router = useRouter();
  const chips = ["I'm hungry", "Something free", "Kid-friendly", "Surprise me"];

  return (
    <div className="mt-10">
      <h2 className="m-0 mb-1 text-center font-serif text-[22px] font-normal text-foreground">
        Something else?
      </h2>
      <p className="m-0 mb-4 text-center text-[13px] text-muted-foreground">
        Tell us what you&apos;re in the mood for.
      </p>

      <button
        onClick={() => router.push(`/${slug}/concierge`)}
        className="mb-3 w-full cursor-pointer rounded-[5px] border border-border bg-background px-4 py-3 text-left text-[13px] text-muted-foreground"
      >
        Show me something different...
      </button>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => router.push(`/${slug}/concierge`)}
            className="cursor-pointer whitespace-nowrap rounded-full border border-border bg-transparent px-4 py-2 text-[13px] text-foreground"
          >
            {chip}
          </button>
        ))}
      </div>

      {otherCollections.length > 0 && (
        <div className="mt-6">
          <p className="m-0 mb-3 text-center text-[13px] text-muted-foreground">
            Or explore something else.
          </p>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
            {otherCollections.map((c) => (
              <Link
                key={c.id}
                href={`/${slug}/explore/${c.id}`}
                className="shrink-0 whitespace-nowrap rounded-full border border-border px-4 py-2 text-[13px] text-foreground no-underline"
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
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
      <div ref={sentinelRef} className="h-0" />

      {/* Sticky header */}
      <div
        className={`sticky top-0 z-30 pt-safe flex items-center px-5 pb-2 transition-[border-color] duration-200 ${
          scrolled ? "border-b border-border" : "border-b border-transparent"
        }`}
        style={{ backgroundColor: "var(--background)" }}
      >
        <Link href={`/${slug}/explore`} className="shrink-0 text-primary no-underline">
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
      <div className="px-5 pb-10 pt-6">
        <CollectionHeader title={collection.title} subtitle={collection.subtitle} />

        {collection.description && (
          <p className="mb-6 text-[14px] leading-relaxed text-foreground">
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
