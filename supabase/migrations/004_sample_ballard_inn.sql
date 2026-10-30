-- Sample data: The Ballard Inn
-- A boutique hotel in Ballard, Seattle — matches the design mockups.
-- Run this in the Supabase SQL Editor to populate the services page.

-------------------------------------------------------
-- VENUE
-------------------------------------------------------
INSERT INTO venues (id, name, slug, description, address, city, state, country, phone, email, website, venue_type, is_active)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'The Ballard Inn',
  'the-ballard-inn',
  'A boutique inn in the heart of Ballard, Seattle. Walking distance to breweries, restaurants, and the waterfront.',
  '5300 Ballard Ave NW',
  'Seattle',
  'WA',
  'US',
  '+1 (206) 555-0123',
  'hello@theballardinn.com',
  'https://theballardinn.com',
  'hotel',
  true
);

-------------------------------------------------------
-- THEME
-------------------------------------------------------
INSERT INTO venue_themes (venue_id, primary_color, secondary_color, accent_color, background_color, foreground_color, font_family)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  '#1A7A6D',
  '#EDE8DE',
  '#D4B483',
  '#F5F0E8',
  '#2D2A26',
  'Inter'
);

-------------------------------------------------------
-- SERVICES: "Your Room" section (category = room_service)
-------------------------------------------------------

-- WiFi & Connectivity
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'WiFi & Connectivity',
  'Network: BallardInn-Guest — Password: welcome2024',
  'room_service',
  1
);

-- Bathroom Amenities
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Bathroom Amenities',
  'Malin+Goetz toiletries, plush robes & slippers, hair dryer, magnifying mirror. Extra towels available on request at the front desk.',
  'room_service',
  2
);

-- Climate & Comfort
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Climate & Comfort',
  'Individual thermostat in each room. Extra blankets and pillows available in the closet or by request.',
  'room_service',
  3
);

-- TV & Entertainment
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'TV & Entertainment',
  'Samsung smart TV with Chromecast built in. To cast from your phone: open the Google Home app, select ''Ballard Inn Room [#]'', and cast. Netflix, Hulu, and YouTube are pre-installed — sign in with your personal account. Accounts auto-clear at checkout.',
  'room_service',
  4
);

-- In-Room Coffee
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'In-Room Coffee',
  'Complimentary Nespresso machine with a selection of pods. Refills available at the front desk. Fresh whole-bean coffee served in the lobby each morning from 6–10am.',
  'room_service',
  5
);

-- Safe & Storage
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Safe & Storage',
  'In-room electronic safe located in the closet. Set your own 4-digit code. If you need to store larger items, the front desk can help.',
  'room_service',
  6
);

-------------------------------------------------------
-- SERVICES: "Services" section (category = concierge)
-------------------------------------------------------

-- Housekeeping
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Housekeeping',
  'Daily housekeeping between 10am–2pm. Place the "Do Not Disturb" sign on your door to skip. For extra towels, linens, or a mid-stay refresh, call the front desk.',
  'concierge',
  10
);

-- Late Check-Out
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Late Check-Out',
  'Subject to availability. Please request at the front desk by 9am on checkout day. Complimentary until 1pm when available; a half-day rate applies after 1pm.',
  'concierge',
  11
);

-- Luggage Storage
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Luggage Storage',
  'Complimentary luggage storage available before check-in and after checkout. Just leave your bags with the front desk.',
  'concierge',
  12
);

-- Laundry
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Laundry',
  'Same-day laundry and dry cleaning when dropped off before 10am. Laundry bags and slips are in the closet. Pricing is on the slip.',
  'concierge',
  13
);

-- Packages & Mail
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Packages & Mail',
  'We accept packages on your behalf. They will be held at the front desk. Outgoing mail can be left at the desk — we drop off daily.',
  'concierge',
  14
);

-------------------------------------------------------
-- SERVICES: "Getting Here" section (category = transportation)
-------------------------------------------------------

-- Parking
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Parking',
  'Street parking is free in most of Ballard (2-hour limit on Ballard Ave during business hours). There is an unmonitored lot behind the building — first come, first served for guests.',
  'transportation',
  20
);

-- From the Airport (SEA)
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'From the Airport (SEA)',
  'Light Rail to Westlake, then D Line bus to Ballard (about 75 min total). Rideshare is typically 25–40 min and $35–50 depending on traffic.',
  'transportation',
  21
);

-- Bikes
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Bikes',
  'We have complimentary bikes for guests — ask at the front desk. The Burke-Gilman Trail runs right through the neighborhood. Lime and LINK scooters are also available around the block.',
  'transportation',
  22
);

-- Neighborhood
INSERT INTO services (venue_id, name, description, category, display_order)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Neighborhood',
  'Ballard is a walkable neighborhood with breweries, seafood restaurants, vintage shops, and the Ballard Locks. Most of the best spots are within a 10-minute walk.',
  'transportation',
  23
);

-------------------------------------------------------
-- EVENTS (a couple of sample events for "Tonight")
-------------------------------------------------------

INSERT INTO events (venue_id, title, description, location, start_time, end_time, is_featured, is_active)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Wine & Cheese Hour',
  'Join us in the lobby for complimentary wine and local cheeses.',
  'Lobby Lounge',
  (CURRENT_DATE + interval '17 hours')::timestamptz,
  (CURRENT_DATE + interval '18 hours')::timestamptz,
  true,
  true
);

INSERT INTO events (venue_id, title, description, location, start_time, end_time, is_featured, is_active)
VALUES (
  'b1a2c3d4-0000-4000-a000-000000000001',
  'Live Jazz',
  'Local trio performing acoustic jazz standards.',
  'Courtyard',
  (CURRENT_DATE + interval '19 hours')::timestamptz,
  (CURRENT_DATE + interval '21 hours')::timestamptz,
  false,
  true
);
