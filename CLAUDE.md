# Centerform

Digital concierge platform (PWA) for venues, standalone events, and cruise ships. Built with Next.js App Router, Supabase, and Capacitor for mobile.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript strict mode)
- **Database**: Supabase (PostgreSQL, remote instance — no local Supabase)
- **Auth**: NextAuth.js 5 beta (magic link via Resend + SupabaseAdapter)
- **UI**: shadcn/ui (New York style) + Radix UI + Tailwind CSS 4
- **Mobile**: Capacitor (iOS/Android)
- **Package Manager**: pnpm

## Commands

- `pnpm dev` — Start dev server (Turbopack)
- `pnpm build` — Production build
- `pnpm lint` — **Broken**: `next lint` was removed in Next.js 16 and no ESLint config exists. Use `npx tsc --noEmit` for type-checking instead.
- `pnpm format` — Prettier (format all files)
- `pnpm format:check` — Check formatting

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Sign-in/sign-up routes
│   ├── api/auth/           # NextAuth API handler
│   ├── api/admin/invites/  # Internal POST endpoint: generate venue invite tokens (ADMIN_API_KEY gated)
│   ├── api/go/             # Affiliate link redirect + click tracking (see Affiliate Links below)
│   ├── invite/             # Invite-based onboarding flow
│   │   ├── [token]/        # Landing page + email form (Server Component + Client form)
│   │   ├── check-email/    # "Check your inbox" screen (pages.verifyRequest destination)
│   │   ├── claim/          # Post-auth claim handler → inserts venue_members → /dashboard
│   │   └── error/          # NextAuth error page (expired magic link, config errors)
│   ├── dashboard/          # Protected admin routes — see Dashboard Architecture below
│   │   ├── layout.tsx      # Auth guard, venue switcher, sidebar nav
│   │   ├── page.tsx        # Overview: real counts (events, services, places, collections)
│   │   ├── actions.ts      # switchVenueAction (cookie-based venue switcher)
│   │   └── venue/
│   │       ├── page.tsx                    # Venue settings (general info + theme)
│   │       ├── actions.ts                  # updateVenueAction, updateVenueThemeAction
│   │       ├── services/                   # Services CRUD (Sheet)
│   │       ├── events/                     # Venue events CRUD (Sheet)
│   │       ├── places/                     # Nearby places CRUD (Sheet)
│   │       ├── explore/                    # Collections list + detail
│   │       │   └── [collectionId]/         # Collection items management
│   │       ├── amenities/                  # Amenity toggles + CRUD (Sheet)
│   │       └── info/                       # Hotel info key-value CRUD (Sheet)
│   └── [slug]/             # Public venue/event pages
│       ├── page.tsx        # Routes to VenueHomePage, CruiseHomePage, or EventHomePage by type
│       ├── services/       # Venue: "Your Room & Stay" accordion
│       ├── dining/         # Venue: nearby dining/drinks list
│       ├── events/         # Venue: venue-hosted events list
│       ├── explore/        # Explore hub + collections + place listings
│       │   ├── [collectionId]/  # Collection page (cards or timeline layout)
│       │   ├── place/[placeId]/ # Individual place detail
│       │   └── area/[area]/     # Area-filtered explore view
│       ├── concierge/      # Concierge chat
│       ├── info/           # Event-only: event details (date, location, contact)
│       ├── schedule/       # Event-only: grouped schedule items
│       ├── ship-info/      # Cruise: accordion info (Welcome Aboard / Amenities / Bars / Entertainment)
│       ├── food-onboard/   # Cruise: restaurant list grouped by sit_down vs walk_up
│       │   └── [restaurantId]/  # Cruise: individual restaurant detail page
│       ├── group-plan/     # Cruise: day-by-day timeline with scrolling pill selector
│       │   └── [itemId]/   # Cruise: individual itinerary item detail page
│       └── the-crew/       # Cruise: crew/group member listing
│           └── [name]/     # Cruise: individual crew member photo gallery
├── components/
│   ├── ui/                 # shadcn/ui components (textarea.tsx added manually)
│   ├── dashboard/          # Dashboard-only components
│   │   ├── nav-link.tsx        # pathname-aware Link with active state; `exact` prop for exact-match only; `activeParam={{ key, value }}` prop for query-param-aware active state (used by Dining & Drinks / Nearby Places)
│   │   ├── venue-switcher.tsx  # Multi-venue dropdown (hidden for single-venue users)
│   │   ├── color-picker.tsx    # Themed color picker: Radix Popover + react-colorful HexColorPicker + hex text input
│   │   ├── font-picker.tsx     # Font selector: dropdown + live preview; loads Google Fonts on demand; exports HEADING_FONTS and BODY_FONTS lists
│   │   ├── service-sheet.tsx   # Sheet form for Service create/edit/delete
│   │   ├── event-sheet.tsx     # Sheet form for VenueEvent create/edit/delete
│   │   ├── place-sheet.tsx     # Sheet form for NearbyPlace create/edit/delete; Area field hidden for dining categories (restaurant/bar/cafe)
│   │   ├── collection-sheet.tsx # Sheet form for ExploreCollection create/edit/delete
│   │   ├── amenity-sheet.tsx   # Sheet form for VenueAmenity create/edit/delete
│   │   └── info-sheet.tsx      # Sheet form for VenueInfo create/edit/delete; "Label" field stores the key (snake_case keys like check_out_time are formatted for display via formatKey())
│   └── guest/              # Guest-facing components
│       ├── primitives/     # Shared building blocks
│       │   ├── accordion-item.tsx      # Animated expand/collapse row
│       │   ├── concierge-prompt.tsx    # Concierge chat prompt card
│       │   ├── copy-button.tsx         # Inline copy-to-clipboard with check feedback
│       │   ├── corner-bracket-card.tsx # Card with decorative corner bracket spans
│       │   ├── loading-spinner.tsx     # Fixed full-screen loading overlay
│       │   ├── nav-card.tsx            # Navigation tile card
│       │   ├── page-hero.tsx           # Full-bleed hero image with gradient
│       │   ├── section-header.tsx      # Numbered section header (e.g. "01 · Title")
│       │   ├── sticky-header.tsx       # Sticky nav header + floating back button
│       │   ├── venue-footer.tsx        # Venue branding footer
│       │   ├── welcome-envelope.tsx    # Animated envelope reveal
│       │   ├── welcome-splash.tsx      # Welcome card (delegates to oversized/text variants)
│       │   ├── welcome-splash-oversized.tsx
│       │   └── welcome-splash-text.tsx
│       ├── cruise/         # Cruise venue pages
│       │   ├── cruise-home.tsx
│       │   ├── cruise-ship-info.tsx
│       │   ├── cruise-food-onboard.tsx
│       │   ├── cruise-restaurant-listing.tsx
│       │   ├── cruise-group-plan.tsx
│       │   ├── cruise-itinerary-listing.tsx
│       │   ├── cruise-crew.tsx
│       │   └── cruise-crew-listing.tsx
│       ├── venue/          # Hotel/resort venue pages
│       │   ├── venue-home.tsx
│       │   ├── venue-services.tsx
│       │   ├── venue-dining.tsx
│       │   ├── venue-events.tsx
│       │   └── venue-explore.tsx
│       ├── explore/        # Explore hub pages
│       │   ├── area-listing.tsx
│       │   ├── explore-collection.tsx
│       │   └── place-listing.tsx
│       └── event/          # Standalone event pages
│           └── event-home.tsx
├── lib/
│   ├── auth.ts             # NextAuth config (Resend magic link + SupabaseAdapter + JWT strategy)
│   ├── invites.ts          # getInviteByToken(), claimInvite() — all invite DB logic
│   ├── dashboard.ts        # getActiveDashboardVenue(userId) — resolves active venue from cookie
│   ├── queries.ts          # Supabase query functions (public + admin variants)
│   ├── permissions.ts      # Dashboard auth: getVenueRole, requireVenueRole, getVenuesForUser
│   ├── storage.ts          # uploadVenueAsset / uploadEventAsset / deleteVenueAsset
│   ├── utils.ts            # cn() utility + formatPrice()
│   ├── slug-resolver.ts    # Route resolution (venue vs event)
│   ├── cruise-crew-data.ts # Hardcoded CREW array (name, slug, photos[]) for anniversary cruise photo galleries
│   └── supabase/           # Supabase clients
│       ├── server.ts       # Anon key client for Server Components (respects RLS)
│       ├── client.ts       # Anon key client for Client Components
│       ├── middleware.ts   # Session refresh middleware
│       └── admin.ts        # Service role client — server-only, bypasses RLS
├── types/index.ts          # All TypeScript interfaces
└── hooks/
    ├── use-debounce.ts
    ├── use-image-loaded.ts # Returns { loaded, imgRef, settle } — spinner until image loads or errors
    ├── use-press-scale.ts  # Returns press event handlers (scale animation, no re-render)
    └── use-sticky-nav.ts   # Returns { showStickyNav, headerRef } scroll-past-header state
