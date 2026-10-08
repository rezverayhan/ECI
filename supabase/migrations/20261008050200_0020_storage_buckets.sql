insert into storage.buckets (id, name, public)
values
  ('it-support-attachments', 'it-support-attachments', false),
  ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;
