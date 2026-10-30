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
- `pnpm build` — Production build (also the way to check which routes are static `●` vs dynamic `ƒ`)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest unit tests
- `pnpm format` / `pnpm format:check` — Prettier (many older files are not yet formatted; only format files you change)
- `pnpm lint` — **Broken**: `next lint` was removed in Next.js 16 and no ESLint config exists. Use `pnpm typecheck`.

## Hard rules

These cause real bugs when forgotten. Details are in the scoped CLAUDE.md files.

1. **Tenant scoping.** The dashboard uses the service-role client, which bypasses RLS. Every `update`/`delete` by `id` must also filter by `venue_id` (or the parent id), and foreign ids from forms must be verified to belong to the venue. Use `authorizeVenue` (`src/lib/venue-action.ts`), which enforces auth + role.
2. **Guest pages are cached (ISR, `revalidate = 300`).** Never call `cookies()`, `headers()` or read `searchParams` in guest routes (`src/app/[slug]/**`) — it makes them dynamic. New dynamic guest pages must export `generateStaticParams`. Any dashboard write that changes what guests see must call `revalidateGuestPages(venueId)` (`finishVenueWrite` in `src/lib/venue-action.ts` does this).
3. **URLs from users** go through `parseOptionalHttpUrl` (forms) / `safeHttpUrl` (rendering, redirects) in `src/lib/url.ts` — http(s) only.
4. **Never** import `createAdminClient` in client components; the service-role key is server-only.
5. **Guest UI accessibility** (zoom, ARIA on interactive rows, focus, reduced motion) — see `src/components/guest/CLAUDE.md`.
6. **Database changes** are SQL files in `supabase/migrations/` applied manually to the remote Supabase — remember to apply new ones.

## Project Structure

```
src/
├── app/
│   ├── (auth)/             # Sign-in/sign-up
│   ├── api/auth/           # NextAuth handler
│   ├── api/admin/invites/  # POST: generate venue invite tokens (ADMIN_API_KEY gated, validated)
│   ├── api/dashboard/upload/ # POST: authenticated image upload (see Conventions)
│   ├── api/go/             # Affiliate redirect for booking_url + rate-limited click log
│   ├── invite/             # Invite onboarding: [token], check-email, claim, error
│   ├── dashboard/          # Protected admin app        → see src/app/dashboard/CLAUDE.md
│   └── [slug]/             # Public venue/event/cruise pages (ISR) → see src/app/[slug]/CLAUDE.md
├── components/
│   ├── ui/                 # shadcn/ui (textarea.tsx added manually)
│   ├── dashboard/          # Dashboard-only components (sheets, pickers, upload)
│   └── guest/              # Guest components: primitives/, cruise/, venue/, explore/, event/ → see src/components/guest/CLAUDE.md
├── lib/
│   ├── auth.ts, auth-helpers.ts   # NextAuth config; normalizeEmail(), allowMagicLinkSend()
│   ├── invites.ts                 # getInviteByToken(), claimInvite() (atomic claim, never downgrades roles)
│   ├── dashboard.ts               # getActiveDashboardVenue(userId) — active venue from cookie
│   ├── permissions.ts             # getVenueRole, requireVenueRole, getVenuesForUser (cached per request)
│   ├── venue-action.ts            # authorizeVenue / nextDisplayOrder / finishVenueWrite for dashboard actions
│   ├── queries.ts                 # Guest Supabase queries (anon, cacheable)
│   ├── slug-resolver.ts           # resolveSlug() — venue vs standalone event (React cache())
│   ├── revalidate.ts              # revalidateGuestPages(venueId)
│   ├── storage.ts                 # uploadVenueAsset / uploadEventAsset / deleteVenueAsset
│   ├── url.ts, rate-limit.ts, env.ts, utils.ts
│   ├── cruise-crew-data.ts        # Hardcoded crew photo galleries for the anniversary cruise
│   └── supabase/
│       ├── public.ts       # Cookie-free anon client — guest reads (cacheable)
│       ├── client.ts       # Anon client for Client Components
│       └── admin.ts        # Service-role client — server-only, bypasses RLS
├── types/index.ts          # All TypeScript interfaces
└── hooks/                  # use-debounce, use-image-loaded, use-press-scale, use-sticky-nav
```

## Database Schema

Core tables (migrations in `supabase/migrations/`):

