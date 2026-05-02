-- Add per-page hero image to venue_page_descriptions.
-- image_url is nullable; pages fall back to venues.cover_image_url when null.
ALTER TABLE venue_page_descriptions ADD COLUMN IF NOT EXISTS image_url TEXT;
