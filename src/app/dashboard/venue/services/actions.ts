"use server";

import { detailsForStorage } from "@/lib/service-details";
import { authorizeVenue, nextDisplayOrder, finishVenueWrite } from "@/lib/venue-action";

export async function upsertServiceAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const id = formData.get("id") as string | null;

  const displayOrder = await nextDisplayOrder(
    supabase,
    "services",
    "venue_id",
    venueId,
    formData.get("display_order"),
  );

  // `details_keep` means the editor could not show the stored details and the owner left them
  // alone: leave the column untouched instead of overwriting it.
  const keepDetails = formData.get("details_keep") === "true";
  const details = keepDetails
    ? undefined
    : detailsForStorage(String(formData.get("details") ?? ""));

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required.");

  const payload = {
    venue_id: venueId,
    name,
    description: (formData.get("description") as string) || null,
    category: formData.get("category") as string,
    icon: (formData.get("icon") as string) || null,
    display_order: displayOrder,
    is_active: formData.get("is_active") === "true",
    ...(details === undefined ? {} : { details }),
  };

  const { error } = id
    ? await supabase.from("services").update(payload).eq("id", id).eq("venue_id", venueId)
    : await supabase.from("services").insert(payload);

  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/services");
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "admin");

  const id = formData.get("id") as string;
  const { error } = await supabase.from("services").delete().eq("id", id).eq("venue_id", venueId);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/services");
}
