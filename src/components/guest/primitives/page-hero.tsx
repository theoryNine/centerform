"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { useImageLoaded } from "@/hooks/use-image-loaded";

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
   * grows to display size at 1024px. Photo height is capped at 40dvh for landscape phones.
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
            ? "h-[280px] w-[45%] min-w-[160px] max-w-[220px]"
            : "h-[180px] w-2/5 min-w-[140px] max-w-[180px]",
          animated && "animate-slide-in-left",
          wideDetail &&
            "cmp:h-[200px] cmp:w-1/2 cmp:max-w-none cmp:rounded-2xl cmp:rounded-br-[100px] tab:h-[min(260px,40dvh)] tab:rounded-br-[130px] lg:h-[min(340px,40dvh)] lg:rounded-br-[170px]",
          wide &&
            isHome &&
            "cmp:h-[220px] cmp:w-1/2 cmp:max-w-none cmp:rounded-2xl cmp:rounded-br-[110px] tab:h-[min(300px,40dvh)] tab:rounded-br-[150px] lg:h-[min(400px,40dvh)] lg:rounded-br-[200px]",
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
            "m-0 font-serif font-semibold leading-tight text-foreground",
            isHome ? "text-hotel-name" : "text-page-title",
            wideDetail && "cmp:text-[36px] tab:text-[48px] lg:text-[80px] lg:leading-none",
            wide && isHome && "cmp:text-[40px] tab:text-[52px] lg:text-[80px] lg:leading-none",
          )}
        >
          {title}
        </h1>
        {isHome && (
          <>
            <div className="my-3 mb-1.5 h-px w-8 bg-[#D0CBC3]" />
            {subtitle && (
              <p className="mt-2 text-label font-extrabold uppercase tracking-[var(--cf-text-label-spacing)] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </>
        )}
        {wideHero && aside && <div className="mt-4 hidden w-full cmp:block">{aside}</div>}
      </div>
    </div>
    </>
  );
}
