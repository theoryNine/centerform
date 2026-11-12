"use client";

import { createContext, useContext, useEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

interface NavHistory {
  /** Path of the page currently shown (updated after each navigation commits). */
  current: string | null;
  /** The page shown before `current`, or null on a direct visit. */
  previous: string | null;
  /** Human labels pages register for their own path, e.g. a guide's title. */
  labels: Map<string, string>;
}

const NavHistoryContext = createContext<RefObject<NavHistory> | null>(null);

/**
 * Remembers which in-app page the guest came from, so a detail page can label its back link
 * ("A Walk Through Ballard", "Dining", …) instead of guessing. Client-only state: it never
 * touches the server render, so guest pages stay statically cached.
 */
export function NavHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<NavHistory>({ current: null, previous: null, labels: new Map() });

  useEffect(() => {
    const history = ref.current;
    if (history.current !== pathname) {
      history.previous = history.current;
      history.current = pathname;
    }
  }, [pathname]);

  return <NavHistoryContext.Provider value={ref}>{children}</NavHistoryContext.Provider>;
}

/**
 * The in-app page the guest navigated from, captured when the calling page first renders.
 * `null` on a direct visit (and on the server render), so hydration always matches.
 */
export function usePreviousPage(): { path: string; label: string | null } | null {
  const ref = useContext(NavHistoryContext);
  const pathname = usePathname();
  const [previous] = useState(() => {
    const history = ref?.current;
    if (!history) return null;
    // The provider may or may not have recorded this page yet when we first render (a Suspense
    // boundary can delay the page past the provider's effect), so don't depend on the order.
    const from = history.current === pathname ? history.previous : history.current;
    return from ? { path: from, label: history.labels.get(from) ?? null } : null;
  });
  return previous;
}

/** Registers a label for the current page so pages navigated to from it can name it. */
export function usePageLabel(label: string) {
  const ref = useContext(NavHistoryContext);
  const pathname = usePathname();

  useEffect(() => {
    ref?.current?.labels.set(pathname, label);
  }, [ref, pathname, label]);
}
