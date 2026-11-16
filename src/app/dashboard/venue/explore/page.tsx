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
    .select("*, explore_collection_items(id, display_order, place:nearby_places(image_url))")
    .eq("venue_id", active.venue.id)
    .order("display_order", { ascending: true });

  type RawItem = { display_order: number; place: { image_url: string | null } | null };
  const collections = (collectionsRaw ?? []).map((c) => {
    const items = ((c as { explore_collection_items?: RawItem[] }).explore_collection_items ?? [])
      .slice()
      .sort((a, b) => a.display_order - b.display_order);
    return {
      ...(c as ExploreCollection),
      itemCount: items.length,
      // Collections have no cover image of their own: use the first place that has a photo.
      coverUrl: items.find((i) => i.place?.image_url)?.place?.image_url ?? null,
    };
  });

  return <ExploreClient collections={collections} venueId={active.venue.id} />;
}
