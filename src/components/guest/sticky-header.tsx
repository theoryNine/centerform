"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
}

function BackButton({ backHref, onBack }: { backHref?: string; onBack?: () => void }) {
  if (backHref) {
    return (
      <Link href={backHref} className="shrink-0 text-primary no-underline">
        <ArrowLeft size={20} />
      </Link>
    );
  }
  if (onBack) {
    return (
      <button
        onClick={onBack}
        className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-primary"
      >
        <ArrowLeft size={20} />
      </button>
    );
  }
  return <div className="w-5 shrink-0" />;
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
        className="pointer-events-auto font-serif text-[20px] font-normal text-foreground no-underline"
      >
        {venueName}
      </Link>
    );
  }
  return (
    <span className="font-serif text-[20px] font-normal text-foreground">{venueName}</span>
  );
}

// ─── Floating Back Button ────────────────────────────────────────────────────
// Overlays a large hero image. Hides when the sticky header scrolls into view.
// Used on: venue/poster detail variant, cruise restaurant detail.

interface FloatingBackButtonProps {
  scrolled: boolean;
  backHref?: string;
  onBack?: () => void;
}

export function FloatingBackButton({ scrolled, backHref, onBack }: FloatingBackButtonProps) {
  const inner = (
    <div
      className="flex items-center justify-center rounded-default"
      style={{
        width: 44,
        height: 36,
        backgroundColor: "rgba(250,247,242,0.9)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <ArrowLeft size={18} className="text-primary" />
    </div>
  );

  const base = `fixed z-40 transition-opacity duration-200 ${scrolled ? "pointer-events-none opacity-0" : "opacity-100"}`;
  const posStyle = { top: 48, left: 20 };

  if (backHref) {
    return (
      <Link href={backHref} className={`${base} no-underline`} style={posStyle}>
        {inner}
      </Link>
    );
  }
  if (onBack) {
    return (
      <button
        onClick={onBack}
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

export function StickyHeader({ venueName, scrolled, backHref, onBack, nameHref }: BaseHeaderProps) {
  return (
    <div
      className={`sticky top-0 z-30 pt-safe relative flex items-center px-5 pb-2 transition-[border-color] duration-200 ${
        scrolled ? "border-b border-border" : "border-b border-transparent"
      }`}
      style={{ backgroundColor: "var(--background)" }}
    >
      <BackButton backHref={backHref} onBack={onBack} />
      <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
        <NameContent venueName={venueName} nameHref={nameHref} />
      </div>
      <div className="w-5 shrink-0" />
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
}: BaseHeaderProps) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-30 pt-safe flex items-center px-5 pb-2 transition-[border-color,opacity] duration-200 ${
        scrolled ? "border-b border-border opacity-100" : "border-b border-transparent opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: "var(--background)" }}
    >
      <BackButton backHref={backHref} onBack={onBack} />
      <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
        <NameContent venueName={venueName} nameHref={nameHref} />
      </div>
      <div className="w-5 shrink-0" />
    </div>
  );
}
