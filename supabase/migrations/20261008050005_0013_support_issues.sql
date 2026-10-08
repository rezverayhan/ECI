create sequence support_issue_number_seq;

create table support_issues (
  id uuid primary key default gen_random_uuid(),
  issue_number text not null unique
    default ('IT-' || lpad(nextval('support_issue_number_seq')::text, 5, '0')),
  user_id uuid not null references users(id),
  title text not null,
  category support_category_enum not null,
  description text,
  priority support_priority_enum not null default 'medium',
  status support_status_enum not null default 'submitted',
  assigned_to uuid references users(id),
  submitted_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  started_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  resolution text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter sequence support_issue_number_seq owned by support_issues.issue_number;

create trigger trg_support_issues_updated_at
  before update on support_issues
  for each row execute function set_updated_at();

-- Resolution duration is always derived from resolved_at - submitted_at
-- (Backend Schema §28), never manually entered. This trigger auto-stamps the
-- lifecycle timestamps as status transitions, which also prevents the
-- inconsistent states called out in §57 (e.g. status=resolved with no
-- resolved_at) without rejecting the update.
create or replace function stamp_support_issue_status_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'acknowledged' and old.acknowledged_at is null then
    new.acknowledged_at := now();
  end if;

  if new.status = 'in_progress' and new.started_at is null then
    new.started_at := now();
  end if;

  if new.status = 'resolved' and new.resolved_at is null then
    new.resolved_at := now();
  end if;

  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
    if new.resolved_at is null then
      new.resolved_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_support_issues_status_timestamps
  before update of status on support_issues
  for each row
  when (new.status is distinct from old.status)
  execute function stamp_support_issue_status_timestamps();

create index idx_support_issues_user_id on support_issues(user_id);
create index idx_support_issues_status on support_issues(status);
create index idx_support_issues_priority on support_issues(priority);
create index idx_support_issues_category on support_issues(category);
create index idx_support_issues_assigned_to on support_issues(assigned_to);
create index idx_support_issues_submitted_at on support_issues(submitted_at);

alter table support_issues enable row level security;
