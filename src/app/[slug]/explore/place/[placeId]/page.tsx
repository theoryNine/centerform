import { resolveSlug } from "@/lib/slug-resolver";
import { getNearbyPlaceById } from "@/lib/queries";
import { notFound } from "next/navigation";
import { PlaceListing } from "@/components/guest/explore/place-listing";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string; placeId: string }>;
}) {
  const { slug, placeId } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const venue = resolved.data;
  const place = await getNearbyPlaceById(placeId);

  if (!place || place.venue_id !== venue.id) {
    notFound();
  }

  return <PlaceListing slug={slug} venue={venue} place={place} />;
}
