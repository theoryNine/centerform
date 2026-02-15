-- Centerform Initial Schema
-- Digital Concierge SaaS Platform

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Venue types enum
create type venue_type as enum ('hotel', 'resort', 'museum', 'event_space', 'other');

-- Venue member roles
create type member_role as enum ('owner', 'admin', 'staff');

-- Service categories
create type service_category as enum ('room_service', 'spa', 'concierge', 'dining', 'transportation', 'activities', 'other');

-- Nearby place categories
create type place_category as enum ('restaurant', 'bar', 'cafe', 'attraction', 'shopping', 'entertainment', 'outdoors', 'other');

-------------------------------------------------------
-- VENUES
-------------------------------------------------------
create table venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  address text,
  city text,
  state text,
  country text,
  phone text,
  email text,
  website text,
  logo_url text,
  cover_image_url text,
  venue_type venue_type not null default 'hotel',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_venues_slug on venues(slug);

-------------------------------------------------------
-- VENUE THEMES
-------------------------------------------------------
create table venue_themes (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  primary_color text not null default '#1a1a2e',
  secondary_color text not null default '#16213e',
  accent_color text not null default '#e94560',
  background_color text not null default '#ffffff',
  foreground_color text not null default '#0a0a0a',
  font_family text default 'Inter',
  border_radius text default '0.625rem',
  custom_css text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(venue_id)
);

-------------------------------------------------------
-- VENUE MEMBERS (links users to venues with roles)
-------------------------------------------------------
create table venue_members (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  user_id uuid not null,
  role member_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique(venue_id, user_id)
);

create index idx_venue_members_user on venue_members(user_id);

-------------------------------------------------------
-- SERVICES
-------------------------------------------------------
create table services (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  description text,
  category service_category not null default 'other',
  icon text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_venue on services(venue_id);

-------------------------------------------------------
-- EVENTS
-------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz,
  image_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_events_venue on events(venue_id);
create index idx_events_start on events(start_time);

-------------------------------------------------------
-- NEARBY PLACES
-------------------------------------------------------
create table nearby_places (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  description text,
  category place_category not null default 'other',
  address text,
  distance text,
  rating numeric(2, 1),
  price_level int,
  phone text,
  website text,
  image_url text,
  is_featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_nearby_places_venue on nearby_places(venue_id);

-------------------------------------------------------
-- ROW LEVEL SECURITY
-------------------------------------------------------

-- Venues: publicly readable, writable by members
alter table venues enable row level security;

create policy "Venues are publicly readable"
  on venues for select
  using (is_active = true);

create policy "Venue members can update their venue"
  on venues for update
  using (
    id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Venue themes: publicly readable (needed for guest theming)
alter table venue_themes enable row level security;

create policy "Venue themes are publicly readable"
  on venue_themes for select
  using (true);

create policy "Venue admins can manage themes"
  on venue_themes for all
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Services: publicly readable, writable by venue members
alter table services enable row level security;

create policy "Active services are publicly readable"
  on services for select
  using (is_active = true);

create policy "Venue members can manage services"
  on services for all
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role in ('owner', 'admin', 'staff')
    )
  );

-- Events: publicly readable, writable by venue members
alter table events enable row level security;

create policy "Active events are publicly readable"
  on events for select
  using (is_active = true);

create policy "Venue members can manage events"
  on events for all
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role in ('owner', 'admin', 'staff')
    )
  );

-- Nearby places: publicly readable, writable by venue members
alter table nearby_places enable row level security;

create policy "Nearby places are publicly readable"
  on nearby_places for select
  using (true);

create policy "Venue members can manage nearby places"
  on nearby_places for all
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role in ('owner', 'admin', 'staff')
    )
  );

-- Venue members: readable by members of same venue
alter table venue_members enable row level security;

create policy "Venue members can view co-members"
  on venue_members for select
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid()
    )
  );

create policy "Venue owners can manage members"
  on venue_members for all
  using (
    venue_id in (
      select venue_id from venue_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-------------------------------------------------------
-- UPDATED_AT TRIGGER
-------------------------------------------------------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger venues_updated_at before update on venues
  for each row execute function update_updated_at();

create trigger venue_themes_updated_at before update on venue_themes
  for each row execute function update_updated_at();

create trigger services_updated_at before update on services
  for each row execute function update_updated_at();

create trigger events_updated_at before update on events
  for each row execute function update_updated_at();

create trigger nearby_places_updated_at before update on nearby_places
  for each row execute function update_updated_at();
