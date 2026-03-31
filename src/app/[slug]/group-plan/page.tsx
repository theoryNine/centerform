import { resolveSlug } from "@/lib/slug-resolver";
import { getCruiseItineraryItems } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseGroupPlanPage } from "@/components/guest/cruise-group-plan";

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

  const items = await getCruiseItineraryItems(resolved.data.id);

  return <CruiseGroupPlanPage venue={resolved.data} items={items} slug={slug} />;
}
