import { resolveSlug } from "@/lib/slug-resolver";
import { getDiningPlaces, getVenuePageDescription } from "@/lib/queries";
import { notFound } from "next/navigation";
import { VenueDiningPage } from "@/components/guest/venue/venue-dining";
import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(slug, "Dining & Drinks");
}

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

  const [places, { body: pageDescription, heroImageUrl }] = await Promise.all([
    getDiningPlaces(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "dining"),
  ]);

  return (
    <VenueDiningPage
      venue={resolved.data}
      places={places}
      slug={slug}
      pageDescription={pageDescription}
      heroImageUrl={heroImageUrl}
    />
  );
}
