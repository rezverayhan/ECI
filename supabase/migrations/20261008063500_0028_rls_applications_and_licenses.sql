create policy user_applications_select on user_applications
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator()
  );
create policy user_applications_write on user_applications
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy user_licenses_select on user_licenses
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator()
  );
create policy user_licenses_write on user_licenses
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy license_renewals_select on license_renewals
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator()
  );
create policy license_renewals_write on license_renewals
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());
