-- Add ship_name to venues for cruise-type venues.
-- Replaces address/city/state as the location identifier shown on cruise pages.
alter table venues add column if not exists ship_name text;

-- Set ship name for the sample anniversary cruise
update venues set ship_name = 'Virgin Voyages Resilient Lady' where slug = 'ansel-adam';
