"use server";

import { authorizeVenue, nextDisplayOrder, finishVenueWrite } from "@/lib/venue-action";

export async function upsertInfoAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const id = formData.get("id") as string | null;

  const displayOrder = await nextDisplayOrder(
    supabase,
    "venue_info",
    "venue_id",
    venueId,
    formData.get("display_order"),
  );

  const payload = {
    venue_id: venueId,
    category: formData.get("category") as string,
    key: formData.get("key") as string,
    value: formData.get("value") as string,
    display_order: displayOrder,
  };

  const { error } = id
    ? await supabase.from("venue_info").update(payload).eq("id", id).eq("venue_id", venueId)
    : await supabase.from("venue_info").insert(payload);

  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/info");
}

export async function deleteInfoAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "admin");

  const id = formData.get("id") as string;
  const { error } = await supabase.from("venue_info").delete().eq("id", id).eq("venue_id", venueId);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/info");
}
