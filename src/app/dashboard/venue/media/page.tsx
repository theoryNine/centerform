import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { MediaClient } from "./media-client";
import type { VenueMedia } from "@/types";

export default async function MediaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_media")
    .select("*")
    .eq("venue_id", active.venue.id)
    .order("created_at", { ascending: false });

  return <MediaClient media={(data as VenueMedia[]) ?? []} venueId={active.venue.id} />;
}
