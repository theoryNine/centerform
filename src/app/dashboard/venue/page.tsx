import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { VenueGeneralForm } from "@/components/dashboard/venue-general-form";
import { VenueImagesForm } from "@/components/dashboard/venue-images-form";
import { VenueThemeForm } from "@/components/dashboard/venue-theme-form";
import { VenueSettingsTabs } from "@/components/dashboard/venue-settings-tabs";
import { parseVenueTab } from "@/lib/venue-tabs";

export default async function VenueSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const { tab } = await searchParams;

  const supabase = createAdminClient();
  const [{ data: theme }, { data: pageDescRows }] = await Promise.all([
    supabase.from("venue_themes").select("*").eq("venue_id", active.venue.id).maybeSingle(),
    supabase
      .from("venue_page_descriptions")
      .select("page_slug, image_url")
      .eq("venue_id", active.venue.id)
      .in("page_slug", ["services", "dining", "events", "explore"]),
  ]);

  const pageImages = Object.fromEntries(
    (pageDescRows ?? []).map((r) => [
      r.page_slug,
      (r as { image_url: string | null }).image_url ?? null,
    ]),
  ) as Record<string, string | null>;

  const v = active.venue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hotel Info & Branding</h1>
        <p className="text-muted-foreground">Manage your venue details and branding.</p>
      </div>

      {/* key: switching venue remounts the forms, so edits typed for one venue are never saved to another */}
      <VenueSettingsTabs
        key={v.id}
        initialTab={parseVenueTab(tab)}
        panels={{
          general: <VenueGeneralForm venue={v} />,
          images: <VenueImagesForm venueId={v.id} images={pageImages} />,
          branding: <VenueThemeForm venueId={v.id} venueName={v.name} theme={theme} />,
        }}
      />
    </div>
  );
}