```

## Database Schema

Core tables (migrations in `supabase/migrations/`):

- **venues** — venue profiles (name, slug, address, type, etc.). Also holds editable welcome card content: `welcome_heading` (nullable, e.g. "Welcome."), `welcome_body` (nullable), `phone_label` (nullable, e.g. "Call the Front Desk"). Components fall back to hardcoded defaults when null. See migration `013_welcome_card_content.sql`.
- **venue_themes** — per-venue color/font theming (1:1 with venues). Configurable fields: `primary_color`, `secondary_color`, `accent_color`, `font_family` (body font → `--font-sans`), `heading_font_family` (heading font → `--font-serif`, migration `031_heading_font_family.sql`), `border_radius`, `color_scheme`. Custom fonts are loaded client-side via injected Google Fonts `<link>` tags in `VenueThemeProvider`; built-in Next.js fonts (Nunito Sans, Source Sans 3) are always available without injection.
- **venue_members** — links users to venues with roles (owner/admin/staff)
- **services** — detailed venue service descriptions (WiFi instructions, housekeeping details, etc.)
- **events** — venue-hosted events (wine hour, live jazz, etc.). Optional `booking_url` field — when set, event cards show a "Book Now" button that routes through `/api/go?event=<id>` for click tracking.
- **nearby_places** — recommended spots near the venue. Dual-purpose: some rows are real places (restaurants, parks, etc.) that link to individual listing pages; others are gateway cards on the Explore page that link to a collection (when `collection_id` is set). Grouped by `area` for the Explore page. Extra detail fields: `tagline`, `hours`, `tips` (text[]), `cta_label`, `price_level` (0 = FREE), `collection_id`, `booking_url` (optional affiliate/booking link — routes through `/api/go?place=<id>` for click tracking; when set, `website` drops to a secondary "Visit Website" button)
- **affiliate_clicks** — click log for affiliate/booking links. Fields: `entity_type` (`'place'` | `'event'`), `entity_id` (uuid), `venue_id`, `clicked_at`. Written fire-and-forget by `/api/go` via the admin client so it never blocks the redirect. Indexed on `(entity_type, entity_id)` and `(venue_id, clicked_at DESC)`. See migration `030_affiliate_links.sql`.
- **explore_collections** — curated editorial lists (e.g. "Date Night", "A Walk Through Ballard"). Two layout variants: `cards` (stacked image cards with CTA) and `timeline` (vertical dot-and-line itinerary). Each collection belongs to a venue and optionally maps to an `area`
- **explore_collection_items** — ordered join table linking a collection to its `nearby_places`. Supports `time_label`, `is_start`, and `is_end` for the timeline variant
- **venue_amenities** — categorized feature flags (free WiFi, pool, parking, etc.) with icon + toggle
- **venue_info** — key-value hotel metadata (check-in time, cancellation policy, star rating, etc.). Two keys drive the services page header display: `check_out_time` (e.g. "11:00 AM") and `front_desk_hours` (e.g. "24 hours") — fetched via `getVenueInfoValues()` with hardcoded fallbacks if absent.
- **cruise_restaurants** — dining venues on a cruise ship. `restaurant_type`: `sit_down` | `walk_up`. Extra fields: `hours` (text, newline-separated), `menu_links` (JSONB `{label, url}[]`). Linked from `cruise_itinerary_items` via optional `restaurant_id` FK.
- **cruise_itinerary_items** — group plan timeline entries per cruise venue. `is_start=true` items serve as day headers (e.g. "SAT NOV 11" with `location` = port name); all items until the next `is_start` belong to that day. `is_end=true` marks the final disembarkation entry — it renders as a regular tappable card like all other items. `time_label` holds display time (e.g. "8:30pm"). `restaurant_id` (nullable FK) links a timeline item directly to a restaurant detail page (bypasses the itinerary detail page entirely). Two text fields intentionally carry different content: `card_description` is the short subheader shown on the timeline card (line-clamped to 2 lines); `description` is the body text rendered on the individual item detail page (split on `\n\n` into paragraphs). Items with `restaurant_id` set only need `card_description` — their detail page is the restaurant page. See migration `027_itinerary_card_description.sql`.
- **cruise_crew** — crew/group members for a cruise venue (name, role, bio, image, display_order)
- **cruise_links** — external URL links shown on the cruise homepage (e.g. iOS shared album, Google shared album, Virgin Voyages site)
- **cruise_nav_images** — optional hero images for the four nav tiles on the cruise homepage. One row per tile per venue: `nav_key` is one of `"ship-info"` | `"food-onboard"` | `"group-plan"` | `"the-crew"` (matching the route segment). Also has `sublabel` (text, optional) for secondary label text on the tile. Unique constraint on `(venue_id, nav_key)`. Fetched client-side on mount alongside `cruise_links`; passed as `imageUrl` to `NavCard`.
- **cruise_daily_welcome** — time-scheduled welcome card content for cruise venues. Each row has `venue_id`, `effective_at` (timestamptz), `heading`, `body`, and `expires_at` (timestamptz, nullable). The query fetches the most recent row where `effective_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())`. Falls back to `venues.welcome_heading/body`, then hardcoded defaults. See migrations `018_cruise_daily_welcome.sql` and `019_sample_cruise_daily_welcome.sql`.
- **venue_page_descriptions** — optional flavor text shown at the top of L1 venue/cruise pages. Keyed by `(venue_id, page_slug)` where `page_slug` matches the route segment (e.g. `"services"`, `"dining"`, `"events"`, `"explore"`, `"food-onboard"`, `"ship-info"`, `"group-plan"`, `"the-crew"`). See migration `016_venue_page_descriptions.sql`.
- **venue_nav_tiles** — sublabel text for nav tiles on standard venue homepages (hotel/resort/etc.). `nav_key` is one of `"services"` | `"dining"` | `"explore"`. Analogous to `cruise_nav_images` but for non-cruise venues. See migration `022_cruise_nav_sublabel.sql`.
- **standalone_events** — events independent of venues (conferences, festivals, weddings)
- **standalone_event_themes** — theming for standalone events
- **standalone_event_members** — user roles for standalone events
- **event_schedule_items** — schedule/agenda for standalone events
- **venue_invites** — invite tokens for owner onboarding. Fields: `token` (unique random string), `venue_id`, `role` (default `owner`), `email_hint` (display only — not enforced), `claimed_by`/`claimed_at` (set on claim), `expires_at`. No RLS permissive policies — only accessible via service role. See migration `029_venue_invites.sql`.
- **users / accounts / verification_tokens** — NextAuth adapter tables managed by `@auth/supabase-adapter`. Required for magic link verification token persistence. No app code reads these directly. See migration `028_nextauth_adapter_schema.sql`.

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
  └── Detail      /:slug/the-crew/[name]          (cruise-crew-listing.tsx — photo gallery, uses cruise-crew-data.ts)
```

