import { cookies } from "next/headers";
import { getVenuesForUser } from "@/lib/permissions";
import type { MemberRole, Venue } from "@/types";

export async function getActiveDashboardVenue(
  userId: string
): Promise<{ venue: Venue; role: MemberRole } | null> {
  const memberships = await getVenuesForUser(userId);
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const cookieVenueId = cookieStore.get("active-venue-id")?.value;

  const match = memberships.find((m) => m.venue.id === cookieVenueId) ?? memberships[0];
  return { venue: match.venue, role: match.role };
}
