-- ============================================================
-- MIGRATION: theme_settings → single-row JSONB global config
-- ============================================================
-- Run this in Supabase SQL Editor to migrate existing data

-- 1. Back up existing key-value rows into a JSON object
do $$
declare
  v_settings jsonb;
begin
  select jsonb_object_agg(key, value) into v_settings from theme_settings;

  -- 2. Drop old table
  drop table if exists theme_settings cascade;

  -- 3. Create new single-row table
  create table if not exists theme_settings (
    id bigint primary key default 1 check (id = 1),
    settings jsonb not null default '{}'::jsonb,
    updated_at timestamptz default now(),
    updated_by uuid references auth.users(id) on delete set null
  );

  -- 4. Insert migrated data or empty default
  insert into theme_settings (id, settings)
  values (1, coalesce(v_settings, '{}'::jsonb))
  on conflict (id) do update set settings = coalesce(v_settings, '{}'::jsonb);

  -- 5. Re-create RLS
  alter table theme_settings enable row level security;
end $$;

-- Drop old policies if re-running
drop policy if exists "Theme viewable by everyone" on theme_settings;
drop policy if exists "Theme insertable by admins" on theme_settings;
drop policy if exists "Theme updatable by admins" on theme_settings;
drop policy if exists "Theme manageable by admins" on theme_settings;

-- Create fresh policies
create policy "Theme viewable by everyone" on theme_settings for select using (true);
create policy "Theme manageable by admins" on theme_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Grant access
GRANT ALL ON theme_settings TO authenticated, service_role;
GRANT SELECT ON theme_settings TO anon;
