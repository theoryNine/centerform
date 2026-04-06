# Centerform

Digital concierge platform (PWA) for venues, standalone events, and cruise ships. Built with Next.js App Router, Supabase, and Capacitor for mobile.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript strict mode)
- **Database**: Supabase (PostgreSQL, remote instance — no local Supabase)
- **Auth**: NextAuth.js 5 beta (Google OAuth + Supabase)
- **UI**: shadcn/ui (New York style) + Radix UI + Tailwind CSS 4
- **Mobile**: Capacitor (iOS/Android)
- **Package Manager**: pnpm

## Commands

- `pnpm dev` — Start dev server (Turbopack)
- `pnpm build` — Production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier (format all files)
- `pnpm format:check` — Check formatting

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Sign-in/sign-up routes
│   ├── api/auth/           # NextAuth API handler
│   ├── dashboard/          # Protected admin routes (venue, events)
│   └── [slug]/             # Public venue/event pages
│       ├── page.tsx        # Routes to VenueHomePage, CruiseHomePage, or EventHomePage by type
│       ├── services/       # Hotel "Your Room & Stay" (accordion)
│       ├── dining/         # Hotel dining
│       ├── explore/        # Explore hub + collections + place listings
│       ├── concierge/      # Concierge chat
│       ├── ship-info/      # Cruise: accordion info (Welcome Aboard / Amenities / Entertainment)
│       ├── food-onboard/   # Cruise: restaurant list grouped by sit_down vs walk_up
│       │   └── [restaurantId]/  # Cruise: individual restaurant detail page
│       ├── group-plan/     # Cruise: day-by-day timeline with scrolling pill selector
│       │   └── [itemId]/   # Cruise: individual itinerary item detail page
│       └── the-crew/       # Cruise: crew/group member listing
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── guest/              # Page-specific components
│       ├── venue-home.tsx          # Hotel homepage
│       ├── venue-services.tsx      # Hotel services accordion
│       ├── cruise-home.tsx         # Cruise homepage
│       ├── cruise-ship-info.tsx    # Cruise ship info accordion
│       ├── cruise-food-onboard.tsx # Cruise restaurant list
│       ├── cruise-restaurant-listing.tsx  # Cruise restaurant detail
│       ├── cruise-group-plan.tsx   # Cruise itinerary timeline with day pills
│       ├── cruise-itinerary-listing.tsx   # Cruise itinerary item detail page
│       └── cruise-crew.tsx         # Cruise crew listing
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── queries.ts          # Supabase query functions
│   ├── utils.ts            # cn() utility
│   ├── slug-resolver.ts    # Route resolution (venue vs event)
│   └── supabase/           # Supabase clients (server.ts, client.ts, middleware.ts)
├── types/index.ts          # All TypeScript interfaces
└── hooks/                  # React hooks
```

## Database Schema

Core tables (migrations in `supabase/migrations/`):

- **venues** — venue profiles (name, slug, address, type, etc.). Also holds editable welcome card content: `welcome_heading` (nullable, e.g. "Welcome."), `welcome_body` (nullable), `phone_label` (nullable, e.g. "Call the Front Desk"). Components fall back to hardcoded defaults when null. See migration `013_welcome_card_content.sql`.
- **venue_themes** — per-venue color/font theming (1:1 with venues)
- **venue_members** — links users to venues with roles (owner/admin/staff)
- **services** — detailed venue service descriptions (WiFi instructions, housekeeping details, etc.)
- **events** — venue-hosted events (wine hour, live jazz, etc.)
- **nearby_places** — recommended spots near the venue. Dual-purpose: some rows are real places (restaurants, parks, etc.) that link to individual listing pages; others are gateway cards on the Explore page that link to a collection (when `collection_id` is set). Grouped by `area` for the Explore page. Extra detail fields: `tagline`, `hours`, `tips` (text[]), `cta_label`, `price_level` (0 = FREE), `collection_id`
- **explore_collections** — curated editorial lists (e.g. "Date Night", "A Walk Through Ballard"). Two layout variants: `cards` (stacked image cards with CTA) and `timeline` (vertical dot-and-line itinerary). Each collection belongs to a venue and optionally maps to an `area`
- **explore_collection_items** — ordered join table linking a collection to its `nearby_places`. Supports `time_label`, `is_start`, and `is_end` for the timeline variant
- **venue_amenities** — categorized feature flags (free WiFi, pool, parking, etc.) with icon + toggle
- **venue_info** — key-value hotel metadata (check-in time, cancellation policy, star rating, etc.)
- **cruise_restaurants** — dining venues on a cruise ship. `restaurant_type`: `sit_down` | `walk_up`. Linked from `cruise_itinerary_items` via optional `restaurant_id` FK.
- **cruise_itinerary_items** — group plan timeline entries per cruise venue. `is_start=true` items serve as day headers (e.g. "SAT NOV 11" with `location` = port name); all items until the next `is_start` belong to that day. `is_end=true` marks the final disembarkation entry — it renders as a regular tappable card like all other items. `time_label` holds display time (e.g. "8:30pm"). `restaurant_id` (nullable FK) links a timeline item to a restaurant detail page.
- **cruise_crew** — crew/group members for a cruise venue (name, role, bio, image, display_order)
- **cruise_links** — external URL links shown on the cruise homepage (e.g. iOS shared album, Google shared album, Virgin Voyages site)
- **cruise_daily_welcome** — time-scheduled welcome card content for cruise venues. Each row has `venue_id`, `effective_at` (timestamptz), `heading`, and `body`. The query fetches the most recent row where `effective_at <= NOW()`, so multiple entries per day are supported (e.g. a morning and an evening message). Falls back to `venues.welcome_heading/body`, then hardcoded defaults. See migrations `018_cruise_daily_welcome.sql` and `019_sample_anniversary_cruise.sql`.
- **standalone_events** — events independent of venues (conferences, festivals, weddings)
- **standalone_event_themes** — theming for standalone events
- **standalone_event_members** — user roles for standalone events
- **event_schedule_items** — schedule/agenda for standalone events

Key patterns:
- All tables use UUID primary keys and `updated_at` triggers
- RLS: public read access, write restricted to venue/event members by role
- Slugs are globally unique across venues and standalone events (enforced by trigger)
- `venue_type = "cruise"` routes to cruise-specific pages; hotel/resort/etc. routes to the standard venue pages. The `[slug]/page.tsx` checks `venue_type` to dispatch to the right homepage component.

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
```

