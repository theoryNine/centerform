-- Seed nav tile sublabels for Ansel & Adam's Anniversary cruise
-- Upserts so this is safe to re-run alongside existing image rows

insert into cruise_nav_images (venue_id, nav_key, image_url, sublabel)
values
  ('c2b3d4e5-0000-4000-a000-000000000001', 'ship-info',     '', 'Your floating home for the week.'),
  ('c2b3d4e5-0000-4000-a000-000000000001', 'food-onboard',  '', '20+ eateries and 0 bad options.'),
  ('c2b3d4e5-0000-4000-a000-000000000001', 'group-plan',    '', 'Our daily itinerary, loosely speaking.'),
  ('c2b3d4e5-0000-4000-a000-000000000001', 'the-crew',      '', 'Meet your group.')
on conflict (venue_id, nav_key) do update
  set sublabel = excluded.sublabel,
      updated_at = now();

-- Seed nav tile sublabels for The Ballard Inn

insert into venue_nav_tiles (venue_id, nav_key, sublabel)
values
  ('b1a2c3d4-0000-4000-a000-000000000001', 'services', 'Amenities, services, and requests.'),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'dining',   'At The Ballard Inn.'),
  ('b1a2c3d4-0000-4000-a000-000000000001', 'explore',  'Let us show you around town.')
on conflict (venue_id, nav_key) do update
  set sublabel = excluded.sublabel,
      updated_at = now();
