"use server";

import { parseOptionalHttpUrl } from "@/lib/url";
import { authorizeVenue, finishVenueWrite } from "@/lib/venue-action";

export async function upsertVenueEventAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const id = formData.get("id") as string | null;

  const payload = {
    venue_id: venueId,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    start_time: formData.get("start_time") as string,
    end_time: (formData.get("end_time") as string) || null,
    image_url: (formData.get("image_url") as string) || null,
    booking_url: parseOptionalHttpUrl(formData.get("booking_url"), "Booking URL"),
    is_featured: formData.get("is_featured") === "true",
    is_active: formData.get("is_active") === "true",
  };

  const { error } = id
    ? await supabase.from("events").update(payload).eq("id", id).eq("venue_id", venueId)
    : await supabase.from("events").insert(payload);

  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/events");
}

export async function deleteVenueEventAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "admin");

  const id = formData.get("id") as string;
  const { error } = await supabase.from("events").delete().eq("id", id).eq("venue_id", venueId);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/events");
}
