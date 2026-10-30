# Dashboard (`src/app/dashboard/`)

Loaded in addition to the root CLAUDE.md when working here.


**Auth identity gap:** NextAuth and Supabase are separate auth systems. Supabase RLS relies on `auth.uid()` from a Supabase JWT, but the app uses NextAuth sessions — so `auth.uid()` is always NULL in dashboard requests, causing all write RLS policies to silently block.

**Solution:** Dashboard Server Actions and Server Components use `createAdminClient()` (service role key, bypasses RLS) and manually enforce permissions via `src/lib/permissions.ts`.

**Never** import `createAdminClient` in client components or `"use client"` files — the service role key must stay server-side only.

### Active Venue Context

Multi-venue support is handled via a cookie (`active-venue-id`). The active venue is resolved by `getActiveDashboardVenue(userId)` in `src/lib/dashboard.ts`, which reads the cookie and matches it against the user's memberships (from `getVenuesForUser`), falling back to the first membership if the cookie is absent or stale.

Every dashboard page calls this once at the top. The `VenueSwitcher` component in the sidebar calls `switchVenueAction(venueId)` (in `src/app/dashboard/actions.ts`) which updates the cookie and revalidates the layout.

### Dashboard Routes

```
/dashboard                                    Overview (real counts: events, services, places, collections)
/dashboard/venue                              Hotel Info & Branding: general info (incl. cover image) + page images + welcome card + theme
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

Use the helpers in `src/lib/venue-action.ts` — they enforce auth + role, return the service-role client, and refresh both the dashboard page and the cached guest pages:

```ts
"use server";
import { authorizeVenue, nextDisplayOrder, finishVenueWrite } from "@/lib/venue-action";
import { parseOptionalHttpUrl } from "@/lib/url";

export async function upsertXAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff"); // redirects to /dashboard if denied

  const id = formData.get("id") as string | null;
  const displayOrder = await nextDisplayOrder(supabase, "table", "venue_id", venueId, formData.get("display_order"));
  const payload = { venue_id: venueId, display_order: displayOrder, website: parseOptionalHttpUrl(formData.get("website"), "Website") };

  const { error } = id
    ? await supabase.from("table").update(payload).eq("id", id).eq("venue_id", venueId) // always scope by venue_id
    : await supabase.from("table").insert(payload);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/section"); // revalidatePath + revalidateGuestPages
}
```

**Always scope mutations by tenant.** The service role bypasses RLS, so every `update`/`delete` by `id` must also filter `.eq("venue_id", venueId)` (or the parent `collection_id`), and any foreign ids from the form (`collection_id`, `place_id`) must be verified to belong to that venue (see `assertCollectionInVenue` in `explore/[collectionId]/actions.ts`). Delete requires `"admin"`; upsert requires `"staff"`. Actions whose venue is derived from a row id (e.g. `toggleAmenityAction`) look the venue up first, then check the role. Media actions use `getVenueRole`/`requireVenueRole` directly. Server Actions live in `actions.ts` beside their page.

### Forms Strategy

All list pages use a right-side shadcn `Sheet` (`side="right"`) for create/edit. One exception: Venue Settings stays as an inline full-page form.

- List pages are split into a Server Component (`page.tsx`) that fetches data, and a `"use client"` sibling (`*-client.tsx`) that holds sheet open state
- Sheet components live in `src/components/dashboard/` (e.g. `ServiceSheet`, `PlaceSheet`)
- On action success: close sheet + `router.refresh()`
- Delete confirmation: inline toggle in sheet footer (no separate Dialog)
- Delete requires `"admin"` role minimum; upsert requires `"staff"`
- One exception: Hotel Info & Branding (`/dashboard/venue`) stays as an inline full-page form (no Sheet)
