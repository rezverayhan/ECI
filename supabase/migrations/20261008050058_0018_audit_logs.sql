create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_actor_user_id on audit_logs(actor_user_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_action on audit_logs(action);
create index idx_audit_logs_created_at on audit_logs(created_at);

alter table audit_logs enable row level security;

-- Audit records are never updated or deleted through normal application use.
revoke update, delete on audit_logs from authenticated, anon;
