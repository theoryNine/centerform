import { resolveSlug } from "@/lib/slug-resolver";
import { getNearbyPlacesByArea } from "@/lib/queries";
import { notFound } from "next/navigation";
import { AreaListingPage } from "@/components/guest/explore/area-listing";
import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; area: string }>;
}): Promise<Metadata> {
  const { slug, area } = await params;
  return pageMetadata(slug, decodeURIComponent(area));
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string; area: string }>;
}) {
  const { slug, area: encodedArea } = await params;
  const area = decodeURIComponent(encodedArea);

  const resolved = await resolveSlug(slug);
  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const venue = resolved.data;
  const places = await getNearbyPlacesByArea(venue.id, area);

  if (places.length === 0) {
    notFound();
  }

  return <AreaListingPage slug={slug} venue={venue} area={area} places={places} />;
}
