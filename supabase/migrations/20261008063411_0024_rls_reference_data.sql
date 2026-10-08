-- Reference/catalog data: readable by any authenticated staff member,
-- writable only by IT Administrators. ip_phones additionally doubles as the
-- organization-wide directory General Users are explicitly entitled to
-- browse (PRD §10) — it never stores an IP address, so broad read access
-- does not leak network information.

create policy departments_select on departments
  for select to authenticated using (true);
create policy departments_write on departments
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy designations_select on designations
  for select to authenticated using (true);
create policy designations_write on designations
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy applications_select on applications
  for select to authenticated using (true);
create policy applications_write on applications
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy meeting_rooms_select on meeting_rooms
  for select to authenticated using (true);
create policy meeting_rooms_write on meeting_rooms
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy cars_select on cars
  for select to authenticated using (true);
create policy cars_write on cars
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy ip_phones_select on ip_phones
  for select to authenticated using (true);
create policy ip_phones_write on ip_phones
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

-- The directory also needs to show who holds which extension; that link
-- lives in ip_phone_assignments, which is therefore readable org-wide too
-- (PRD §10: the directory shows Department / Employee / Extension / Status).
create policy ip_phone_assignments_select on ip_phone_assignments
  for select to authenticated using (true);
create policy ip_phone_assignments_write on ip_phone_assignments
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());
