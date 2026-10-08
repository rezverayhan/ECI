create policy machine_profiles_select on machine_profiles
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator()
  );
create policy machine_profiles_write on machine_profiles
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy devices_select on devices
  for select to authenticated using (
    is_it_administrator()
    or exists (
      select 1 from device_assignments da
      where da.device_id = devices.id
        and da.user_id = current_user_id()
        and da.assignment_status = 'active'
    )
  );
create policy devices_write on devices
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

-- General Users may read their own assignment history (including past,
-- returned assignments), but only IT Administrators create/change
-- assignments (Task 02 §8 device_assignments: "Do not allow General Users to
-- create/change assignments").
create policy device_assignments_select on device_assignments
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator()
  );
create policy device_assignments_write on device_assignments
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy device_service_records_select on device_service_records
  for select to authenticated using (
    is_it_administrator()
    or exists (
      select 1 from device_assignments da
      where da.device_id = device_service_records.device_id
        and da.user_id = current_user_id()
        and da.assignment_status = 'active'
    )
  );
create policy device_service_records_write on device_service_records
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());
