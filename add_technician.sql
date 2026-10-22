-- ============================================================================
-- HelpDesk Lite - add demo technicians to the allowed list
-- Run this AFTER you have created the demo user accounts in Supabase
-- (Authentication > Users) and AFTER access_policies.sql.
--
-- BEFORE YOU RUN IT: replace the two example emails below with the exact emails
-- of the demo users you created. Keep the single quotes and the comma.
-- It is safe to run again whenever you add another demo user.
-- ============================================================================

insert into public.technicians (user_id)
select id
from auth.users
where email in (
  'demo.technician1@example.com',
  'demo.technician2@example.com'
)
on conflict (user_id) do nothing;

-- Check: every account and whether it is on the technician list.
-- Expect "true" for each demo technician you just added.
select u.email,
       (t.user_id is not null) as is_technician
from auth.users u
left join public.technicians t on t.user_id = u.id
order by u.email;
