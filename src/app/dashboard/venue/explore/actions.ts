"use server";

import { authorizeVenue, nextDisplayOrder, finishVenueWrite } from "@/lib/venue-action";

export async function upsertCollectionAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const id = formData.get("id") as string | null;

  const displayOrder = await nextDisplayOrder(
    supabase,
    "explore_collections",
    "venue_id",
    venueId,
    formData.get("display_order"),
  );

  const payload = {
    venue_id: venueId,
    title: formData.get("title") as string,
    subtitle: (formData.get("subtitle") as string) || null,
    description: (formData.get("description") as string) || null,
    layout: (formData.get("layout") as string) || "cards",
    area: (formData.get("area") as string) || null,
    is_active: formData.get("is_active") === "true",
    display_order: displayOrder,
  };

  const { error } = id
    ? await supabase.from("explore_collections").update(payload).eq("id", id).eq("venue_id", venueId)
    : await supabase.from("explore_collections").insert(payload);

  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/explore");
}

export async function deleteCollectionAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "admin");

  const id = formData.get("id") as string;
  const { error } = await supabase.from("explore_collections").delete().eq("id", id).eq("venue_id", venueId);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/explore");
}
