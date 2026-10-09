-- Known schema gap from the original 79-user import: source had "IP Phone IP" per
-- employee, but ip_phones had no field to hold it, so those values were never
-- persisted anywhere (confirmed again now: column genuinely absent). Nullable —
-- the original source file no longer exists on disk to backfill historical values,
-- so this column starts empty for all 59 existing phones. It is kept on ip_phones
-- (the phone record), never on users or ip_addresses, preserving the existing
-- separation between a phone's own IP and a user's machine IP.
alter table ip_phones add column ip_address inet;
