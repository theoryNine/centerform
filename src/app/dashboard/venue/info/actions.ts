"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertInfoAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const id = formData.get("id") as string | null;

  let displayOrder = parseInt(formData.get("display_order") as string, 10);
  if (isNaN(displayOrder)) {
    const { data } = await supabase
      .from("venue_info")
      .select("display_order")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    displayOrder = (data?.display_order ?? 0) + 1;
  }

  const payload = {
    venue_id: venueId,
    category: formData.get("category") as string,
    key: formData.get("key") as string,
    value: formData.get("value") as string,
    display_order: displayOrder,
  };

  const { error } = id
    ? await supabase.from("venue_info").update(payload).eq("id", id)
    : await supabase.from("venue_info").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/info");
}

export async function deleteInfoAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "admin");

  const id = formData.get("id") as string;
  const supabase = createAdminClient();
  const { error } = await supabase.from("venue_info").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue/info");
}
