/** Pages the e2e checks visit. Data comes from the remote Supabase sample venues. */

export const SLUG = "the-ballard-inn";
export const MARKET_ID = "b1a2c3d4-0000-4000-a000-000000000101";
export const CAFE_ID = "b1a2c3d4-0000-4000-a000-000000000103";
export const WALK_COLLECTION_ID = "b1a2c3d4-0000-4000-a000-000000000201";
export const DATE_NIGHT_ID = "b1a2c3d4-0000-4000-a000-000000000202";
export const CRUISE_SLUG = "adam-ansel";

export const PAGES = [
  { name: "home", path: `/${SLUG}` },
  { name: "services", path: `/${SLUG}/services` },
  { name: "dining", path: `/${SLUG}/dining` },
  { name: "explore", path: `/${SLUG}/explore` },
  { name: "place", path: `/${SLUG}/explore/place/${MARKET_ID}` },
  { name: "dine-place", path: `/${SLUG}/explore/place/${CAFE_ID}` },
  { name: "guide", path: `/${SLUG}/explore/${WALK_COLLECTION_ID}` },
  { name: "date-night", path: `/${SLUG}/explore/${DATE_NIGHT_ID}` },
  { name: "area", path: `/${SLUG}/explore/area/Ballard` },
  { name: "events", path: `/${SLUG}/events` },
  { name: "cruise-ship-info", path: `/${CRUISE_SLUG}/ship-info` },
  { name: "cruise-group-plan", path: `/${CRUISE_SLUG}/group-plan` },
  { name: "cruise-food", path: `/${CRUISE_SLUG}/food-onboard` },
  { name: "cruise-crew", path: `/${CRUISE_SLUG}/the-crew` },
];
