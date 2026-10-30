-- Fix infinite recursion in venue_members and standalone_event_members RLS policies.
-- Self-referencing policies and FOR ALL policies cause recursion when PostgreSQL
-- evaluates them during SELECT queries via PostgREST.
-- Solution: use SECURITY DEFINER functions + split FOR ALL into per-operation policies.

-------------------------------------------------------
-- HELPER FUNCTIONS (SECURITY DEFINER bypasses RLS)
-------------------------------------------------------

create or replace function get_user_venue_ids(uid uuid)
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select venue_id from venue_members where user_id = uid;
$$;

create or replace function get_user_venue_ids_by_role(uid uuid, allowed_roles member_role[])
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select venue_id from venue_members where user_id = uid and role = any(allowed_roles);
$$;

create or replace function get_user_event_ids(uid uuid)
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select event_id from standalone_event_members where user_id = uid;
$$;

create or replace function get_user_event_ids_by_role(uid uuid, allowed_roles member_role[])
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select event_id from standalone_event_members where user_id = uid and role = any(allowed_roles);
$$;

-------------------------------------------------------
-- FIX VENUE_MEMBERS POLICIES
-------------------------------------------------------

drop policy "Venue members can view co-members" on venue_members;
create policy "Venue members can view co-members"
  on venue_members for select
  using (venue_id in (select get_user_venue_ids(auth.uid())));

drop policy "Venue owners can manage members" on venue_members;
create policy "Venue owners can manage members - insert"
  on venue_members for insert
  with check (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner']::member_role[])));
create policy "Venue owners can manage members - update"
  on venue_members for update
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner']::member_role[])));
create policy "Venue owners can manage members - delete"
  on venue_members for delete
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner']::member_role[])));

-------------------------------------------------------
-- FIX VENUES POLICIES
-------------------------------------------------------

drop policy "Venue members can update their venue" on venues;
create policy "Venue members can update their venue"
  on venues for update
  using (id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));

-------------------------------------------------------
-- FIX VENUE_THEMES POLICIES (split FOR ALL)
-------------------------------------------------------

drop policy "Venue admins can manage themes" on venue_themes;
create policy "Venue admins can manage themes - insert"
  on venue_themes for insert
  with check (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));
create policy "Venue admins can manage themes - update"
  on venue_themes for update
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));
create policy "Venue admins can manage themes - delete"
  on venue_themes for delete
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));

-------------------------------------------------------
-- FIX SERVICES POLICIES (split FOR ALL)
-------------------------------------------------------

drop policy "Venue members can manage services" on services;
create policy "Venue members can manage services - insert"
  on services for insert
  with check (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Venue members can manage services - update"
  on services for update
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Venue members can manage services - delete"
  on services for delete
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));

-------------------------------------------------------
-- FIX EVENTS POLICIES (split FOR ALL)
-------------------------------------------------------

drop policy "Venue members can manage events" on events;
create policy "Venue members can manage events - insert"
  on events for insert
  with check (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Venue members can manage events - update"
  on events for update
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Venue members can manage events - delete"
  on events for delete
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));

-------------------------------------------------------
-- FIX NEARBY_PLACES POLICIES (split FOR ALL)
-------------------------------------------------------

drop policy "Venue members can manage nearby places" on nearby_places;
create policy "Venue members can manage nearby places - insert"
  on nearby_places for insert
  with check (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Venue members can manage nearby places - update"
  on nearby_places for update
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Venue members can manage nearby places - delete"
  on nearby_places for delete
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));

-------------------------------------------------------
-- FIX STANDALONE_EVENT_MEMBERS POLICIES
-------------------------------------------------------

drop policy "Event members can view co-members" on standalone_event_members;
create policy "Event members can view co-members"
  on standalone_event_members for select
  using (event_id in (select get_user_event_ids(auth.uid())));

drop policy "Event owners can manage members" on standalone_event_members;
create policy "Event owners can manage members - insert"
  on standalone_event_members for insert
  with check (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner']::member_role[])));
create policy "Event owners can manage members - update"
  on standalone_event_members for update
  using (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner']::member_role[])));
create policy "Event owners can manage members - delete"
  on standalone_event_members for delete
  using (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner']::member_role[])));

-------------------------------------------------------
-- FIX STANDALONE_EVENT_THEMES POLICIES (split FOR ALL)
-------------------------------------------------------

drop policy "Event admins can manage themes" on standalone_event_themes;
create policy "Event admins can manage themes - insert"
  on standalone_event_themes for insert
  with check (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));
create policy "Event admins can manage themes - update"
  on standalone_event_themes for update
  using (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));
create policy "Event admins can manage themes - delete"
  on standalone_event_themes for delete
  using (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));

-------------------------------------------------------
-- FIX EVENT_SCHEDULE_ITEMS POLICIES (split FOR ALL)
-------------------------------------------------------

drop policy "Event members can manage schedule items" on event_schedule_items;
create policy "Event members can manage schedule items - insert"
  on event_schedule_items for insert
  with check (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Event members can manage schedule items - update"
  on event_schedule_items for update
  using (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));
create policy "Event members can manage schedule items - delete"
  on event_schedule_items for delete
  using (event_id in (select get_user_event_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));

-------------------------------------------------------
-- FIX STANDALONE_EVENTS UPDATE POLICY
-------------------------------------------------------

drop policy "Event members can update their event" on standalone_events;
create policy "Event members can update their event"
  on standalone_events for update
  using (id in (select get_user_event_ids_by_role(auth.uid(), array['owner', 'admin']::member_role[])));
