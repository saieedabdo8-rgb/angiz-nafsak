-- ============================================================
-- أنجز نفسك - FIX #2: RLS + Admin Profile + Grants
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. GRANT table-level permissions (needed for RLS to work)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 2. CREATE admin profile if missing
insert into profiles (id, full_name, phone, role)
select 
  id,
  coalesce(raw_user_meta_data->>'full_name', 'Admin'),
  coalesce(raw_user_meta_data->>'phone', '01125031755'),
  'admin'
from auth.users
where email = '01125031755@student.local'
  and not exists (select 1 from profiles p where p.id = auth.users.id)
on conflict (id) do update set role = 'admin';

-- 3. Verify profile exists
do $$
begin
  if not exists (select 1 from profiles where phone = '01125031755' and role = 'admin') then
    raise notice 'ADMIN PROFILE STILL MISSING - check auth.users';
  else
    raise notice 'ADMIN PROFILE EXISTS';
  end if;
end $$;

-- 4. DROP and RECREATE all RLS policies (fix INSERT issue)
-- Tracks
drop policy if exists "Tracks viewable by everyone" on tracks;
drop policy if exists "Tracks manageable by admins" on tracks;
create policy "Tracks viewable by everyone" on tracks for select using (true);
create policy "Tracks insertable by admins" on tracks for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Tracks updatable by admins" on tracks for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Tracks deletable by admins" on tracks for delete using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Subjects
drop policy if exists "Subjects viewable by everyone" on subjects;
drop policy if exists "Subjects manageable by admins" on subjects;
create policy "Subjects viewable by everyone" on subjects for select using (true);
create policy "Subjects insertable by admins" on subjects for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Subjects updatable by admins" on subjects for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Subjects deletable by admins" on subjects for delete using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Track_Subjects
drop policy if exists "Track_Subjects viewable by everyone" on track_subjects;
drop policy if exists "Track_Subjects manageable by admins" on track_subjects;
create policy "Track_Subjects viewable by everyone" on track_subjects for select using (true);
create policy "Track_Subjects insertable by admins" on track_subjects for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Track_Subjects updatable by admins" on track_subjects for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Track_Subjects deletable by admins" on track_subjects for delete using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Teachers
drop policy if exists "Teachers viewable by everyone" on teachers;
drop policy if exists "Teachers manageable by admins" on teachers;
create policy "Teachers viewable by everyone" on teachers for select using (true);
create policy "Teachers insertable by admins" on teachers for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Teachers updatable by admins" on teachers for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Teachers deletable by admins" on teachers for delete using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Courses
drop policy if exists "Courses viewable by everyone" on courses;
drop policy if exists "Courses manageable by admins" on courses;
create policy "Courses viewable by everyone" on courses for select using (true);
create policy "Courses insertable by admins" on courses for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Courses updatable by admins" on courses for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Courses deletable by admins" on courses for delete using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Codes
drop policy if exists "Codes viewable by admins only" on codes;
drop policy if exists "Codes manageable by admins" on codes;
create policy "Codes viewable by admins" on codes for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Codes insertable by admins" on codes for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Codes updatable by admins" on codes for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Codes deletable by admins" on codes for delete using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Theme Settings
drop policy if exists "Theme viewable by everyone" on theme_settings;
drop policy if exists "Theme manageable by admins" on theme_settings;
create policy "Theme viewable by everyone" on theme_settings for select using (true);
create policy "Theme manageable by admins" on theme_settings for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Settings
drop policy if exists "Settings viewable by everyone" on settings;
drop policy if exists "Settings manageable by admins" on settings;
create policy "Settings viewable by everyone" on settings for select using (true);
create policy "Settings insertable by admins" on settings for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Settings updatable by admins" on settings for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 5. SEED subjects (if not already done)
insert into subjects (name, slug, color, description, display_order, status)
select * from (values
  ('الأحياء', 'biology', '#22C55E', 'علم الأحياء', 0, 'active'),
  ('الكيمياء', 'chemistry', '#3B82F6', 'علم الكيمياء', 1, 'active'),
  ('الفيزياء', 'physics', '#F97316', 'علم الفيزياء', 2, 'active'),
  ('الرياضيات', 'mathematics', '#8B5CF6', 'علم الرياضيات', 3, 'active'),
  ('التاريخ', 'history', '#EC4899', 'علم التاريخ', 4, 'active'),
  ('الجغرافيا', 'geography', '#14B8A6', 'علم الجغرافيا', 5, 'active'),
  ('الإحصاء', 'statistics', '#F59E0B', 'علم الإحصاء', 6, 'active'),
  ('اللغة العربية', 'arabic', '#10B981', 'اللغة العربية', 7, 'active'),
  ('اللغة الإنجليزية', 'english', '#6366F1', 'اللغة الإنجليزية', 8, 'active'),
  ('علوم الحاسب', 'computer-science', '#06B6D4', 'علوم الحاسب', 9, 'active')
) as v(name, slug, color, description, display_order, status)
where not exists (select 1 from subjects limit 1);

