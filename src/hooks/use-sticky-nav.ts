"use client";

import { useRef, useState, useEffect } from "react";

/**
 * Tracks whether the page has scrolled past a header element.
 *
 * Usage:
 *   const { showStickyNav, headerRef } = useStickyNav();
 *   <div ref={headerRef}>...</div>
 *   <nav style={{ transform: showStickyNav ? "translateY(0)" : "translateY(-100%)" }}>
 */
export function useStickyNav() {
  const [showStickyNav, setShowStickyNav] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setShowStickyNav(rect.bottom <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { showStickyNav, headerRef };
}
