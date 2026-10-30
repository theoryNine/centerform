import { createAdminClient } from "@/lib/supabase/admin";
import type { MemberRole, VenueInvite } from "@/types";

// Read-only lookup — used by the invite landing page to show venue name and validate state.
export async function getInviteByToken(
  token: string,
): Promise<(VenueInvite & { venue_name: string }) | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_invites")
    .select("*, venues(name)")
    .eq("token", token)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    venue_name: (data.venues as { name: string } | null)?.name ?? "your venue",
  };
}

export type ClaimResult =
  | { success: true; venueId: string }
  | { success: false; reason: "not_found" | "expired" | "already_claimed" };

// Claims the invite for the given user. Idempotent if the same user already claimed it.
export async function claimInvite(userId: string, token: string): Promise<ClaimResult> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: invite } = await supabase
    .from("venue_invites")
    .select("id, venue_id, role, claimed_by, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { success: false, reason: "not_found" };
  if (invite.claimed_by === userId) return { success: true, venueId: invite.venue_id };
  if (invite.claimed_by !== null) return { success: false, reason: "already_claimed" };
  if (invite.expires_at < now) return { success: false, reason: "expired" };

  // Claim atomically first: only one concurrent request can flip claimed_by from NULL.
  const { data: claimed, error: claimError } = await supabase
    .from("venue_invites")
    .update({ claimed_by: userId, claimed_at: now })
    .eq("id", invite.id)
    .is("claimed_by", null)
    .select("id");

  if (claimError) throw new Error(`Failed to claim invite: ${claimError.message}`);
  if (!claimed || claimed.length === 0) {
    // Lost the race — re-read to tell "same user double-click" from "someone else won".
    const { data: latest } = await supabase
      .from("venue_invites")
      .select("claimed_by")
      .eq("id", invite.id)
      .maybeSingle();
    if (latest?.claimed_by === userId) return { success: true, venueId: invite.venue_id };
    return { success: false, reason: "already_claimed" };
  }

  // Never downgrade: if the user is already a member with an equal or higher role, keep it.
  const { data: existing } = await supabase
    .from("venue_members")
    .select("role")
    .eq("venue_id", invite.venue_id)
    .eq("user_id", userId)
    .maybeSingle();

  const rank: Record<MemberRole, number> = { owner: 3, admin: 2, staff: 1 };
  const invitedRole = invite.role as MemberRole;
  const existingRole = existing?.role as MemberRole | undefined;

  if (!existingRole || rank[existingRole] < rank[invitedRole]) {
    const { error: memberError } = await supabase
      .from("venue_members")
      .upsert(
        { venue_id: invite.venue_id, user_id: userId, role: invitedRole },
        { onConflict: "venue_id,user_id" },
      );

    if (memberError) {
      // Release the invite so the user can retry rather than being locked out.
      await supabase
        .from("venue_invites")
        .update({ claimed_by: null, claimed_at: null })
        .eq("id", invite.id)
        .eq("claimed_by", userId);
      throw new Error(`Failed to add venue member: ${memberError.message}`);
    }
  }

  return { success: true, venueId: invite.venue_id };
}
