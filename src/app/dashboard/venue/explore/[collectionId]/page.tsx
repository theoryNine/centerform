import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { CollectionDetailClient } from "./collection-detail-client";
import type { CollectionItemWithPlace, ExploreCollection, NearbyPlace } from "@/types";

interface Props {
  params: Promise<{ collectionId: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const { collectionId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const supabase = createAdminClient();

  const [collectionRes, itemsRes, placesRes] = await Promise.all([
    supabase
      .from("explore_collections")
      .select("*")
      .eq("id", collectionId)
      .eq("venue_id", active.venue.id)
      .maybeSingle(),
    supabase
      .from("explore_collection_items")
      .select("*, place:nearby_places(*)")
      .eq("collection_id", collectionId)
      .order("display_order", { ascending: true }),
    supabase
      .from("nearby_places")
      .select("*")
      .eq("venue_id", active.venue.id)
      .order("display_order", { ascending: true }),
  ]);

  if (!collectionRes.data) notFound();

  return (
    <CollectionDetailClient
      collection={collectionRes.data as ExploreCollection}
      items={(itemsRes.data as CollectionItemWithPlace[]) ?? []}
      places={(placesRes.data as NearbyPlace[]) ?? []}
      venueId={active.venue.id}
    />
  );
}
