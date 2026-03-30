-- Sample data: Explore collections for The Ballard Inn
-- Adds real place records, two collections, and wires up the explore cards.

-------------------------------------------------------
-- SCHEMA: add collection_id to nearby_places
-- Lets an explore card link to a collection instead of a place listing.
-------------------------------------------------------
ALTER TABLE nearby_places
  ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES explore_collections(id) ON DELETE SET NULL;

-------------------------------------------------------
-- REAL PLACES: "A Walk Through Ballard" stops
-------------------------------------------------------
INSERT INTO nearby_places
  (id, venue_id, name, description, category, area, area_display_order,
   address, phone, hours, price_level, tagline, display_order)
VALUES
  (
    'b1a2c3d4-0000-4000-a000-000000000101',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'The Sunday Farmers Market',
    'The mushroom guy and the oyster stand. Go early — the good stuff sells out by 10am.',
    'outdoors', 'Ballard', 1,
    'Ballard Ave NW & Vernon Pl NW, Seattle, WA',
    null,
    'Sundays 9am – 2pm',
    0,
    'Outdoor Market',
    1
  ),
  (
    'b1a2c3d4-0000-4000-a000-000000000102',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'Prism Glass',
    'Watch glassblowers work through the window. One of Ballard''s best-kept secrets — always something happening on weekends.',
    'attraction', 'Ballard', 1,
    '4305 Ballard Ave NW, Seattle, WA 98107',
    '(206) 789-1234',
    'Wed–Sun 10am – 6pm',
    null,
    'Glassblowing Studio',
    2
  ),
  (
    'b1a2c3d4-0000-4000-a000-000000000103',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'Café Besalu',
    'The almond croissant. That''s it. Go for that. Everything else is great too, but the almond croissant is the reason people line up before they open.',
    'cafe', 'Ballard', 1,
    '5909 24th Ave NW, Seattle, WA 98107',
    '(206) 789-1463',
    'Wed–Sun 7am – 3pm',
    1,
    'French Bakery',
    3
  ),
  (
    'b1a2c3d4-0000-4000-a000-000000000104',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'Ballard Avenue',
    'Vintage shops, murals, best people-watching in the neighborhood. Walk the whole stretch — it''s only a few blocks but there''s a lot to find.',
    'shopping', 'Ballard', 1,
    'Ballard Ave NW, Seattle, WA 98107',
    null,
    'Open daily',
    null,
    'Historic Strip',
    4
  ),
  (
    'b1a2c3d4-0000-4000-a000-000000000105',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'Golden Gardens Park',
    'Fire pits, sunsets, the Olympics across the water. Get here before dusk — the light off the Sound is something else. Bring layers.',
    'outdoors', 'Ballard', 1,
    '8498 Seaview Pl NW, Seattle, WA 98117',
    null,
    'Open daily, dawn to dusk',
    0,
    'Beach Park',
    5
  );

-------------------------------------------------------
-- REAL PLACES: "Date Night" spots
-------------------------------------------------------
INSERT INTO nearby_places
  (id, venue_id, name, description, category, area, area_display_order,
   address, phone, hours, price_level, tagline, tips, cta_label, display_order)
