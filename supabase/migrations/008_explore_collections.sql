-- Curated explore collections (e.g. "Date Night", "A Walk Through Ballard")
CREATE TABLE explore_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  description text,
  layout text NOT NULL DEFAULT 'cards', -- 'cards' | 'timeline'
  area text, -- optional: associates with an explore area section
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Items within a collection, each pointing to a nearby_place
CREATE TABLE explore_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES explore_collections(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES nearby_places(id) ON DELETE CASCADE,
  display_order int NOT NULL DEFAULT 0,
  time_label text,      -- e.g. "10am", "12:30pm" (timeline variant)
  is_start boolean NOT NULL DEFAULT false,  -- renders START terminal marker
  is_end boolean NOT NULL DEFAULT false,    -- renders END terminal marker
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_explore_collections_venue ON explore_collections(venue_id);
CREATE INDEX idx_explore_collection_items_collection ON explore_collection_items(collection_id);

ALTER TABLE explore_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE explore_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active collections"
  ON explore_collections FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read collection items"
  ON explore_collection_items FOR SELECT USING (true);

CREATE TRIGGER explore_collections_updated_at
  BEFORE UPDATE ON explore_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
