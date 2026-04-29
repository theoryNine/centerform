import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ServicesClient } from "./services-client";
import type { Service } from "@/types";

export default async function ManageServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("venue_id", active.venue.id)
    .not("category", "in", '("welcome_aboard","ship_amenities","ship_bars","ship_entertainment")')
    .order("display_order", { ascending: true });

  return <ServicesClient services={(data as Service[]) ?? []} venueId={active.venue.id} />;
}
