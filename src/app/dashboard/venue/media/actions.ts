"use server";

import { auth } from "@/lib/auth";
import { getVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import type { VenueMedia } from "@/types";

export async function listVenueMediaAction(venueId: string): Promise<VenueMedia[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const role = await getVenueRole(session.user.id, venueId);
  if (!role) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_media")
    .select("*")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
