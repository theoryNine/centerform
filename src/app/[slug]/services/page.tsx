import { resolveSlug } from "@/lib/slug-resolver";
import { getVenueServices, getVenuePageDescription } from "@/lib/queries";
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

  const [services, pageDescription] = await Promise.all([
    getVenueServices(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "services"),
  ]);

  return (
    <VenueServicesPage
      venue={resolved.data}
      services={services}
      slug={slug}
      pageDescription={pageDescription}
    />
  );
}
