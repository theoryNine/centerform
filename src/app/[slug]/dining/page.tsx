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

  return (
    <VenueDiningPage
      venue={resolved.data}
      places={places}
      slug={slug}
      pageDescription={pageDescription}
    />
  );
}
