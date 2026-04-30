"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVenueAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("venues")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      website: (formData.get("website") as string) || null,
      welcome_heading: (formData.get("welcome_heading") as string) || null,
      welcome_body: (formData.get("welcome_body") as string) || null,
      phone_label: (formData.get("phone_label") as string) || null,
    })
    .eq("id", venueId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue");
}

export async function updateVenueThemeAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const { error } = await supabase.from("venue_themes").upsert(
    {
      venue_id: venueId,
      primary_color: formData.get("primary_color") as string,
      secondary_color: formData.get("secondary_color") as string,
      accent_color: formData.get("accent_color") as string,
      font_family: (formData.get("font_family") as string) || null,
      border_radius: (formData.get("border_radius") as string) || null,
    },
    { onConflict: "venue_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue");
}
