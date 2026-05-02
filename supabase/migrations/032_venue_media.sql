-- Media library: tracks all images uploaded by a venue for reuse across entities.
CREATE TABLE IF NOT EXISTS venue_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_venue_media_venue_id ON venue_media(venue_id, created_at DESC);

ALTER TABLE venue_media ENABLE ROW LEVEL SECURITY;
