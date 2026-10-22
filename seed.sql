-- ============================================================================
-- HelpDesk Lite - fictional sample tickets
-- Run this file SECOND, after schema.sql. All names and issues are FICTIONAL.
--
-- It only adds the tickets when the table is empty, so running it twice will
-- not create duplicates. The database numbers them 1 to 5 (HD-0001 to HD-0005),
-- in the same order as src/data/sampleTickets.js.
-- ============================================================================

insert into public.tickets (name, category, description, status, created_at, updated_at)
select v.name, v.category, v.description, v.status, v.created_at, v.updated_at
from (
  values
    (1, 'Jordan Ellis', 'Password / Account',
     'I cannot log in to my sample student portal account after the last password reset. It says the credentials are invalid.',
     'Open', '2026-10-12T09:15:00Z'::timestamptz, '2026-10-12T09:15:00Z'::timestamptz),

    (2, 'Priya Raman', 'Network / Wi-Fi',
     'The Wi-Fi in the sample library annex keeps disconnecting every few minutes while I am on a video call.',
     'In Progress', '2026-10-13T14:40:00Z'::timestamptz, '2026-10-14T10:05:00Z'::timestamptz),

    (3, 'Marcus Webb', 'Hardware',
     'My sample office laptop will not turn on. The charging light blinks twice and then stops.',
     'Resolved', '2026-10-09T11:00:00Z'::timestamptz, '2026-10-11T16:30:00Z'::timestamptz),

    (4, 'Sofia Alvarez', 'Software',
     'The sample spreadsheet application crashes whenever I try to open a file larger than 10 MB.',
     'Open', '2026-10-15T08:20:00Z'::timestamptz, '2026-10-15T08:20:00Z'::timestamptz),

    (5, 'Daniel Okafor', 'Printer',
     'The sample department printer shows an offline status on my computer but is working for others.',
     'In Progress', '2026-10-16T13:10:00Z'::timestamptz, '2026-10-16T15:45:00Z'::timestamptz)
) as v(sort_order, name, category, description, status, created_at, updated_at)
where not exists (select 1 from public.tickets)
order by v.sort_order;
