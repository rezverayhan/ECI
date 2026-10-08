create policy printers_select on printers
  for select to authenticated using (
    is_it_administrator()
    or exists (
      select 1 from printer_assignments pa
      where pa.printer_id = printers.id
        and pa.user_id = current_user_id()
        and pa.assignment_status = 'active'
    )
  );
create policy printers_write on printers
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy printer_assignments_select on printer_assignments
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator()
  );
create policy printer_assignments_write on printer_assignments
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

-- Unlike the IP Phone directory, individual IP addresses are not a general
-- directory feature (App Flow §2/§56.3 explicitly keeps IP out of main
-- navigation). A General User may only see the one IP currently assigned to
-- them.
create policy ip_addresses_select on ip_addresses
  for select to authenticated using (
    is_it_administrator()
    or exists (
      select 1 from ip_assignments ia
      where ia.ip_address_id = ip_addresses.id
        and ia.user_id = current_user_id()
        and ia.assignment_status = 'active'
    )
  );
create policy ip_addresses_write on ip_addresses
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());

create policy ip_assignments_select on ip_assignments
  for select to authenticated using (
    user_id = current_user_id() or is_it_administrator()
  );
create policy ip_assignments_write on ip_assignments
  for all to authenticated using (is_it_administrator()) with check (is_it_administrator());
