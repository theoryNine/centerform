"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Grid for a list of `responsive` NavCards: one column on phones, two from 600px, three from 1024px. */
export const NAV_CARD_GRID = "gap-card-gap cmp:grid cmp:grid-cols-2 lg:grid-cols-3";

interface NavCardProps {
  label: string;
  sublabel: string;
  href: string;
  imageUrl?: string;
  onSettle?: () => void;
  footer?: ReactNode;
  sublabelClassName?: string;
  hideImage?: boolean;
  /**
   * List layout for wide-frame pages. Phone is the horizontal row (unchanged). 600–699px: image-top
   * card; 700–1023px: horizontal row with a 120px photo; 1024px+: image-top card (176px photo).
   * Put the cards in a grid: `cmp:grid cmp:grid-cols-2 lg:grid-cols-3`.
   */
  responsive?: boolean;
  /** With `responsive`: at 1024px+ span the whole grid row as a horizontal card with a 260px photo. */
  featured?: boolean;
  /**
   * Home tile: from 600px an image-top card (photo 120px, 160px from 700px, 200px from 1024px) for
   * a three-across grid. Phone stays the horizontal row.
   */
  tile?: boolean;
  /** Lazy-load the image. Use for cards that are hidden on some widths so they cost nothing there. */
  lazyImage?: boolean;
}

export function NavCard({
  label,
  sublabel,
  href,
  imageUrl,
  onSettle,
  footer,
  sublabelClassName,
  hideImage,
  responsive,
  featured,
  tile,
  lazyImage,
}: NavCardProps) {
  // Report the image as settled exactly once. A cached image can finish loading before React
  // attaches onLoad (it never fires then), so also check `complete` when the element mounts;
  // otherwise pages waiting on every card image (Home, Dining) would show their spinner forever.
  const settled = useRef(false);
  const settle = () => {
    if (settled.current) return;
    settled.current = true;
    onSettle?.();
  };

  return (
    <Link
      href={href}
      // Cards are ISR pages backed by Supabase; prefetching a screenful of them on a cold cache
      // would render every one of them, so navigate on tap like the old router.push did.
      prefetch={false}
      className={cn(
        "card-shadow hover:[box-shadow:var(--cf-card-shadow-hover,var(--cf-card-shadow))] flex min-h-[116px] w-full cursor-pointer items-center gap-4 overflow-hidden rounded-default bg-card p-0 text-left no-underline transition-transform ease-out active:scale-[var(--cf-press-scale)]",
        responsive &&
          "relative cmp:min-h-0 cmp:flex-col cmp:items-stretch cmp:gap-0 tab:min-h-[116px] tab:flex-row tab:items-center tab:gap-4 lg:min-h-0 lg:flex-col lg:items-stretch lg:gap-0",
        responsive && featured && "lg:col-span-3 lg:min-h-[116px] lg:flex-row lg:items-center lg:gap-6",
        tile && "relative cmp:min-h-0 cmp:flex-col cmp:items-stretch cmp:gap-0",
      )}
      style={{ transitionDuration: "var(--cf-press-duration)" }}
      onMouseDown={(e) => (e.currentTarget.style.transform = `scale(var(--cf-press-scale))`)}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onTouchStart={(e) => (e.currentTarget.style.transform = `scale(var(--cf-press-scale))`)}
      onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {!hideImage && (
        <div
          className={cn(
            "relative w-[30%] shrink-0 self-stretch overflow-hidden",
            responsive &&
              "cmp:h-[110px] cmp:w-full cmp:self-auto tab:h-auto tab:w-[120px] tab:self-stretch lg:h-[176px] lg:w-full lg:self-auto",
            responsive && featured && "lg:h-auto lg:w-[260px] lg:self-stretch",
            tile && "cmp:h-[120px] cmp:w-full cmp:self-auto tab:h-[160px] lg:h-[200px]",
          )}
          style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)" }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              loading={lazyImage ? "lazy" : undefined}
              decoding={lazyImage ? "async" : undefined}
              ref={(el) => {
                if (el?.complete) settle();
              }}
              onLoad={settle}
              onError={settle}
              className="absolute inset-0 size-full object-cover"
            />
          )}
        </div>
      )}
      <div
        className={cn(
          "min-w-0 flex-1 py-4",
          hideImage && "pl-4",
          responsive &&
            "cmp:px-4 cmp:pb-4 cmp:pr-12 cmp:pt-3 tab:px-0 tab:py-4 tab:pr-0 lg:px-4 lg:pb-4 lg:pr-12 lg:pt-3",
          responsive && featured && "lg:px-0 lg:py-4 lg:pr-0",
          tile && "cmp:px-4 cmp:pb-4 cmp:pr-12 cmp:pt-3",
        )}
      >
        <div className="mb-0.5 font-serif text-card-title-lg font-normal text-foreground">{label}</div>
        {sublabel && <div className={`text-body-sm leading-snug text-muted-foreground ${sublabelClassName ?? ""}`}>{sublabel}</div>}
        {footer && <div className="mt-1.5">{footer}</div>}
      </div>
      <ArrowRight
        size={18}
        color="var(--primary, #1A7A6D)"
        className={cn(
          "mr-3 shrink-0",
          responsive &&
            "cmp:absolute cmp:bottom-4 cmp:right-4 cmp:mr-0 tab:static tab:mr-3 lg:absolute lg:bottom-4 lg:right-4 lg:mr-0",
          responsive && featured && "lg:static lg:mr-3",
          tile && "cmp:absolute cmp:bottom-4 cmp:right-4 cmp:mr-0",
        )}
      />
    </Link>
  );
}

interface SectionDividerProps {
  title: string;
  /** Wide-frame pages: the rule starts at the content edge from 600px and is a hairline at 1024px. */
  wide?: boolean;
}

export function SectionDivider({ title, wide }: SectionDividerProps) {
  return (
    <div className="mb-heading-gap">
      <h2
        className={`mb-2 font-serif text-card-title-lg font-normal text-foreground${
          wide ? " lg:text-[28px]" : ""
        }`}
      >
        {title}
      </h2>
      <div
        className={`-ml-page h-0.5 w-[calc(60%+var(--cf-page-padding))] bg-primary${
          wide ? " cmp:ml-0 cmp:w-[70%] tab:w-1/2 lg:h-px lg:w-full lg:bg-border" : ""
        }`}
      />
    </div>
  );
}
