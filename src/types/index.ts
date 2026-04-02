export type VenueType = "hotel" | "resort" | "museum" | "event_space" | "cruise" | "other";
export type MemberRole = "owner" | "admin" | "staff";
export type ServiceCategory = "room_service" | "spa" | "concierge" | "dining" | "transportation" | "activities" | "other" | "welcome_aboard" | "ship_amenities" | "ship_entertainment";
export type PlaceCategory = "restaurant" | "bar" | "cafe" | "attraction" | "shopping" | "entertainment" | "outdoors" | "other";
export type AmenityCategory = "general" | "room" | "bathroom" | "kitchen" | "dining" | "recreation" | "business" | "wellness" | "parking" | "accessibility" | "family" | "safety" | "outdoor";
export type InfoCategory = "general" | "policies" | "hours" | "payments";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  venue_type: VenueType;
  welcome_heading: string | null;
  welcome_body: string | null;
  phone_label: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueTheme {
  id: string;
  venue_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  font_family: string | null;
  border_radius: string | null;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}

export interface VenueMember {
  id: string;
  venue_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export type ServiceDetailsBlock =
  | { type: "kv"; rows: { label: string; value: string; copy?: boolean }[] }
  | { type: "bullets"; items: string[] }
  | { type: "phone"; label: string; value: string }
  | { type: "text"; content: string };

export type ServiceDetails = ServiceDetailsBlock | ServiceDetailsBlock[];

export interface Service {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  details: ServiceDetails | null;
  category: ServiceCategory;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueEvent {
  id: string;
  venue_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NearbyPlace {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  category: PlaceCategory;
  address: string | null;
  distance: string | null;
  rating: number | null;
  price_level: number | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  area: string | null;
  area_display_order: number;
  is_featured: boolean;
  display_order: number;
  tagline: string | null;
  hours: string | null;
  tips: string[] | null;
  cta_label: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VenueAmenity {
  id: string;
  venue_id: string;
  category: AmenityCategory;
  name: string;
  description: string | null;
  icon: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VenueInfo {
  id: string;
  venue_id: string;
  category: InfoCategory;
  key: string;
  value: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VenueWithTheme extends Venue {
  venue_themes: VenueTheme | null;
}

// --- Standalone Events ---

export type EventType = "conference" | "concert" | "festival" | "wedding" | "gala" | "other";

export interface StandaloneEvent {
  id: string;
  venue_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  event_type: EventType;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StandaloneEventTheme {
  id: string;
  event_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  font_family: string | null;
  border_radius: string | null;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}

export interface StandaloneEventMember {
  id: string;
  event_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface EventScheduleItem {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  speaker: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StandaloneEventWithTheme extends StandaloneEvent {
  standalone_event_themes: StandaloneEventTheme | null;
}

// --- Explore Collections ---

export type CollectionLayout = "cards" | "timeline";

export interface ExploreCollection {
  id: string;
  venue_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  layout: CollectionLayout;
  area: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExploreCollectionItem {
  id: string;
  collection_id: string;
  place_id: string;
  display_order: number;
  time_label: string | null;
  is_start: boolean;
  is_end: boolean;
  created_at: string;
}

export interface CollectionItemWithPlace extends ExploreCollectionItem {
  place: NearbyPlace;
}

export interface ExploreCollectionWithItems extends ExploreCollection {
  items: CollectionItemWithPlace[];
}

// --- Cruise Ship ---

export type CruiseRestaurantType = "sit_down" | "walk_up";

export interface CruiseRestaurant {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  deck: string | null;
  hours: string | null;
  image_url: string | null;
  phone: string | null;
  website: string | null;
  price_level: number | null;
  restaurant_type: CruiseRestaurantType;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CruiseItineraryItem {
  id: string;
  venue_id: string;
  title: string;
  description: string | null;
  location: string | null;
  time_label: string | null;
  image_url: string | null;
  restaurant_id: string | null;
  is_start: boolean;
  is_end: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CruiseLink {
  id: string;
  venue_id: string;
  label: string;
  url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CruiseCrewMember {
  id: string;
  venue_id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Shared types ---

export interface ThemeColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  font_family: string | null;
  border_radius: string | null;
  custom_css: string | null;
}

export type SlugResolution =
  | { type: "venue"; data: VenueWithTheme }
  | { type: "event"; data: StandaloneEventWithTheme };
