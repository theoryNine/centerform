-- Nav card images for cruise homepage tiles
-- nav_key matches the route segment: "ship-info" | "food-onboard" | "group-plan" | "the-crew"

create table cruise_nav_images (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  nav_key text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, nav_key)
);

-- Public read, write restricted to venue members
alter table cruise_nav_images enable row level security;

create policy "Public read cruise_nav_images"
  on cruise_nav_images for select
  using (true);

create policy "Venue members can manage cruise_nav_images"
  on cruise_nav_images for all
  using (
    exists (
      select 1 from venue_members
      where venue_members.venue_id = cruise_nav_images.venue_id
        and venue_members.user_id = auth.uid()
    )
  );

create trigger set_updated_at
  before update on cruise_nav_images
  for each row execute function update_updated_at_column();
