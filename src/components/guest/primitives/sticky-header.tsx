"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FrameInner } from "@/components/guest/primitives/page-frame";

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStickyScroll() {
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

  return { scrolled, sentinelRef };
}

// Scroll-event-based variant for pages where the fixed header takes no layout
// space (so the IntersectionObserver sentinel at y=0 is unreliable).
export function useWindowScroll(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return scrolled;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

interface BaseHeaderProps {
  venueName: string;
  scrolled: boolean;
  /** Link-based back navigation */
  backHref?: string;
  /** Callback-based back navigation (e.g. router.back() or history.back()) */
  onBack?: () => void;
  /** If set, the venue name is rendered as a link */
  nameHref?: string;
  /**
   * For pages in the wide frame. Phone is unchanged; from 600px the header is static (not sticky)
   * with a 44px back button and 64px height, and from 1024px it becomes a text back link on the
   * left with the phone number on the right (80px).
   */
  wide?: boolean;
  /** Wide only, 1024px+: back link text (defaults to the venue name, e.g. "Explore" on place pages). */
  backLabel?: string;
  /** Wide only, 1024px+: front desk number shown on the right. */
  phone?: string | null;
}

// Every icon back button is a 44x44 target around a 20px arrow. The negative margins keep its
// layout box at 20x20, so the arrow sits exactly where a bare icon would. Wide headers hand over
// to the text link at 1024px.
const BACK_TARGET = "-m-3 flex size-11 items-center justify-center";

function BackButton({
  backHref,
  onBack,
  wide,
}: {
  backHref?: string;
  onBack?: () => void;
  wide?: boolean;
}) {
  const extra = `${BACK_TARGET}${wide ? " lg:hidden" : ""}`;
  if (backHref) {
    return (
      <Link
        href={backHref}
        aria-label="Go back"
        className={`shrink-0 text-primary no-underline ${extra}`}
      >
        <ArrowLeft size={20} />
      </Link>
    );
  }
  if (onBack) {
    return (
      <button
        onClick={onBack}
        aria-label="Go back"
        className={`shrink-0 cursor-pointer border-none bg-transparent p-0 text-primary ${extra}`}
      >
        <ArrowLeft size={20} />
      </button>
    );
  }
  return <div className={`w-5 shrink-0${wide ? " lg:hidden" : ""}`} />;
}

function NameContent({
  venueName,
  nameHref,
}: {
  venueName: string;
  nameHref?: string;
}) {
  if (nameHref) {
    return (
      <Link
        href={nameHref}
        className="pointer-events-auto font-serif text-[20px] font-medium text-foreground no-underline"
      >
        {venueName}
      </Link>
    );
  }
  return (
    <span className="font-serif text-[20px] font-medium text-foreground">{venueName}</span>
  );
}

// ─── Shared header row ───────────────────────────────────────────────────────

type HeaderRowProps = Pick<
  BaseHeaderProps,
  "venueName" | "backHref" | "onBack" | "nameHref" | "wide" | "backLabel" | "phone"
>;

const LAPTOP_LINK =
  "min-h-11 items-center gap-2 text-body font-medium text-primary no-underline cursor-pointer border-none bg-transparent p-0";

function HeaderRow({
  venueName,
  backHref,
  onBack,
  nameHref,
  wide,
  backLabel,
  phone,
}: HeaderRowProps) {
  const label = backLabel ?? venueName;
  return (
    <>
      <BackButton backHref={backHref} onBack={onBack} wide={wide} />
      <div
        className={`pointer-events-none absolute inset-x-0 flex items-center justify-center${
          wide ? " lg:hidden" : ""
        }`}
      >
        <NameContent venueName={venueName} nameHref={nameHref} />
      </div>
      <div className={wide ? "w-5 shrink-0 cmp:w-11 lg:hidden" : "w-5 shrink-0"} />
      {wide && (
        <div className="hidden flex-1 items-center justify-between lg:flex">
          {backHref ? (
            <Link href={backHref} className={`inline-flex ${LAPTOP_LINK}`}>
              <ArrowLeft size={20} aria-hidden="true" />
              {label}
            </Link>
          ) : onBack ? (
            <button onClick={onBack} className={`inline-flex ${LAPTOP_LINK}`}>
              <ArrowLeft size={20} aria-hidden="true" />
              {label}
            </button>
          ) : (
            <span />
          )}
          {phone && (
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="text-body font-medium text-primary no-underline"
            >
              {phone}
            </a>
          )}
        </div>
      )}
    </>
  );
}

// ─── Floating Back Button ────────────────────────────────────────────────────
// Overlays a large hero image. Hides when the sticky header scrolls into view.
// Used on: venue/poster detail variant, cruise restaurant detail.

interface FloatingBackButtonProps {
  scrolled: boolean;
  backHref?: string;
  onBack?: () => void;
  /** Wide-frame pages show the back button in the header from 600px, so this floats on phones only. */
  wide?: boolean;
}

export function FloatingBackButton({ scrolled, backHref, onBack, wide }: FloatingBackButtonProps) {
  const inner = (
    <div
      className="flex items-center justify-center rounded-default"
      style={{
        width: 44,
        height: 44,
        backgroundColor: "var(--cf-glass-bg)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <ArrowLeft size={20} className="text-primary" />
    </div>
  );

  const base = `fixed z-40 transition-opacity duration-200 ${scrolled ? "pointer-events-none opacity-0" : "opacity-100"}${wide ? " cmp:hidden" : ""}`;
  // Fixed to the viewport, so on wide screens line it up with the narrow frame's left gutter.
  const posStyle = {
    top: 48,
    left: "max(20px, calc((100% - var(--cf-frame-narrow-max)) / 2 + 20px))",
  };

  if (backHref) {
    return (
      <Link href={backHref} aria-label="Go back" className={`${base} no-underline`} style={posStyle}>
        {inner}
      </Link>
    );
  }
  if (onBack) {
    return (
      <button
        onClick={onBack}
        aria-label="Go back"
        className={`${base} cursor-pointer border-none bg-transparent p-0`}
        style={posStyle}
      >
        {inner}
      </button>
    );
  }
  return null;
}

// ─── Standard Sticky Header ──────────────────────────────────────────────────
// Always visible. Used on: Info page, Explore landing, Explore results,
// Timeline (name row), Dining, The Crew.

export function StickyHeader({
  venueName,
  scrolled,
  backHref,
  onBack,
  nameHref,
  wide,
  backLabel,
  phone,
}: BaseHeaderProps) {
  // Same geometry as ScrollRevealStickyHeader: the safe-area padding is on the outer element and
  // the row (with its minimum height) is inside it, so the back arrow sits at the same spot on
  // every page.
  return (
    <div
      className={`sticky top-0 z-30 pt-safe pb-2 transition-[border-color] duration-200 ${
        wide ? "cmp:relative cmp:border-transparent cmp:pb-0 " : ""
      }${scrolled ? "border-b border-border" : "border-b border-transparent"}`}
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className={`relative flex items-center ${
          wide ? "px-page cmp:min-h-16 lg:min-h-20" : "px-5"
        }`}
      >
        <HeaderRow
          venueName={venueName}
          backHref={backHref}
          onBack={onBack}
          nameHref={nameHref}
          wide={wide}
          backLabel={backLabel}
          phone={phone}
        />
      </div>
    </div>
  );
}

// ─── Scroll-Reveal Sticky Header ─────────────────────────────────────────────
// Back arrow always visible; venue name fades in (200ms) when the page header
// scrolls out of view, fades back out when user scrolls up.
// Used on: all venue detail page variants (venue home, cruise home).

export function ScrollRevealStickyHeader({
  venueName,
  scrolled,
  backHref,
  onBack,
  nameHref,
  wide,
  backLabel,
  phone,
}: BaseHeaderProps) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-30 pt-safe pb-2 transition-[border-color,opacity] duration-200 ${
        scrolled ? "border-b border-border opacity-100" : "border-b border-transparent opacity-0 pointer-events-none"
      }${
        wide
          ? " cmp:static cmp:border-transparent cmp:pb-0 cmp:opacity-100 cmp:pointer-events-auto"
          : ""
      }`}
      style={{ backgroundColor: "var(--background)" }}
    >
      <FrameInner
        width={wide ? "wide" : "narrow"}
        className={`relative flex items-center ${
          wide ? "px-page cmp:min-h-16 lg:min-h-20" : "px-5"
        }`}
      >
        <HeaderRow
          venueName={venueName}
          backHref={backHref}
          onBack={onBack}
          nameHref={nameHref}
          wide={wide}
          backLabel={backLabel}
          phone={phone}
        />
      </FrameInner>
    </div>
  );
}