**Ship Info** uses the existing `services` table with four cruise-specific categories:
- `welcome_aboard` → section 01 Welcome Aboard
- `ship_amenities` → section 02 Amenities
- `ship_bars` → section 03 Bars
- `ship_entertainment` → section 04 Entertainment

**Food Onboard** groups `cruise_restaurants` into Sit Down Restaurants (`restaurant_type = "sit_down"`) and Walk Up Eateries (`restaurant_type = "walk_up"`). Each row links to an individual detail page.

**Group Plan** renders a day-by-day timeline. `is_start=true` items are parsed as day headers and drive horizontal scrolling pill navigation at the top. Selecting a pill filters the timeline to show only that day's items. Every regular timeline card (non-`is_start`, non-`is_end`) links to its own detail page at `/:slug/group-plan/[itemId]`, which uses the same hero + floating name card design as the restaurant listing. If the item has a `restaurant_id`, the detail page also shows a "View Restaurant →" button linking to `/:slug/food-onboard/[restaurantId]`.

**Cruise home** fetches `cruise_daily_welcome` and `cruise_links` client-side on mount. The welcome card displays the most recent `cruise_daily_welcome` entry where `effective_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())`, falling back to `venue.welcome_heading/body` then hardcoded defaults. Multiple entries per day are supported for time-of-day updates (e.g. a morning message and a Scarlet Night evening message). All timestamps are stored in UTC.

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
- **Place listing** shows full detail for an individual `nearby_place` — hero image, metadata sections (address, hours, price, phone), tips bullets, and venue footer. Back button uses `history.back()` to return to whichever page linked here.
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

