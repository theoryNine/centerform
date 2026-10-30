"use server";

import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { authorizeVenue, nextDisplayOrder, finishVenueWrite } from "@/lib/venue-action";

export async function upsertAmenityAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const id = formData.get("id") as string | null;

  const displayOrder = await nextDisplayOrder(
    supabase,
    "venue_amenities",
    "venue_id",
    venueId,
    formData.get("display_order"),
  );

  const payload = {
    venue_id: venueId,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category: formData.get("category") as string,
    icon: (formData.get("icon") as string) || null,
    is_available: formData.get("is_available") === "true",
    display_order: displayOrder,
  };

  const { error } = id
    ? await supabase.from("venue_amenities").update(payload).eq("id", id).eq("venue_id", venueId)
    : await supabase.from("venue_amenities").insert(payload);

  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/amenities");
}

export async function toggleAmenityAction(id: string, isAvailable: boolean): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { data: amenity } = await supabase
    .from("venue_amenities")
    .select("venue_id")
    .eq("id", id)
    .maybeSingle();

  if (!amenity) throw new Error("Not found");
  await requireVenueRole(session.user.id, amenity.venue_id, "staff");

  const { error } = await supabase
    .from("venue_amenities")
    .update({ is_available: isAvailable })
    .eq("id", id)
    .eq("venue_id", amenity.venue_id);

  if (error) throw new Error(error.message);
  await finishVenueWrite(amenity.venue_id, "/dashboard/venue/amenities");
}

export async function deleteAmenityAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "admin");

  const id = formData.get("id") as string;
  const { error } = await supabase.from("venue_amenities").delete().eq("id", id).eq("venue_id", venueId);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/amenities");
}
