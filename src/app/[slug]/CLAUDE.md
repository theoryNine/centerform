# Public guest routes (`src/app/[slug]/`)

Loaded in addition to the root CLAUDE.md when working here.

## Route map

All routes live under `/:slug/`. Venue-type routes return 404 for the wrong `venue_type`.

- `page.tsx` — Routes to VenueHomePage, CruiseHomePage, or EventHomePage by type
- `services/` — Venue: "Your Room & Stay" accordion
- `dining/` — Venue: nearby dining/drinks list
- `events/` — Venue: venue-hosted events list
- `explore/` — Explore hub + collections + place listings
- `[collectionId]/` — Collection page (cards or timeline layout)
- `place/[placeId]/` — Individual place detail
- `area/[area]/` — Area-filtered explore view
- `concierge/` — Concierge chat
- `info/` — Event-only: event details (date, location, contact)
- `schedule/` — Event-only: grouped schedule items
- `ship-info/` — Cruise: accordion info (Welcome Aboard / Amenities / Bars / Entertainment)
- `food-onboard/` — Cruise: restaurant list grouped by sit_down vs walk_up
- `[restaurantId]/` — Cruise: individual restaurant detail page
- `group-plan/` — Cruise: day-by-day timeline with scrolling pill selector
- `[itemId]/` — Cruise: individual itinerary item detail page
- `the-crew/` — Cruise: crew/group member listing
- `[name]/` — Cruise: individual crew member photo gallery

## Caching (ISR)

Every guest route is cached: `[slug]/layout.tsx` exports `revalidate = 300` and `generateStaticParams` (returns `[]`, so pages render on first request then are served from cache). Rules:

- Use `createPublicClient()` (via `src/lib/queries.ts`) — never the cookie-based client — and never call `cookies()`/`headers()`/read `searchParams` here, or the route becomes dynamic.
- New dynamic route segments need their own `export function generateStaticParams() { return []; }`.
- Dashboard writes call `revalidateGuestPages(venueId)` for instant updates; the 5‑minute window covers edits made outside the dashboard. Unknown slugs 404 and that 404 is cached too (a brand-new venue can 404 for up to 5 minutes).
- Anything that depends on the viewer's clock/timezone (today's events, the active cruise welcome) is decided **client-side** from data the server fetched in full.
- `[slug]/page.tsx` is a Server Component that fetches home-page data and passes it to `VenueHomePage` / `CruiseHomePage` as props; client components should not use the browser Supabase client for guest data.
- `[slug]/manifest.webmanifest` is still dynamic.

## Cruise Ship Architecture

Four pages under `/:slug/` for `venue_type = "cruise"`. All four routes return 404 for non-cruise venues.

```
Cruise home       /:slug                          (cruise-home.tsx)
Ship Info         /:slug/ship-info                (cruise-ship-info.tsx)
Food Onboard      /:slug/food-onboard             (cruise-food-onboard.tsx)
  └── Detail      /:slug/food-onboard/[id]        (cruise-restaurant-listing.tsx)
Group Plan        /:slug/group-plan               (cruise-group-plan.tsx)
  └── Detail      /:slug/group-plan/[itemId]      (cruise-itinerary-listing.tsx)
The Crew          /:slug/the-crew                 (cruise-crew.tsx)
  └── Detail      /:slug/the-crew/[name]          (cruise-crew-listing.tsx — photo gallery, uses cruise-crew-data.ts)
```

**Ship Info** uses the existing `services` table with four cruise-specific categories:
- `welcome_aboard` → section 01 Welcome Aboard
- `ship_amenities` → section 02 Amenities
- `ship_bars` → section 03 Bars
- `ship_entertainment` → section 04 Entertainment

**Food Onboard** groups `cruise_restaurants` into Sit Down Restaurants (`restaurant_type = "sit_down"`) and Walk Up Eateries (`restaurant_type = "walk_up"`). Each row links to an individual detail page.

