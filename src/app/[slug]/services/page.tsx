import { resolveSlug } from "@/lib/slug-resolver";
import { getVenueServices, getVenuePageDescription, getVenueInfoValues } from "@/lib/queries";
import { notFound } from "next/navigation";
import { VenueServicesPage } from "@/components/guest/venue/venue-services";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const [services, { body: pageDescription, heroImageUrl }, infoValues] = await Promise.all([
    getVenueServices(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "services"),
    getVenueInfoValues(resolved.data.id, ["check_out_time", "front_desk_hours"]),
  ]);

  return (
    <VenueServicesPage
      venue={resolved.data}
      services={services}
      slug={slug}
      pageDescription={pageDescription}
      heroImageUrl={heroImageUrl}
      checkoutTime={infoValues["check_out_time"] ?? null}
      frontDeskHours={infoValues["front_desk_hours"] ?? null}
    />
  );
}
