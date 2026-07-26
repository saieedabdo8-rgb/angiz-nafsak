-- Migration: allow teachers + courses in multiple tracks

-- TEACHER_TRACKS
create table if not exists teacher_tracks (
  teacher_id uuid not null references teachers(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (teacher_id, track_id)
);

insert into teacher_tracks (teacher_id, track_id)
select id, track_id from teachers where track_id is not null;

alter table teachers drop column if exists track_id;

-- COURSE_TRACKS
create table if not exists course_tracks (
  course_id uuid not null references courses(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  primary key (course_id, track_id)
);

insert into course_tracks (course_id, track_id)
select id, track_id from courses where track_id is not null;

alter table courses drop column if exists track_id;
