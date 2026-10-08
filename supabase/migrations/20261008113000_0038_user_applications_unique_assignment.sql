-- user_applications has no assignment_status/history column (every row IS the
-- current assignment), so a plain UNIQUE constraint — not a partial index — is the
-- correct guard against the same user being granted the same application twice.
-- Table is empty (0 rows) at the time of this migration, so this is zero-risk.
create unique index uq_user_applications_user_application
  on user_applications (user_id, application_id);
