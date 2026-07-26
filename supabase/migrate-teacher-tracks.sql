-- Run this in Supabase SQL Editor
-- Safe to run multiple times

-- TEACHER_TRACKS
create table if not exists teacher_tracks (
  teacher_id uuid not null references teachers(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (teacher_id, track_id)
);

do $$
begin
  if exists (select 1 from information_schema.columns where table_name='teachers' and column_name='track_id') then
    insert into teacher_tracks (teacher_id, track_id)
    select id, track_id from teachers where track_id is not null
    on conflict do nothing;
    alter table teachers drop column track_id;
  end if;
end $$;

-- COURSE_TRACKS
create table if not exists course_tracks (
  course_id uuid not null references courses(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (course_id, track_id)
);

do $$
begin
  if exists (select 1 from information_schema.columns where table_name='courses' and column_name='track_id') then
    insert into course_tracks (course_id, track_id)
    select id, track_id from courses where track_id is not null
    on conflict do nothing;
    alter table courses drop column track_id;
  end if;
end $$;
