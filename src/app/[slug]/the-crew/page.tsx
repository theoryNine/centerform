import { resolveSlug } from "@/lib/slug-resolver";
import { getCruiseCrew } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseCrewPage } from "@/components/guest/cruise-crew";

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

  const crew = await getCruiseCrew(resolved.data.id);

  return <CruiseCrewPage venue={resolved.data} crew={crew} slug={slug} />;
}
