import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ExploreClient } from "./explore-client";
import type { ExploreCollection } from "@/types";

export default async function ExploreCollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: collectionsRaw } = await supabase
    .from("explore_collections")
    .select("*, explore_collection_items(id)")
    .eq("venue_id", active.venue.id)
    .order("display_order", { ascending: true });

  const collections = (collectionsRaw ?? []).map((c) => ({
    ...(c as ExploreCollection),
    itemCount: Array.isArray((c as { explore_collection_items?: unknown[] }).explore_collection_items)
      ? (c as { explore_collection_items: unknown[] }).explore_collection_items.length
      : 0,
  }));

  return <ExploreClient collections={collections} venueId={active.venue.id} />;
}