## Dark Mode

All guest-facing venue and event pages (`[slug]/` routes) support system dark mode via `prefers-color-scheme`. The dashboard does not currently implement dark mode.

### Architecture

Dark mode is **CSS-first**: `globals.css` has a `@media (prefers-color-scheme: dark)` block that overrides `:root` token values before any JavaScript runs. This is critical — JS-only approaches (e.g. `useEffect` or `useLayoutEffect`) cause race conditions with component lifecycle that produce inconsistent results, especially on the welcome splash screen.

```css
/* globals.css */
@media (prefers-color-scheme: dark) {
  :root { --background: #1C1A17; --foreground: #EDE8DE; ... }
  body { background-color: #1C1A17; }  /* for iOS status bar */
}
```

`VenueThemeProvider` (`src/components/theme-provider.tsx`) also applies dark overrides as inline CSS vars after mount via `useEffect` for tokens not handled by the CSS cascade (e.g. `--cf-card-shadow`, `--cf-glass-bg`). It also sets `document.body.style.backgroundColor` to ensure the iOS Safari status bar matches the page background.

### Dark palette tokens

The `DARK_MODE` constant in `[slug]/layout.tsx` defines the structural neutral tokens applied to all venue/event pages. **Venue brand colors (`--primary`, `--accent`) are intentionally excluded** — they stay the same in both modes as configured in `venue_themes`.

