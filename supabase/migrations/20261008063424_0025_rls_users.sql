-- Self, IT Administrators, and General Managers/Admins only for the users
-- whose records they have an approved operational reason to see: GM sees
-- submitters of the support issues they're allowed to view (which is all of
-- them); Admin sees users tied to a booking they're allowed to administer.
-- Nobody else ever sees another user's row (Task 02 Case 1/3).
create policy users_select on users
  for select to authenticated using (
    id = current_user_id()
    or is_it_administrator()
    or (is_general_manager() and exists (
      select 1 from support_issues si where si.user_id = users.id
    ))
    or (is_admin() and (
      exists (select 1 from meeting_room_bookings b where b.user_id = users.id)
      or exists (select 1 from car_bookings cb where cb.user_id = users.id)
    ))
  );

-- User provisioning is an IT Administrator operation (App Flow §11).
create policy users_insert on users
  for insert to authenticated with check (is_it_administrator());

-- Self-update is allowed at the row level; the trg_users_enforce_self_update
-- trigger (migration 0023) restricts which columns a non-admin may actually
-- change on their own row.
create policy users_update on users
  for update to authenticated
  using (id = current_user_id() or is_it_administrator())
  with check (id = current_user_id() or is_it_administrator());

-- Controlled deletion of genuinely incorrect records only (Content
-- Guidelines §33-34).
create policy users_delete on users
  for delete to authenticated using (is_it_administrator());
