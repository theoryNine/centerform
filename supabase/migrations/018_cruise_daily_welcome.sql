-- cruise_daily_welcome: time-scheduled welcome card content for cruise venues.
-- Rows become active when effective_at <= NOW(). The query always returns the
-- most recent past entry, so you can pre-load multiple entries per day (e.g.
-- morning, evening) and they will switch automatically at the scheduled time.
-- Falls back to venues.welcome_heading / welcome_body when no row is found.

CREATE TABLE cruise_daily_welcome (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id      UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  effective_at  TIMESTAMPTZ NOT NULL,
  heading       TEXT NOT NULL,
  body          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cruise_daily_welcome_venue_time_idx
  ON cruise_daily_welcome (venue_id, effective_at DESC);

-- updated_at trigger (reuse the existing trigger function)
CREATE TRIGGER set_cruise_daily_welcome_updated_at
  BEFORE UPDATE ON cruise_daily_welcome
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: public read, write restricted to authenticated venue members
ALTER TABLE cruise_daily_welcome ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read cruise_daily_welcome"
  ON cruise_daily_welcome FOR SELECT
  USING (true);

CREATE POLICY "Venue members can manage cruise_daily_welcome"
  ON cruise_daily_welcome FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venue_members
      WHERE venue_members.venue_id = cruise_daily_welcome.venue_id
        AND venue_members.user_id = auth.uid()
    )
  );