Key dark values: background `#1C1A17`, card `#252220`, foreground `#EDE8DE`, muted `#2E2B27`, border `#3A3632`.

### Critical constraints

- **Do not add `--background` or `--foreground` to `VenueThemeProvider`'s `lightStyle`**. These must come from the CSS cascade (`:root` in `globals.css`) so the dark media query can take effect on first render before JS fires. Adding them as inline styles would override the CSS and break dark mode on first paint.
- **Do not put `bg-background` on `VenueThemeProvider`'s wrapper div**. The body provides the page background; the wrapper is intentionally transparent so the body color is visible in the iOS status bar area.
- **Splash components (`welcome-splash-oversized.tsx`, `welcome-splash-text.tsx`) use `bg-background`** on their root div — this is correct and intentional. It gives the splash an opaque background that blocks underlying content, and it resolves correctly from the CSS dark media query (not from inline styles).
- **`FloatingBackButton`** uses `var(--cf-glass-bg)` for its background (not a hardcoded color), so it adapts to dark mode.
- **`card-shadow` utility** uses `var(--cf-card-shadow)` which is overridden in dark mode.
- **`theme-color` meta tag** in `src/app/layout.tsx` uses a media-conditional array so Safari's browser chrome matches the dark background.

## Design Token System

All design tokens live in `src/app/globals.css` as `--cf-*` CSS custom properties on `:root`. They are the single source of truth — change a value there and it propagates everywhere. Tokens cover typography, spacing, radius, and interactive states.

