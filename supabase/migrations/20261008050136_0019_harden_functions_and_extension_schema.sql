alter function set_updated_at() set search_path = '';
alter function stamp_support_issue_status_timestamps() set search_path = '';

alter extension btree_gist set schema extensions;
