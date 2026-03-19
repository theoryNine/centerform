"use client";

import { createContext, useContext } from "react";
import type { SlugResolution } from "@/types";

const SlugContext = createContext<SlugResolution | null>(null);

export function SlugProvider({
  value,
  children,
}: {
  value: SlugResolution;
  children: React.ReactNode;
}) {
  return <SlugContext.Provider value={value}>{children}</SlugContext.Provider>;
}

export function useSlug() {
  const ctx = useContext(SlugContext);
  if (!ctx) throw new Error("useSlug must be used within a SlugProvider");
  return ctx;
}

export function useVenue() {
  const ctx = useSlug();
  if (ctx.type !== "venue") throw new Error("useVenue called outside a venue context");
  return ctx.data;
}

export function useStandaloneEvent() {
  const ctx = useSlug();
  if (ctx.type !== "event") throw new Error("useStandaloneEvent called outside an event context");
  return ctx.data;
}
