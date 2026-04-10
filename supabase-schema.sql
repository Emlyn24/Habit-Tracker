-- ─────────────────────────────────────────────────────────────────────────────
-- Habit Tracker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- habits
create table public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  description   text not null default '',
  reminder_time text,
  created_at    date not null default current_date,
  sort_order    integer not null default 0
);
alter table public.habits enable row level security;
create policy "habits: own rows only"
  on public.habits for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- completions
create table public.completions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  habit_id       uuid references public.habits(id) on delete cascade not null,
  completed_date date not null,
  unique (habit_id, completed_date)
);
alter table public.completions enable row level security;
create policy "completions: own rows only"
  on public.completions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- indexes
create index habits_user_idx      on public.habits     (user_id);
create index completions_user_idx on public.completions (user_id);
create index completions_date_idx on public.completions (user_id, completed_date);
