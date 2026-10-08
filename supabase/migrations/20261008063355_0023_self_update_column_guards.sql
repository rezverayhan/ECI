-- A General User may update their own `users` row (RLS allows it so they can
-- edit their personal profile), but only specific columns. Everything
-- organization-controlled (Backend Schema §53) must stay locked even on their
-- own row. IT Administrators bypass this check entirely.
create or replace function public.enforce_users_self_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_it_administrator() then
    return new;
  end if;

  if new.employee_id is distinct from old.employee_id
     or new.user_id is distinct from old.user_id
     or new.official_email is distinct from old.official_email
     or new.designation_id is distinct from old.designation_id
     or new.department_id is distinct from old.department_id
     or new.manager_id is distinct from old.manager_id
     or new.join_date is distinct from old.join_date
     or new.employment_status is distinct from old.employment_status
     or new.access_level is distinct from old.access_level
     or new.is_active is distinct from old.is_active
     or new.deleted_at is distinct from old.deleted_at
     or new.auth_user_id is distinct from old.auth_user_id
     or new.created_at is distinct from old.created_at
  then
    raise exception 'This field is organization-controlled. Contact IT if it needs to change.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger trg_users_enforce_self_update
  before update on users
  for each row
  execute function enforce_users_self_update();

-- A user updating their own notification may only toggle is_read/read_at,
-- never rewrite the title/message/type of their own notification record.
create or replace function public.enforce_notifications_self_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.recipient_user_id is distinct from old.recipient_user_id
     or new.notification_type is distinct from old.notification_type
     or new.title is distinct from old.title
     or new.message is distinct from old.message
     or new.related_entity_type is distinct from old.related_entity_type
     or new.related_entity_id is distinct from old.related_entity_id
     or new.created_at is distinct from old.created_at
  then
    raise exception 'Only the read status of a notification can be changed.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger trg_notifications_enforce_self_update
  before update on notifications
  for each row
  execute function enforce_notifications_self_update();
