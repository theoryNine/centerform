import { resolveSlug } from "@/lib/slug-resolver";
import { getNearbyPlaces, getVenuePageDescription } from "@/lib/queries";
import { notFound } from "next/navigation";
import { VenueExplorePage } from "@/components/guest/venue/venue-explore";
import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(slug, "Explore");
}

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
  const [places, { body: pageDescription, heroImageUrl }] = await Promise.all([
    getNearbyPlaces(venue.id),
    getVenuePageDescription(venue.id, "explore"),
  ]);

  return <VenueExplorePage slug={slug} venue={venue} places={places} pageDescription={pageDescription} heroImageUrl={heroImageUrl} />;
}