- **venues** — venue profiles (name, slug, address, type, etc.). Also holds editable welcome card content: `welcome_heading` (nullable, e.g. "Welcome."), `welcome_body` (nullable), `phone_label` (nullable, e.g. "Call the Front Desk"). Components fall back to hardcoded defaults when null. See migration `013_welcome_card_content.sql`.
- **venue_themes** — per-venue color/font theming (1:1 with venues). Configurable fields: `primary_color`, `secondary_color`, `accent_color`, `font_family` (body font → `--font-sans`), `heading_font_family` (heading font → `--font-serif`, migration `031_heading_font_family.sql`), `border_radius`, `color_scheme`. Custom fonts are loaded client-side via injected Google Fonts `<link>` tags in `VenueThemeProvider`; built-in Next.js fonts (Nunito Sans, Source Sans 3) are always available without injection.
- **venue_members** — links users to venues with roles (owner/admin/staff)
- **services** — detailed venue service descriptions (WiFi instructions, housekeeping details, etc.)
- **events** — venue-hosted events (wine hour, live jazz, etc.). Optional `booking_url` field — when set, event cards show a "Book Now" button that routes through `/api/go?event=<id>` for click tracking.
- **nearby_places** — recommended spots near the venue. Dual-purpose: some rows are real places (restaurants, parks, etc.) that link to individual listing pages; others are gateway cards on the Explore page that link to a collection (when `collection_id` is set). Grouped by `area` for the Explore page. Extra detail fields: `tagline`, `hours`, `tips` (text[]), `cta_label`, `price_level` (0 = FREE), `collection_id`, `booking_url` (optional affiliate/booking link — routes through `/api/go?place=<id>` for click tracking; when set, `website` drops to a secondary "Visit Website" button). **Dining `area` convention**: for dining categories (restaurant/bar/cafe), `area = "on-site"` marks the place as a hotel restaurant/bar shown in the "At the Hotel" section of the Dining page; all other area values (including null) appear under "Nearby Recommendations". Set via the "Location" select in PlaceSheet.
- **affiliate_clicks** — click log for affiliate/booking links. Fields: `entity_type` (`'place'` | `'event'`), `entity_id` (uuid), `venue_id`, `clicked_at`. Written fire-and-forget by `/api/go` via the admin client so it never blocks the redirect. Indexed on `(entity_type, entity_id)` and `(venue_id, clicked_at DESC)`. RLS enabled with no policies (service role only) — see migrations `030_affiliate_links.sql`, `034_affiliate_clicks_rls.sql`.
- **explore_collections** — curated editorial lists (e.g. "Date Night", "A Walk Through Ballard"). Two layout variants: `cards` (stacked image cards with CTA) and `timeline` (vertical dot-and-line itinerary). Each collection belongs to a venue and optionally maps to an `area`
- **explore_collection_items** — ordered join table linking a collection to its `nearby_places`. Supports `time_label`, `is_start`, and `is_end` for the timeline variant
- **venue_amenities** — categorized feature flags (free WiFi, pool, parking, etc.) with icon + toggle
- **venue_info** — key-value hotel metadata (check-in time, cancellation policy, star rating, etc.). Two keys drive the services page header display: `check_out_time` (e.g. "11:00 AM") and `front_desk_hours` (e.g. "24 hours") — fetched via `getVenueInfoValues()` with hardcoded fallbacks if absent.
- **cruise_restaurants** — dining venues on a cruise ship. `restaurant_type`: `sit_down` | `walk_up`. Extra fields: `hours` (text, newline-separated), `menu_links` (JSONB `{label, url}[]`). Linked from `cruise_itinerary_items` via optional `restaurant_id` FK.
- **cruise_itinerary_items** — group plan timeline entries per cruise venue. `is_start=true` items serve as day headers (e.g. "SAT NOV 11" with `location` = port name); all items until the next `is_start` belong to that day. `is_end=true` marks the final disembarkation entry — it renders as a regular tappable card like all other items. `time_label` holds display time (e.g. "8:30pm"). `restaurant_id` (nullable FK) links a timeline item directly to a restaurant detail page (bypasses the itinerary detail page entirely). Two text fields intentionally carry different content: `card_description` is the short subheader shown on the timeline card (line-clamped to 2 lines); `description` is the body text rendered on the individual item detail page (split on `\n\n` into paragraphs). Items with `restaurant_id` set only need `card_description` — their detail page is the restaurant page. See migration `027_itinerary_card_description.sql`.
- **cruise_crew** — crew/group members for a cruise venue (name, role, bio, image, display_order)
- **cruise_links** — external URL links shown on the cruise homepage (e.g. iOS shared album, Google shared album, Virgin Voyages site)
- **cruise_nav_images** — optional hero images for the four nav tiles on the cruise homepage. One row per tile per venue: `nav_key` is one of `"ship-info"` | `"food-onboard"` | `"group-plan"` | `"the-crew"` (matching the route segment). Also has `sublabel` (text, optional) for secondary label text on the tile. Unique constraint on `(venue_id, nav_key)`. Fetched server-side in `[slug]/page.tsx` (`getCruiseNavTiles`) and passed to `CruiseHomePage`; each tile's image is passed as `imageUrl` to `NavCard`.
- **cruise_daily_welcome** — time-scheduled welcome card content for cruise venues. Each row has `venue_id`, `effective_at` (timestamptz), `heading`, `body`, and `expires_at` (timestamptz, nullable). The server fetches **all** rows (`getCruiseDailyWelcomes`, newest first) so the cached page stays valid; `CruiseHomePage` picks the most recent row where `effective_at <= now AND (expires_at IS NULL OR expires_at > now)` on the client. Falls back to `venues.welcome_heading/body`, then hardcoded defaults. See migrations `018_cruise_daily_welcome.sql` and `019_sample_cruise_daily_welcome.sql`.
- **venue_page_descriptions** — optional flavor text and hero image shown at the top of L1 venue/cruise pages. Keyed by `(venue_id, page_slug)` where `page_slug` matches the route segment (e.g. `"services"`, `"dining"`, `"events"`, `"explore"`, `"food-onboard"`, `"ship-info"`, `"group-plan"`, `"the-crew"`). Fields: `body` (NOT NULL, empty string when a row is created for an image-only page), `image_url` (nullable — per-page hero image; guest pages fall back to `venues.cover_image_url` when null). Managed via `updatePageImagesAction` in `src/app/dashboard/venue/actions.ts`. Queried via `getVenuePageDescription(venueId, pageSlug)` in `queries.ts` which returns `{ body: string | null; heroImageUrl: string | null }`. See migrations `016_venue_page_descriptions.sql`, `033_page_hero_images.sql`.
- **venue_nav_tiles** — sublabel text for nav tiles on standard venue homepages (hotel/resort/etc.). `nav_key` is one of `"services"` | `"dining"` | `"explore"`. Analogous to `cruise_nav_images` but for non-cruise venues. See migration `022_cruise_nav_sublabel.sql`.
- **standalone_events** — events independent of venues (conferences, festivals, weddings)
- **standalone_event_themes** — theming for standalone events
- **standalone_event_members** — user roles for standalone events
- **event_schedule_items** — schedule/agenda for standalone events
- **venue_media** — media library for a venue. Each row tracks one uploaded image: `url` (public Supabase Storage URL), `filename`, `size`. All uploads go to `venue-assets/{slug}/media/{uuid}.{ext}` so they're isolated from entity-specific paths. Written by `POST /api/dashboard/upload`; queried by `listVenueMediaAction`. No RLS permissive policies — only accessible via service role (admin client). See migration `032_venue_media.sql`.
- **venue_invites** — invite tokens for owner onboarding. Fields: `token` (unique random string), `venue_id`, `role` (default `owner`), `email_hint` (display only — not enforced), `claimed_by`/`claimed_at` (set on claim), `expires_at`. No RLS permissive policies — only accessible via service role. See migration `029_venue_invites.sql`.
- **users / accounts / verification_tokens** — NextAuth adapter tables managed by `@auth/supabase-adapter`. Required for magic link verification token persistence. No app code reads these directly. See migration `028_nextauth_adapter_schema.sql`.

