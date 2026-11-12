import type { ReactNode, Ref } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FrameInner, type PageFrameWidth } from "@/components/guest/primitives/page-frame";

// A 44x44 target around a 20px arrow. The negative margins keep the layout box at 20x20, so the
// arrow sits exactly where a bare icon would (see "Back buttons" in the guest CLAUDE.md).
const BACK_LINK = "shrink-0 -m-3 flex size-11 items-center justify-center text-link no-underline";
// Same, for a row where the title follows the arrow instead of being centered.
const BACK_LINK_BEFORE_TITLE =
  "-my-3 -ml-3 flex size-11 shrink-0 items-center justify-center text-link no-underline";

const WEIGHT = { normal: "font-normal", medium: "font-medium" } as const;

interface TitleProps {
  title: string;
  /** Weight of the centered title. Default "medium". */
  weight?: keyof typeof WEIGHT;
  /**
   * "center" (default): arrow on the left, title centered on the page. "start": arrow followed
   * directly by a smaller title (the Events page).
   */
  align?: "center" | "start";
}

interface BackLinkProps {
  href: string;
  /** Name of the page it goes back to; read out as "Back to <label>". */
  label: string;
  className?: string;
}

/** Icon-only back link: 44x44 target, 20px arrow, accessible name. */
export function BackLink({ href, label, className = BACK_LINK }: BackLinkProps) {
  return (
    <Link href={href} aria-label={`Back to ${label}`} className={className}>
      <ArrowLeft size={20} />
    </Link>
  );
}

interface PageTopBarProps extends TitleProps {
  backHref: string;
  backLabel: string;
  /** Where tapping the title goes (usually the venue home). */
  titleHref: string;
  className?: string;
}

/** The in-flow header at the top of a page: back arrow, title, safe-area padding. */
export function PageTopBar({
  backHref,
  backLabel,
  title,
  titleHref,
  weight = "medium",
  align = "center",
  className = "",
}: PageTopBarProps) {
  if (align === "start") {
    return (
      <div className={`flex items-center px-5 pb-2 pt-safe ${className}`}>
        <BackLink href={backHref} label={backLabel} className={BACK_LINK_BEFORE_TITLE} />
        <Link
          href={titleHref}
          className="font-serif text-base font-normal text-foreground no-underline"
        >
          {title}
        </Link>
      </div>
    );
  }
  return (
    <div className={`relative flex items-center px-5 pb-2 pt-safe ${className}`}>
      <BackLink href={backHref} label={backLabel} />
      <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
        <Link
          href={titleHref}
          className={`pointer-events-auto font-serif text-[20px] ${WEIGHT[weight]} text-foreground no-underline`}
        >
          {title}
        </Link>
      </div>
      <div className="w-5 shrink-0" />
    </div>
  );
}

interface SlideDownNavProps extends TitleProps {
  /** Visible (slid into view) or hidden above the viewport. Hidden means inert. */
  show: boolean;
  backHref: string;
  backLabel: string;
  /** Section tabs / pills shown under the title row. */
  children?: ReactNode;
  /** Frame the content lines up with. Default "narrow". */
  width?: PageFrameWidth;
  /** Side gutter of the rows: a fixed 20px (default) or the responsive page gutter. */
  gutter?: "fixed" | "page";
  /** Extra classes on the fixed bar, e.g. `lg:hidden`. */
  className?: string;
  navRef?: Ref<HTMLDivElement>;
}

/**
 * Bar that slides down from the top once the page's own header has scrolled out of view. While
 * it is off-screen it is `inert`, so keyboard and screen-reader users can't reach invisible links.
 */
export function SlideDownNav({
  show,
  backHref,
  backLabel,
  title,
  weight = "medium",
  align = "center",
  children,
  width = "narrow",
  gutter = "fixed",
  className = "",
  navRef,
}: SlideDownNavProps) {
  const px = gutter === "page" ? "px-page" : "px-5";
  return (
    <div
      ref={navRef}
      inert={!show}
      className={`fixed inset-x-0 top-0 z-50 bg-background transition-transform duration-300 ease-out ${className}`}
      style={{ transform: show ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <FrameInner width={width}>
          {align === "start" ? (
            <div className={`flex items-center ${px} py-3`}>
              <BackLink href={backHref} label={backLabel} className={BACK_LINK_BEFORE_TITLE} />
              <span className="font-serif text-base font-normal text-foreground">{title}</span>
            </div>
          ) : (
            <div className={`relative flex items-center ${px} py-3`}>
              <BackLink href={backHref} label={backLabel} />
              <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
                <span className={`font-serif text-[20px] ${WEIGHT[weight]} text-foreground`}>
                  {title}
                </span>
              </div>
              <div className="w-5 shrink-0" />
            </div>
          )}
          {children}
        </FrameInner>
        <div className="h-px bg-border" />
      </div>
    </div>
  );
}
