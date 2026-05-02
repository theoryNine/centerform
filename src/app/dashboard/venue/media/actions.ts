"use server";

import { auth } from "@/lib/auth";
import { getVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteVenueAsset } from "@/lib/storage";
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

export async function deleteVenueMediaAction(mediaId: string, venueId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const role = await getVenueRole(session.user.id, venueId);
  if (!role) throw new Error("Forbidden");

  const supabase = createAdminClient();

  const { data: media } = await supabase
    .from("venue_media")
    .select("url")
    .eq("id", mediaId)
    .eq("venue_id", venueId)
    .single();

  if (!media) throw new Error("Not found");

  await supabase.from("venue_media").delete().eq("id", mediaId);

  // Extract storage path from the public URL and delete the file
  const pathMatch = media.url.match(/\/storage\/v1\/object\/public\/venue-assets\/(.+)/);
  if (pathMatch) {
    await deleteVenueAsset(pathMatch[1]).catch(() => {});
  }
}
