# Centerform

Digital concierge platform (PWA) for venues and standalone events. Built with Next.js App Router, Supabase, and Capacitor for mobile.

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
│   └── [slug]/             # Public venue/event pages (services, dining, explore, events, concierge, etc.)
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── guest/              # Page-specific components
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

- **venues** — venue profiles (name, slug, address, type, etc.)
- **venue_themes** — per-venue color/font theming (1:1 with venues)
- **venue_members** — links users to venues with roles (owner/admin/staff)
- **services** — detailed venue service descriptions (WiFi instructions, housekeeping details, etc.)
- **events** — venue-hosted events (wine hour, live jazz, etc.)
- **nearby_places** — recommended spots near the venue. Dual-purpose: some rows are real places (restaurants, parks, etc.) that link to individual listing pages; others are gateway cards on the Explore page that link to a collection (when `collection_id` is set). Grouped by `area` for the Explore page. Extra detail fields: `tagline`, `hours`, `tips` (text[]), `cta_label`, `price_level` (0 = FREE), `collection_id`
- **explore_collections** — curated editorial lists (e.g. "Date Night", "A Walk Through Ballard"). Two layout variants: `cards` (stacked image cards with CTA) and `timeline` (vertical dot-and-line itinerary). Each collection belongs to a venue and optionally maps to an `area`
- **explore_collection_items** — ordered join table linking a collection to its `nearby_places`. Supports `time_label`, `is_start`, and `is_end` for the timeline variant
- **venue_amenities** — categorized feature flags (free WiFi, pool, parking, etc.) with icon + toggle
- **venue_info** — key-value hotel metadata (check-in time, cancellation policy, star rating, etc.)
- **standalone_events** — events independent of venues (conferences, festivals, weddings)
- **standalone_event_themes** — theming for standalone events
- **standalone_event_members** — user roles for standalone events
- **event_schedule_items** — schedule/agenda for standalone events

Key patterns:
- All tables use UUID primary keys and `updated_at` triggers
- RLS: public read access, write restricted to venue/event members by role
- Slugs are globally unique across venues and standalone events (enforced by trigger)

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

## Conventions

- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char width
- **Styling**: Tailwind classes for layout; CSS variables for dynamic theming per venue/event
- **Components**: Follow shadcn/ui patterns with `data-slot` attributes and CVA variants
- **Database queries**: Add to `src/lib/queries.ts` using the Supabase client pattern
- **Path alias**: `@/*` maps to `src/*`
- **Branches**: `develop` for active work, `main` for production

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
