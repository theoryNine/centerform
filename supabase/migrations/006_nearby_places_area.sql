-- Add area/neighborhood grouping to nearby_places for the Explore page.
-- Areas let venues organize recommendations by geography
-- (e.g. "In Ballard", "In Seattle", "Beyond Seattle").

alter table nearby_places
  add column area text,
  add column area_display_order int not null default 0;

comment on column nearby_places.area is 'Geographic grouping label (e.g. "Ballard", "Seattle", "Beyond Seattle")';
comment on column nearby_places.area_display_order is 'Sort order for area sections on the Explore page';

-- Sample nearby places for The Ballard Inn
insert into nearby_places (venue_id, name, description, category, area, area_display_order, image_url, is_featured, display_order) values
  -- In Ballard
  ('b1a2c3d4-0000-4000-a000-000000000001', 'A Walk Through Ballard', 'Neighborhood stroll through our favorite stops', 'attraction', 'Ballard', 1, null, true, 1),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Best Meal Near You', 'Our top tables within walking distance', 'restaurant', 'Ballard', 1, null, false, 2),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Coffee & Morning Ritual', 'Start the day right, Ballard style', 'cafe', 'Ballard', 1, null, false, 3),
  -- In Seattle
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Date Night', 'Seattle''s most romantic evenings', 'restaurant', 'Seattle', 2, null, false, 4),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Happy Hour & Nightlife', 'Where locals go after dark', 'bar', 'Seattle', 2, null, false, 5),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Arts & Culture', 'Museums, galleries & shows', 'attraction', 'Seattle', 2, null, false, 6),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Rainy Day Indoors', 'Seattle''s best when it pours', 'entertainment', 'Seattle', 2, null, false, 7),
  -- Beyond Seattle
  ('b1a2c3d4-0000-4000-a000-000000000001', 'A Day Beyond the City', 'Islands, mountains, wine country & more', 'outdoors', 'Beyond Seattle', 3, null, true, 8),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Island Hopping', 'Ferries, fresh air & small-town charm', 'outdoors', 'Beyond Seattle', 3, null, false, 9),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'Wine Country', 'Woodinville is closer than you think', 'attraction', 'Beyond Seattle', 3, null, false, 10);
