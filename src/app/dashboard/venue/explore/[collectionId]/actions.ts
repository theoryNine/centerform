"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertCollectionItemAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const collectionId = formData.get("collectionId") as string;
  const id = formData.get("id") as string | null;

  let displayOrder = parseInt(formData.get("display_order") as string, 10);
  if (isNaN(displayOrder)) {
    const { data } = await supabase
      .from("explore_collection_items")
      .select("display_order")
      .eq("collection_id", collectionId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    displayOrder = (data?.display_order ?? 0) + 1;
  }

  const payload = {
    collection_id: collectionId,
    place_id: formData.get("place_id") as string,
    display_order: displayOrder,
    time_label: (formData.get("time_label") as string) || null,
    is_start: formData.get("is_start") === "true",
    is_end: formData.get("is_end") === "true",
  };

  const { error } = id
    ? await supabase.from("explore_collection_items").update(payload).eq("id", id)
    : await supabase.from("explore_collection_items").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/venue/explore/${collectionId}`);
}

export async function removeCollectionItemAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const id = formData.get("id") as string;
  const collectionId = formData.get("collectionId") as string;

  const supabase = createAdminClient();
  const { error } = await supabase.from("explore_collection_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/venue/explore/${collectionId}`);
}

export async function reorderCollectionItemsAction(
  venueId: string,
  collectionId: string,
  orderedIds: string[]
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("explore_collection_items")
        .update({ display_order: index + 1 })
        .eq("id", id)
    )
  );
  revalidatePath(`/dashboard/venue/explore/${collectionId}`);
}
