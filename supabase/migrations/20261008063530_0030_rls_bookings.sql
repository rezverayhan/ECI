-- Every doc version (PRD §13, Content Guidelines §13, App Flow §28) frames
-- Cancel/Pause/Deny as an Admin-only action — there is no documented
-- self-service cancel for General Users, so booking mutation after creation
-- is Admin/IT only. General Users can create and read their own bookings.
create policy meeting_room_bookings_select on meeting_room_bookings
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator() or is_admin()
  );
create policy meeting_room_bookings_insert on meeting_room_bookings
  for insert to authenticated with check (
    user_id = current_user_id() or is_it_administrator()
  );
create policy meeting_room_bookings_update on meeting_room_bookings
  for update to authenticated
  using (is_it_administrator() or is_admin())
  with check (is_it_administrator() or is_admin());

create policy car_bookings_select on car_bookings
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator() or is_admin()
  );
create policy car_bookings_insert on car_bookings
  for insert to authenticated with check (
    user_id = current_user_id() or is_it_administrator()
  );
create policy car_bookings_update on car_bookings
  for update to authenticated
  using (is_it_administrator() or is_admin())
  with check (is_it_administrator() or is_admin());
