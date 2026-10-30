# Shared library (`src/lib/`)

Loaded in addition to the root CLAUDE.md when working here.

## Which Supabase client?

| Client | File | Use for |
|---|---|---|
| `createPublicClient()` | `supabase/public.ts` | Guest reads (`queries.ts`, `slug-resolver.ts`, `/api/go`). Cookie-free so pages stay cacheable. |
| `createClient()` | `supabase/client.ts` | Client Components only. Don't use for guest page data — fetch on the server and pass props. |
| `createAdminClient()` | `supabase/admin.ts` | Server-only, bypasses RLS: dashboard actions/pages, upload + invite routes, click logging. Always scope by `venue_id`. |

There is no cookie-based Supabase client any more (guests and dashboard users have no Supabase session — auth is NextAuth).

## Helpers

- `venue-action.ts` — `authorizeVenue`, `nextDisplayOrder`, `finishVenueWrite` for dashboard actions.
- `revalidate.ts` — `revalidateGuestPages(venueId)`: regenerates the venue's cached guest pages.
- `url.ts` — `safeHttpUrl` (render/redirect) and `parseOptionalHttpUrl` (form input). http(s) only; use for any user-supplied URL.
- `rate-limit.ts` — in-memory fixed-window limiter. **Per server instance only** — on serverless it just dampens bursts. Swap in a shared store (e.g. Upstash) before relying on it for hard limits.
- `auth-helpers.ts` — `normalizeEmail` and `allowMagicLinkSend` (per-IP and per-address limits); use in every magic-link action.
- `env.ts` — `requireEnv(name, value)`: throws a clear error for missing env vars (use for server-side env, read via literal `process.env.NAME`).
- `permissions.ts` — role ranks owner > admin > staff. `requireVenueRole` redirects to `/dashboard`. `getVenuesForUser` is wrapped in React `cache()`.
- `invites.ts` — `claimInvite` claims atomically first (`UPDATE … WHERE claimed_by IS NULL`), then adds the member without downgrading an existing role, and releases the invite if adding the member fails.
- `slug-resolver.ts` — `resolveSlug` is wrapped in `cache()` so layout + page share one lookup.
- `storage.ts` — upload/delete helpers for the public buckets (see root CLAUDE.md for layout).

## Tests

Pure-logic unit tests sit next to the code as `*.test.ts` and run with `pnpm test` (Vitest, node environment). Modules that import Next/auth runtime need `vi.mock` stubs — see `venue-action.test.ts`. CI runs typecheck, tests and build on every PR.
