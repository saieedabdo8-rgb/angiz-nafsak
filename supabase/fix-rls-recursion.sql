-- ============================================================
-- FIX: RLS infinite recursion + auto-confirm email on signup
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Modify handle_new_user to auto-confirm email
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

-- 2. Replace ALL recursive admin checks with JWT-based checks
-- Profiles
drop policy if exists "Profiles viewable by admins" on profiles;
drop policy if exists "Profiles updatable by admins" on profiles;
create policy "Profiles viewable by admins" on profiles for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Profiles updatable by admins" on profiles for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Tracks
drop policy if exists "Tracks insertable by admins" on tracks;
drop policy if exists "Tracks updatable by admins" on tracks;
drop policy if exists "Tracks deletable by admins" on tracks;
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
drop policy if exists "Subjects insertable by admins" on subjects;
drop policy if exists "Subjects updatable by admins" on subjects;
drop policy if exists "Subjects deletable by admins" on subjects;
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
drop policy if exists "Track_Subjects insertable by admins" on track_subjects;
drop policy if exists "Track_Subjects updatable by admins" on track_subjects;
drop policy if exists "Track_Subjects deletable by admins" on track_subjects;
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
drop policy if exists "Teachers insertable by admins" on teachers;
drop policy if exists "Teachers updatable by admins" on teachers;
drop policy if exists "Teachers deletable by admins" on teachers;
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
drop policy if exists "Courses insertable by admins" on courses;
drop policy if exists "Courses updatable by admins" on courses;
drop policy if exists "Courses deletable by admins" on courses;
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
drop policy if exists "Orders viewable by admins" on orders;
drop policy if exists "Orders updatable by admins" on orders;
create policy "Orders viewable by admins" on orders for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Orders updatable by admins" on orders for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Payments
drop policy if exists "Payments viewable by admins" on payments;
drop policy if exists "Payments updatable by admins" on payments;
create policy "Payments viewable by admins" on payments for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Payments updatable by admins" on payments for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Purchases
drop policy if exists "Purchases viewable by admins" on purchases;
create policy "Purchases viewable by admins" on purchases for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- User_Tracks
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
drop policy if exists "Theme manageable by admins" on theme_settings;
create policy "Theme manageable by admins" on theme_settings for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Settings
drop policy if exists "Settings insertable by admins" on settings;
drop policy if exists "Settings updatable by admins" on settings;
create policy "Settings insertable by admins" on settings for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "Settings updatable by admins" on settings for update using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Audit Logs
drop policy if exists "Audit viewable by admins" on audit_logs;
create policy "Audit viewable by admins" on audit_logs for select using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Storage: payment screenshots
drop policy if exists "Admins can view all payment screenshots" on storage.objects;
create policy "Admins can view all payment screenshots" on storage.objects for select using (
  bucket_id = 'payments' and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Storage: image upload
drop policy if exists "Admins can upload images" on storage.objects;
create policy "Admins can upload images" on storage.objects for insert with check (
  bucket_id in ('teachers', 'courses', 'avatars') and
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
