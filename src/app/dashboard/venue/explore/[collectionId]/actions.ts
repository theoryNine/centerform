"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { authorizeVenue, nextDisplayOrder, finishVenueWrite } from "@/lib/venue-action";

async function assertCollectionInVenue(
  supabase: SupabaseClient,
  collectionId: string,
  venueId: string,
): Promise<void> {
  const { data } = await supabase
    .from("explore_collections")
    .select("id")
    .eq("id", collectionId)
    .eq("venue_id", venueId)
    .maybeSingle();
  if (!data) throw new Error("Collection not found.");
}

export async function upsertCollectionItemAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const collectionId = formData.get("collectionId") as string;
  const id = formData.get("id") as string | null;
  const placeId = formData.get("place_id") as string;

  await assertCollectionInVenue(supabase, collectionId, venueId);
  const { data: place } = await supabase
    .from("nearby_places")
    .select("id")
    .eq("id", placeId)
    .eq("venue_id", venueId)
    .maybeSingle();
  if (!place) throw new Error("Place not found.");

  const displayOrder = await nextDisplayOrder(
    supabase,
    "explore_collection_items",
    "collection_id",
    collectionId,
    formData.get("display_order"),
  );

  const payload = {
    collection_id: collectionId,
    place_id: placeId,
    display_order: displayOrder,
    time_label: (formData.get("time_label") as string) || null,
    is_start: formData.get("is_start") === "true",
    is_end: formData.get("is_end") === "true",
  };

  const { error } = id
    ? await supabase.from("explore_collection_items").update(payload).eq("id", id).eq("collection_id", collectionId)
    : await supabase.from("explore_collection_items").insert(payload);

  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, `/dashboard/venue/explore/${collectionId}`);
}

export async function removeCollectionItemAction(formData: FormData): Promise<void> {
  const venueId = formData.get("venueId") as string;
  const { supabase } = await authorizeVenue(venueId, "staff");

  const id = formData.get("id") as string;
  const collectionId = formData.get("collectionId") as string;

  await assertCollectionInVenue(supabase, collectionId, venueId);
  const { error } = await supabase
    .from("explore_collection_items")
    .delete()
    .eq("id", id)
    .eq("collection_id", collectionId);
  if (error) throw new Error(error.message);
  await finishVenueWrite(venueId, `/dashboard/venue/explore/${collectionId}`);
}

export async function reorderCollectionItemsAction(
  venueId: string,
  collectionId: string,
  orderedIds: string[]
): Promise<void> {
  const { supabase } = await authorizeVenue(venueId, "staff");
  await assertCollectionInVenue(supabase, collectionId, venueId);
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("explore_collection_items")
        .update({ display_order: index + 1 })
        .eq("id", id)
        .eq("collection_id", collectionId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  await finishVenueWrite(venueId, `/dashboard/venue/explore/${collectionId}`);
}
