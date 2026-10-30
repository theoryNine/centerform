import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { HotelInfoClient } from "./hotel-info-client";
import type { VenueInfo } from "@/types";

export default async function HotelInfoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_info")
    .select("*")
    .eq("venue_id", active.venue.id)
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return <HotelInfoClient info={(data as VenueInfo[]) ?? []} venueId={active.venue.id} />;
}
