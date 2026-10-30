-- Migration: Cruise ship updates
-- 011_cruise_updates.sql

-- ─── New service categories for cruise ship info sections ────────────────────

ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'welcome_aboard';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'ship_amenities';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'ship_entertainment';

-- ─── Add restaurant_type to cruise_restaurants ───────────────────────────────
-- "sit_down" | "walk_up"

ALTER TABLE cruise_restaurants
  ADD COLUMN IF NOT EXISTS restaurant_type TEXT NOT NULL DEFAULT 'sit_down'
    CHECK (restaurant_type IN ('sit_down', 'walk_up'));

-- ─── Add optional restaurant link to itinerary items ────────────────────────

ALTER TABLE cruise_itinerary_items
  ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES cruise_restaurants(id) ON DELETE SET NULL;

-- ─── Cruise links table (external URLs on the homepage) ──────────────────────

CREATE TABLE IF NOT EXISTS cruise_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cruise_links_venue_id_idx ON cruise_links(venue_id);

CREATE TRIGGER set_cruise_links_updated_at
  BEFORE UPDATE ON cruise_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE cruise_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active cruise links"
  ON cruise_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Venue members can manage cruise links"
  ON cruise_links FOR ALL
  USING (
    venue_id IN (
      SELECT venue_id FROM venue_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
