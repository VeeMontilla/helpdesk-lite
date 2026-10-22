# HelpDesk Lite: Supabase setup

This folder holds the SQL files and instructions for the database and technician sign-in.

**Status**
- Part 1 (create the table, add sample tickets) was run by the project owner in Supabase.
- Part 2 (sign-in, access rules, connecting the app) is written but **has not been tested against a real
  Supabase project yet**. Do not treat the integration as working until you have finished the checklist
  in Step 11 and recorded what you actually saw.

| File | What it does | Run order |
|------|--------------|-----------|
| `schema.sql` | Creates the `tickets` table, its rules, the "last updated" trigger, and turns on Row Level Security | 1st (done) |
| `seed.sql` | Adds the 5 fictional sample tickets (only if the table is empty) | 2nd (done) |
| `access_policies.sql` | Creates the technician list, and the rules that let only technicians read, create and update tickets. Nobody can delete | 3rd |
| `add_technician.sql` | Puts your demo user accounts on the technician list | 4th, after you create the users |
| `alternative/policies_without_technician_list.sql` | **Do not run.** A different, simpler set of access rules (see the note at the bottom) | never together with `access_policies.sql` |

## Words you will see

- **Row Level Security (RLS)**: a lock on a table. The rules ("policies") say who may read or change rows.
- **Publishable key**: a public key the website uses to talk to Supabase. It is safe to be in the website because the access rules protect the data.
- **Secret key / `service_role` key / database password**: powerful. They bypass every rule. **Never** put them in this project, in GitHub, in `.env.local`, or in a chat.
- **Technician list**: a small table (`technicians`) of people allowed to use the app. Having a Supabase account is not enough; you must also be on this list.

---

# Part 1: Database table (already done)

Run `schema.sql`, then `seed.sql` in the Supabase **SQL Editor**: open a new query, paste the whole file, click **Run**. Both are safe to run again. Check the **Table Editor** shows 5 rows in `tickets`. You can also run this in the SQL Editor to see the IDs the app will display (expect HD-0001 to HD-0005):

```sql
select 'HD-' || lpad(ticket_number::text, 4, '0') as ticket_id, name, category, status
from public.tickets
order by ticket_number;
```

---

# Part 2: Sign-in, access rules, and connecting the app

Do these steps in order. Stop and send me the exact message if any step shows an error.

## Step 5: Run `access_policies.sql`

1. In Supabase, open the **SQL Editor** and start a **new query**.
2. Copy all of `supabase/access_policies.sql`, paste it, and click **Run**.
3. Expected: a success message such as **Success. No rows returned.**
4. Supabase may warn about statements that change permissions. This file only removes and sets *permissions*. It has no `drop`, `delete` or `truncate` commands, so it cannot remove tickets or tables.
5. **Run this file only once.** If you run it again, you will see an error saying a policy "already exists". That only means it was already applied.

What it sets up:
- Signed-in technicians can read tickets, create tickets (name, category, description only), and change a ticket's status.
- Nobody can delete tickets, or edit a ticket's name, category or description after it is created.
- People who are not signed in cannot see or change anything.

## Step 6: Turn off public sign-ups

Without this, anyone who finds your site could create an account.

1. In Supabase, open **Authentication**.
2. Open the **Sign In / Providers** settings (older projects may call this **Providers** or **Settings**).
3. Find the switch **Allow new users to sign up** and turn it **off**. Save if there is a Save button.

