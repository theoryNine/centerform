"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateGuestPages } from "@/lib/revalidate";
import { parseOptionalHttpUrl } from "@/lib/url";

export async function upsertPlaceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const id = formData.get("id") as string | null;

  let displayOrder = parseInt(formData.get("display_order") as string, 10);
  if (isNaN(displayOrder)) {
    const { data } = await supabase
      .from("nearby_places")
      .select("display_order")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    displayOrder = (data?.display_order ?? 0) + 1;
  }

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
  revalidatePath("/dashboard/venue/places");
  await revalidateGuestPages(venueId);
}

export async function deletePlaceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "admin");

  const id = formData.get("id") as string;
  const supabase = createAdminClient();
  const { error } = await supabase.from("nearby_places").delete().eq("id", id).eq("venue_id", venueId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/places");
  await revalidateGuestPages(venueId);
}
