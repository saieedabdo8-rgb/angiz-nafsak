-- Revert: drop teacher_tracks, add track_id back
drop table if exists teacher_tracks cascade;
alter table teachers add column if not exists track_id uuid references tracks(id);
