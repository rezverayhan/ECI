-- storage.objects has RLS enabled but had ZERO policies at all (verified via
-- pg_policies) — meaning the it-support-attachments bucket was completely
-- non-functional from the client (default-deny), not insecure. These policies
-- mirror the existing support_issue_attachments TABLE RLS exactly: the requester
-- can access their own issue's files, IT Admin has full access, General Manager
-- gets read-only visibility (matching support_issues_select), nobody else.
-- Upload path convention: {issue_id}/{filename}.

create policy "it_support_attachments_select" on storage.objects
for select to authenticated
using (
  bucket_id = 'it-support-attachments'
  and (
    public.is_it_administrator()
    or public.is_general_manager()
    or exists (
      select 1 from support_issues si
      where si.id::text = (storage.foldername(name))[1]
        and si.user_id = public.current_user_id()
    )
  )
);

create policy "it_support_attachments_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'it-support-attachments'
  and (
    public.is_it_administrator()
    or exists (
      select 1 from support_issues si
      where si.id::text = (storage.foldername(name))[1]
        and si.user_id = public.current_user_id()
    )
  )
);

create policy "it_support_attachments_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'it-support-attachments'
  and public.is_it_administrator()
);
