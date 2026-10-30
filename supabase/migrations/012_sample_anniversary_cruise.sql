-- Sample data: Ansel & Adam's Anniversary Cruise
-- Virgin Voyages Resilient Lady — Miami to the Caribbean
-- Nov 11–18, 2025
--
-- NOTE: The Group Plan uses `is_start` items as day headers in the flat timeline.
-- A future enhancement (day selector pills) will add per-day filtering UI.
-- Port days include "All Aboard" cards — an urgent/red card treatment can be added to the UI later.

-------------------------------------------------------
-- VENUE
-------------------------------------------------------
INSERT INTO venues (id, name, slug, description, address, city, state, country, venue_type, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Ansel & Adam''s Anniversary',
  'ansel-adam',
  'Our group''s sail on Virgin Voyages Resilient Lady — Miami to the Caribbean and back. Nov 11–18, 2025.',
  'PortMiami, 1015 N America Way',
  'Miami',
  'FL',
  'US',
  'cruise',
  true
);

-------------------------------------------------------
-- THEME
-------------------------------------------------------
INSERT INTO venue_themes (venue_id, primary_color, secondary_color, accent_color, background_color, foreground_color, font_family)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  '#C8102E',
  '#F5F0E8',
  '#D4AF37',
  '#F5F0E8',
  '#1A1A2E',
  'DM Sans'
);

-------------------------------------------------------
-- SERVICES: 01 Welcome Aboard (category = welcome_aboard)
-------------------------------------------------------

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Deck Overview',
  'Here''s what''s on the major decks of Resilient Lady:

Deck 4 (Aft) — The Wake restaurant
Deck 5 — Most sit-down restaurants: Extra Virgin, Pink Agave, Gunbae, Razzle Dazzle, The Test Kitchen
Deck 6 — Casino
Deck 7 — The Galley (food hall), The Pizza Place, The Dock House
Deck 15 / 16 — Pool & Hot Tubs
Deck 16 — Sun Club Café
Deck 17 — The Runway (jogging track)',
  'welcome_aboard',
  1,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'WiFi',
  'Connect to the ship''s WiFi network. Packages are available for purchase through the VV App or at the Digital Den. Basic messaging is included for all sailors — great for staying in touch with the group.',
  'welcome_aboard',
  2,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Dress Code',
  'No formal dress code — Virgin Voyages keeps things casual and comfortable.

One big exception: Scarlet Night. This is the ship''s signature event and the whole ship celebrates in red. Wear something red! It''s a full vibe.',
  'welcome_aboard',
  3,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The VV App',
  'Download the Virgin Voyages app before you board — seriously, do it now.

You''ll use it to: make restaurant reservations, view your daily schedule, order room service (Ship Eats), and manage your onboard account. Restaurant reservations go fast, especially for smaller venues like Pink Agave.',
  'welcome_aboard',
  4,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Being on Board',
  'The wristband — your room key, payment method, and access pass. Tap it everywhere. You never need to carry cash or your phone to pay.

Gratuities are already included in your voyage cost. No tipping needed.

Room service (Ship Eats) is available 24 hours a day via the VV App. Free delivery, and the food is actually good.',
  'welcome_aboard',
  5,
  true
);

-------------------------------------------------------
-- SERVICES: 02 Amenities (category = ship_amenities)
-------------------------------------------------------

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Pool & Hot Tubs',
  'Located on Decks 15 and 16. There are multiple pools and hot tubs — including a private pool area that may be open at select times for our group. Check the VV App for daily pool hours and keep an eye on the group chat.',
  'ship_amenities',
  10,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Athletic Club',
  'Full gym, basketball court, and fitness classes — all included. Classes fill up fast, so book in advance through the VV App. Great option for sea days.',
  'ship_amenities',
  11,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Redemption Spa',
  'The spa has a charge for entry (worth it for a sea day), and you can book individual massages and treatments separately. Book early — the best time slots sell out.',
  'ship_amenities',
  12,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Runway',
  'Jogging and walking track on Deck 17 with incredible open-ocean views. Open early morning. A great way to start a sea day.',
  'ship_amenities',
  13,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Beach Club at Bimini',
  'Virgin Voyages'' private island — this is Day 6 (Friday, Nov 17th). The Beach Club is an all-day experience with beach access, pools, and food. Some areas have additional costs. Plan to spend the whole day here.',
  'ship_amenities',
  14,
  true
);

