-- Idempotent migration for IDS-6.0
-- Run this in Supabase SQL Editor.
-- Purpose:
-- 1) Add missing profile columns used by signup/profile/resume flows
-- 2) Ensure student_progress table exists
-- 3) Backfill profile fields from weak_skills metadata wrapper when present

begin;

alter table if exists profiles
  add column if not exists college_name text,
  add column if not exists year text,
  add column if not exists about text,
  add column if not exists resume_file_name text,
  add column if not exists resume_storage_name text,
  add column if not exists resume_bucket_path text,
  add column if not exists resume_public_url text,
  add column if not exists resume_content_type text,
  add column if not exists resume_insights jsonb,
  add column if not exists last_login_at timestamptz,
  add column if not exists progress_percentage int default 0,
  add column if not exists active_roadmap int default 0;

create table if not exists student_progress (
  id text primary key,
  student_email text,
  progress_percentage int default 0,
  updated_at timestamptz default now()
);

create index if not exists student_progress_email_idx on student_progress(student_email);
create index if not exists profiles_last_login_at_idx on profiles(last_login_at);

-- Backfill from compatibility metadata stored in weak_skills array as:
-- "__profile_meta__:{...json...}"

do $$
declare
  r record;
  meta_raw text;
  meta_json jsonb;
begin
  for r in
    select id, weak_skills
    from profiles
    where weak_skills is not null
  loop
    begin
      select replace(value, '__profile_meta__:', '')
      into meta_raw
      from jsonb_array_elements_text(r.weak_skills) as value
      where value like '__profile_meta__:%'
      limit 1;

      if meta_raw is null then
        continue;
      end if;

      meta_json := meta_raw::jsonb;

      update profiles
      set
        college_name = coalesce(college_name, meta_json ->> 'college_name'),
        year = coalesce(year, meta_json ->> 'year'),
        about = coalesce(about, meta_json ->> 'about'),
        resume_file_name = coalesce(resume_file_name, meta_json ->> 'resume_file_name'),
        resume_storage_name = coalesce(resume_storage_name, meta_json ->> 'resume_storage_name'),
        resume_bucket_path = coalesce(resume_bucket_path, meta_json ->> 'resume_bucket_path'),
        resume_public_url = coalesce(resume_public_url, meta_json ->> 'resume_public_url'),
        resume_content_type = coalesce(resume_content_type, meta_json ->> 'resume_content_type'),
        resume_insights = coalesce(resume_insights, meta_json -> 'resume_insights'),
        last_login_at = coalesce(last_login_at, nullif(meta_json ->> 'last_login_at', '')::timestamptz),
        progress_percentage = coalesce(progress_percentage, nullif(meta_json ->> 'progress_percentage', '')::int, 0),
        active_roadmap = coalesce(active_roadmap, nullif(meta_json ->> 'active_roadmap', '')::int, 0)
      where id = r.id;
    exception
      when others then
        -- Skip malformed metadata rows safely.
        continue;
    end;
  end loop;
end $$;

commit;
