-- notifications_update RLS allows a recipient to UPDATE their own row, but with no
-- column-level restriction — a crafted request could rewrite title/message/
-- notification_type/related_entity_id on an owned row. Mirrors the existing
-- enforce_users_self_update() pattern exactly: non-admins may only ever change
-- is_read/read_at, nothing else. (In practice this wasn't independently exploitable
-- since related_entity access is still separately RLS-gated, but it's the real,
-- minimal DB-level fix rather than relying on "the app only ever sends two fields.")
create or replace function public.enforce_notifications_recipient_update()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if public.is_it_administrator() then
    return new;
  end if;

  if new.recipient_user_id is distinct from old.recipient_user_id
     or new.notification_type is distinct from old.notification_type
     or new.title is distinct from old.title
     or new.message is distinct from old.message
     or new.related_entity_type is distinct from old.related_entity_type
     or new.related_entity_id is distinct from old.related_entity_id
     or new.created_at is distinct from old.created_at
  then
    raise exception 'Only the read state of a notification can be changed.'
      using errcode = '42501';
  end if;

  return new;
end;
$function$;

create trigger trg_notifications_enforce_recipient_update
  before update on public.notifications
  for each row
  execute function public.enforce_notifications_recipient_update();

-- Realtime was not configured for any table (supabase_realtime publication was
-- empty). Adding notifications only — RLS still applies to Realtime changefeeds,
-- so a recipient only ever receives their own rows.
alter publication supabase_realtime add table public.notifications;
