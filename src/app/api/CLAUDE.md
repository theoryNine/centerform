# Route handlers (`src/app/api/`)

Loaded in addition to the root CLAUDE.md when working here.

- `auth/[...nextauth]` — NextAuth handler. Don't add logic here; configure in `src/lib/auth.ts`.
- `admin/invites` — `POST`, gated by `Authorization: Bearer $ADMIN_API_KEY` (constant-time compare). Validates `venueId` (UUID), `role` (owner/admin/staff), `expiresInDays` (1–90), `invitedBy`/`emailHint` (length-limited). Tokens are 32 random bytes, base64url.
- `dashboard/upload` — `POST`: signed-in user with any role on the venue. Rejects >10 MB and non-raster types (no SVG), re-encodes with sharp (EXIF-rotate, ≤2400px, WebP q85, metadata stripped, animated GIFs preserved), stores under `media/{uuid}.webp`, inserts a `venue_media` row.
- `go` — `GET ?place=<uuid>|?event=<uuid>`: validates the id, looks up `booking_url` with the public client, redirects only to http(s) URLs (`safeHttpUrl`), and logs the click to `affiliate_clicks` only inside a per-IP rate limit (the redirect always happens).

## Rules for new handlers

1. Authenticate first (`auth()` for dashboard users, API key for internal endpoints), then authorize against the venue with `getVenueRole`/`requireVenueRole`.
2. Validate every input (types, UUID shape, lengths, enums) before touching the database; return generic error messages and `console.error` the details.
3. Never redirect to a user-supplied or DB-supplied URL without `safeHttpUrl`.
4. Rate-limit anything unauthenticated that writes or sends email (`src/lib/rate-limit.ts`).
5. Public read endpoints should use `createPublicClient()`, not the admin client.
