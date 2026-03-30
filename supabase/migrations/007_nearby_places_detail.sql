-- Add detail fields to nearby_places for individual listing pages
ALTER TABLE nearby_places
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS hours text,
  ADD COLUMN IF NOT EXISTS tips text[],
  ADD COLUMN IF NOT EXISTS cta_label text;
