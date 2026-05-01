-- ============================================================
-- StudentXOrb Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── 1. Colleges ───────────────────────────────────────────────────────
create table if not exists colleges (
  id            text primary key default gen_random_uuid()::text,
  aishe_code    text,
  name          text not null,
  state         text,
  district      text,
  website       text,
  year_est      text,
  location      text,       -- Urban / Rural
  college_type  text,       -- Affiliated College / Constituent College / etc.
  management    text,       -- Government / Private / etc.
  university_code text,
  university_name text,
  university_type text,
  -- Derived fields used by the journey UI
  ownership     text,
  type          text,
  context_tag   text default 'A path worth exploring',
  tier          text default 'fit',
  vibe          text[] default '{}',
  created_at    timestamptz default now()
);

-- ── 2. Universities ───────────────────────────────────────────────────
create table if not exists universities (
  id         text primary key default gen_random_uuid()::text,
  aishe_code text,
  name       text not null,
  state      text,
  district   text,
  website    text,
  year_est   text,
  location   text,
  ownership  text,
  type       text,
  context_tag text default 'A path worth exploring',
  tier        text default 'fit',
  vibe        text[] default '{}',
  created_at  timestamptz default now()
);

-- ── 3. Standalone Institutes ──────────────────────────────────────────
create table if not exists standalone_institutes (
  id              text primary key default gen_random_uuid()::text,
  aishe_code      text,
  name            text not null,
  state           text,
  district        text,
  year_est        text,
  location        text,
  standalone_type text,
  management      text,
  ownership       text,
  type            text,
  context_tag     text default 'A path worth exploring',
  tier            text default 'fit',
  vibe            text[] default '{}',
  created_at      timestamptz default now()
);

-- ── 4. R&D Institutes ────────────────────────────────────────────────
create table if not exists rnd_institutes (
  id          text primary key default gen_random_uuid()::text,
  serial_no   text,
  aishe_code  text,
  name        text not null,
  state       text,
  district    text,
  ministry    text,
  ownership   text,
  type        text default 'Others',
  context_tag text default 'A path worth exploring',
  tier        text default 'fit',
  vibe        text[] default '{}',
  created_at  timestamptz default now()
);

-- ── 5. Institutes of National Importance ─────────────────────────────
create table if not exists institutes_national_importance (
  id         text primary key default gen_random_uuid()::text,
  aishe_code text,
  name       text not null,
  state      text,
  district   text,
  website    text,
  year_est   text,
  location   text,
  inst_type  text,   -- AIIMS / IIT / NIT / etc.
  ownership  text,
  type       text,
  context_tag text default 'A path worth exploring',
  tier        text default 'growth',
  vibe        text[] default '{}',
  created_at  timestamptz default now()
);

-- ── 6. Admin Upload Log ───────────────────────────────────────────────
create table if not exists admin_uploads (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null,
  category    text not null,
  row_count   int,
  uploaded_at timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────
-- Allow anyone to SELECT (public read for the journey UI)
alter table colleges                      enable row level security;
alter table universities                  enable row level security;
alter table standalone_institutes         enable row level security;
alter table rnd_institutes                enable row level security;
alter table institutes_national_importance enable row level security;
alter table admin_uploads                 enable row level security;

-- Public read
create policy "public read colleges"    on colleges                      for select using (true);
create policy "public read universities" on universities                  for select using (true);
create policy "public read standalone"  on standalone_institutes         for select using (true);
create policy "public read rnd"         on rnd_institutes                for select using (true);
create policy "public read national"    on institutes_national_importance for select using (true);
create policy "public read uploads log" on admin_uploads                 for select using (true);

-- Allow all inserts/deletes from anon (admin panel uses anon key + JS auth check)
-- In production you'd use Supabase Auth with service role key for writes.
create policy "anon insert colleges"    on colleges                      for insert with check (true);
create policy "anon delete colleges"    on colleges                      for delete using (true);
create policy "anon insert universities" on universities                  for insert with check (true);
create policy "anon delete universities" on universities                  for delete using (true);
create policy "anon insert standalone"  on standalone_institutes         for insert with check (true);
create policy "anon delete standalone"  on standalone_institutes         for delete using (true);
create policy "anon insert rnd"         on rnd_institutes                for insert with check (true);
create policy "anon delete rnd"         on rnd_institutes                for delete using (true);
create policy "anon insert national"    on institutes_national_importance for insert with check (true);
create policy "anon delete national"    on institutes_national_importance for delete using (true);
create policy "anon insert uploads"     on admin_uploads                 for insert with check (true);
create policy "anon delete uploads"     on admin_uploads                 for delete using (true);
