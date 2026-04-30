"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertServiceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const id = formData.get("id") as string | null;

  let displayOrder = parseInt(formData.get("display_order") as string, 10);
  if (isNaN(displayOrder)) {
    const { data } = await supabase
      .from("services")
      .select("display_order")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    displayOrder = (data?.display_order ?? 0) + 1;
  }

  const rawDetails = (formData.get("details") as string)?.trim();
  let details = null;
  if (rawDetails) {
    try {
      details = JSON.parse(rawDetails);
    } catch {
      throw new Error("Details must be valid JSON.");
    }
  }

  const payload = {
    venue_id: venueId,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category: formData.get("category") as string,
    icon: (formData.get("icon") as string) || null,
    display_order: displayOrder,
    is_active: formData.get("is_active") === "true",
    details,
  };

  const { error } = id
    ? await supabase.from("services").update(payload).eq("id", id)
    : await supabase.from("services").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/services");
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "admin");

  const id = formData.get("id") as string;
  const supabase = createAdminClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/services");
}