**Font families:** `--cf-font-display: "Nunito Sans"` (display/headings, loaded via `--font-serif` CSS variable) and `--cf-font-body: "Source Sans 3"` (body, loaded via `--font-sans`). Use `font-serif` Tailwind class for display text, `font-sans` for body. Both fonts are **per-venue configurable** via `venue_themes.heading_font_family` (→ `--font-serif`) and `venue_themes.font_family` (→ `--font-sans`). Custom fonts are loaded client-side via Google Fonts; Nunito Sans and Source Sans 3 are pre-loaded by Next.js and need no injection. The `FontPicker` dashboard component (`src/components/dashboard/font-picker.tsx`) handles selection and live preview.

**Font weight conventions for display (`font-serif`) text:**
- Hero h1 (`text-hotel-name`, `text-page-title`): `font-semibold` (600)
- Section headings, sticky header venue name, card titles: `font-medium` (500)
- Nav card labels, timeline card titles, decorative/secondary display text: `font-normal` (400)

Tokens are registered in the `@theme inline {}` block so Tailwind generates real utility classes from them:

| Token group | CSS var example | Tailwind utility |
|---|---|---|
| Font size | `--cf-text-hotel-name: 30px` | `text-hotel-name` |
| Font size | `--cf-text-body: 15px` | `text-body` |
| Font size | `--cf-text-label: 11px` | `text-label` |
| Font size | `--cf-text-cta-button: 15px` | `text-cta-button` |
| Font size | `--cf-text-card-title-lg: 20px` | `text-card-title-lg` |
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

`guest/cruise/cruise-home.tsx` is the reference implementation. Apply the same token utilities when working on other guest components.

## Shared Guest Primitives

Before adding inline UI patterns to a guest component, check if a shared primitive already exists:

| Need | Use |
|---|---|
| Price display (`FREE` / `$$$`) | `formatPrice(priceLevel)` from `@/lib/utils` |
| Full-screen loading overlay | `<LoadingSpinner />` from `@/components/guest/primitives/loading-spinner` |
| Wait for image before showing page | `const { loaded, imgRef, settle } = useImageLoaded(url)` from `@/hooks/use-image-loaded` — then `{!loaded && <LoadingSpinner />}` and `<img ref={imgRef} onLoad={settle} onError={settle} />` |
| Inline clipboard copy button | `<CopyButton text={...} label={...} />` from `@/components/guest/primitives/copy-button` |
| Animated accordion row | `<AccordionItem title isOpen onToggle>` from `@/components/guest/primitives/accordion-item` |
| Card with decorative corner brackets | `<CornerBracketCard className?>` from `@/components/guest/primitives/corner-bracket-card` |
| Numbered section header + underline | `<SectionHeader number="01" title="..." />` from `@/components/guest/primitives/section-header` |
| Button press scale animation | `const p = usePressScale(); <button {...p}>` from `@/hooks/use-press-scale` |
| Sticky nav visibility on scroll | `const { showStickyNav, headerRef } = useStickyNav()` from `@/hooks/use-sticky-nav` |

## Auth Configuration

NextAuth 5 (beta.30) is configured in `src/lib/auth.ts`. Auth uses **email magic link via Resend** — no passwords, works with any email provider (Gmail, Outlook, work domains, etc.).

### Providers

- **Resend** — production magic link provider. Sends a sign-in email via Resend's API. Configured with `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- **Credentials** — dev-only stub (guarded by `NODE_ENV === "development"`). Returns a hardcoded user for any email/password. Allows local development without a real email. **Never present in production.**

### SupabaseAdapter

`@auth/supabase-adapter` is wired into the NextAuth config. It uses the service role key to persist `verification_tokens` (required for magic link round-trips) and `users` to the Supabase DB. Combined with `strategy: "jwt"` so sessions stay client-side — no `sessions` table needed.

