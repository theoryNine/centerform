"use server";

import { parseOptionalHttpUrl } from "@/lib/url";
import { authorizeVenue, nextDisplayOrder, finishVenueWrite } from "@/lib/venue-action";

export async function upsertPlaceAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const id = formData.get("id") as string | null;

  const displayOrder = await nextDisplayOrder(
    supabase,
    "nearby_places",
    "venue_id",
    venueId,
    formData.get("display_order"),
  );

  const rawTips = (formData.get("tips") as string)?.trim();
  const tips = rawTips
    ? rawTips
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
    : null;

  const ratingRaw = parseFloat(formData.get("rating") as string);
  const priceLevelRaw = parseInt(formData.get("price_level") as string, 10);
  const areaDisplayOrderRaw = parseInt(formData.get("area_display_order") as string, 10);

  const collectionId = (formData.get("collection_id") as string) || null;
  if (collectionId) {
    const { data: collection } = await supabase
      .from("explore_collections")
      .select("id")
      .eq("id", collectionId)
      .eq("venue_id", venueId)
      .maybeSingle();
    if (!collection) throw new Error("Collection not found.");
  }

  const payload = {
    venue_id: venueId,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category: formData.get("category") as string,
    address: (formData.get("address") as string) || null,
    distance: (formData.get("distance") as string) || null,
    rating: isNaN(ratingRaw) ? null : ratingRaw,
    price_level: isNaN(priceLevelRaw) ? null : priceLevelRaw,
    phone: (formData.get("phone") as string) || null,
    website: parseOptionalHttpUrl(formData.get("website"), "Website"),
    image_url: (formData.get("image_url") as string) || null,
    area: (formData.get("area") as string) || null,
    area_display_order: isNaN(areaDisplayOrderRaw) ? 0 : areaDisplayOrderRaw,
    tagline: (formData.get("tagline") as string) || null,
    hours: (formData.get("hours") as string) || null,
    cta_label: (formData.get("cta_label") as string) || null,
    booking_url: parseOptionalHttpUrl(formData.get("booking_url"), "Booking URL"),
    collection_id: collectionId,
    is_featured: formData.get("is_featured") === "true",
    display_order: displayOrder,
    tips,
  };

  const { error } = id
    ? await supabase.from("nearby_places").update(payload).eq("id", id).eq("venue_id", venueId)
    : await supabase.from("nearby_places").insert(payload);

  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/places");
}

export async function deletePlaceAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "admin");

  const id = formData.get("id") as string;
  const { error } = await supabase.from("nearby_places").delete().eq("id", id).eq("venue_id", venueId);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, "/dashboard/venue/places");
}
