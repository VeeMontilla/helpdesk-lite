-- ============================================================================
-- HelpDesk Lite - who may use the tickets table
-- Run this file THIRD, after schema.sql and seed.sql.
--
-- The rule: only signed-in users who are on the "technicians" list may read
-- tickets, create tickets, or change a ticket's status. Nobody can delete.
-- Visitors who are not signed in (the "anon" role) get no access at all.
--
-- This file contains no DROP, DELETE or TRUNCATE commands, so it cannot remove
-- tickets or tables. Run it ONCE. If you run it a second time, Supabase will
-- stop with an error like: policy "technicians can read tickets" ... already
-- exists. That only means it was already applied. Nothing is damaged.
-- ============================================================================

-- 1. The technician list ----------------------------------------------------------
-- One row per person allowed to use the app. You add rows with add_technician.sql.
create table if not exists public.technicians (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Locked down: nobody can read or change this list through the website.
-- You manage it from the Supabase SQL Editor, which is not affected by this.
alter table public.technicians enable row level security;
revoke all on table public.technicians from anon, authenticated;

-- 2. A question the app and the policies can ask: "is the current user a technician?" --
-- It only ever answers about the person who is asking. It cannot list anyone else.
create or replace function public.is_technician()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.technicians where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_technician() from public, anon, authenticated;
grant execute on function public.is_technician() to authenticated;

-- 3. What the signed-in role is allowed to touch on the tickets table -------------------
-- First remove every default permission, then give back only what is needed.
revoke all on table public.tickets from anon, authenticated;

grant usage on schema public to authenticated;
grant select on table public.tickets to authenticated;
-- Creating a ticket may only set these three fields. The database fills in the
-- ID, ticket number, "Open" status and timestamps itself.
grant insert (name, category, description) on table public.tickets to authenticated;
-- Updating a ticket may only change its status ("last updated" is set by the trigger).
grant update (status) on table public.tickets to authenticated;
-- There is no DELETE permission for anyone, so tickets cannot be deleted from the app.

-- 4. The Row Level Security policies -----------------------------------------------------
-- (Row Level Security was already turned on in schema.sql.)
-- Note there is no policy for the "anon" role and none for DELETE.
create policy "technicians can read tickets"
  on public.tickets for select
  to authenticated
  using ((select public.is_technician()));

create policy "technicians can create tickets"
  on public.tickets for insert
  to authenticated
  with check ((select public.is_technician()));

create policy "technicians can update tickets"
  on public.tickets for update
  to authenticated
  using ((select public.is_technician()))
  with check ((select public.is_technician()));
