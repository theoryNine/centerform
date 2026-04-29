import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const venueId = active.venue.id;
  const supabase = createAdminClient();

  const [eventsRes, servicesRes, placesRes, collectionsRes] = await Promise.all([
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
  ]);

  const stats = [
    {
      label: "Active Events",
      value: eventsRes.count ?? 0,
      sub: "Venue-hosted events",
    },
    {
      label: "Services",
      value: servicesRes.count ?? 0,
      sub: "Guest service items",
    },
    {
      label: "Nearby Places",
      value: placesRes.count ?? 0,
      sub: "Recommendations",
    },
    {
      label: "Collections",
      value: collectionsRes.count ?? 0,
      sub: "Explore curations",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Your venue at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            Activity tracking coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