-- 6. MIGRATE stages → tracks (from old project)
insert into tracks (name, slug, description, icon, background_color, gradient_start, gradient_end, text_color, button_color, display_order, status)
select
  s.name,
  case
    when s.name like '%علمى%' or s.name like '%علمي%' then 'science'
    when s.name like '%أدب%' or s.name like '%ادب%' then 'literary'
    when s.name like '%رياض%' then 'math'
    else lower(regexp_replace(s.name, '[^a-zA-Z0-9]', '-', 'g'))
  end,
  coalesce(nullif(s.description, ''), 'شعبة ' || s.name),
  case
    when s.name like '%علمى%' or s.name like '%علمي%' then '🧬'
    when s.name like '%أدب%' or s.name like '%ادب%' then '📚'
    when s.name like '%رياض%' then '📐'
    else '🎯'
  end,
  case
    when s.name like '%علمى%' or s.name like '%علمي%' then '#10B981'
    when s.name like '%أدب%' or s.name like '%ادب%' then '#F97316'
    else '#1e40af'
  end,
  case
    when s.name like '%علمى%' or s.name like '%علمي%' then '#34D399'
    when s.name like '%أدب%' or s.name like '%ادب%' then '#FB923C'
    else '#1e40af'
  end,
  case
    when s.name like '%علمى%' or s.name like '%علمي%' then '#14B8A6'
    when s.name like '%أدب%' or s.name like '%ادب%' then '#F97316'
    else '#7c3aed'
  end,
  '#FFFFFF', '#FFFFFF',
  row_number() over (order by s.created_at) - 1,
  'active'
from stages s
where not exists (select 1 from tracks t where t.name = s.name)
on conflict (slug) do nothing;

-- 7. Link tracks ↔ subjects
insert into track_subjects (track_id, subject_id)
select t.id, s.id
from tracks t, subjects s
where t.slug = 'science' and s.slug in ('biology', 'chemistry', 'physics', 'arabic', 'english')
  and not exists (select 1 from track_subjects ts where ts.track_id = t.id and ts.subject_id = s.id);

insert into track_subjects (track_id, subject_id)
select t.id, s.id
from tracks t, subjects s
where t.slug = 'math' and s.slug in ('mathematics', 'chemistry', 'physics', 'arabic', 'english')
  and not exists (select 1 from track_subjects ts where ts.track_id = t.id and ts.subject_id = s.id);

insert into track_subjects (track_id, subject_id)
select t.id, s.id
from tracks t, subjects s
where t.slug = 'literary' and s.slug in ('history', 'geography', 'statistics', 'arabic', 'english')
  and not exists (select 1 from track_subjects ts where ts.track_id = t.id and ts.subject_id = s.id);

-- 8. Also link any remaining tracks (general)
insert into track_subjects (track_id, subject_id)
select t.id, s.id
from tracks t, subjects s
where t.slug not in ('science', 'math', 'literary')
  and s.slug in ('arabic', 'english')
  and not exists (select 1 from track_subjects ts where ts.track_id = t.id and ts.subject_id = s.id);
