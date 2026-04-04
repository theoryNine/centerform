-- Add splash_variant to venues so each venue can choose its welcome splash style.
-- 'oversized' = large image bleeding off screen edges (default for cruise)
-- 'text'      = in-flow image with card below (default for hotel/resort)

ALTER TABLE venues
  ADD COLUMN splash_variant text NOT NULL DEFAULT 'oversized';

-- Set existing hotel/resort/etc venues to 'text' — cruise stays 'oversized'
UPDATE venues
  SET splash_variant = 'text'
  WHERE venue_type != 'cruise';
