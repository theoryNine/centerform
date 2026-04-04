-- Migration: Optional flavor text for L1 venue pages
-- 016_venue_page_descriptions.sql

CREATE TABLE IF NOT EXISTS venue_page_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  page_slug TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (venue_id, page_slug)
);

CREATE INDEX IF NOT EXISTS venue_page_descriptions_venue_id_idx
  ON venue_page_descriptions(venue_id);

CREATE TRIGGER set_venue_page_descriptions_updated_at
  BEFORE UPDATE ON venue_page_descriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE venue_page_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view venue page descriptions"
  ON venue_page_descriptions FOR SELECT
  USING (true);

CREATE POLICY "Venue members can manage venue page descriptions"
  ON venue_page_descriptions FOR ALL
  USING (
    venue_id IN (
      SELECT venue_id FROM venue_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ─── Sample data: Ansel & Adam's Anniversary Cruise ──────────────────────────

INSERT INTO venue_page_descriptions (venue_id, page_slug, body) VALUES
  (
    'c2b3d4e5-0000-4000-a000-000000000001',
    'food-onboard',
    'From casual bites poolside to a full sit-down dinner — Resilient Lady has something for every mood. Reservations for sit-down restaurants can be made through the Virgin Voyages app.'
  ),
  (
    'c2b3d4e5-0000-4000-a000-000000000001',
    'ship-info',
    'Everything you need to know about life onboard Resilient Lady — from getting settled in your cabin to finding your favorite spots on the ship.'
  ),
  (
    'c2b3d4e5-0000-4000-a000-000000000001',
    'group-plan',
    'Our day-by-day itinerary for the voyage. Port days are yours to explore — just don''t miss the All Aboard time.'
  ),
  (
    'c2b3d4e5-0000-4000-a000-000000000001',
    'the-crew',
    'The people who made this trip happen. Say hi when you see them around the ship.'
  );
