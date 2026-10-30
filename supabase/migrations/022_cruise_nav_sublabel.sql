-- Add optional sublabel to cruise nav tiles (editable per venue via dashboard)
alter table cruise_nav_images add column sublabel text;

-- Nav tiles for standard venue homepages (hotel/resort/etc.)
-- nav_key matches the route segment: "services" | "dining" | "explore"

create table venue_nav_tiles (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  nav_key text not null,
  sublabel text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, nav_key)
);

alter table venue_nav_tiles enable row level security;

create policy "Public read venue_nav_tiles"
  on venue_nav_tiles for select
  using (true);

create policy "Venue members can manage venue_nav_tiles"
  on venue_nav_tiles for all
  using (
    exists (
      select 1 from venue_members
      where venue_members.venue_id = venue_nav_tiles.venue_id
        and venue_members.user_id = auth.uid()
    )
  );

create trigger set_updated_at
  before update on venue_nav_tiles
  for each row execute function update_updated_at_column();
