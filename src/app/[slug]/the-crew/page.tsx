import { resolveSlug } from "@/lib/slug-resolver";
import { getVenuePageDescription, getCruiseNavImage } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseCrewPage } from "@/components/guest/cruise/cruise-crew";
import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(slug, "The Crew");
}

export default async function TheCrewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue" || resolved.data.venue_type !== "cruise") {
    notFound();
  }

  const [{ body: pageDescription }, heroImageUrl] = await Promise.all([
    getVenuePageDescription(resolved.data.id, "the-crew"),
    getCruiseNavImage(resolved.data.id, "the-crew"),
  ]);

  return (
    <CruiseCrewPage
      venue={resolved.data}
      slug={slug}
      pageDescription={pageDescription}
      heroImageUrl={heroImageUrl}
    />
  );
}
