-- ============================================================
-- أنجز نفسك - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
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

-- ============================================================
-- TRACKS (e.g. علمي علوم, علمي رياضة, أدبي)
-- ============================================================
create table if not exists tracks (
  id uuid primary key default uuid_generate_v4(),
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

-- ============================================================
-- SUBJECTS (e.g. الأحياء, الكيمياء, الرياضيات)
-- ============================================================
create table if not exists subjects (
  id uuid primary key default uuid_generate_v4(),
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

-- ============================================================
-- TRACK_SUBJECTS (Many-to-Many)
-- ============================================================
create table if not exists track_subjects (
  track_id uuid not null references tracks(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  primary key (track_id, subject_id)
);

-- ============================================================
-- TEACHERS
-- ============================================================
create table if not exists teachers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  photo text,
  cover text,
  bio text,
  subject_id uuid not null references subjects(id),
  track_id uuid references tracks(id),
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

-- ============================================================
-- COURSES (Products)
-- ============================================================
create table if not exists courses (
  id uuid primary key default uuid_generate_v4(),
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

-- ============================================================
-- CODES (Activation codes for each course)
-- ============================================================
create table if not exists codes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  code text not null,
  status text not null default 'unused' check (status in ('unused', 'reserved', 'sold')),
  student_id uuid references auth.users(id) on delete set null,
  sold_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
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

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  amount decimal(10,2) not null,
  method text not null check (method in ('instapay', 'vodafone_cash')),
  screenshot_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- ============================================================
-- PURCHASES (Record of code assignments)
-- ============================================================
create table if not exists purchases (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id),
  teacher_id uuid not null references teachers(id),
  code_id uuid not null references codes(id),
  order_id uuid not null references orders(id),
  price decimal(10,2) not null,
  purchased_at timestamptz default now()
);

-- ============================================================
-- USER_TRACKS (Student track selection history)
-- ============================================================
create table if not exists user_tracks (
  student_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (student_id, track_id)
);

-- ============================================================
-- THEME_SETTINGS
-- ============================================================
create table if not exists theme_settings (
  key text primary key,
  value text not null
);

-- ============================================================
-- SETTINGS
-- ============================================================
create table if not exists settings (
  key text primary key,
  value text not null
);

-- ============================================================
-- AUDIT_LOGS
-- ============================================================
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
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

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values ('payments', 'payments', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('teachers', 'teachers', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('courses', 'courses', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table profiles enable row level security;
create policy "Profiles viewable by owner" on profiles for select using (auth.uid() = id);
create policy "Profiles viewable by admins" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Profiles updatable by owner" on profiles for update using (auth.uid() = id);
create policy "Profiles updatable by admins" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Tracks
alter table tracks enable row level security;
create policy "Tracks viewable by everyone" on tracks for select using (true);
create policy "Tracks manageable by admins" on tracks for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Subjects
alter table subjects enable row level security;
create policy "Subjects viewable by everyone" on subjects for select using (true);
create policy "Subjects manageable by admins" on subjects for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Track_Subjects
alter table track_subjects enable row level security;
create policy "Track_Subjects viewable by everyone" on track_subjects for select using (true);
create policy "Track_Subjects manageable by admins" on track_subjects for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Teachers
alter table teachers enable row level security;
create policy "Teachers viewable by everyone" on teachers for select using (true);
create policy "Teachers manageable by admins" on teachers for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Courses
alter table courses enable row level security;
create policy "Courses viewable by everyone" on courses for select using (true);
create policy "Courses manageable by admins" on courses for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Codes (students never see codes directly)
alter table codes enable row level security;
create policy "Codes viewable by admins only" on codes for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Codes manageable by admins" on codes for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders
alter table orders enable row level security;
create policy "Orders viewable by owner" on orders for select using (auth.uid() = student_id);
create policy "Orders viewable by admins" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Orders insertable by students" on orders for insert with check (auth.uid() = student_id);
create policy "Orders updatable by admins" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Payments
alter table payments enable row level security;
create policy "Payments viewable by owner" on payments for select using (auth.uid() = student_id);
create policy "Payments viewable by admins" on payments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Payments insertable by students" on payments for insert with check (auth.uid() = student_id);
create policy "Payments updatable by admins" on payments for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Purchases
alter table purchases enable row level security;
create policy "Purchases viewable by owner" on purchases for select using (auth.uid() = student_id);
create policy "Purchases viewable by admins" on purchases for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- User_Tracks
alter table user_tracks enable row level security;
create policy "User_Tracks viewable by owner" on user_tracks for select using (auth.uid() = student_id);
create policy "User_Tracks manageable by owner" on user_tracks for all using (auth.uid() = student_id);
create policy "User_Tracks manageable by admins" on user_tracks for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Theme Settings
alter table theme_settings enable row level security;
create policy "Theme viewable by everyone" on theme_settings for select using (true);
create policy "Theme manageable by admins" on theme_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Settings
alter table settings enable row level security;
create policy "Settings viewable by everyone" on settings for select using (true);
create policy "Settings manageable by admins" on settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Audit Logs
alter table audit_logs enable row level security;
create policy "Audit viewable by admins" on audit_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Storage Policies
create policy "Students can upload payment screenshots" on storage.objects for insert with check (
  bucket_id = 'payments' and auth.role() = 'authenticated'
);
create policy "Students can view own payment screenshots" on storage.objects for select using (
  bucket_id = 'payments' and auth.role() = 'authenticated'
);
create policy "Admins can view all payment screenshots" on storage.objects for select using (
  bucket_id = 'payments' and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
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
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
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
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ASSIGN CODE FUNCTION (called by edge function after payment)
-- ============================================================
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
  -- Get order details
  select course_id, student_id, price, teacher_id
  into v_course_id, v_student_id, v_price, v_teacher_id
  from orders
  where id = p_order_id and payment_status = 'approved';

  if not found then
    return 'ORDER_NOT_FOUND_OR_NOT_APPROVED';
  end if;

  -- Find first unused code
  select id, code into v_code_id, v_code_text
  from codes
  where course_id = v_course_id and status = 'unused'
  order by created_at
  limit 1;

  if not found then
    return 'NO_CODES_AVAILABLE';
  end if;

  -- Assign code
  update codes set
    status = 'sold',
    student_id = v_student_id,
    sold_at = now()
  where id = v_code_id;

  -- Mark order as code assigned
  update orders set code_assigned = true where id = p_order_id;

  -- Record purchase
  insert into purchases (student_id, course_id, teacher_id, code_id, order_id, price)
  values (v_student_id, v_course_id, v_teacher_id, v_code_id, p_order_id, v_price);

  return v_code_text;
end;
$$;

-- ============================================================
-- LOG AUDIT FUNCTION
-- ============================================================
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
