"use client";

import {
  useWindowScroll,
  ScrollRevealStickyHeader,
  FloatingBackButton,
} from "@/components/guest/primitives/sticky-header";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { useImageLoaded } from "@/hooks/use-image-loaded";
import type { NearbyPlace, VenueWithTheme } from "@/types";

function getCTALabel(category: NearbyPlace["category"]): string {
  switch (category) {
    case "restaurant":
    case "bar":
    case "cafe":
      return "Reserve a Table";
    case "outdoors":
    case "attraction":
      return "Get Directions";
    default:
      return "Learn More";
  }
}

function getCTAHref(place: NearbyPlace): string | null {
  if (place.website) return place.website;
  if (
    (place.category === "outdoors" || place.category === "attraction") &&
    place.address
  ) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}`;
  }
  return null;
}

interface PlaceListingProps {
  slug: string;
  venue: VenueWithTheme;
  place: NearbyPlace;
}

export function PlaceListing({ slug, venue, place }: PlaceListingProps) {
  const scrolled = useWindowScroll();
  const { loaded, imgRef, settle } = useImageLoaded(place.image_url);

  const priceLabel = place.price_level ? "$".repeat(place.price_level) : null;
  const ctaLabel = place.cta_label ?? getCTALabel(place.category);
  const ctaHref = place.booking_url ? `/api/go?place=${place.id}` : getCTAHref(place);
  const websiteHref = place.booking_url ? getCTAHref(place) : null;
  const mapsHref = place.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}`
    : null;

  const metaParts = [place.tagline, priceLabel].filter(Boolean);
  const hasMetadata = !!(place.address || place.hours || priceLabel || place.phone);

  return (
    <div className="min-h-screen bg-background font-sans">
      {!loaded && <LoadingSpinner />}
      <ScrollRevealStickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        onBack={() => history.back()}
        nameHref={`/${slug}`}
      />
      <FloatingBackButton scrolled={scrolled} onBack={() => history.back()} />

      {/* Hero + floating name card */}
      <div className="relative">
        {place.image_url ? (
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              ref={imgRef}
              src={place.image_url}
              alt={place.name}
              className="size-full object-cover"
              onLoad={settle}
              onError={settle}
            />
          </div>
        ) : (
          <div
            className="h-[240px] w-full"
            style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A89878 100%)" }}
          />
        )}

        {/* Name card — 50% overlaps the bottom of the hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1/2 px-page">
          <div className="rounded-default bg-card px-card py-5 text-center shadow-md">
            <h1 className="m-0 font-serif text-hotel-name font-semibold leading-tight text-foreground">
              {place.name}
            </h1>
            {metaParts.length > 0 && (
              <p className="m-0 mt-1.5 text-label font-semibold uppercase tracking-widest text-muted-foreground">
                {metaParts.join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content — top padding clears the overlapping card */}
      <div className="bg-background">
        <div className="px-page pb-10 pt-20">
          {/* Description */}
          {place.description && (
            <p className="m-0 text-body leading-[var(--cf-body-line-height)] text-foreground">
              {place.description.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          )}

          {/* CTA buttons */}
          {ctaHref && (
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-default bg-primary px-4 py-3 text-body-sm font-medium text-primary-foreground no-underline"
              >
                {ctaLabel} →
              </a>
              {websiteHref && (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-default border border-border px-4 py-3 text-body-sm font-medium text-foreground no-underline"
                >
                  Visit Website →
                </a>
              )}
            </div>
          )}

          {/* Metadata */}
          {hasMetadata && (
            <>
              <div className="mt-6 flex justify-center">
                <div className="w-10 border-t border-border" />
              </div>
              <div className="mt-6 flex flex-col">
                {place.address && mapsHref && (
                  <div className="border-b border-border py-4">
                    <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Address
                    </p>
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-sm text-primary no-underline"
                    >
                      {place.address}
                    </a>
                  </div>
                )}
                {place.hours && (
                  <div className="border-b border-border py-4">
                    <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Hours
                    </p>
                    <p className="m-0 text-body-sm text-foreground">{place.hours}</p>
                  </div>
                )}
                {priceLabel && (
                  <div className="border-b border-border py-4">
                    <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Price
                    </p>
                    <p className="m-0 text-body-sm text-foreground">{priceLabel}</p>
                  </div>
                )}
                {place.phone && (
                  <div className="border-b border-border py-4">
                    <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Phone
                    </p>
                    <a
                      href={`tel:${place.phone.replace(/\D/g, "")}`}
                      className="flex min-h-[44px] items-center text-body-sm text-primary no-underline"
                    >
                      {place.phone}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* What to know */}
          {place.tips && place.tips.length > 0 && (
            <div className="mt-6">
              <h2 className="m-0 mb-3 font-serif text-card-title-md font-medium text-foreground">
                What to know
              </h2>
              <ul className="m-0 list-none p-0">
                {place.tips.map((tip, i) => (
                  <li key={i} className="mb-2 flex gap-2.5 text-body-sm leading-snug text-foreground">
                    <span className="mt-px shrink-0 font-medium text-primary">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <VenueFooter venueName={venue.name} address={venue.address} phone={venue.phone} />
          </div>

          <div className="h-safe-bottom" />
        </div>
      </div>
    </div>
  );
}
