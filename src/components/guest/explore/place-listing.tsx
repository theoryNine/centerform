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
import { safeHttpUrl } from "@/lib/url";
import { PageFrame } from "@/components/guest/primitives/page-frame";
import { useRouter } from "next/navigation";
import { usePreviousPage } from "@/components/guest-nav-history";

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
  const website = safeHttpUrl(place.website);
  if (website) return website;
  if ((place.category === "outdoors" || place.category === "attraction") && place.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}`;
  }
  return null;
}

// Photo sizing for 600px+ (phone keeps the 4:3 hero). Handoff: 280px compact tablet, 480px tablet
// (left column), 520px laptop with a larger radius. Capped by viewport height for landscape phones.
const PHOTO_CLASSES =
  "cmp:aspect-auto cmp:h-[280px] cmp:rounded-2xl tab:col-start-1 tab:row-span-2 tab:row-start-1 tab:h-[480px] tab:max-h-[60dvh] tab:self-start lg:h-[520px] lg:max-h-[70dvh] lg:rounded-[20px]";

interface PlaceListingProps {
  slug: string;
  venue: VenueWithTheme;
  place: NearbyPlace;
}

export function PlaceListing({ slug, venue, place }: PlaceListingProps) {
  const scrolled = useWindowScroll();
  const router = useRouter();
  // Back goes to wherever the guest came from, labelled with that page's name. A direct visit
  // (shared link) has no previous page, so back goes to Explore instead of leaving the site.
  const previous = usePreviousPage();
  const backLabel = previous ? (previous.label ?? "Back") : "Explore";
  const goBack = () => (previous ? history.back() : router.push(`/${slug}/explore`));
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
    <PageFrame width="wide">
      {!loaded && <LoadingSpinner />}
      <ScrollRevealStickyHeader
        venueName={venue.name}
        scrolled={scrolled}
        onBack={goBack}
        nameHref={`/${slug}`}
        wide
        backLabel={backLabel}
        phone={venue.phone}
      />
      <FloatingBackButton scrolled={scrolled} onBack={goBack} wide />

      {/*
        Phone: hero with the name card overlapping its bottom edge, content below.
        600px+: no overlap, photo then title then content (two columns, facts on the right).
        700px+: grid with the photo on the left (spanning both rows); the hero wrapper uses
        `contents` so the photo and title card become grid items next to the content.
      */}
      <div className="cmp:px-page tab:grid tab:grid-cols-2 tab:grid-rows-[auto_1fr] tab:gap-x-10 lg:grid-cols-[7fr_5fr] lg:gap-x-14">
        {/* Hero + floating name card */}
        <div className="tab:contents relative">
          {place.image_url ? (
            <div className={`aspect-[4/3] w-full overflow-hidden ${PHOTO_CLASSES}`}>
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
              className={`h-[240px] w-full ${PHOTO_CLASSES}`}
              style={{
                background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A89878 100%)",
              }}
            />
          )}

          {/* Name card — 50% overlaps the bottom of the hero */}
          <div className="px-page cmp:static cmp:mt-6 cmp:translate-y-0 cmp:px-0 tab:col-start-2 tab:row-start-1 tab:mt-0 absolute right-0 bottom-0 left-0 z-10 translate-y-1/2">
            <div className="rounded-default bg-card px-card cmp:bg-transparent cmp:p-0 cmp:text-left cmp:shadow-none py-5 text-center shadow-md">
              <h1 className="text-hotel-name text-foreground cmp:text-[36px] tab:text-[48px] m-0 font-serif leading-tight font-semibold lg:text-[60px]">
                {place.name}
              </h1>
              {metaParts.length > 0 && (
                <p className="text-label text-muted-foreground m-0 mt-1.5 font-semibold tracking-widest uppercase">
                  {metaParts.join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content — top padding clears the overlapping card (phone only) */}
        <div className="bg-background tab:col-start-2 tab:row-start-2">
          <div className="px-page cmp:grid cmp:grid-cols-2 cmp:items-start cmp:gap-x-10 cmp:px-0 cmp:pt-8 tab:block tab:pt-6 pt-20">
            {/* Description */}
            {place.description && (
              <p className="text-body text-foreground cmp:col-start-1 m-0 leading-[var(--cf-body-line-height)]">
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
              <div className="cmp:col-start-1 mt-5 flex flex-col gap-2 lg:flex-row lg:flex-wrap">
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-default bg-primary text-body-sm text-primary-foreground cmp:min-h-[52px] flex items-center justify-center gap-1.5 px-4 py-3 font-medium no-underline lg:px-8"
                >
                  {ctaLabel} →
                </a>
                {websiteHref && (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-default border-border text-body-sm text-foreground cmp:min-h-[52px] flex items-center justify-center border px-4 py-3 font-medium no-underline lg:px-8"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            )}

            {/* Metadata */}
            {hasMetadata && (
              <>
                <div className="cmp:hidden mt-6 flex justify-center">
                  <div className="border-border w-10 border-t" />
                </div>
                <div className="cmp:col-start-2 cmp:row-span-2 cmp:row-start-1 cmp:-mt-4 tab:mt-6 mt-6 flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
                  {place.address && mapsHref && (
                    <div className="border-border border-b py-4">
                      <p className="text-muted-foreground m-0 mb-1.5 text-[10px] font-semibold tracking-widest uppercase">
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
                    <div className="border-border border-b py-4">
                      <p className="text-muted-foreground m-0 mb-1.5 text-[10px] font-semibold tracking-widest uppercase">
                        Hours
                      </p>
                      <p className="text-body-sm text-foreground m-0">{place.hours}</p>
                    </div>
                  )}
                  {priceLabel && (
                    <div className="border-border border-b py-4">
                      <p className="text-muted-foreground m-0 mb-1.5 text-[10px] font-semibold tracking-widest uppercase">
                        Price
                      </p>
                      <p className="text-body-sm text-foreground m-0">{priceLabel}</p>
                    </div>
                  )}
                  {place.phone && (
                    <div className="border-border border-b py-4">
                      <p className="text-muted-foreground m-0 mb-1.5 text-[10px] font-semibold tracking-widest uppercase">
                        Phone
                      </p>
                      <a
                        href={`tel:${place.phone.replace(/\D/g, "")}`}
                        className="text-body-sm text-primary flex min-h-[44px] items-center no-underline"
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
              <div className="cmp:col-span-2 mt-6">
                <h2 className="text-card-title-md text-foreground m-0 mb-3 font-serif font-medium">
                  What to know
                </h2>
                <ul className="m-0 list-none p-0">
                  {place.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-body-sm text-foreground mb-2 flex gap-2.5 leading-snug"
                    >
                      <span className="text-primary mt-px shrink-0 font-medium">·</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-page pb-10">
        <div className="cmp:mt-12 mt-8">
          <VenueFooter
            venueName={venue.name}
            address={venue.address}
            phone={venue.phone}
            layout="responsive"
          />
        </div>

        <div className="h-safe-bottom" />
      </div>
    </PageFrame>
  );
}
