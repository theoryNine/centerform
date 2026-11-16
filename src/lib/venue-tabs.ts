// Tabs on Hotel Info & Branding. Kept out of the "use client" tabs component so the server page
// can call parseVenueTab.

export const VENUE_TABS = [
  { key: "general", label: "General" },
  { key: "images", label: "Page images" },
  { key: "branding", label: "Branding and theme" },
] as const;

export type VenueTabKey = (typeof VENUE_TABS)[number]["key"];

/** Reads `?tab=`; anything unknown (or missing) is the General tab. */
export function parseVenueTab(value: string | string[] | undefined): VenueTabKey {
  const v = Array.isArray(value) ? value[0] : value;
  return VENUE_TABS.some((t) => t.key === v) ? (v as VenueTabKey) : "general";
}
