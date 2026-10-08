-- Extensions required by the schema
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists btree_gist;

-- Enumerated vocabularies (Phase 4 Content Guidelines + Phase 5 Backend Schema)
create type employment_status_enum as enum ('active', 'inactive', 'resigned');

-- Internal access classification used by RLS and server-side authorization.
-- This is NOT a user-editable role/permission system (explicitly forbidden by
-- PRD §9 / Backend Schema §2) — it is a fixed, non-configurable enum with
-- exactly the four approved access categories.
create type access_level_enum as enum ('it_administrator', 'general_manager', 'admin', 'general_user');

create type device_type_enum as enum ('laptop', 'desktop', 'tablet', 'other');
create type asset_status_enum as enum ('assigned', 'available', 'under_service', 'returned', 'retired');
create type service_type_enum as enum ('repair', 'maintenance', 'diagnostic', 'upgrade', 'other');
create type service_status_enum as enum ('open', 'in_progress', 'completed', 'cancelled');
create type ip_status_enum as enum ('free', 'assigned', 'reserved', 'unavailable');
create type ip_phone_status_enum as enum ('active', 'inactive');
create type assignment_state_enum as enum ('active', 'ended');
create type license_status_enum as enum ('active', 'upcoming', 'due', 'expired');
create type support_category_enum as enum (
  'laptop_computer', 'network_lan', 'internet', 'ip_address', 'ip_phone',
  'software', 'access', 'hardware', 'printer_peripheral', 'other'
);
create type support_priority_enum as enum ('low', 'medium', 'high', 'urgent');
create type support_status_enum as enum (
  'submitted', 'acknowledged', 'in_progress', 'waiting_on_hold', 'resolved', 'closed'
);
create type resource_status_enum as enum ('available', 'unavailable', 'maintenance');
create type booking_status_enum as enum ('confirmed', 'pending', 'paused', 'cancelled', 'denied', 'completed');

-- Generic "updated_at" maintenance trigger used by every table below.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
