-- Approved for the 79-user real-data import (owner-confirmed, not a
-- unilateral change): a small number of real employees genuinely have no
-- Employee ID or Designation on record yet (e.g. recently joined Country
-- Managers). The manifest forbids fabricating either value, so the
-- constraint itself must relax to accept a true NULL rather than force a
-- fake placeholder. UNIQUE already permits multiple NULLs in Postgres, so
-- uniqueness for employee_id is preserved among rows that do have a value.
alter table users alter column employee_id drop not null;
alter table users alter column designation_id drop not null;

-- Preserves the real source "Resign Date" field instead of discarding it or
-- misusing deleted_at as a substitute (manifest §5).
alter table users add column resign_date date;
