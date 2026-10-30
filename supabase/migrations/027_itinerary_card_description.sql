-- Migration: Add card_description to cruise_itinerary_items
-- + Refresh the Ansel & Adam anniversary cruise group plan itinerary
--
-- card_description: short text shown on the timeline card (the "subheader")
-- description:      body text shown on the individual item detail page
-- These fields intentionally carry different content.

ALTER TABLE cruise_itinerary_items ADD COLUMN IF NOT EXISTS card_description TEXT;

-- Clear and reload the anniversary cruise itinerary
DELETE FROM cruise_itinerary_items
WHERE venue_id = 'c2b3d4e5-0000-4000-a000-000000000001';

-- ── SAT NOV 11 · MIAMI ──────────────────────────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'SAT NOV 11', 'Miami', true, 10, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Embarkation & Sail Away',
  'Get on the ship, find your cabin and unwind. We sail away from Miami at 5:30pm.',
  E'The trip starts now! Find your cabin, drop your bags (or fully unpack, you do you!), explore the ship and get a drink. She\'s bigger than you might think.\n\nSail Away is at 5:30pm on Deck 15. It\'s a big ship-wide party featuring unlimited bubbly while we all get together and watch Miami disappear into the distance. Be there!',
  '5:30pm',
  20,
  true
);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, time_label, restaurant_id, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Group Dinner',
  'Extra Virgin. We may not be virgins anymore but we can eat like it.',
  '8:30pm',
  'c2b3d4e5-0001-4000-a000-000000000002',
  30,
  true
);

-- ── SUN NOV 12 · SEA DAY ────────────────────────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'SUN NOV 12', 'Sea Day', true, 40, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Sea Day',
  'No plans, the ship is yours to enjoy.',
  E'The ship is open and the whole day is yours to enjoy. Make the most of it! Or don\'t, we don\'t judge. There\'s more bars, loungers, and recreation activities than you can shake a stick at.\n\nMaybe you want to read a book, maybe you want to get a workout in, maybe you stay in bed all day and order room service.\n\nSee you when we see you!',
  50,
  true
);

-- ── MON NOV 13 · OCHO RIOS, JAMAICA ─────────────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'MON NOV 13', 'Ocho Rios, Jamaica', true, 60, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Ocho Rios, Jamaica',
  'First port day. Waterfalls, the Blue Hole, or just walk around.',
  E'The ship parked itself in Jamaica and we think you should take the hint. Ocho Rios is lush, loud and beautiful. It\'s known for Dunn\'s River Falls (a 600ft waterfall you can walk up) and the Blue Hole swimming holes tucked away inside of jungles that look almost too beautiful.\n\nGo do something you\'ll talk about at dinner.',
  70,
  true
);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'All Aboard',
  'Go explore, but don''t miss the boat!',
  'The Resilient Lady waits for no one. They will leave without you, and Jamaica is nice but I doubt you want to get stuck here!',
  '4:30pm',
  80,
  true
);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, time_label, restaurant_id, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Group Dinner',
  'We''ll give ''em the old Razzle Dazzle!',
  '7:15pm',
  'c2b3d4e5-0001-4000-a000-000000000005',
  90,
  true
);

-- ── TUE NOV 14 · SEA DAY ────────────────────────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'TUE NOV 14', 'Sea Day', true, 100, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Sea Day',
  'No group plans, except maybe a Titanic situation.',
  E'Another open day at sea. Find a new restaurant, hit the gym, get a tattoo - you do you! If you haven\'t seen any of the ship\'s shows, tonight\'s the night to start thinking about it.\n\nToday is the 114th Anniversary of the Titanic. I hear some folks may be planning to watch the movie this evening.',
  110,
  true
);

-- ── WED NOV 15 · GEORGE TOWN, GRAND CAYMAN ──────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'WED NOV 15', 'George Town, Grand Cayman', true, 120, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'George Town, Grand Cayman',
  'This postcard island is Grand Cayman''s finest.',
  E'George Town is here to make you question every other beach vacation you\'ve ever been to. Seven Mile Beach is exactly what it sounds like (even if it is only 6.3 miles), and has white sand with crystal clear water you\'ll question your phone\'s camera.\n\nStingray City is another main attraction if you want to feel stingrays bumping against your legs. Go explore, swim and get some sun until your heart\'s content.',
  130,
  true
);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'All Aboard',
  'So long, paradise. We sail towards red waters.',
  'We know Seven Mile Beach is hard to leave, but try to be on the ship by 5pm. You have a date with the color red tonight and you want to be rested and ready!',
  '5:00pm',
  140,
  true
);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Scarlet Night',
  'The ship''s signature event. Category is: Red.',
  E'Once every voyage, the whole ship transforms. Lights go red and the people follow suit. The energy cranks up, with activities and performances throughout. The party ends with the last person standing out on the pool deck.\n\nMake sure you''re wearing red. The more the better! We''ll meet up around 9pm and let the Resilient Lady take it from there.',
  '9:00pm',
  150,
  true
);

-- ── THU NOV 16 · SEA DAY ────────────────────────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'THU NOV 16', 'Sea Day', true, 160, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Sea Day',
  'Open ocean recovery day. Take it easy.',
  E'Now that Scarlet Night has happened, today doesn\'t necessarily have to. There\'s no reason to get up and do anything unless you want to. We\'ll keep lounging, eating and relaxing our way through the Caribbean.\n\nDon\'t forget to check out any restaurants, shows, or ship spaces that are still calling to you, and let us know if you want company.',
  170,
  true
);

-- ── FRI NOV 17 · BIMINI, BAHAMAS ────────────────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'FRI NOV 17', 'Bimini, Bahamas', true, 180, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Bimini Beach Club',
  'Our last port is VV''s private beach club. Make it count.',
  E'Our last port day is at Virgin\'s private beach. White sand, turquoise water, a pool, a party, and it\'s just like being on the ship — everything is included.\n\nGet off the ship, get right over and plant yourself somewhere nice.',
  190,
  true
);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'All Aboard',
  'Alas, it is time to head back home.',
  E'Our last port, and last beach of the trip will soon be behind us. The Beach Club has a way of making people forget they are on a cruise and need to be back at a certain time.\n\nBut you are! The ship is leaving.',
  '5:00pm',
  200,
  true
);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, time_label, restaurant_id, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Group Dinner',
  'Extra Virgin. One last group dinner before reality sets back in.',
  '8:15pm',
  'c2b3d4e5-0001-4000-a000-000000000002',
  210,
  true
);

-- ── SAT NOV 18 · MIAMI · DISEMBARKATION ─────────────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, is_start, display_order, is_active)
VALUES ('c2b3d4e5-0000-4000-a000-000000000001', 'SAT NOV 18', 'Miami', true, 220, true);

INSERT INTO cruise_itinerary_items
  (venue_id, title, card_description, time_label, is_end, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Disembarkation',
  E'Au revoir! We are back where we started, only with better tans and worse sleep schedules. We may have to go now but the memories will stay a lifetime.\n\nLeaving the ship gets busiest later in the day. You don\'t have to go home, but you can\'t stay here.',
  '7–10:30am',
  true,
  230,
  true
);