(The setting name comes from Supabase's documentation. The exact place in the menu may differ.)

## Step 7: Create your demo technician accounts

1. Open **Authentication**, then **Users**.
2. Click **Add user**.
3. Choose the option to **create a new user** with an email and password. If you see a checkbox like **Auto Confirm User**, tick it, so no email needs to be clicked.
4. Create one or two demo users. Use strong, unique passwords and keep them in a password manager. **Never save these passwords in the project or on GitHub.**
5. Note the exact email you used for each.

If the only option you see is **Send invitation**, that is a different route: the person clicks an emailed link and chooses a password. Tell me what you see and we will adjust. I could not confirm the exact button names from Supabase's documentation, so they may differ.

## Step 8: Put the demo users on the technician list

1. Open `supabase/add_technician.sql`.
2. Replace the two example emails (`demo.technician1@example.com` and `demo.technician2@example.com`) with your demo users' exact emails. Keep the single quotes and the comma between emails. Delete a line if you only created one user.
3. Paste the whole file into a new SQL Editor query and click **Run**.
4. Expected: a small table listing every account with `is_technician` = **true** for the demo users you added.

You can run this file again whenever you add another demo user.

## Step 9: Copy your project URL and publishable key

1. In Supabase, open **Settings**, then **API Keys**. (You can also use the **Connect** button at the top of the project.)
2. Copy the **Project URL** (it looks like `https://abcdefghijkl.supabase.co`).
3. Copy the **Publishable key** (it starts with `sb_publishable_`).
4. Do **not** copy the **Secret** key or the `service_role` key.

## Step 10: Give the two values to the app

1. In the `helpdesk-lite` folder, make a copy of `.env.example` and name the copy `.env.local`. (This hidden-style file name is correct. It must start with a dot.)
2. Open `.env.local` in any text editor and replace the two placeholder values with the ones from Step 9:

```
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxx
```

3. Save the file. `.env.local` is ignored by Git, so it will not be uploaded to GitHub.

The app checks these values when it starts. It refuses to run, and shows a setup screen, if a value is missing, still a placeholder, or looks like a secret key.

## Step 11: Install, run, and test with your real project

1. In a terminal inside `helpdesk-lite`, run `npm install` (this downloads the Supabase library, which is new in this version).
2. Run `npm run dev` and open the address it prints (usually `http://localhost:5173`).
3. Work through this checklist and write down what you actually see, with the date.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Open the app | The **Technician sign-in** page, with no tickets visible |
| 2 | Enter a wrong password | A message that the email or password is incorrect |
| 3 | Sign in with a demo technician | The dashboard with 5 tickets (HD-0001 to HD-0005) and counts Open 2, In Progress 2, Resolved 1 |
| 4 | Click **New ticket**, submit with nothing filled in | Three validation messages |
| 5 | Fill in the form and submit | A green confirmation with the next ticket ID (for example HD-0006), then its detail page showing Open |
| 6 | Change the status to **In Progress**, then **Resolved** | A confirmation each time, and the status badge changes |
| 7 | Go back to the dashboard and refresh the browser | The new ticket is listed, and you are still signed in |
| 8 | In Supabase **Table Editor**, open `tickets` | The new ticket and its latest status are there. This confirms the data is really in the database |
| 9 | Click **Sign out** | Back to the sign-in page with no tickets on screen |
| 10 | Create a third Supabase user but do **not** add it to the technician list; sign in with it | A "Not set up as a technician" screen and no tickets |
| 11 | In a private/incognito window, open the app without signing in | Only the sign-in page. No tickets |

Test 10 and 11 prove the access rules work. If either shows tickets, stop and tell me.

If something goes wrong:
- **"Supabase setup needed" screen**: `.env.local` is missing, still has placeholders, or was edited while the app was running. Fix it, then stop and restart `npm run dev`.
- **"The email or password is incorrect"**: check the exact email and password you created in Step 7.
- **"Not set up as a technician"**: the account is not on the list. Re-run `add_technician.sql` with the right email (Step 8).
- **Dashboard is empty after signing in**: run the query in Step 4 of Part 1 to confirm the 5 rows exist, and confirm Step 5 ran without error.
- **"You do not have permission"**: Step 5 or Step 8 was skipped.

## Step 12 (later, at deployment): Vercel

When we deploy, you will add the same two values (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) in the Vercel project's **Environment Variables** settings. Do not put them, or any secret, in the code. We will do this as a separate step.

---

## Things to know

- **Public ticket submission is off.** Because only signed-in technicians can create tickets, end users cannot submit tickets from the website. A technician enters the ticket for them. If you want a public form later, that needs a separate, carefully limited design.
- **Anyone you add as a technician can change any ticket's status.** There are no per-technician permissions.
- **Ticket numbers can skip.** A failed insert still uses up a number, so you may see HD-0006 followed by HD-0008.
- **Passwords and keys:** keep demo passwords in a password manager. If you ever paste a secret key or the database password anywhere public by mistake, rotate it in Supabase immediately.
- **Why a technician list?** If sign-ups were ever switched on by accident, a stranger could create an account. Without the list, that account could read your tickets. With it, they get nothing.

## About the file in `alternative/`

While building this phase, a second, simpler set of access rules was found in the project (`policies.sql`). It lets **any** signed-in account use tickets and relies only on sign-ups being switched off. It has been moved to `alternative/policies_without_technician_list.sql` unchanged, not deleted. **Do not run both files.** The rules combine, and the simpler one would cancel out the technician list.