Key patterns:
- All tables use UUID primary keys and `updated_at` triggers
- RLS: public read access, write restricted to venue/event members by role
- Slugs are globally unique across venues and standalone events (enforced by trigger)
- `venue_type = "cruise"` routes to cruise-specific pages; hotel/resort/etc. routes to the standard venue pages. The `[slug]/page.tsx` checks `venue_type` to dispatch to the right homepage component.

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

## Conventions

- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char width
- **Styling**: Tailwind classes for layout; CSS variables for dynamic theming per venue/event; `--cf-*` design tokens (see `src/components/guest/CLAUDE.md`)
- **Components**: Follow shadcn/ui patterns with `data-slot` attributes and CVA variants
- **Database queries**: Guest queries live in `src/lib/queries.ts` and use `createPublicClient()` (cookie-free anon client). Dashboard reads/writes use `createAdminClient()` directly in the Server Component/Action (see `src/app/dashboard/CLAUDE.md`).
- **Image uploads**: Use `uploadVenueAsset(slug, path, file, contentType?)` from `src/lib/storage.ts` — accepts `File | Buffer`. `path` is relative within the slug folder, e.g. `"places/{place-id}/photo.jpg"`. Uploads through `POST /api/dashboard/upload` are validated (10 MB cap, raster types only — **SVG is rejected**), then re-encoded to WebP (quality 85, max 2400px, EXIF rotated, metadata stripped; animated GIFs stay animated).
- **Path alias**: `@/*` maps to `src/*`
- **Branches**: `develop` for active work, `main` for production. **Open PRs against `develop`.** `gh` is installed for creating PRs.
- **Where things live**: area-specific rules are in directory-scoped CLAUDE.md files (`src/app/dashboard/`, `src/app/[slug]/`, `src/components/guest/`) — read them before working there.

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
