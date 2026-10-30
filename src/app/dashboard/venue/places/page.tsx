import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlacesClient } from "./places-client";
import type { ExploreCollection, NearbyPlace } from "@/types";

export default async function NearbyPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const { type } = await searchParams;
  const viewType = type === "places" ? "places" : "dining";

  const supabase = createAdminClient();
  const [placesRes, collectionsRes] = await Promise.all([
    supabase
      .from("nearby_places")
      .select("*")
      .eq("venue_id", active.venue.id)
      .order("area_display_order", { ascending: true })
      .order("display_order", { ascending: true }),
    supabase
      .from("explore_collections")
      .select("id, title")
      .eq("venue_id", active.venue.id)
      .order("display_order", { ascending: true }),
  ]);

  return (
    <PlacesClient
      places={(placesRes.data as NearbyPlace[]) ?? []}
      collections={(collectionsRes.data as ExploreCollection[]) ?? []}
      venueId={active.venue.id}
      type={viewType}
    />
  );
}
