# Database migrations (`supabase/migrations/`)

Loaded in addition to the root CLAUDE.md when working here.

- The database is a **remote** Supabase instance (no local Supabase). Migrations are plain SQL files, numbered sequentially (`NNN_description.sql`), and are **applied to the remote manually** — adding a file does not change the database. When you add one, say so in the PR so someone applies it.
- Latest at time of writing: `034_affiliate_clicks_rls.sql`. Check the folder for the next number.
- Make migrations idempotent where practical (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
- **RLS convention:** guest-facing content tables have public read; write policies in older migrations never match in practice (`auth.uid()` is always NULL — auth is NextAuth), so writes go through the service role with role checks in app code. Tables that must never be readable with the anon key (`venue_invites`, `venue_media`, `affiliate_clicks`, NextAuth tables) enable RLS with **no policies**. Every new table needs an explicit decision: public read policy, or RLS on with no policies.
- All tables use UUID primary keys and `updated_at` triggers. Slugs are globally unique across venues and standalone events (enforced by trigger).
- Sample data: `012_sample_anniversary_cruise.sql` seeds the anniversary cruise (slug `adam-ansel`) — do **not** re-run its itinerary data (replaced in `027`). `019` seeds cruise daily welcomes. `030` includes test booking URLs for the Ballard Inn listings.
