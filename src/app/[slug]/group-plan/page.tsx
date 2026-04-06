import { resolveSlug } from "@/lib/slug-resolver";
import { getCruiseItineraryItems, getVenuePageDescription, getCruiseNavImage } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseGroupPlanPage } from "@/components/guest/cruise/cruise-group-plan";

export default async function GroupPlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue" || resolved.data.venue_type !== "cruise") {
    notFound();
  }

  const [items, pageDescription, heroImageUrl] = await Promise.all([
    getCruiseItineraryItems(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "group-plan"),
    getCruiseNavImage(resolved.data.id, "group-plan"),
  ]);

  return (
    <CruiseGroupPlanPage
      venue={resolved.data}
      items={items}
      slug={slug}
      pageDescription={pageDescription}
      heroImageUrl={heroImageUrl}
    />
  );
}
