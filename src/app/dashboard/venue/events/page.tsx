import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { EventsClient } from "./events-client";
import type { VenueEvent } from "@/types";

export default async function ManageEventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("venue_id", active.venue.id)
    .order("start_time", { ascending: true });

  return <EventsClient events={(data as VenueEvent[]) ?? []} venueId={active.venue.id} />;
}
