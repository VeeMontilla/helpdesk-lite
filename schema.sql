-- ============================================================================
-- HelpDesk Lite - database structure (schema)
-- Run this file FIRST in the Supabase SQL Editor.
--
-- It is safe to run more than once: it will not delete tickets. It will also
-- not change a table that already exists, so if you edit the table design
-- later, ask for a separate "migration" instead of re-running this file.
-- ============================================================================

-- 1. The tickets table ---------------------------------------------------------
create table if not exists public.tickets (
  -- The real, permanent key. The database makes it. Never shown to users.
  id            uuid        primary key default gen_random_uuid(),

  -- A counter the database fills in (1, 2, 3, ...). The app will show it as
  -- HD-0001, HD-0002, ... The "HD-" text is NOT stored, only the number.
  ticket_number bigint      generated always as identity unique,

  name          text        not null,
  category      text        not null,
  description   text        not null,
  status        text        not null default 'Open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Rules the database enforces. They match the rules in src/lib/ticketLogic.js.
  -- If you change CATEGORIES, STATUSES or LIMITS there, change them here too.
  constraint tickets_name_length check (char_length(btrim(name)) between 1 and 60),
  constraint tickets_category_valid check (category in (
    'Password / Account', 'Network / Wi-Fi', 'Hardware', 'Software',
    'Printer', 'Email', 'Other'
  )),
  constraint tickets_description_length check (char_length(btrim(description)) between 10 and 1000),
  constraint tickets_status_valid check (status in ('Open', 'In Progress', 'Resolved'))
);

-- 2. An index so "newest tickets first" stays fast ---------------------------------
create index if not exists tickets_created_at_idx
  on public.tickets (created_at desc);

-- 3. Automatically refresh "last updated" whenever a ticket changes ------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- 4. Security: Row Level Security (RLS) ---------------------------------------------
-- RLS ON + NO policies = the public website key cannot read or change any row.
-- That is intentional for now. We still need to decide on safe access before
-- deployment, and the policies will be added then, as a separate step.
-- The Supabase SQL Editor and Table Editor are not affected by this.
alter table public.tickets enable row level security;
