-- ============================================================
-- أنجز نفسك - FIX: Grants + Migrate + Seed
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- 1. GRANT permissions (anon + authenticated roles)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON payments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON user_tracks TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 2. MIGRATE old stages → tracks
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
  '#FFFFFF',
  '#FFFFFF',
  row_number() over (order by s.created_at) - 1,
  'active'
from stages s
where not exists (select 1 from tracks t where t.name = s.name)
on conflict (slug) do nothing;

-- 3. FIX existing slug (handle old stage slug conflict)
update tracks set slug = 'grade-3-science' where slug = 'science' and name like '%ثالث%';
update tracks set slug = 'grade-2-general' where slug like '%rade%' and name like '%ثانى%' or name like '%ثاني%';

-- 4. SEED subjects if empty
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

-- 5. Link tracks ↔ subjects (track_subjects)
-- Science track → Biology, Chemistry, Physics, Arabic, English
insert into track_subjects (track_id, subject_id)
select t.id, s.id
from tracks t, subjects s
where (t.name like '%علم%' or t.slug = 'science')
  and s.slug in ('biology', 'chemistry', 'physics', 'arabic', 'english')
  and not exists (select 1 from track_subjects ts where ts.track_id = t.id and ts.subject_id = s.id);

-- Math track → Math, Chemistry, Physics, Arabic, English
insert into track_subjects (track_id, subject_id)
select t.id, s.id
from tracks t, subjects s
where t.slug = 'math'
  and s.slug in ('mathematics', 'chemistry', 'physics', 'arabic', 'english')
  and not exists (select 1 from track_subjects ts where ts.track_id = t.id and ts.subject_id = s.id);

-- Literary track → History, Geography, Statistics, Arabic, English
insert into track_subjects (track_id, subject_id)
select t.id, s.id
from tracks t, subjects s
where t.slug = 'literary'
  and s.slug in ('history', 'geography', 'statistics', 'arabic', 'english')
  and not exists (select 1 from track_subjects ts where ts.track_id = t.id and ts.subject_id = s.id);
