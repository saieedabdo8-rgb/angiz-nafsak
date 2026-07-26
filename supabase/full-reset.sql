-- ============================================================
-- أنجز نفسك - FULL DATABASE RESET
-- Drops old tables, creates new schema, seeds data
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- 0. Drop OLD tables from previous project (if they exist)
drop table if exists sections cascade;
drop table if exists subjects cascade;
drop table if exists stages cascade;
drop table if exists products cascade;

-- 1. Drop ALL new tables (clean slate)
drop table if exists audit_logs cascade;
drop table if exists purchases cascade;
drop table if exists payments cascade;
drop table if exists orders cascade;
drop table if exists codes cascade;
drop table if exists courses cascade;
drop table if exists teachers cascade;
drop table if exists track_subjects cascade;
drop table if exists tracks cascade;
drop table if exists user_tracks cascade;
drop table if exists theme_settings cascade;
drop table if exists settings cascade;
drop table if exists profiles cascade;

-- 2. PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null unique,
  avatar text,
  track_id uuid,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TRACKS
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  background_color text default '#1e40af',
  gradient_start text default '#1e40af',
  gradient_end text default '#7c3aed',
  text_color text default '#ffffff',
  button_color text default '#3b82f6',
  display_order int default 0,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. SUBJECTS
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  color text default '#3b82f6',
  description text,
  display_order int default 0,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. TRACK_SUBJECTS
create table if not exists track_subjects (
  track_id uuid not null references tracks(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  primary key (track_id, subject_id)
);

-- 6. TEACHERS
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo text,
  cover text,
  bio text,
  subject_id uuid not null references subjects(id),
  experience text,
  facebook text,
  telegram text,
  whatsapp text,
  youtube text,
  rating decimal(2,1) default 0.0,
  display_order int default 0,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6b. TEACHER_TRACKS (many-to-many)
create table if not exists teacher_tracks (
  teacher_id uuid not null references teachers(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (teacher_id, track_id)
);

-- 7. COURSES
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  track_id uuid references tracks(id),
  subject_id uuid references subjects(id),
  name text not null,
  description text,
  price decimal(10,2) not null,
  thumbnail text,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. CODES
create table if not exists codes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  code text not null,
  status text not null default 'unused' check (status in ('unused', 'reserved', 'sold')),
  student_id uuid references auth.users(id) on delete set null,
  sold_at timestamptz,
  created_at timestamptz default now()
);

-- 9. ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id),
  teacher_id uuid not null references teachers(id),
  price decimal(10,2) not null,
  payment_method text check (payment_method in ('instapay', 'vodafone_cash')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'approved', 'rejected')),
  code_assigned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. PAYMENTS
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  amount decimal(10,2) not null,
  method text not null check (method in ('instapay', 'vodafone_cash')),
  screenshot_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- 11. PURCHASES
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id),
  teacher_id uuid not null references teachers(id),
  code_id uuid not null references codes(id),
  order_id uuid not null references orders(id),
  price decimal(10,2) not null,
  purchased_at timestamptz default now()
);

-- 12. USER_TRACKS
create table if not exists user_tracks (
  student_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (student_id, track_id)
);

