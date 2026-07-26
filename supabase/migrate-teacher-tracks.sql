-- Migration: allow teachers to be in multiple tracks
-- 1. Create teacher_tracks junction table
create table if not exists teacher_tracks (
  teacher_id uuid not null references teachers(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (teacher_id, track_id)
);

-- 2. Migrate existing track_id values
insert into teacher_tracks (teacher_id, track_id)
select id, track_id from teachers where track_id is not null;

-- 3. Drop track_id from teachers
alter table teachers drop column if exists track_id;