**Group Plan** renders a day-by-day timeline. `is_start=true` items are parsed as day headers and drive horizontal scrolling pill navigation at the top. Selecting a pill filters the timeline to show only that day's items. Every regular timeline card (non-`is_start`, non-`is_end`) links to its own detail page at `/:slug/group-plan/[itemId]`, which uses the same hero + floating name card design as the restaurant listing. If the item has a `restaurant_id`, the detail page also shows a "View Restaurant →" button linking to `/:slug/food-onboard/[restaurantId]`.

**Cruise home** receives `cruise_daily_welcome` rows, `cruise_links` and `cruise_nav_images` as props from the server page (cached with ISR). The welcome card displays the most recent `cruise_daily_welcome` entry (selected client-side from the clock) where `effective_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())`, falling back to `venue.welcome_heading/body` then hardcoded defaults. Multiple entries per day are supported for time-of-day updates (e.g. a morning message and a Scarlet Night evening message). All timestamps are stored in UTC.

**Sample cruise**: "Adam & Ansel's Anniversary" at slug `adam-ansel` — Virgin Voyages Resilient Lady, Nov 11–18, 2025. See migrations `012_sample_anniversary_cruise.sql` and `019_sample_cruise_daily_welcome.sql`. The group plan itinerary was fully replaced in `027_itinerary_card_description.sql` (do not re-run `012` data for itinerary items). Crew photo galleries for this cruise use `cruise-crew-data.ts` (hardcoded, not the `cruise_crew` DB table).

## Explore Page Architecture

Three-tier navigation under `/:slug/explore/`:

```
Explore index         /:slug/explore
  ├── Collection      /:slug/explore/[collectionId]      (explore-collection.tsx)
  │     └── Place     /:slug/explore/place/[placeId]     (place-listing.tsx)
  └── Area            /:slug/explore/area/[area]         (area-filtered explore view)
```

- **Explore index** groups `nearby_places` by `area`. Cards with `collection_id` set link to the collection; cards without link to the place listing.
- **Collection page** renders either `cards` layout (Date Night style) or `timeline` layout (Open Wander/itinerary style) based on `explore_collections.layout`.
- **Place listing** shows full detail for an individual `nearby_place`. Uses the same floating name card pattern as cruise restaurant/itinerary detail pages: `ScrollRevealStickyHeader` + `FloatingBackButton` over a full `aspect-[4/3]` hero, with a centered card (`translate-y-1/2` over the hero bottom) containing the place name and tagline/price meta. Content starts at `pt-20` to clear the card. Back button uses `history.back()` to return to whichever page linked here.
- **`nearby_places.collection_id`** is the key field that makes an explore card a gateway to a collection rather than an individual place listing.

## Affiliate Links

Optional booking/affiliate URLs on `nearby_places` and `events`. When a `booking_url` is set, guest-facing cards route clicks through `/api/go` before redirecting, logging each click to `affiliate_clicks`.

### Flow

```
Guest taps CTA → /api/go?place=<id>  (or ?event=<id>)
                → INSERT affiliate_clicks (fire-and-forget, admin client)
                → 302 → booking_url
```

### Guest behavior

- **Place listing** (`place-listing.tsx`): when `booking_url` is set, the primary CTA button (`cta_label` or category default) routes through `/api/go?place=<id>`. The place's `website` drops to a secondary "Visit Website" outline button below it. When no `booking_url`, behavior is unchanged — CTA links directly to `website` or Google Maps.
- **Venue events** (`venue-events.tsx`): event cards show a "Book Now →" pill button when `booking_url` is set. No button when absent.

### Dashboard

Both `PlaceSheet` and `EventSheet` have a "Booking URL" field. Managed via `upsertPlaceAction` / `upsertVenueEventAction` — the field is nullable and optional.

### Querying clicks

```sql
-- Clicks per place for a venue (last 30 days)
SELECT entity_id, COUNT(*) AS clicks
FROM affiliate_clicks
WHERE venue_id = '<venue-id>'
  AND entity_type = 'place'
  AND clicked_at > now() - interval '30 days'
GROUP BY entity_id
ORDER BY clicks DESC;
```
