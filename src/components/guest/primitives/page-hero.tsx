"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { useImageLoaded } from "@/hooks/use-image-loaded";

// Wide hero photo, sized from one variable (--hero-h, set per breakpoint on the element):
//  - height is capped at 48dvh so a landscape phone doesn't get a hero taller than the screen;
//  - width is half the row but never wider than ~2.1:1, so a short photo isn't stretched into a
//    banner;
//  - the signature rounded corner is always half the height, which keeps it circular at any size.
const WIDE_PHOTO =
  "cmp:h-[var(--hero-h)] cmp:w-[min(50%,calc(var(--hero-h)*2.1))] cmp:max-w-none cmp:rounded-2xl cmp:rounded-br-[calc(var(--hero-h)/2)]";

interface PageHeroProps {
  /** Cover image URL. If falsy, renders fallbackNode instead. */
  imageUrl?: string | null;
  imageAlt: string;
  /** Rendered inside the image slot when imageUrl is not set. */
  fallbackNode: ReactNode;
  /** Page title — can be a string or multiline JSX. */
  title: ReactNode;
  /** Location/metadata string shown below the divider (home size only). */
  subtitle?: string;
  /**
   * "home"   = 280px, safe-area top padding, hotel-name title size, divider + subtitle.
   * "detail" = 180px, no intrinsic padding. Default: "detail".
   */
  size?: "home" | "detail";
  /** Apply slide-in / fade-in entrance animations. */
  animated?: boolean;
  /** Extra classes on the outer wrapper (e.g. "pt-6"). */
  className?: string;
  /** Title alignment. Default: "center". */
  textAlign?: "center" | "left";
  /**
   * For wide-frame pages (detail size only). From 600px the photo is a ~50% column inside the
   * gutters with one large rounded corner and the title is left-aligned beside it; the title
   * grows to display size at 1024px. Photo height is capped at 48dvh for landscape phones.
   */
  wide?: boolean;
  /** Wide detail only: extra content under the title from 600px (e.g. address and hours). */
  aside?: ReactNode;
}

export function PageHero({
  imageUrl,
  imageAlt,
  fallbackNode,
  title,
  subtitle,
  size = "detail",
  animated = false,
  className,
  textAlign = "center",
  wide,
  aside,
}: PageHeroProps) {
  const isHome = size === "home";
  const wideDetail = wide && !isHome;
  const wideHero = !!wide; // detail and home both get the two-column wide hero
  const { loaded, imgRef, settle } = useImageLoaded(imageUrl);

  return (
    <>
      {!loaded && <LoadingSpinner />}
      <div
        className={cn(
          "flex items-center",
          isHome ? "min-h-[280px] pt-8" : "min-h-[180px]",
          wideHero && "cmp:min-h-0 cmp:px-page",
          className,
        )}
      >
        {/* Image — flush left, rounded right */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-r-[40%]",
            isHome
              ? "h-[280px] w-[45%] max-w-[220px] min-w-[160px]"
              : "h-[180px] w-2/5 max-w-[180px] min-w-[140px]",
            animated && "animate-slide-in-left",
            wideDetail &&
              `${WIDE_PHOTO} cmp:[--hero-h:min(200px,48dvh)] tab:[--hero-h:min(260px,48dvh)] lg:[--hero-h:min(340px,48dvh)]`,
            wide &&
              isHome &&
              `${WIDE_PHOTO} cmp:[--hero-h:min(220px,48dvh)] tab:[--hero-h:min(300px,48dvh)] lg:[--hero-h:min(400px,48dvh)]`,
          )}
        >
          {imageUrl ? (
            <img
              ref={imgRef}
              src={imageUrl}
              alt={imageAlt}
              className="size-full object-cover"
              onLoad={settle}
              onError={settle}
            />
          ) : (
            fallbackNode
          )}
        </div>

        {/* Text */}
        <div
          className={cn(
            "flex flex-1 flex-col justify-center px-6",
            textAlign === "center" ? "items-center text-center" : "items-start",
            wideHero && "cmp:items-start cmp:pl-8 cmp:pr-0 cmp:text-left lg:pl-14",
            animated && "animate-fade-in",
          )}
        >
          <h1
            className={cn(
              "text-foreground m-0 font-serif leading-tight font-semibold",
              isHome ? "text-hotel-name" : "text-page-title",
              wideDetail && "cmp:text-[36px] tab:text-[clamp(32px,11dvh,48px)] lg:text-[80px] lg:leading-none",
              wide && isHome && "cmp:text-[40px] tab:text-[clamp(34px,11dvh,52px)] lg:text-[80px] lg:leading-none",
            )}
          >
            {title}
          </h1>
          {isHome && (
            <>
              <div className="my-3 mb-1.5 h-px w-8 bg-[#D0CBC3]" />
              {subtitle && (
                <p className="text-label text-muted-foreground mt-2 font-extrabold tracking-[var(--cf-text-label-spacing)] uppercase">
                  {subtitle}
                </p>
              )}
            </>
          )}
          {wideHero && aside && <div className="cmp:block mt-4 hidden w-full">{aside}</div>}
        </div>
      </div>
    </>
  );
}
