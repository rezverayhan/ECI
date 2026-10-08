-- RLS is row-level, not column-level: a single `support_issues` row visible
-- to its submitter would also expose `internal_notes` to that same SELECT.
-- To make "General Users must never retrieve internal IT notes" actually
-- enforced by the database (not just hidden by the frontend), internal notes
-- move into their own table with its own, stricter RLS policy.
create table support_issue_internal_notes (
  issue_id uuid primary key references support_issues(id),
  internal_notes text,
  updated_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_support_issue_internal_notes_updated_at
  before update on support_issue_internal_notes
  for each row execute function set_updated_at();

alter table support_issue_internal_notes enable row level security;

alter table support_issues drop column internal_notes;

-- Lets IT mark individual timeline entries as internal-only (diagnostic
-- comments) versus visible to the submitting user (status changes). Required
-- for support_issue_updates RLS to distinguish the two (Task 02 §10).
alter table support_issue_updates
  add column is_internal boolean not null default false;
