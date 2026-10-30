-- Add expires_at to cruise_daily_welcome so entries have a bounded active window.
-- Query pattern: effective_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())
-- NULL expires_at means "never expires" — useful for entries with no planned successor.

ALTER TABLE cruise_daily_welcome
  ADD COLUMN expires_at TIMESTAMPTZ NULL;

CREATE INDEX cruise_daily_welcome_expires_idx
  ON cruise_daily_welcome (venue_id, effective_at DESC, expires_at);

-- Patch the Ansel & Adam sample entries so each expires when the next one begins,
-- and the final entry expires at end of disembarkation day.
UPDATE cruise_daily_welcome SET expires_at = '2025-11-12 13:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-11 18:00:00+00';

UPDATE cruise_daily_welcome SET expires_at = '2025-11-13 13:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-12 13:00:00+00';

UPDATE cruise_daily_welcome SET expires_at = '2025-11-14 13:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-13 13:00:00+00';

UPDATE cruise_daily_welcome SET expires_at = '2025-11-15 13:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-14 13:00:00+00';

UPDATE cruise_daily_welcome SET expires_at = '2025-11-15 23:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-15 13:00:00+00';

UPDATE cruise_daily_welcome SET expires_at = '2025-11-16 13:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-15 23:00:00+00';

UPDATE cruise_daily_welcome SET expires_at = '2025-11-17 13:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-16 13:00:00+00';

UPDATE cruise_daily_welcome SET expires_at = '2025-11-18 12:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-17 13:00:00+00';

-- Final entry expires end of disembarkation day (midnight ET = 05:00 UTC Nov 19)
UPDATE cruise_daily_welcome SET expires_at = '2025-11-19 05:00:00+00'
  WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001' AND effective_at = '2025-11-18 12:00:00+00';
