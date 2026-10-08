-- printer_assignments already has uq_printer_assignments_active_printer (one active
-- assignment per printer). It was missing the matching per-user guard that
-- devices/ip_addresses/ip_phones all already have, allowing a user to
-- theoretically hold two active printer assignments at once. Table is empty
-- (0 rows) at the time of this migration, so this is a zero-risk addition.
create unique index uq_printer_assignments_active_user
  on printer_assignments (user_id)
  where (assignment_status = 'active'::assignment_state_enum);
