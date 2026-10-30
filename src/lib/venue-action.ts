import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { revalidateGuestPages } from "@/lib/revalidate";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MemberRole } from "@/types";

// Shared preamble for dashboard server actions: requires a signed-in user with at least
// `minRole` on the venue (redirects to /dashboard otherwise) and returns the service-role
// client. The client bypasses RLS, so callers must still scope every query by venue_id.
export async function authorizeVenue(
  venueId: string | null | undefined,
  minRole: MemberRole,
): Promise<{ userId: string; role: MemberRole; supabase: SupabaseClient }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!venueId) throw new Error("Missing venueId");

  const role = await requireVenueRole(session.user.id, venueId, minRole);
  return { userId: session.user.id, role, supabase: createAdminClient() };
}

// `table` and `scopeColumn` must be hard-coded by the caller, never taken from user input.
// Uses the submitted display_order when it's a number, otherwise appends after the current max
// within the given scope (e.g. `venue_id` = the venue, or `collection_id` = a collection).
export async function nextDisplayOrder(
  supabase: SupabaseClient,
  table: string,
  scopeColumn: string,
  scopeValue: string,
  requested: FormDataEntryValue | null,
): Promise<number> {
  const parsed = parseInt(String(requested ?? ""), 10);
  if (!Number.isNaN(parsed)) return parsed;

  const { data } = await supabase
    .from(table)
    .select("display_order")
    .eq(scopeColumn, scopeValue)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.display_order ?? 0) + 1;
}

// Call after every successful dashboard write: refreshes the dashboard page and regenerates the
// venue's cached guest pages so edits show up on the next view.
export async function finishVenueWrite(venueId: string, dashboardPath: string): Promise<void> {
  revalidatePath(dashboardPath);
  await revalidateGuestPages(venueId);
}