### Invite flow

New venue owners arrive via `/invite/[token]`. The flow:
1. Customer enters email on the invite landing page
2. Server Action calls `signIn("resend", { email, redirectTo: "/invite/claim?token=<token>" })`
3. NextAuth signs the `redirectTo` URL into the verification token — the invite token travels in the URL through the email round-trip, no cookie needed, works cross-device
4. Customer clicks magic link → NextAuth validates → redirects to `/invite/claim?token=<token>`
5. `/invite/claim` calls `claimInvite(userId, token)` from `src/lib/invites.ts` → upserts `venue_members` → redirects to `/dashboard`

Invite tokens are generated via `POST /api/admin/invites` (gated by `ADMIN_API_KEY`). See `src/lib/invites.ts` for `getInviteByToken` and `claimInvite`.

### `session.user.id` requires explicit callbacks

NextAuth 5 does NOT automatically copy `user.id` into `session.user.id`. Without the `jwt` + `session` callbacks, `session.user.id` is always `undefined`:

```ts
callbacks: {
  jwt({ token, user }) {
    if (user?.id) token.id = user.id;
    return token;
  },
  session({ session, token }) {
    if (token.id) session.user.id = token.id as string;
    return session;
  },
}
```

### Magic link / Server Action pattern

Magic link sign-in uses `useActionState` (React 19) with `<form action={formAction}>`. The server action must re-throw non-`AuthError` errors so the `NEXT_REDIRECT` thrown by `signIn` propagates:

```ts
export async function signInWithMagicLink(_prev, formData): Promise<{ error: string } | null> {
  try {
    await signIn("resend", { email, redirectTo: "/dashboard" });
    return null;
  } catch (error) {
    if (error instanceof AuthError) return { error: "Failed to send magic link." };
    throw error; // Re-throw NEXT_REDIRECT — swallowing it breaks navigation
  }
}
```

---

## Dashboard Architecture

**Auth identity gap:** NextAuth and Supabase are separate auth systems. Supabase RLS relies on `auth.uid()` from a Supabase JWT, but the app uses NextAuth sessions — so `auth.uid()` is always NULL in dashboard requests, causing all write RLS policies to silently block.

**Solution:** Dashboard Server Actions and Server Components use `createAdminClient()` (service role key, bypasses RLS) and manually enforce permissions via `src/lib/permissions.ts`.

**Never** import `createAdminClient` in client components or `"use client"` files — the service role key must stay server-side only.

### Active Venue Context

Multi-venue support is handled via a cookie (`active-venue-id`). The active venue is resolved by `getActiveDashboardVenue(userId)` in `src/lib/dashboard.ts`, which reads the cookie and matches it against the user's memberships (from `getVenuesForUser`), falling back to the first membership if the cookie is absent or stale.

Every dashboard page calls this once at the top. The `VenueSwitcher` component in the sidebar calls `switchVenueAction(venueId)` (in `src/app/dashboard/actions.ts`) which updates the cookie and revalidates the layout.

### Dashboard Routes

```
/dashboard                                    Overview (real counts: events, services, places, collections)
/dashboard/venue                              Hotel Info & Branding: general info + welcome card + theme
/dashboard/venue/info                         Hotel Details: key-value metadata (check-in, policies, etc.)
/dashboard/venue/amenities                    Amenity toggles + CRUD (grouped by category)
/dashboard/venue/services                     Services CRUD
/dashboard/venue/events                       Venue events CRUD
/dashboard/venue/places?type=dining           Dining & Drinks: places with category restaurant/bar/cafe (flat list, no area grouping)
/dashboard/venue/places?type=places           Nearby Places: all non-dining places (grouped by area)
/dashboard/venue/explore                      Explore Collections list
/dashboard/venue/explore/[collectionId]       Collection detail + ordered items management
```

The nav is organized into two sections — **Hotel** (Hotel Info & Branding, Hotel Details, Amenities, Services, Events) and **Places** (Dining & Drinks, Nearby Places, Explore Collections). `NavLink` uses `activeParam={{ key: "type", value: "..." }}` to correctly highlight the Dining vs Places links independently despite sharing the same route path.