-- 13. THEME_SETTINGS (global single-row)
create table if not exists theme_settings (
  id bigint primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Insert default theme row
insert into theme_settings (id, settings)
values (1, '{
  "primary": "#2563EB", "secondary": "#3B82F6", "accent": "#7C3AED",
  "background": "#F8FAFC", "card": "#FFFFFF", "surface": "#FFFFFF",
  "text": "#0F172A", "secondary_text": "#64748B", "border": "#E2E8F0",
  "success": "#16A34A", "warning": "#F59E0B", "danger": "#DC2626", "info": "#0891B2",
  "header_bg": "#FFFFFF", "sidebar_bg": "#FFFFFF", "footer_bg": "#1E293B",
  "hero_bg": "#1E40AF", "button_bg": "#2563EB", "button_hover": "#1D4ED8", "button_text": "#FFFFFF"
}'::jsonb)
on conflict (id) do nothing;

-- 14. SETTINGS
create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- 15. AUDIT_LOGS
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- 16. INDEXES
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_track on profiles(track_id);
create index if not exists idx_tracks_status on tracks(status);
create index if not exists idx_tracks_order on tracks(display_order);
create index if not exists idx_subjects_status on subjects(status);
create index if not exists idx_subjects_order on subjects(display_order);
create index if not exists idx_teachers_subject on teachers(subject_id);
create index if not exists idx_teachers_track on teachers(track_id);
create index if not exists idx_teachers_status on teachers(status);
create index if not exists idx_courses_teacher on courses(teacher_id);
create index if not exists idx_courses_track on courses(track_id);
create index if not exists idx_courses_subject on courses(subject_id);
create index if not exists idx_courses_status on courses(status);
create index if not exists idx_codes_course on codes(course_id);
create index if not exists idx_codes_status on codes(status);
create index if not exists idx_codes_student on codes(student_id);
create index if not exists idx_orders_student on orders(student_id);
create index if not exists idx_orders_status on orders(payment_status);
create index if not exists idx_payments_order on payments(order_id);
create index if not exists idx_payments_student on payments(student_id);
create index if not exists idx_payments_status on payments(status);

-- 17. STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('payments', 'payments', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('teachers', 'teachers', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('courses', 'courses', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

-- 18. ROW LEVEL SECURITY
-- Profiles
alter table profiles enable row level security;
drop policy if exists "Profiles viewable by owner" on profiles;
drop policy if exists "Profiles viewable by admins" on profiles;
drop policy if exists "Profiles updatable by owner" on profiles;
drop policy if exists "Profiles updatable by admins" on profiles;
create policy "Profiles viewable by owner" on profiles for select using (auth.uid() = id);
create policy "Profiles viewable by admins" on profiles for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Profiles updatable by owner" on profiles for update using (auth.uid() = id);
create policy "Profiles updatable by admins" on profiles for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Tracks
alter table tracks enable row level security;
drop policy if exists "Tracks viewable by everyone" on tracks;
drop policy if exists "Tracks insertable by admins" on tracks;
drop policy if exists "Tracks updatable by admins" on tracks;
drop policy if exists "Tracks deletable by admins" on tracks;
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
alter table subjects enable row level security;
drop policy if exists "Subjects viewable by everyone" on subjects;
drop policy if exists "Subjects insertable by admins" on subjects;
drop policy if exists "Subjects updatable by admins" on subjects;
drop policy if exists "Subjects deletable by admins" on subjects;
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
alter table track_subjects enable row level security;
drop policy if exists "Track_Subjects viewable by everyone" on track_subjects;
drop policy if exists "Track_Subjects insertable by admins" on track_subjects;
drop policy if exists "Track_Subjects updatable by admins" on track_subjects;
drop policy if exists "Track_Subjects deletable by admins" on track_subjects;
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
alter table teachers enable row level security;
drop policy if exists "Teachers viewable by everyone" on teachers;
drop policy if exists "Teachers insertable by admins" on teachers;
drop policy if exists "Teachers updatable by admins" on teachers;
drop policy if exists "Teachers deletable by admins" on teachers;
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
alter table courses enable row level security;
drop policy if exists "Courses viewable by everyone" on courses;
drop policy if exists "Courses insertable by admins" on courses;
drop policy if exists "Courses updatable by admins" on courses;
drop policy if exists "Courses deletable by admins" on courses;
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
alter table codes enable row level security;
drop policy if exists "Codes viewable by admins" on codes;
drop policy if exists "Codes insertable by admins" on codes;
drop policy if exists "Codes updatable by admins" on codes;
drop policy if exists "Codes deletable by admins" on codes;
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

-- Orders
alter table orders enable row level security;
drop policy if exists "Orders viewable by owner" on orders;
drop policy if exists "Orders viewable by admins" on orders;
drop policy if exists "Orders insertable by students" on orders;
drop policy if exists "Orders updatable by admins" on orders;
create policy "Orders viewable by owner" on orders for select using (auth.uid() = student_id);
create policy "Orders viewable by admins" on orders for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Orders insertable by students" on orders for insert with check (auth.uid() = student_id);
create policy "Orders updatable by admins" on orders for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Payments
alter table payments enable row level security;
drop policy if exists "Payments viewable by owner" on payments;
drop policy if exists "Payments viewable by admins" on payments;
drop policy if exists "Payments insertable by students" on payments;
drop policy if exists "Payments updatable by admins" on payments;
create policy "Payments viewable by owner" on payments for select using (auth.uid() = student_id);
create policy "Payments viewable by admins" on payments for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Payments insertable by students" on payments for insert with check (auth.uid() = student_id);
create policy "Payments updatable by admins" on payments for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Purchases
alter table purchases enable row level security;
drop policy if exists "Purchases viewable by owner" on purchases;
drop policy if exists "Purchases viewable by admins" on purchases;
create policy "Purchases viewable by owner" on purchases for select using (auth.uid() = student_id);
create policy "Purchases viewable by admins" on purchases for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- User_Tracks
alter table user_tracks enable row level security;
drop policy if exists "User_Tracks viewable by owner" on user_tracks;
drop policy if exists "User_Tracks insertable by owner" on user_tracks;
drop policy if exists "User_Tracks updatable by owner" on user_tracks;
drop policy if exists "User_Tracks deletable by owner" on user_tracks;
drop policy if exists "User_Tracks insertable by admins" on user_tracks;
drop policy if exists "User_Tracks updatable by admins" on user_tracks;
drop policy if exists "User_Tracks deletable by admins" on user_tracks;
create policy "User_Tracks viewable by owner" on user_tracks for select using (auth.uid() = student_id);
create policy "User_Tracks insertable by owner" on user_tracks for insert with check (auth.uid() = student_id);
create policy "User_Tracks updatable by owner" on user_tracks for update using (auth.uid() = student_id);
create policy "User_Tracks deletable by owner" on user_tracks for delete using (auth.uid() = student_id);
create policy "User_Tracks insertable by admins" on user_tracks for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "User_Tracks updatable by admins" on user_tracks for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "User_Tracks deletable by admins" on user_tracks for delete using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Theme Settings
alter table theme_settings enable row level security;
drop policy if exists "Theme viewable by everyone" on theme_settings;
drop policy if exists "Theme manageable by admins" on theme_settings;
create policy "Theme viewable by everyone" on theme_settings for select using (true);
create policy "Theme manageable by admins" on theme_settings for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Settings
alter table settings enable row level security;
drop policy if exists "Settings viewable by everyone" on settings;
drop policy if exists "Settings insertable by admins" on settings;
drop policy if exists "Settings updatable by admins" on settings;
create policy "Settings viewable by everyone" on settings for select using (true);
create policy "Settings insertable by admins" on settings for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Settings updatable by admins" on settings for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Audit Logs
alter table audit_logs enable row level security;
drop policy if exists "Audit viewable by admins" on audit_logs;
create policy "Audit viewable by admins" on audit_logs for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Storage Policies
drop policy if exists "Students can upload payment screenshots" on storage.objects;
drop policy if exists "Students can view own payment screenshots" on storage.objects;
drop policy if exists "Admins can view all payment screenshots" on storage.objects;
drop policy if exists "Public can view teacher images" on storage.objects;
drop policy if exists "Public can view course images" on storage.objects;
drop policy if exists "Public can view avatars" on storage.objects;
drop policy if exists "Admins can upload images" on storage.objects;

create policy "Students can upload payment screenshots" on storage.objects for insert with check (
  bucket_id = 'payments' and auth.role() = 'authenticated'
);
create policy "Students can view own payment screenshots" on storage.objects for select using (
  bucket_id = 'payments' and auth.role() = 'authenticated'
);
create policy "Admins can view all payment screenshots" on storage.objects for select using (
  bucket_id = 'payments' and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Public can view teacher images" on storage.objects for select using (
  bucket_id = 'teachers'
);
create policy "Public can view course images" on storage.objects for select using (
  bucket_id = 'courses'
);
create policy "Public can view avatars" on storage.objects for select using (
  bucket_id = 'avatars'
);
create policy "Admins can upload images" on storage.objects for insert with check (
  bucket_id in ('teachers', 'courses', 'avatars') and
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 19. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  );
  -- Auto-confirm email so user can login immediately
  update auth.users set email_confirmed_at = now()
  where id = new.id and email_confirmed_at is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 20. ASSIGN CODE FUNCTION
create or replace function public.assign_code(p_order_id uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_course_id uuid;
  v_student_id uuid;
  v_code_id uuid;
  v_code_text text;
  v_price decimal(10,2);
  v_teacher_id uuid;
begin
  select course_id, student_id, price, teacher_id
  into v_course_id, v_student_id, v_price, v_teacher_id
  from orders
  where id = p_order_id and payment_status = 'approved';

  if not found then
    return 'ORDER_NOT_FOUND_OR_NOT_APPROVED';
  end if;

  select id, code into v_code_id, v_code_text
  from codes
  where course_id = v_course_id and status = 'unused'
  order by created_at
  limit 1;

  if not found then
    return 'NO_CODES_AVAILABLE';
  end if;

  update codes set
    status = 'sold',
    student_id = v_student_id,
    sold_at = now()
  where id = v_code_id;

  update orders set code_assigned = true where id = p_order_id;

  insert into purchases (student_id, course_id, teacher_id, code_id, order_id, price)
  values (v_student_id, v_course_id, v_teacher_id, v_code_id, p_order_id, v_price);

  return v_code_text;
end;
$$;

-- 21. LOG AUDIT FUNCTION
drop function if exists public.log_audit(uuid,text,text,text,jsonb);
create or replace function public.log_audit(
  p_user_id uuid default null,
  p_action text default '',
  p_entity text default '',
  p_entity_id text default null,
  p_details jsonb default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.audit_logs (user_id, action, entity, entity_id, details)
  values (p_user_id, p_action, p_entity, p_entity_id, p_details);
end;
$$;

-- 22. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON payments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON user_tracks TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;

-- 23. CREATE ADMIN PROFILE (if missing)
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

-- 24. SEED SUBJECTS
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

-- 25. MIGRATE STAGES → TRACKS (only if stages table still exists)
do $$
begin
  if exists (select from information_schema.tables where table_schema = 'public' and table_name = 'stages') then
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
  end if;
end $$;

-- 26. LINK TRACKS ↔ SUBJECTS
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

-- Verify
do $$
begin
  raise notice 'Setup complete!';
  raise notice 'Tables: profiles, tracks, subjects, teachers, courses, codes, orders, payments, purchases, user_tracks, theme_settings, settings, audit_logs';
  if exists (select 1 from profiles where role = 'admin') then
    raise notice 'Admin profile: OK';
  else
    raise notice 'Admin profile: MISSING - create manually';
  end if;
end $$;