-------------------------------------------------------
-- SERVICES: 03 Entertainment (category = ship_entertainment)
-------------------------------------------------------

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Red Room',
  'The main theater on board. Shows include Persephone and Duel Reality — both are worth seeing. Reserve your seats through the VV App before you board. These fill up fast and are free.',
  'ship_entertainment',
  20,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Manor',
  'The ship''s main nightclub. Hosts Lola''s Library (a speakeasy-style bar during early evening), DJ sets nightly, and the official Scarlet Night after-party. Open until very late. This is the move.',
  'ship_entertainment',
  21,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Voyage Vinyl',
  'A record shop and DJ booth on board. Browse vinyl, make requests, and catch live DJ sessions. Perfect for a sea day afternoon — most people don''t find it.',
  'ship_entertainment',
  22,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Groupie',
  'Karaoke bar with 4 private booths you can book for the group. Bookable through the VV App. Absolute must-do — we are absolutely doing this.',
  'ship_entertainment',
  23,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'On The Rocks',
  'Late-night cocktail bar. Great for a nightcap after dinner or a pre-club drink. Open until the early hours.',
  'ship_entertainment',
  24,
  true
);

INSERT INTO services (venue_id, name, description, category, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Casino',
  'Located on Deck 6. Open most evenings once the ship is at sea (closed while in port). Slots, table games, the usual.',
  'ship_entertainment',
  25,
  true
);

-------------------------------------------------------
-- RESTAURANTS: Sit-Down
-------------------------------------------------------

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000001',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Wake',
  'The most upscale dinner onboard. Get the bone marrow starter. Brunch here is also incredible.',
  'Steak & Seafood',
  '4, Aft',
  'sit_down',
  1,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000002',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Extra Virgin',
  'Best consistency on the ship. Handmade pasta, great charcuterie. Can''t go wrong.',
  'Italian',
  '5',
  'sit_down',
  2,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000003',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Pink Agave',
  'Order shareables for the table. The corn soup is a sleeper hit. Book early — smallest venue.',
  'Mexican',
  '5',
  'sit_down',
  3,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000004',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Gunbae',
  'Interactive and social — they cook for you. Starts with a soju drinking game. Go with the whole group.',
  'Korean BBQ',
  '5',
  'sit_down',
  4,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000005',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Razzle Dazzle',
  'New American menu on Resilient Lady. Good brunch spot too.',
  'American Fusion',
  '5',
  'sit_down',
  5,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000006',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Test Kitchen',
  '6-course surprise menu. Changes every few days. Expect to be there a while.',
  'Tasting Menu',
  '5',
  'sit_down',
  6,
  true
);

-------------------------------------------------------
-- RESTAURANTS: Walk-Up Eateries
-------------------------------------------------------

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000007',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Galley',
  'Not a buffet — order and they bring it. Diner & Dash for breakfast, burger bar all day.',
  'Food Hall',
  '7',
  'walk_up',
  7,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000008',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Pizza Place',
  'Open late. Made to order. Your 11pm spot.',
  'Pizza',
  '7',
  'walk_up',
  8,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000009',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Dock House',
  'Great for a casual afternoon snack with drinks.',
  'Mezze',
  '7',
  'walk_up',
  9,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000010',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Sun Club Café',
  'Hidden gem. Most people don''t know it exists.',
  'Hawaiian-Asian',
  '16',
  'walk_up',
  10,
  true
);

INSERT INTO cruise_restaurants (id, venue_id, name, description, cuisine_type, deck, restaurant_type, display_order, is_active)
VALUES (
  'c2b3d4e5-0001-4000-a000-000000000011',
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Lick Me Till Ice Cream',
  'Yes, that''s the real name. Open whenever. You''ll go daily.',
  'Ice Cream',
  '7',
  'walk_up',
  11,
  true
);

-------------------------------------------------------
-- GROUP PLAN: Itinerary
-- Day headers use is_start=true. Restaurant-linked dinners use restaurant_id.
-- "All Aboard" departure reminders are included as urgent items (red card UI: future enhancement).
-------------------------------------------------------