**Ship Info** uses the existing `services` table with three cruise-specific categories:
- `welcome_aboard` → section 01 Welcome Aboard
- `ship_amenities` → section 02 Amenities
- `ship_entertainment` → section 03 Entertainment

**Food Onboard** groups `cruise_restaurants` into Sit Down Restaurants (`restaurant_type = "sit_down"`) and Walk Up Eateries (`restaurant_type = "walk_up"`). Each row links to an individual detail page.

**Group Plan** renders a day-by-day timeline. `is_start=true` items are parsed as day headers and drive horizontal scrolling pill navigation at the top. Selecting a pill filters the timeline to show only that day's items. Every regular timeline card (non-`is_start`, non-`is_end`) links to its own detail page at `/:slug/group-plan/[itemId]`, which uses the same hero + floating name card design as the restaurant listing. If the item has a `restaurant_id`, the detail page also shows a "View Restaurant →" button linking to `/:slug/food-onboard/[restaurantId]`.

**Cruise home** fetches `cruise_daily_welcome` and `cruise_links` client-side on mount. The welcome card displays the most recent `cruise_daily_welcome` entry where `effective_at <= NOW()`, falling back to `venue.welcome_heading/body` then hardcoded defaults. Multiple entries per day are supported for time-of-day updates (e.g. a morning message and a Scarlet Night evening message). All timestamps are stored in UTC.

**Sample cruise**: "Adam & Ansel's Anniversary" at slug `adam-ansel` — Virgin Voyages Resilient Lady, Nov 11–18, 2025. See migrations `012_sample_anniversary_cruise.sql` and `019_sample_cruise_daily_welcome.sql`.

## Explore Page Architecture

Three-tier navigation under `/:slug/explore/`:

```
Explore index         /:slug/explore
  └── Collection      /:slug/explore/[collectionId]      (explore-collection.tsx)
        └── Place     /:slug/explore/place/[placeId]     (place-listing.tsx)
```

- **Explore index** groups `nearby_places` by `area`. Cards with `collection_id` set link to the collection; cards without link to the place listing.
- **Collection page** renders either `cards` layout (Date Night style) or `timeline` layout (Open Wander/itinerary style) based on `explore_collections.layout`.
- **Place listing** shows full detail for an individual `nearby_place` — hero image, metadata sections (address, hours, price, phone), tips bullets, and venue footer. Back button uses `history.back()` to return to whichever page linked here.
- **`nearby_places.collection_id`** is the key field that makes an explore card a gateway to a collection rather than an individual place listing.

## Design Token System

All design tokens live in `src/app/globals.css` as `--cf-*` CSS custom properties on `:root`. They are the single source of truth — change a value there and it propagates everywhere. Tokens cover typography, spacing, radius, and interactive states.

Tokens are registered in the `@theme inline {}` block so Tailwind generates real utility classes from them:

| Token group | CSS var example | Tailwind utility |
|---|---|---|
| Font size | `--cf-text-hotel-name: 30px` | `text-hotel-name` |
| Font size | `--cf-text-body: 15px` | `text-body` |
| Font size | `--cf-text-description: 13px` | `text-description` |
| Font size | `--cf-text-label: 11px` | `text-label` |
| Font size | `--cf-text-cta-button: 15px` | `text-cta-button` |
| Font size | `--cf-text-card-title-lg: 22px` | `text-card-title-lg` |
| Spacing | `--cf-page-padding: 20px` | `px-page`, `-ml-page` |
| Spacing | `--cf-section-gap: 40px` | `mb-section` |
| Spacing | `--cf-card-padding: 20px` | `p-card` |
| Spacing | `--cf-card-gap: 14px` | `gap-card-gap` |
| Spacing | `--cf-heading-to-content: 16px` | `mb-heading-gap` |
| Radius | `--cf-radius-default: 4px` | `rounded-default` |
| Radius | `--cf-radius-chip: 20px` | `rounded-chip` |

For tokens not suited to Tailwind utilities (line-height, letter-spacing, interactive values), use them directly as `var(--cf-...)` in arbitrary values or inline styles:
- `leading-[var(--cf-body-line-height)]`
- `tracking-[var(--cf-text-label-spacing)]`
- `style={{ transitionDuration: "var(--cf-press-duration)" }}`

`cruise-home.tsx` is the reference implementation. Apply the same token utilities when working on other guest components.

## Conventions

- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char width
- **Styling**: Tailwind classes for layout; CSS variables for dynamic theming per venue/event; `--cf-*` design tokens for all typography, spacing, radius, and interactive values (see Design Token System above)
- **Components**: Follow shadcn/ui patterns with `data-slot` attributes and CVA variants
- **Database queries**: Add to `src/lib/queries.ts` using the Supabase client pattern
- **Path alias**: `@/*` maps to `src/*`
- **Branches**: `develop` for active work, `main` for production

## Supabase Storage

Two public buckets. Folders use the venue/event slug as the top-level key (slugs are globally unique); sub-entity folders use UUIDs (stable even if display names change).

**`venue-assets`** — all venue and cruise image assets

```
venue-assets/
└── {venue-slug}/
    ├── hero                        # venue cover/hero image (single file, overwrite on update)
    ├── gallery/                    # additional venue photos
    ├── places/
    │   └── {place-id}/             # nearby_places images
    ├── collections/
    │   └── {collection-id}/        # explore_collections cover images
    ├── restaurants/
    │   └── {restaurant-id}/        # cruise_restaurants images
    ├── itinerary/
    │   └── {item-id}/              # cruise_itinerary_items images
    └── crew/
        └── {crew-id}/              # cruise_crew member photos
```

**`event-assets`** — standalone event image assets

```
event-assets/
└── {event-slug}/
    ├── hero
    └── schedule/
        └── {item-id}/              # event_schedule_items images
```

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
