-- Add color_scheme to venue_themes and standalone_event_themes
-- Allows venues/events to override the user's OS dark/light preference.
-- 'system' = follow OS (default behavior), 'light' = always light, 'dark' = always dark.

ALTER TABLE venue_themes
  ADD COLUMN color_scheme TEXT NOT NULL DEFAULT 'system'
  CONSTRAINT venue_themes_color_scheme_check CHECK (color_scheme IN ('system', 'light', 'dark'));

ALTER TABLE standalone_event_themes
  ADD COLUMN color_scheme TEXT NOT NULL DEFAULT 'system'
  CONSTRAINT standalone_event_themes_color_scheme_check CHECK (color_scheme IN ('system', 'light', 'dark'));
