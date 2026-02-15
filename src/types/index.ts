export type VenueType = "hotel" | "resort" | "museum" | "event_space" | "other";
export type MemberRole = "owner" | "admin" | "staff";
export type ServiceCategory = "room_service" | "spa" | "concierge" | "dining" | "transportation" | "activities" | "other";
export type PlaceCategory = "restaurant" | "bar" | "cafe" | "attraction" | "shopping" | "entertainment" | "outdoors" | "other";

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

export interface Service {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
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
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VenueWithTheme extends Venue {
  venue_themes: VenueTheme | null;
}
