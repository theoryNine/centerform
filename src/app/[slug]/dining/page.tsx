import { resolveSlug } from "@/lib/slug-resolver";
import { getNearbyPlaces, getVenuePageDescription } from "@/lib/queries";
import { notFound } from "next/navigation";
import { VenueDiningPage } from "@/components/guest/venue/venue-dining";

export default async function DiningPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const [places, pageDescription] = await Promise.all([
    getNearbyPlaces(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "dining"),
  ]);

  const diningPlaces = places.filter(
    (p) =>
      !p.collection_id &&
      (p.category === "restaurant" || p.category === "bar" || p.category === "cafe"),
  );

  return (
    <VenueDiningPage
      venue={resolved.data}
      places={diningPlaces}
      slug={slug}
      pageDescription={pageDescription}
    />
  );
}
