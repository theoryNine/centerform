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
  if (invite.expires_at < now) return { success: false, reason: "expired" };

  if (invite.claimed_by !== null) {
    // Idempotent: same user re-hitting claim after a double-click or page refresh.
    if (invite.claimed_by === userId) return { success: true, venueId: invite.venue_id };
    return { success: false, reason: "already_claimed" };
  }

  const { error: memberError } = await supabase
    .from("venue_members")
    .upsert(
      { venue_id: invite.venue_id, user_id: userId, role: invite.role as MemberRole },
      { onConflict: "venue_id,user_id" },
    );

  if (memberError) throw new Error(`Failed to add venue member: ${memberError.message}`);

  // Guard with .is("claimed_by", null) so a concurrent request can't double-claim.
  await supabase
    .from("venue_invites")
    .update({ claimed_by: userId, claimed_at: now })
    .eq("id", invite.id)
    .is("claimed_by", null);

  return { success: true, venueId: invite.venue_id };
}
