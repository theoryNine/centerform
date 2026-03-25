import { resolveSlug } from "@/lib/slug-resolver";
import { getNearbyPlaces } from "@/lib/queries";
import { notFound } from "next/navigation";
import { VenueExplorePage } from "@/components/guest/venue-explore";

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const venue = resolved.data;
  const places = await getNearbyPlaces(venue.id);

  return <VenueExplorePage slug={slug} venue={venue} places={places} />;
}
