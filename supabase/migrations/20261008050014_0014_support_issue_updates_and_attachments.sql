create table support_issue_updates (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references support_issues(id),
  actor_user_id uuid references users(id),
  update_type text not null,
  old_status support_status_enum,
  new_status support_status_enum,
  comment text,
  created_at timestamptz not null default now()
);

create index idx_support_issue_updates_issue_id on support_issue_updates(issue_id);

alter table support_issue_updates enable row level security;

create table support_issue_attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references support_issues(id),
  storage_path text not null,
  file_name text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now()
);

create index idx_support_issue_attachments_issue_id on support_issue_attachments(issue_id);

alter table support_issue_attachments enable row level security;
