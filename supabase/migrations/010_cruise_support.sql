-- Migration: Add cruise ship venue type and related tables
-- 010_cruise_support.sql

-- ─── updated_at trigger function (idempotent) ────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Extend venue_type enum ──────────────────────────────────────────────────

ALTER TYPE venue_type ADD VALUE IF NOT EXISTS 'cruise';

-- ─── Cruise restaurants (dining venues onboard the ship) ────────────────────

CREATE TABLE IF NOT EXISTS cruise_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT,
  deck TEXT,
  hours TEXT,
  image_url TEXT,
  phone TEXT,
  website TEXT,
  price_level INTEGER CHECK (price_level BETWEEN 0 AND 4),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cruise_restaurants_venue_id_idx ON cruise_restaurants(venue_id);

CREATE TRIGGER set_cruise_restaurants_updated_at
  BEFORE UPDATE ON cruise_restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Cruise itinerary items (group plan timeline) ────────────────────────────

CREATE TABLE IF NOT EXISTS cruise_itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  time_label TEXT,
  image_url TEXT,
  is_start BOOLEAN NOT NULL DEFAULT false,
  is_end BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cruise_itinerary_items_venue_id_idx ON cruise_itinerary_items(venue_id);

CREATE TRIGGER set_cruise_itinerary_items_updated_at
  BEFORE UPDATE ON cruise_itinerary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Cruise crew members ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cruise_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cruise_crew_venue_id_idx ON cruise_crew(venue_id);

CREATE TRIGGER set_cruise_crew_updated_at
  BEFORE UPDATE ON cruise_crew
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS policies ────────────────────────────────────────────────────────────

ALTER TABLE cruise_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cruise_crew ENABLE ROW LEVEL SECURITY;

-- Public read access for active records
CREATE POLICY "Public can view active cruise restaurants"
  ON cruise_restaurants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active cruise itinerary items"
  ON cruise_itinerary_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active cruise crew"
  ON cruise_crew FOR SELECT
  USING (is_active = true);

-- Venue members (owner/admin) can manage cruise data
CREATE POLICY "Venue members can manage cruise restaurants"
  ON cruise_restaurants FOR ALL
  USING (
    venue_id IN (
      SELECT venue_id FROM venue_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Venue members can manage cruise itinerary items"
  ON cruise_itinerary_items FOR ALL
  USING (
    venue_id IN (
      SELECT venue_id FROM venue_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Venue members can manage cruise crew"
  ON cruise_crew FOR ALL
  USING (
    venue_id IN (
      SELECT venue_id FROM venue_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
