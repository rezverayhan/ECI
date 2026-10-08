-- A General User can only ever see support_issues rows where they are the
-- submitter. There is no path — direct query, changed ID, or otherwise —
-- to read another user's issue (Task 02 Case 2/3). General Manager gets
-- read-only visibility across all issues (PRD §13.4); Admin gets none
-- (explicitly out of scope per Task 02 §9).
create policy support_issues_select on support_issues
  for select to authenticated using (
    user_id = current_user_id()
    or is_it_administrator()
    or is_general_manager()
  );

-- A General User submits their own issue. IT Administrators may also file
-- one on a user's behalf from that user's Employee 360 page (App Flow §23).
create policy support_issues_insert on support_issues
  for insert to authenticated with check (
    user_id = current_user_id() or is_it_administrator()
  );

-- Status, assignment, priority and resolution are IT-operational fields;
-- General Managers can view but never act (PRD §13.4 "Cannot: Change issue
-- status"), so no UPDATE policy exists for them (Task 02 Case 8).
create policy support_issues_update on support_issues
  for update to authenticated
  using (is_it_administrator())
  with check (is_it_administrator());

create policy support_issues_delete on support_issues
  for delete to authenticated using (is_it_administrator());

-- Internal notes are a genuinely separate table (migration 0022) so that
-- "General Users must never retrieve internal IT notes" is enforced by
-- Postgres, not by the frontend choosing not to render a column. General
-- Managers are also excluded: PRD §21/§483 treat internal operational
-- detail and resolution-performance information as IT-side only.
create policy support_issue_internal_notes_all on support_issue_internal_notes
  for all to authenticated
  using (is_it_administrator())
  with check (is_it_administrator());

-- Timeline entries: IT sees everything. General Managers and the issue's own
-- submitter see only entries NOT marked internal. Nobody sees another user's
-- issue timeline at all.
create policy support_issue_updates_select on support_issue_updates
  for select to authenticated using (
    is_it_administrator()
    or (
      not is_internal
      and (
        is_general_manager()
        or exists (
          select 1 from support_issues si
          where si.id = support_issue_updates.issue_id
            and si.user_id = current_user_id()
        )
      )
    )
  );

-- Append-only history: only IT writes entries; nobody updates or deletes
-- them (consistent with audit_logs' immutability — no update/delete policy
-- exists at all, so both are denied by default).
create policy support_issue_updates_insert on support_issue_updates
  for insert to authenticated with check (is_it_administrator());

-- Attachments: the submitter can read/upload on their own issue; IT and GM
-- get the same visibility as the parent issue.
create policy support_issue_attachments_select on support_issue_attachments
  for select to authenticated using (
    is_it_administrator()
    or is_general_manager()
    or exists (
      select 1 from support_issues si
      where si.id = support_issue_attachments.issue_id
        and si.user_id = current_user_id()
    )
  );
create policy support_issue_attachments_insert on support_issue_attachments
  for insert to authenticated with check (
    is_it_administrator()
    or exists (
      select 1 from support_issues si
      where si.id = support_issue_attachments.issue_id
        and si.user_id = current_user_id()
    )
  );
create policy support_issue_attachments_delete on support_issue_attachments
  for delete to authenticated using (is_it_administrator());
