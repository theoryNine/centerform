import { resolveSlug } from "@/lib/slug-resolver";
import { notFound } from "next/navigation";
import { CruiseCrewListing } from "@/components/guest/cruise/cruise-crew-listing";
import { CREW } from "@/lib/cruise-crew-data";

export default async function CrewMemberPage({
  params,
}: {
  params: Promise<{ slug: string; name: string }>;
}) {
  const { slug, name } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue" || resolved.data.venue_type !== "cruise") {
    notFound();
  }

  const member = CREW.find((m) => m.slug === name);
  if (!member) notFound();

  return <CruiseCrewListing venue={resolved.data} member={member} />;
}
