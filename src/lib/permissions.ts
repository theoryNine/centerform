import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MemberRole, Venue } from "@/types";

const ROLE_RANK: Record<MemberRole, number> = { owner: 3, admin: 2, staff: 1 };

// Returns the user's role for the given venue, or null if they have no access.
export async function getVenueRole(userId: string, venueId: string): Promise<MemberRole | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_members")
    .select("role")
    .eq("user_id", userId)
    .eq("venue_id", venueId)
    .maybeSingle();
  return (data?.role as MemberRole) ?? null;
}

// Redirects to /dashboard if the user doesn't have at least minRole for the venue.
export async function requireVenueRole(
  userId: string,
  venueId: string,
  minRole: MemberRole
): Promise<MemberRole> {
  const role = await getVenueRole(userId, venueId);
  if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
    redirect("/dashboard");
  }
  return role;
}

// Returns all venues the user is a member of, with their role and venue details.
export async function getVenuesForUser(
  userId: string
): Promise<Array<{ role: MemberRole; venue: Venue }>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_members")
    .select("role, venues(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    role: row.role as MemberRole,
    venue: row.venues as unknown as Venue,
  }));
}
