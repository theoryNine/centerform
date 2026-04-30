"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getVenuesForUser } from "@/lib/permissions";

export async function switchVenueAction(venueId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const memberships = await getVenuesForUser(session.user.id);
  const valid = memberships.some((m) => m.venue.id === venueId);
  if (!valid) return;

  const cookieStore = await cookies();
  cookieStore.set("active-venue-id", venueId, {
    path: "/dashboard",
    httpOnly: true,
    sameSite: "lax",
  });

  revalidatePath("/dashboard", "layout");
}
