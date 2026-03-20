import { createClient } from "@/lib/supabase/server";

export async function getVenueBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getVenueEvents(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("start_time", { ascending: true });
  return data ?? [];
}

export async function getVenueServices(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getNearbyPlaces(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nearby_places")
    .select("*")
    .eq("venue_id", venueId)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getEventScheduleItems(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_schedule_items")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .order("start_time", { ascending: true });
  return data ?? [];
}

export async function getStandaloneEventBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("standalone_events")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getAllVenueEvents(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("venue_id", venueId)
    .order("start_time", { ascending: true });
  return data ?? [];
}

export async function getAllVenueServices(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("venue_id", venueId)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getAllStandaloneEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("standalone_events")
    .select("*")
    .order("start_date", { ascending: true });
  return data ?? [];
}

export async function getAllEventScheduleItems(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_schedule_items")
    .select("*")
    .eq("event_id", eventId)
    .order("start_time", { ascending: true });
  return data ?? [];
}
