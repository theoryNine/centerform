"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DirtyRegistryContext } from "@/components/dashboard/dirty-form";
import { parseVenueTab, VENUE_TABS, type VenueTabKey } from "@/lib/venue-tabs";

interface VenueSettingsTabsProps {
  initialTab: VenueTabKey;
  panels: Record<VenueTabKey, ReactNode>;
}

const LEAVE_MESSAGE = "You have unsaved changes. Leave without saving?";

/**
 * Tabs for Hotel Info & Branding. All three panels stay mounted (the inactive ones are hidden), so
 * switching tabs never loses edits. The active tab lives in `?tab=` so reloads and checklist links
 * land in the right place. Also guards against leaving the page with unsaved changes.
 */
export function VenueSettingsTabs({ initialTab, panels }: VenueSettingsTabsProps) {
  const [active, setActive] = useState<VenueTabKey>(initialTab);
  // Panels mount the first time they are shown and then stay mounted, so edits survive tab
  // switches. (The Branding panel loads every Google Font it previews, so it waits for a visit.)
  const [visited, setVisited] = useState<Set<VenueTabKey>>(() => new Set([initialTab]));
  const [dirty, setDirty] = useState<Record<string, number>>({});

  const report = useCallback((key: string, count: number) => {
    setDirty((prev) => (prev[key] === count ? prev : { ...prev, [key]: count }));
  }, []);
  const registry = useMemo(() => ({ report }), [report]);
  const anyDirty = Object.values(dirty).some((n) => n > 0);

  // A link from elsewhere (e.g. the Overview checklist) can change ?tab= while this stays mounted.
  useEffect(() => {
    setActive(initialTab);
    setVisited((v) => (v.has(initialTab) ? v : new Set(v).add(initialTab)));
  }, [initialTab]);

  function handleTabChange(next: string) {
    const tab = parseVenueTab(next);
    setActive(tab);
    setVisited((v) => (v.has(tab) ? v : new Set(v).add(tab)));
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(window.history.state, "", url);
  }

  // Leaving the page: reloads and closing the tab...
  useEffect(() => {
    if (!anyDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [anyDirty]);

  // ...and in-app link clicks. Capture phase on `document` runs before React/Next's Link handler.
  // (The browser Back button is not intercepted; the App Router has no hook for it.)
  useEffect(() => {
    if (!anyDirty) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      const dest = new URL(anchor.href, window.location.href);
      if (dest.origin !== window.location.origin) return;
      if (dest.pathname === window.location.pathname) return; // staying on this page (tab links)
      if (!window.confirm(LEAVE_MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [anyDirty]);

  return (
    <DirtyRegistryContext.Provider value={registry}>
      <Tabs value={active} onValueChange={handleTabChange} className="gap-6">
        <TabsList variant="line" className="h-11 w-full justify-start gap-6 border-b p-0">
          {VENUE_TABS.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              id={`venue-tab-${t.key}`}
              className="text-muted-foreground after:bg-primary data-[state=active]:text-primary h-11 flex-none rounded-none px-1 text-base after:bottom-[-1px]"
            >
              {t.label}
              {(dirty[t.key] ?? 0) > 0 && (
                <>
                  <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
                  <span className="sr-only">(unsaved changes)</span>
                </>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {VENUE_TABS.map((t) => (
          <TabsContent
            key={t.key}
            value={t.key}
            forceMount
            aria-labelledby={`venue-tab-${t.key}`}
            className="data-[state=inactive]:hidden"
          >
            {visited.has(t.key) ? panels[t.key] : null}
          </TabsContent>
        ))}
      </Tabs>
    </DirtyRegistryContext.Provider>
  );
}
