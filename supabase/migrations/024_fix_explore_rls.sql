-- Add missing write policies for explore_collections and explore_collection_items.
-- The original migration (008) only created SELECT policies, leaving venue members
-- unable to create or edit collections from the dashboard.

create policy "Venue members can manage explore_collections - insert"
  on explore_collections for insert
  with check (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));

create policy "Venue members can manage explore_collections - update"
  on explore_collections for update
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));

create policy "Venue members can manage explore_collections - delete"
  on explore_collections for delete
  using (venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[])));

-- explore_collection_items has no direct venue_id, so check via parent collection
create policy "Venue members can manage explore_collection_items - insert"
  on explore_collection_items for insert
  with check (
    collection_id in (
      select id from explore_collections
      where venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[]))
    )
  );

create policy "Venue members can manage explore_collection_items - update"
  on explore_collection_items for update
  using (
    collection_id in (
      select id from explore_collections
      where venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[]))
    )
  );

create policy "Venue members can manage explore_collection_items - delete"
  on explore_collection_items for delete
  using (
    collection_id in (
      select id from explore_collections
      where venue_id in (select get_user_venue_ids_by_role(auth.uid(), array['owner', 'admin', 'staff']::member_role[]))
    )
  );
