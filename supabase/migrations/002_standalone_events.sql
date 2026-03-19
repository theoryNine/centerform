-- Standalone Events Schema
-- Allows events to exist independently from venues with their own concierge experience

-- Event type enum
create type event_type as enum ('conference', 'concert', 'festival', 'wedding', 'gala', 'other');

-------------------------------------------------------
-- STANDALONE EVENTS
-------------------------------------------------------
create table standalone_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  event_type event_type not null default 'other',
  address text,
  city text,
  state text,
  country text,
  phone text,
  email text,
  website text,
  logo_url text,
  cover_image_url text,
  start_date timestamptz not null,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_standalone_events_slug on standalone_events(slug);
create index idx_standalone_events_start on standalone_events(start_date);

-------------------------------------------------------
-- STANDALONE EVENT THEMES
-------------------------------------------------------
create table standalone_event_themes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references standalone_events(id) on delete cascade,
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
  unique(event_id)
);

-------------------------------------------------------
-- STANDALONE EVENT MEMBERS
-------------------------------------------------------
create table standalone_event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references standalone_events(id) on delete cascade,
  user_id uuid not null,
  role member_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index idx_standalone_event_members_user on standalone_event_members(user_id);

-------------------------------------------------------
-- EVENT SCHEDULE ITEMS
-------------------------------------------------------
create table event_schedule_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references standalone_events(id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz,
  speaker text,
  is_featured boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_schedule_items_event on event_schedule_items(event_id);
create index idx_schedule_items_start on event_schedule_items(start_time);

-------------------------------------------------------
-- SLUG UNIQUENESS ACROSS VENUES AND EVENTS
-------------------------------------------------------
create or replace function check_slug_uniqueness()
returns trigger as $$
begin
  if tg_table_name = 'venues' then
    if exists (select 1 from standalone_events where slug = new.slug) then
      raise exception 'Slug "%" is already used by a standalone event', new.slug;
    end if;
  elsif tg_table_name = 'standalone_events' then
    if exists (select 1 from venues where slug = new.slug) then
      raise exception 'Slug "%" is already used by a venue', new.slug;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger venues_slug_uniqueness before insert or update of slug on venues
  for each row execute function check_slug_uniqueness();

create trigger standalone_events_slug_uniqueness before insert or update of slug on standalone_events
  for each row execute function check_slug_uniqueness();

-------------------------------------------------------
-- ROW LEVEL SECURITY
-------------------------------------------------------

-- Standalone events: publicly readable, writable by members
alter table standalone_events enable row level security;

create policy "Standalone events are publicly readable"
  on standalone_events for select
  using (is_active = true);

create policy "Event members can update their event"
  on standalone_events for update
  using (
    id in (
      select event_id from standalone_event_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Standalone event themes: publicly readable
alter table standalone_event_themes enable row level security;

create policy "Event themes are publicly readable"
  on standalone_event_themes for select
  using (true);

create policy "Event admins can manage themes"
  on standalone_event_themes for all
  using (
    event_id in (
      select event_id from standalone_event_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Event schedule items: publicly readable, writable by event members
alter table event_schedule_items enable row level security;

create policy "Active schedule items are publicly readable"
  on event_schedule_items for select
  using (is_active = true);

create policy "Event members can manage schedule items"
  on event_schedule_items for all
  using (
    event_id in (
      select event_id from standalone_event_members
      where user_id = auth.uid() and role in ('owner', 'admin', 'staff')
    )
  );

-- Standalone event members: readable by co-members
alter table standalone_event_members enable row level security;

create policy "Event members can view co-members"
  on standalone_event_members for select
  using (
    event_id in (
      select event_id from standalone_event_members
      where user_id = auth.uid()
    )
  );

create policy "Event owners can manage members"
  on standalone_event_members for all
  using (
    event_id in (
      select event_id from standalone_event_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-------------------------------------------------------
-- UPDATED_AT TRIGGERS
-------------------------------------------------------
create trigger standalone_events_updated_at before update on standalone_events
  for each row execute function update_updated_at();

create trigger standalone_event_themes_updated_at before update on standalone_event_themes
  for each row execute function update_updated_at();

create trigger event_schedule_items_updated_at before update on event_schedule_items
  for each row execute function update_updated_at();

-------------------------------------------------------
-- SAMPLE STANDALONE EVENTS
-------------------------------------------------------
insert into standalone_events (name, slug, description, event_type, address, city, state, country, start_date, end_date) values
  ('TechConnect 2026', 'techconnect-2026', 'The premier technology conference bringing together innovators, developers, and industry leaders for three days of talks, workshops, and networking.', 'conference', '500 Convention Center Dr', 'Austin', 'TX', 'US', '2026-06-15 09:00:00+00', '2026-06-17 18:00:00+00'),
  ('Summer Sounds Festival', 'summer-sounds-festival', 'A weekend-long outdoor music festival featuring indie, electronic, and world music acts across four stages.', 'festival', '1200 Waterfront Park', 'Portland', 'OR', 'US', '2026-07-25 12:00:00+00', '2026-07-27 23:00:00+00'),
  ('The Anderson-Park Wedding', 'anderson-park-wedding', 'Celebrating the union of Emily Anderson and James Park. Welcome to our special weekend.', 'wedding', '88 Garden Estate Lane', 'Savannah', 'GA', 'US', '2026-09-12 16:00:00+00', '2026-09-13 14:00:00+00');
