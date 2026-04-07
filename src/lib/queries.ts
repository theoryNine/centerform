import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NearbyPlace, ExploreCollectionWithItems, CruiseRestaurant, CruiseItineraryItem, CruiseDailyWelcome, CruiseLink, MemberRole, Venue } from "@/types";

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

export async function getNearbyPlaceById(placeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nearby_places")
    .select("*")
    .eq("id", placeId)
    .single();
  return data;
}

export async function getNearbyPlacesByArea(venueId: string, area: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nearby_places")
    .select("*")
    .eq("venue_id", venueId)
    .eq("area", area)
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

export async function getVenueAmenities(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_amenities")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_available", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getVenueAmenitiesByCategory(venueId: string, category: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_amenities")
    .select("*")
    .eq("venue_id", venueId)
    .eq("category", category)
    .eq("is_available", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getVenueInfo(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_info")
    .select("*")
    .eq("venue_id", venueId)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getVenueInfoByCategory(venueId: string, category: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_info")
    .select("*")
    .eq("venue_id", venueId)
    .eq("category", category)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getAllVenueAmenities(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_amenities")
    .select("*")
    .eq("venue_id", venueId)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getAllVenueInfo(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_info")
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

export async function getExploreCollections(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("explore_collections")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getExploreCollectionWithItems(
  collectionId: string,
): Promise<ExploreCollectionWithItems | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("explore_collections")
    .select(`*, explore_collection_items (*, nearby_places (*))`)
    .eq("id", collectionId)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  const items = ((data.explore_collection_items as unknown[]) ?? [])
    .sort((a, b) => {
      const ai = a as Record<string, unknown>;
      const bi = b as Record<string, unknown>;
      return (ai.display_order as number) - (bi.display_order as number);
    })
    .map((i: unknown) => {
      const item = i as Record<string, unknown>;
      const { nearby_places, ...rest } = item;
      return { ...(rest as object), place: nearby_places as NearbyPlace };
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { explore_collection_items: _, ...collection } = data as Record<string, unknown>;
  return { ...(collection as object), items } as unknown as ExploreCollectionWithItems;
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

// ─── Cruise queries ───────────────────────────────────────────────────────────

export async function getCruiseRestaurants(venueId: string): Promise<CruiseRestaurant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cruise_restaurants")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return (data ?? []) as CruiseRestaurant[];
}

export async function getCruiseItineraryItems(venueId: string): Promise<CruiseItineraryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cruise_itinerary_items")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return (data ?? []) as CruiseItineraryItem[];
}


export async function getCruiseRestaurantById(restaurantId: string): Promise<CruiseRestaurant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cruise_restaurants")
    .select("*")
    .eq("id", restaurantId)
    .eq("is_active", true)
    .single();
  return data as CruiseRestaurant | null;
}

export async function getCruiseItineraryItemById(
  itemId: string,
): Promise<CruiseItineraryItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cruise_itinerary_items")
    .select("*")
    .eq("id", itemId)
    .eq("is_active", true)
    .single();
  return data as CruiseItineraryItem | null;
}

export async function getVenuePageDescription(
  venueId: string,
  pageSlug: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venue_page_descriptions")
    .select("body")
    .eq("venue_id", venueId)
    .eq("page_slug", pageSlug)
    .single();
  return data?.body ?? null;
}

export async function getCruiseDailyWelcome(
  venueId: string,
): Promise<CruiseDailyWelcome | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("cruise_daily_welcome")
    .select("*")
    .eq("venue_id", venueId)
    .lte("effective_at", now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("effective_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as CruiseDailyWelcome | null;
}

export async function getCruiseLinks(venueId: string): Promise<CruiseLink[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cruise_links")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return (data ?? []) as CruiseLink[];
}

export async function getCruiseNavImage(venueId: string, navKey: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cruise_nav_images")
    .select("image_url")
    .eq("venue_id", venueId)
    .eq("nav_key", navKey)
    .maybeSingle();
  return data?.image_url ?? null;
}

// ─── Dashboard / admin queries ─────────────────────────────────────────────────

// Returns all venues the given user is a member of, ordered by when they joined.
// Uses the admin client so it works regardless of whether Supabase Auth is active.
export async function getVenuesForUser(
  userId: string,
): Promise<Array<{ role: MemberRole; venue: Venue }>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_members")
    .select("role, venues(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    role: row.role as MemberRole,
    venue: row.venues as unknown as Venue,
  }));
}

// Returns the user's role for a specific venue, or null if they have no membership.
export async function getVenueMemberRole(
  userId: string,
  venueId: string,
): Promise<MemberRole | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_members")
    .select("role")
    .eq("user_id", userId)
    .eq("venue_id", venueId)
    .maybeSingle();
  return (data?.role as MemberRole) ?? null;
}

// Returns all explore collections for a venue regardless of is_active (for dashboard listing).
export async function getAllExploreCollections(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("explore_collections")
    .select("*")
    .eq("venue_id", venueId)
    .order("display_order", { ascending: true });
  return data ?? [];
}

// Returns all nearby places for a venue regardless of is_active (for dashboard listing).
export async function getAllNearbyPlaces(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nearby_places")
    .select("*")
    .eq("venue_id", venueId)
    .order("display_order", { ascending: true });
  return data ?? [];
}
