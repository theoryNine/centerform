-- Venue Amenities & Info Schema
-- Allows venues to manage structured amenities and key-value hotel info
-- from the dashboard.

-------------------------------------------------------
-- AMENITY CATEGORIES
-------------------------------------------------------
create type amenity_category as enum (
  'general',
  'room',
  'bathroom',
  'kitchen',
  'dining',
  'recreation',
  'business',
  'wellness',
  'parking',
  'accessibility',
  'family',
  'safety',
  'outdoor'
);

-------------------------------------------------------
-- INFO CATEGORIES
-------------------------------------------------------
create type info_category as enum (
  'general',
  'policies',
  'hours',
  'payments'
);

-------------------------------------------------------
-- VENUE AMENITIES
-------------------------------------------------------
create table venue_amenities (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  category amenity_category not null,
  name text not null,
  description text,
  icon text,
  is_available boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(venue_id, category, name)
);

create index idx_venue_amenities_venue on venue_amenities(venue_id);
create index idx_venue_amenities_category on venue_amenities(venue_id, category);

-------------------------------------------------------
-- VENUE INFO (key-value pairs)
-------------------------------------------------------
create table venue_info (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  category info_category not null,
  key text not null,
  value text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(venue_id, key)
);

create index idx_venue_info_venue on venue_info(venue_id);

-------------------------------------------------------
-- ROW LEVEL SECURITY
-------------------------------------------------------

-- Venue amenities: publicly readable, writable by venue members
alter table venue_amenities enable row level security;

create policy "Venue amenities are publicly readable"
  on venue_amenities for select
  using (true);

create policy "Venue members can manage amenities"
  on venue_amenities for all
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role in ('owner', 'admin', 'staff')
    )
  );

-- Venue info: publicly readable, writable by venue members
alter table venue_info enable row level security;

create policy "Venue info is publicly readable"
  on venue_info for select
  using (true);

create policy "Venue members can manage info"
  on venue_info for all
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role in ('owner', 'admin', 'staff')
    )
  );

-------------------------------------------------------
-- UPDATED_AT TRIGGERS
-------------------------------------------------------
create trigger venue_amenities_updated_at before update on venue_amenities
  for each row execute function update_updated_at();

create trigger venue_info_updated_at before update on venue_info
  for each row execute function update_updated_at();

-------------------------------------------------------
-- SAMPLE DATA: The Ballard Inn
-------------------------------------------------------

-- Amenities: General
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Free WiFi', 'wifi', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Air Conditioning', 'snowflake', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Heating', 'flame', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Elevator', 'arrow-up-down', 4),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Non-Smoking Property', 'ban', 5),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Daily Housekeeping', 'sparkles', 6),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Luggage Storage', 'briefcase', 7),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Concierge Service', 'bell', 8),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'Laundry Service', 'shirt', 9);

-- Amenities: Room
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'Smart TV', 'tv', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'Chromecast', 'cast', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'Nespresso Machine', 'coffee', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'In-Room Safe', 'lock', 4),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'Iron & Ironing Board', 'shirt', 5),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'Blackout Curtains', 'moon', 6),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'USB Charging Ports', 'plug', 7),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'Extra Pillows & Blankets', 'bed', 8),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'room', 'Work Desk', 'lamp-desk', 9);

-- Amenities: Bathroom
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'bathroom', 'Premium Toiletries', 'droplets', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'bathroom', 'Plush Robes', 'shirt', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'bathroom', 'Slippers', 'footprints', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'bathroom', 'Hair Dryer', 'wind', 4),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'bathroom', 'Rainfall Shower', 'shower-head', 5),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'bathroom', 'Magnifying Mirror', 'search', 6);

-- Amenities: Dining
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'dining', 'Complimentary Breakfast', 'egg-fried', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'dining', 'Evening Wine & Cheese', 'wine', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'dining', 'Lobby Coffee Bar', 'coffee', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'dining', 'Room Service', 'utensils', 4);

-- Amenities: Recreation
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'recreation', 'Complimentary Bikes', 'bike', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'recreation', 'Board Games Library', 'dice-5', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'recreation', 'Book Exchange', 'book-open', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'recreation', 'Garden Courtyard', 'flower-2', 4);

-- Amenities: Wellness
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'wellness', 'Yoga Mats Available', 'heart-pulse', 1);

-- Amenities: Parking
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'parking', 'Free Street Parking', 'car', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'parking', 'Guest Lot (First Come)', 'parking-circle', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'parking', 'Bike Rack', 'bike', 3);

-- Amenities: Accessibility
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'accessibility', 'Wheelchair Accessible', 'accessibility', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'accessibility', 'ADA-Compliant Rooms', 'door-open', 2);

-- Amenities: Family
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'family', 'Cribs Available', 'baby', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'family', 'Rollaway Beds', 'bed', 2);

-- Amenities: Safety
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'safety', 'Smoke Detectors', 'siren', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'safety', 'Fire Extinguishers', 'flame', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'safety', 'First Aid Kit', 'cross', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'safety', '24-Hour Front Desk', 'clock', 4);

-- Amenities: Outdoor
INSERT INTO venue_amenities (venue_id, category, name, icon, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'outdoor', 'Patio Seating', 'armchair', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'outdoor', 'Garden', 'flower-2', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'outdoor', 'Fire Pit', 'flame', 3);

-- Venue Info
INSERT INTO venue_info (venue_id, category, key, value, display_order) VALUES
  ('b1a2c3d4-0000-4000-a000-000000000001', 'hours', 'check_in_time', '3:00 PM', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'hours', 'check_out_time', '11:00 AM', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'hours', 'front_desk_hours', '24 hours', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'hours', 'breakfast_hours', '7:00 AM – 10:00 AM', 4),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'hours', 'lobby_coffee', '6:00 AM – 10:00 AM', 5),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'hours', 'wine_hour', '5:00 PM – 6:00 PM', 6),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'policies', 'cancellation_policy', 'Free cancellation up to 48 hours before check-in. After that, one night charge applies.', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'policies', 'pet_policy', 'Dogs welcome (under 50 lbs). $50/night pet fee. Max 2 pets per room.', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'policies', 'smoking_policy', 'Non-smoking property. Designated smoking area in the rear courtyard.', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'policies', 'late_checkout', 'Subject to availability. Complimentary until 1:00 PM; half-day rate after.', 4),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'policies', 'minimum_age', 'Guests must be 21+ to book. Valid ID required at check-in.', 5),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'star_rating', '4', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'year_built', '1928', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'year_renovated', '2022', 3),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'total_rooms', '28', 4),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'general', 'floors', '3', 5),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'payments', 'accepted_cards', 'Visa, Mastercard, Amex, Discover', 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'payments', 'deposit_required', 'Credit card hold at check-in ($100 incidentals)', 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'payments', 'currency', 'USD', 3);
