"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertAmenityAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const id = formData.get("id") as string | null;

  let displayOrder = parseInt(formData.get("display_order") as string, 10);
  if (isNaN(displayOrder)) {
    const { data } = await supabase
      .from("venue_amenities")
      .select("display_order")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    displayOrder = (data?.display_order ?? 0) + 1;
  }

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
    ? await supabase.from("venue_amenities").update(payload).eq("id", id)
    : await supabase.from("venue_amenities").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/amenities");
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
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/amenities");
}

export async function deleteAmenityAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "admin");

  const id = formData.get("id") as string;
  const supabase = createAdminClient();
  const { error } = await supabase.from("venue_amenities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/amenities");
}