The `/dashboard/events/*` standalone event routes still exist but are not linked from the nav. Cruise content has no dashboard coverage yet.

### Server Component Page Pattern

All dashboard page.tsx files follow this structure:

```ts
const session = await auth();
if (!session?.user?.id) redirect("/sign-in");

const active = await getActiveDashboardVenue(session.user.id);
if (!active) redirect("/sign-in");

const supabase = createAdminClient();
const { data: items } = await supabase
  .from("table")
  .select("*")
  .eq("venue_id", active.venue.id);

return <PageClient items={items ?? []} venueId={active.venue.id} role={active.role} />;
```

Do **not** use the shared `getAllNearbyPlaces()` / `getAllExploreCollections()` helpers in dashboard pages — those use the regular anon client which doesn't see data without Supabase Auth. Call `createAdminClient()` directly.

### Server Action Pattern

All mutations in `actions.ts` files follow this structure:

```ts
"use server";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function upsertXAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff"); // redirects to /dashboard if denied

  const supabase = createAdminClient();
  const { error } = await supabase.from("table").upsert({ venue_id: venueId, ...data });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/section");
}
```

Server Actions are colocated in `actions.ts` files beside their page, e.g. `src/app/dashboard/venue/services/actions.ts`. Note: `requireVenueRole` redirects to `/dashboard` on role failure — that's the intended behavior.

### Forms Strategy

All list pages use a right-side shadcn `Sheet` (`side="right"`) for create/edit. One exception: Venue Settings stays as an inline full-page form.

- List pages are split into a Server Component (`page.tsx`) that fetches data, and a `"use client"` sibling (`*-client.tsx`) that holds sheet open state
- Sheet components live in `src/components/dashboard/` (e.g. `ServiceSheet`, `PlaceSheet`)
- On action success: close sheet + `router.refresh()`
- Delete confirmation: inline toggle in sheet footer (no separate Dialog)
- Delete requires `"admin"` role minimum; upsert requires `"staff"`
- One exception: Hotel Info & Branding (`/dashboard/venue`) stays as an inline full-page form (no Sheet)

## Conventions

- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char width
- **Styling**: Tailwind classes for layout; CSS variables for dynamic theming per venue/event; `--cf-*` design tokens for all typography, spacing, radius, and interactive values (see Design Token System above)
- **Components**: Follow shadcn/ui patterns with `data-slot` attributes and CVA variants
- **Database queries**: Public/guest queries go in `src/lib/queries.ts` using `createClient()` (anon key). Dashboard admin queries that need to bypass RLS use `createAdminClient()` directly in the Server Action or Server Component — or use the `getAll*` / `getVenuesForUser` / `getVenueMemberRole` variants already in `queries.ts`.
- **Image uploads**: Use `uploadVenueAsset(slug, path, file)` from `src/lib/storage.ts`. The `path` arg is relative within the slug folder, e.g. `"places/{place-id}/photo.jpg"`. See the Supabase Storage section for the full bucket layout.
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
    ├── crew/
    │   └── {crew-id}/              # cruise_crew member photos
    └── nav/
        └── {nav-key}               # cruise_nav_images (ship-info, food-onboard, group-plan, the-crew)
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
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never prefix with `NEXT_PUBLIC_`. Find in Supabase → Settings → API.
- `AUTH_SECRET` — NextAuth 5 uses `AUTH_SECRET` (not `NEXTAUTH_SECRET`). Generate: `openssl rand -base64 32`.
- `AUTH_URL` — NextAuth 5 uses `AUTH_URL` (not `NEXTAUTH_URL`). Base URL of the app (`http://localhost:3000` in dev).
- `RESEND_API_KEY` — from Resend dashboard → API Keys. Required for magic link emails.
- `RESEND_FROM_EMAIL` — must be on a verified Resend domain, e.g. `noreply@centerform.co`.
- `ADMIN_API_KEY` — guards `POST /api/admin/invites`. Generate: `openssl rand -base64 32`.
