-- Add heading font column to venue_themes
ALTER TABLE venue_themes ADD COLUMN IF NOT EXISTS heading_font_family text;
