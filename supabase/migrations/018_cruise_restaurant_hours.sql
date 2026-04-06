-- Migration: 018_cruise_restaurant_hours.sql
-- Populates hours for Resilient Lady restaurants.
-- Multi-period hours use newline-separated lines (rendered as stacked rows in the UI).

-- The Wake (brunch + dinner)
UPDATE cruise_restaurants
SET hours = 'Brunch: 8:00am–1:00pm' || E'\n' || 'Dinner: 5:30pm–9:30pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000001';

-- Extra Virgin
UPDATE cruise_restaurants
SET hours = 'Dinner: 6:00pm–10:00pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000002';

-- Pink Agave
UPDATE cruise_restaurants
SET hours = 'Dinner: 6:00pm–10:00pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000003';

-- Gunbae
UPDATE cruise_restaurants
SET hours = 'Dinner: 5:30pm–10:00pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000004';

-- Razzle Dazzle (breakfast, lunch, and dinner service)
UPDATE cruise_restaurants
SET hours = 'Breakfast: 7:00am–9:30am' || E'\n' || 'Lunch: 11:30am–2:00pm' || E'\n' || 'Dinner: 6:00pm–9:30pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000005';

-- The Test Kitchen
UPDATE cruise_restaurants
SET hours = 'Dinner: 6:00pm–10:00pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000006';

-- The Galley (open all day; Diner & Dash 24/7)
UPDATE cruise_restaurants
SET hours = 'Breakfast: 6:30am–11:00am' || E'\n' || 'Lunch: 12:00pm–3:00pm' || E'\n' || 'Dinner: 5:00pm–10:00pm' || E'\n' || 'Late Night: Open 24hrs'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000007';

-- The Pizza Place (sea days open earlier)
UPDATE cruise_restaurants
SET hours = 'Sea days: 12:00pm–2:00am' || E'\n' || 'Port days: 2:00pm–2:00am'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000008';

-- The Dock House
UPDATE cruise_restaurants
SET hours = 'Daily: 12:00pm–5:30pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000009';

-- Sun Club Café
UPDATE cruise_restaurants
SET hours = 'Daily: 12:00pm–5:00pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000010';

-- Lick Me Till Ice Cream
UPDATE cruise_restaurants
SET hours = 'Sea days: 11:30am–10:00pm' || E'\n' || 'Port days: 2:00pm–10:00pm'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000011';
