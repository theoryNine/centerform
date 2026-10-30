-- Composite indexes for common dashboard listing queries.
-- Dashboard views filter by venue_id and sort by display_order or category,
-- which benefits from covering indexes beyond the existing single-column ones.

-- Services: filter by venue + active flag, sort by display_order
create index if not exists idx_services_venue_active_order
  on services(venue_id, is_active, display_order);

-- Nearby places: filter by venue, sort by display_order (no is_active filter on this table)
create index if not exists idx_nearby_places_venue_order
  on nearby_places(venue_id, display_order);

-- Venue amenities: filter by venue + category, sort by display_order
create index if not exists idx_amenities_venue_category_order
  on venue_amenities(venue_id, category, display_order);

-- Explore collections: filter by venue + active flag, sort by display_order
create index if not exists idx_explore_collections_venue_active_order
  on explore_collections(venue_id, is_active, display_order);

-- Cruise restaurants: filter by venue + active flag, sort by display_order
create index if not exists idx_cruise_restaurants_venue_active_order
  on cruise_restaurants(venue_id, is_active, display_order);

-- Cruise itinerary items: filter by venue + active flag, sort by display_order
create index if not exists idx_cruise_itinerary_venue_active_order
  on cruise_itinerary_items(venue_id, is_active, display_order);

-- Cruise crew: filter by venue + active flag, sort by display_order
create index if not exists idx_cruise_crew_venue_active_order
  on cruise_crew(venue_id, is_active, display_order);
