import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
}: PageHeroProps) {
  const isHome = size === "home";

  return (
    <div
      className={cn(
        "flex items-center",
        isHome
          ? "min-h-[280px] pt-[calc(env(safe-area-inset-top,0px)+32px)]"
          : "min-h-[180px]",
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
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt} className="size-full object-cover" />
        ) : (
          fallbackNode
        )}
      </div>

      {/* Text */}
      <div
        className={cn(
          "flex flex-1 flex-col justify-center px-6",
          textAlign === "center" ? "items-center text-center" : "items-start",
          animated && "animate-fade-in",
        )}
      >
        <h1
          className={cn(
            "m-0 font-serif font-normal leading-tight text-foreground",
            isHome ? "text-hotel-name" : "text-page-title",
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
      </div>
    </div>
  );
}
