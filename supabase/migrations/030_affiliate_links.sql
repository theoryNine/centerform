-- Add booking_url to nearby_places and events for affiliate link tracking
ALTER TABLE nearby_places ADD COLUMN IF NOT EXISTS booking_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS booking_url text;

-- Click tracking table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('place', 'event')),
  entity_id uuid NOT NULL,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_entity_idx ON affiliate_clicks (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS affiliate_clicks_venue_idx ON affiliate_clicks (venue_id, clicked_at DESC);

-- Test data: fake booking links for Ballard Inn listings
UPDATE nearby_places SET booking_url = 'https://resy.com/cities/sea/lucianos-trattoria'
  WHERE id = 'b1a2c3d4-0000-4000-a000-000000000106';

UPDATE nearby_places SET booking_url = 'https://www.exploretock.com/theamberdoor'
  WHERE id = 'b1a2c3d4-0000-4000-a000-000000000107';
