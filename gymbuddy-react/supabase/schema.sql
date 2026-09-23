-- GymBuddy accounts schema.
--
-- Run this once in the Supabase dashboard: Project -> SQL Editor -> New query
-- -> paste this whole file -> Run. See README.md "Supabase setup" for the
-- full step-by-step (creating the project, enabling providers, etc).
--
-- Design notes:
-- - Every row is scoped to auth.uid() via Row Level Security — a user can
--   only ever read or write their own profile/workouts, enforced by
--   Postgres itself, not just by app code.
-- - profiles.id and workouts.user_id both reference auth.users(id) with
--   ON DELETE CASCADE, so deleting the auth user (see delete_user() below)
--   automatically removes their profile and every workout row too — no
--   separate cleanup needed.
-- - workouts has a UNIQUE (user_id, date) constraint. This is what makes
--   the client's "upload local history, merging by date without
--   duplicates" sync an upsert: re-uploading the same date just updates
--   that row instead of creating a second one. One workout per calendar
--   date per user, matching how the app already works (it won't start a
--   second session on a day that already has a finished one).

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  age integer,
  goal text,
  equipment text[] not null default '{}',
  weekly_target integer,
  label_style text,
  created_at timestamptz not null default now()
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  "group" text,
  -- One entry per exercise: { id, effort, sets: [{ reps, weight, completedAt }] }.
  -- effort is per-exercise (one rating per exercise, not per set) — that's
  -- how the app itself models it; swap history and bonus-tip unlocks are
  -- deliberately not synced, this is progress data, not a full activity log.
  exercises jsonb not null default '[]',
  duration integer,
  feel text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists workouts_user_id_idx on workouts (user_id);
create index if not exists workouts_date_idx on workouts (date);

alter table profiles enable row level security;
alter table workouts enable row level security;

create policy "profiles: read own" on profiles for select using (auth.uid() = id);
create policy "profiles: insert own" on profiles for insert with check (auth.uid() = id);
create policy "profiles: update own" on profiles for update using (auth.uid() = id);
create policy "profiles: delete own" on profiles for delete using (auth.uid() = id);

create policy "workouts: read own" on workouts for select using (auth.uid() = user_id);
create policy "workouts: insert own" on workouts for insert with check (auth.uid() = user_id);
create policy "workouts: update own" on workouts for update using (auth.uid() = user_id);
create policy "workouts: delete own" on workouts for delete using (auth.uid() = user_id);

-- Lets a signed-in user delete their OWN auth account (and, via the
-- cascades above, their profile and workouts) from the client with just the
-- anon key — no service-role key needed anywhere. security definer runs
-- with the privileges of the function's owner (which can write to
-- auth.users), but the `where id = auth.uid()` restricts it to the caller's
-- own row regardless of who owns the function.
create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function delete_user() from public;
grant execute on function delete_user() to authenticated;
