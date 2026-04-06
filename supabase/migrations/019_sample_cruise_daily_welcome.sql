-- Sample cruise_daily_welcome entries for Ansel & Adam's Anniversary cruise
-- Virgin Voyages Resilient Lady — Nov 11–18, 2025
-- effective_at is in UTC; ship sails from Miami (ET = UTC-5 in November)
-- Morning updates fire at 8:00am ET = 13:00 UTC
-- Evening updates fire at 6:00pm ET = 23:00 UTC

INSERT INTO cruise_daily_welcome (venue_id, effective_at, heading, body) VALUES

-- SAT NOV 11 — Embarkation Day (evening update after sail-away)
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-11 18:00:00+00',
  'We''re setting sail.',
  'Miami is behind us. Seven days, open ocean, and all of you. Get up on deck for the departure — it''s a moment worth seeing.'
),

-- SUN NOV 12 — Sea Day
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-12 13:00:00+00',
  'Day 2 — At Sea.',
  'Nothing on the agenda. Sleep in, find a hot tub, explore the ship. The Runway on Deck 17 is a great morning start if you''re up early.'
),

-- MON NOV 13 — Ocho Rios, Jamaica
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-13 13:00:00+00',
  'Day 3 — Ocho Rios, Jamaica.',
  'We''re docked in Jamaica. All Aboard is at 4:30pm — do not miss the ship. Group dinner tonight at Razzle Dazzle at 7:15pm.'
),

-- TUE NOV 14 — Sea Day
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-14 13:00:00+00',
  'Day 4 — At Sea.',
  'Another open day. Gym, spa, pool, or just find a quiet corner of the ship. We''re halfway through the voyage.'
),

-- WED NOV 15 — Grand Cayman + Scarlet Night
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-15 13:00:00+00',
  'Day 5 — George Town, Grand Cayman.',
  'Docked in Grand Cayman today. All Aboard at 5:00pm. And tonight — Scarlet Night. Wear red. The whole ship goes red at 9pm.'
),
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-15 23:00:00+00',
  'Scarlet Night.',
  'The ship''s signature event is here. Wear red, head to The Manor or The Red Room, and stay out late. This is the one.'
),

-- THU NOV 16 — Sea Day (recovery)
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-16 13:00:00+00',
  'Day 6 — At Sea.',
  'Rest, relax, recover. No plans today — you were out late. Enjoy the ocean and take it easy.'
),

-- FRI NOV 17 — Bimini, Bahamas + final group dinner
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-17 13:00:00+00',
  'Day 7 — Bimini, Bahamas.',
  'The Beach Club at Bimini. VV''s private island — spend the whole day here. All Aboard at 5:00pm. Last group dinner tonight at Extra Virgin, 8:15pm.'
),

-- SAT NOV 18 — Disembarkation
(
  'c2b3d4e5-0000-4000-a000-000000000001',
  '2025-11-18 12:00:00+00',
  'Last day — Miami.',
  'Depart between 7:00am and 10:30am. Make sure your luggage was tagged and left outside your cabin last night. Safe travels, everyone — it was a good one.'
);