VALUES
  (
    'b1a2c3d4-0000-4000-a000-000000000106',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'Luciano''s Trattoria',
    'The corner booth here is the most romantic table in Ballard. Skip the menu — ask what''s fresh tonight. The pastas rotate nightly; they charge almost nothing for corkage. Ask for Marco when you arrive — he''ll take care of you.',
    'restaurant', 'Ballard', 1,
    '2847 Ballard Ave NW, Seattle, WA 98107',
    '(206) 555-0187',
    'Tue–Sun 5pm – 10pm',
    2,
    'Italian · Ballard',
    ARRAY[
      'Reservations recommended, especially weekends',
      'No parties larger than 4 — try Stoneburner for bigger groups',
      'Street parking on Ballard Ave or paid lot on 22nd'
    ],
    'Reserve a Table',
    6
  ),
  (
    'b1a2c3d4-0000-4000-a000-000000000107',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'The Amber Door',
    'No menu. Tell the bartender what you''re in the mood for. The heated back patio is the move — ask for it even if they don''t offer. Best cocktail program in Ballard, and it''s not close.',
    'bar', 'Ballard', 1,
    '5411 Ballard Ave NW, Seattle, WA 98107',
    '(206) 555-0244',
    'Mon–Sat 4pm – 2am',
    3,
    'Cocktails · Ballard',
    ARRAY[
      'Walk-ins only — no reservations',
      'Ask for the back patio, even in winter (it''s heated)',
      'The staff picks change weekly — ask what they''re excited about'
    ],
    'Reserve a Spot',
    7
  ),
  (
    'b1a2c3d4-0000-4000-a000-000000000108',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'Sunset Walk at Golden Gardens',
    'Head north along the water at golden hour. Grab takeout from Señor Moose on the way — the carnitas and a margarita travel well. The fire pits are first-come, first-served.',
    'outdoors', 'Ballard', 1,
    '8498 Seaview Pl NW, Seattle, WA 98117',
    null,
    'Open daily, dawn to dusk',
    0,
    'Beach · 1.2 mi',
    ARRAY[
      'Golden hour is best May–September, roughly 8–9pm',
      'Fire pit wood is $5 from the Parks truck on weekends',
      'Señor Moose is at 5603 Leary Ave NW — get there early'
    ],
    'Get Directions',
    8
  );

-------------------------------------------------------
-- COLLECTIONS
-------------------------------------------------------
INSERT INTO explore_collections
  (id, venue_id, title, subtitle, description, layout, area, display_order)
VALUES
  (
    'b1a2c3d4-0000-4000-a000-000000000201',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'A Walk Through Ballard',
    'Our favorite neighborhood stroll, stop by stop.',
    'Ballard used to be its own city — a Scandinavian fishing village with its own mayor. You can still feel it in the streets. This walk takes you through the best of what''s left and what''s new, from the locks to the main drag. Budget about two hours, more if you linger.',
    'timeline',
    'Ballard',
    1
  ),
  (
    'b1a2c3d4-0000-4000-a000-000000000202',
    'b1a2c3d4-0000-4000-a000-000000000001',
    'Date Night',
    'Treat your loved one to something special.',
    null,
    'cards',
    'Ballard',
    2
  );

-------------------------------------------------------
-- COLLECTION ITEMS
-------------------------------------------------------

-- A Walk Through Ballard (timeline)
INSERT INTO explore_collection_items
  (collection_id, place_id, display_order, is_start, is_end)
VALUES
  ('b1a2c3d4-0000-4000-a000-000000000201', 'b1a2c3d4-0000-4000-a000-000000000101', 1, false, false),
  ('b1a2c3d4-0000-4000-a000-000000000201', 'b1a2c3d4-0000-4000-a000-000000000102', 2, false, false),
  ('b1a2c3d4-0000-4000-a000-000000000201', 'b1a2c3d4-0000-4000-a000-000000000103', 3, false, false),
  ('b1a2c3d4-0000-4000-a000-000000000201', 'b1a2c3d4-0000-4000-a000-000000000104', 4, false, false),
  ('b1a2c3d4-0000-4000-a000-000000000201', 'b1a2c3d4-0000-4000-a000-000000000105', 5, false, false);

-- Date Night (cards)
INSERT INTO explore_collection_items
  (collection_id, place_id, display_order, is_start, is_end)
VALUES
  ('b1a2c3d4-0000-4000-a000-000000000202', 'b1a2c3d4-0000-4000-a000-000000000106', 1, false, false),
  ('b1a2c3d4-0000-4000-a000-000000000202', 'b1a2c3d4-0000-4000-a000-000000000107', 2, false, false),
  ('b1a2c3d4-0000-4000-a000-000000000202', 'b1a2c3d4-0000-4000-a000-000000000108', 3, false, false);

-------------------------------------------------------
-- WIRE UP: link the explore gateway cards to their collections
-------------------------------------------------------
UPDATE nearby_places
  SET collection_id = 'b1a2c3d4-0000-4000-a000-000000000201'
  WHERE venue_id = 'b1a2c3d4-0000-4000-a000-000000000001'
    AND name = 'A Walk Through Ballard';

UPDATE nearby_places
  SET collection_id = 'b1a2c3d4-0000-4000-a000-000000000202'
  WHERE venue_id = 'b1a2c3d4-0000-4000-a000-000000000001'
    AND name = 'Date Night';
