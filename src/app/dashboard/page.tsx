import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { buildChecklist } from "@/lib/dashboard-checklist";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { ChecklistCard } from "@/components/dashboard/checklist";
import { GuestLinkCard } from "@/components/dashboard/guest-link-card";
import { StatLink } from "@/components/dashboard/stat-link";

// Public origin of this deployment, from the request (so previews and localhost are right),
// falling back to AUTH_URL.
// A well-formed host name (optionally with a port): anything else in the header is ignored.
const HOST_RE = /^(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d{1,5})?$/i;

async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim();
  if (HOST_RE.test(host)) {
    const forwarded = h.get("x-forwarded-proto")?.split(",")[0].trim();
    const proto =
      forwarded === "http" || forwarded === "https"
        ? forwarded
        : /^(localhost|127\.0\.0\.1)(:|$)/.test(host)
          ? "http"
          : "https";
    return `${proto}://${host}`;
  }
  return (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const venue = active.venue;
  const venueId = venue.id;
  const supabase = createAdminClient();

  const [eventsRes, servicesRes, placesRes, collectionsRes, eventsPageRes, origin] =
    await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .eq("is_active", true),
      supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId),
      supabase
        .from("nearby_places")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId),
      supabase
        .from("explore_collections")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId),
      // Admin client, not getVenuePageDescription(): that one uses the anon client.
      supabase
        .from("venue_page_descriptions")
        .select("image_url")
        .eq("venue_id", venueId)
        .eq("page_slug", "events")
        .maybeSingle(),
      appOrigin(),
    ]);

  const stats = [
    {
      label: "Active events",
      value: eventsRes.count ?? 0,
      href: "/dashboard/venue/events",
      linkText: "Manage events",
    },
    {
      label: "Services",
      value: servicesRes.count ?? 0,
      href: "/dashboard/venue/services",
      linkText: "Manage services",
    },
    {
      label: "Nearby places",
      value: placesRes.count ?? 0,
      href: "/dashboard/venue/places?type=places",
      linkText: "Manage places",
    },
    {
      label: "Collections",
      value: collectionsRes.count ?? 0,
      href: "/dashboard/venue/explore",
      linkText: "Manage collections",
    },
  ];

  const checklist = buildChecklist({
    coverImageUrl: venue.cover_image_url,
    servicesCount: servicesRes.count ?? 0,
    placesCount: placesRes.count ?? 0,
    collectionsCount: collectionsRes.count ?? 0,
    eventsPageImageUrl:
      (eventsPageRes.data as { image_url: string | null } | null)?.image_url ?? null,
    welcomeBody: venue.welcome_body,
  });
  const allDone = checklist.every((i) => i.done);
  const guestUrl = `${origin}/${venue.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Your venue at a glance.</p>
        </div>
        <Button asChild variant="outline" className="hidden h-10 md:inline-flex">
          <a href={guestUrl} target="_blank" rel="noopener noreferrer">
            View guest site
            <ExternalLink />
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatLink key={stat.label} {...stat} />
        ))}
      </div>

      {allDone ? (
        <GuestLinkCard url={guestUrl} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
          <ChecklistCard items={checklist} />
          <GuestLinkCard url={guestUrl} />
        </div>
      )}

      <Button asChild variant="outline" className="h-11 w-full md:hidden">
        <a href={guestUrl} target="_blank" rel="noopener noreferrer">
          View guest site
          <ExternalLink />
        </a>
      </Button>
    </div>
  );
}
