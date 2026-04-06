import { resolveSlug } from "@/lib/slug-resolver";
import { getVenueServices, getVenuePageDescription, getCruiseNavImage } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseShipInfoPage } from "@/components/guest/cruise-ship-info";

export default async function ShipInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue" || resolved.data.venue_type !== "cruise") {
    notFound();
  }

  const [services, pageDescription, heroImageUrl] = await Promise.all([
    getVenueServices(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "ship-info"),
    getCruiseNavImage(resolved.data.id, "ship-info"),
  ]);

  return (
    <CruiseShipInfoPage
      venue={resolved.data}
      services={services}
      slug={slug}
      pageDescription={pageDescription}
      heroImageUrl={heroImageUrl}
    />
  );
}