-- ── SAT NOV 11 · MIAMI ──────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'SAT NOV 11',
  'Miami',
  null,
  true,
  1,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Embarkation · Sail Away',
  'Boarding opens in the afternoon. We sail away from Miami at 5:30pm. Get up on deck for the departure — it''s a moment.',
  '5:30pm',
  2,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, restaurant_id, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Group Dinner',
  'Extra Virgin — handmade pasta, great charcuterie. First night together.',
  '8:30pm',
  'c2b3d4e5-0001-4000-a000-000000000002',
  3,
  true
);

-- ── SUN NOV 12 · SEA DAY ────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'SUN NOV 12',
  'Sea Day',
  null,
  true,
  4,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Open Day',
  'Nothing planned — enjoy the ship. Explore, relax, find a hot tub. The Runway is a great morning start.',
  5,
  true
);

-- ── MON NOV 13 · OCHO RIOS, JAMAICA ────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'MON NOV 13',
  'Ocho Rios, Jamaica',
  null,
  true,
  6,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'All Aboard',
  'Ship departs Ocho Rios. Do not miss this.',
  '4:30pm',
  7,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, restaurant_id, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Group Dinner',
  'Razzle Dazzle — New American. Good brunch spot too.',
  '7:15pm',
  'c2b3d4e5-0001-4000-a000-000000000005',
  8,
  true
);

-- ── TUE NOV 14 · SEA DAY ────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'TUE NOV 14',
  'Sea Day',
  null,
  true,
  9,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Open Day',
  'Nothing planned — enjoy the day!',
  10,
  true
);

-- ── WED NOV 15 · GEORGE TOWN, GRAND CAYMAN ──────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'WED NOV 15',
  'George Town, Grand Cayman',
  null,
  true,
  11,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'All Aboard',
  'Ship departs Grand Cayman. Do not miss this.',
  '5:00pm',
  12,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Scarlet Night',
  'The ship''s signature event. Wear red. The whole ship transforms — The Manor, The Red Room, everywhere. Starts at 9pm.',
  '9:00pm',
  13,
  true
);

-- ── THU NOV 16 · SEA DAY ────────────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'THU NOV 16',
  'Sea Day',
  null,
  true,
  14,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Open Day',
  'Rest, relax, recover. No plans. You were out late. Enjoy the ocean.',
  15,
  true
);

-- ── FRI NOV 17 · BIMINI, BAHAMAS ────────────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'FRI NOV 17',
  'Bimini, Bahamas',
  null,
  true,
  16,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'The Beach Club at Bimini',
  'VV''s private island. Beach access, pools, food, drinks. Spend the whole day here.',
  17,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'All Aboard',
  'Ship departs Bimini. Last one — don''t blow it.',
  '5:00pm',
  18,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, restaurant_id, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Group Dinner',
  'Extra Virgin — one more time. Last dinner together.',
  '8:15pm',
  'c2b3d4e5-0001-4000-a000-000000000002',
  19,
  true
);

-- ── SAT NOV 18 · MIAMI · DISEMBARKATION ─────────────

INSERT INTO cruise_itinerary_items (venue_id, title, location, time_label, is_start, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'SAT NOV 18',
  'Miami',
  null,
  true,
  20,
  true
);

INSERT INTO cruise_itinerary_items (venue_id, title, description, time_label, is_end, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Disembarkation',
  'Depart between 7:00am and 10:30am. Tag your luggage the night before and leave it outside your cabin.',
  '7–10:30am',
  true,
  21,
  true
);

-------------------------------------------------------
-- LINKS (homepage)
-------------------------------------------------------

INSERT INTO cruise_links (venue_id, label, url, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'iOS Shared Album',
  'https://www.icloud.com',
  1,
  true
);

INSERT INTO cruise_links (venue_id, label, url, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Google Shared Album',
  'https://photos.google.com',
  2,
  true
);

INSERT INTO cruise_links (venue_id, label, url, display_order, is_active)
VALUES (
  'c2b3d4e5-0000-4000-a000-000000000001',
  'Virgin Voyages',
  'https://www.virginvoyages.com',
  3,
  true
);
