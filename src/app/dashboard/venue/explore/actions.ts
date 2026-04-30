"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertCollectionAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const id = formData.get("id") as string | null;

  let displayOrder = parseInt(formData.get("display_order") as string, 10);
  if (isNaN(displayOrder)) {
    const { data } = await supabase
      .from("explore_collections")
      .select("display_order")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    displayOrder = (data?.display_order ?? 0) + 1;
  }

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
    ? await supabase.from("explore_collections").update(payload).eq("id", id)
    : await supabase.from("explore_collections").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/explore");
}

export async function deleteCollectionAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "admin");

  const id = formData.get("id") as string;
  const supabase = createAdminClient();
  const { error } = await supabase.from("explore_collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/explore");
}
