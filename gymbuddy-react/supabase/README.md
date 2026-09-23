# Supabase setup

GymBuddy works fully without this — signed out, everything saves to
localStorage exactly as before. This turns on optional accounts (Google
sign-in + email magic link) and cross-device workout sync, on Supabase's
free tier.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Pick an organization, name it (e.g. `gymbuddy`), set a database password
   (save it somewhere — you won't need it for anything in this app, but
   Supabase asks), pick a region close to your users, and choose the
   **Free** plan.
3. Wait for it to finish provisioning (a minute or two).

## 2. Run the schema

1. In the project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it
   in, and click **Run**.
3. This creates the `profiles` and `workouts` tables with Row Level
   Security (a user can only ever read/write their own rows — enforced by
   Postgres, not just app code), indexes on `user_id` and `date`, and a
   `delete_user()` function a signed-in user can call on themselves to
   delete their account (which cascades to delete their profile and every
   workout row too).

## 3. Enable the auth providers

Go to **Authentication → Providers**.

**Email (magic link)** is on by default. Optional but recommended: go to
**Authentication → Emails** and customize the "Magic Link" template so it
doesn't look like raw Supabase boilerplate — not required for it to work.

**Google:**

1. In **Authentication → Providers**, find **Google**, toggle it on — this
   panel shows you the **Callback URL** you need for step 2 (it looks like
   `https://<your-project-ref>.supabase.co/auth/v1/callback`).
2. In a separate tab, go to the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   create a project (or pick an existing one) → **Create Credentials →
   OAuth client ID** → Application type **Web application**.
3. Under **Authorized redirect URIs**, paste the Callback URL from step 1.
4. Google gives you a **Client ID** and **Client Secret** — paste both back
   into the Google provider panel in Supabase, then **Save**.
5. (First time using OAuth in this Google Cloud project? It'll also ask you
   to configure an **OAuth consent screen** — app name, your email, and
   scopes; the default scopes are fine, you don't need to request anything
   beyond email/profile.)

**Do not enable Phone/SMS** — that's a paid Twilio-backed add-on on
Supabase, which is why this app only offers Google + email.

## 4. Get the two values for Vercel

In the Supabase dashboard: **Project Settings → API**.

| Copy this | Paste into Vercel as |
|---|---|
| **Project URL** | `VITE_SUPABASE_URL` |
| **anon / public** key (not the `service_role` key — never expose that one) | `VITE_SUPABASE_ANON_KEY` |

## 5. Set them in Vercel

1. Vercel dashboard → your GymBuddy project → **Settings → Environment
   Variables**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the values from
   step 4. Apply to Production (and Preview/Development too, if you want
   those to have accounts as well).
3. Redeploy (env var changes don't apply to already-built deployments —
   trigger a new deploy, or just push a commit).
4. For local dev: copy `.env.example` to `.env.local` in `gymbuddy-react/`
   and fill in the same two values there.

## 6. Point Supabase at your real URL

Auth redirects (the magic link, and Google's callback) need Supabase to
know your app's real URL, not just `localhost`.

Go to **Authentication → URL Configuration**:

- **Site URL**: your production URL, e.g. `https://gymbuddy-snowy.vercel.app`
- **Redirect URLs**: add `https://gymbuddy-snowy.vercel.app/app` (and
  `http://localhost:5173/app` / whatever port `vite dev` uses, for local
  testing)

Without this step, sign-in will still start but the redirect back into the
app after clicking Google/the magic link will fail or land on the wrong
domain.

## That's it

Once the env vars are set and the project redeploys, `/app` will show the
sign-in screen right after onboarding, and Settings → Account will offer
sign-in/sign-out and "Delete my account and data" for existing users. Until
you do this, both screens detect the missing config and just say accounts
aren't set up yet — nothing breaks.

## What wasn't (and couldn't be) tested here

This was built and tested against the **signed-out** path fully (that's
everything not gated by a Supabase project existing), and the pull/merge
logic has unit tests (`src/lib/cloudSync.test.ts`) covering the "upload
local history, merge by date, no duplicates" behavior in isolation. Real
Google sign-in, real magic-link email delivery, and a real
offline-then-online sync against a live database need a live Supabase
project to verify end to end — there wasn't one available while building
this. Worth manually checking once you've done the steps above:

- Sign in with Google, then Settings should show your email and "Sign out".
- Request a magic link, receive the email, click it, land back in the app
  signed in.
- Finish a workout while signed in, check the `workouts` table in Supabase's
  **Table Editor** shows the row.
- Go offline (airplane mode), finish a workout, come back online — check
  that workout shows up in the table too (may take a moment after the
  `online` browser event fires).
- Sign in on a second device/browser with existing history on both — check
  both sets of workouts show up on both after sign-in (merge, not overwrite).
- Settings → "Delete my account and data" — check the `profiles` and
  `workouts` rows are actually gone from the Table Editor, and that signing
  in with the same Google account afterward creates a fresh account (not
  the old data back).
