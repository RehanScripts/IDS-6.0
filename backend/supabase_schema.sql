-- Supabase schema for IDS-6.0 backend (profiles, companies, roadmaps, student_progress)

create table if not exists profiles (
  id text primary key,
  email text not null,
  password_hash text,
  name text,
  role text,
  branch text,
  college_name text,
  year text,
  about text,
  readiness_score int default 0,
  placement_status text,
  weak_skills jsonb,
  resume_file_name text,
  resume_storage_name text,
  resume_bucket_path text,
  resume_public_url text,
  resume_content_type text,
  resume_insights jsonb,
  last_login_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_email_idx on profiles(email);

create table if not exists companies (
  id text primary key,
  company_name text,
  role text,
  date text,
  eligibility text,
  status text,
  package text,
  requirements text,
  industry text,
  created_at timestamptz default now()
);

create index if not exists companies_status_idx on companies(status);

create table if not exists roadmaps (
  id text primary key,
  student_id text,
  student_email text,
  company_id text,
  company_name text,
  role text,
  skill_gaps jsonb,
  plan jsonb,
  resources jsonb,
  created_at timestamptz default now()
);

create index if not exists roadmaps_student_id_idx on roadmaps(student_id);
create index if not exists roadmaps_student_email_idx on roadmaps(student_email);

create table if not exists student_progress (
  id text primary key,
  student_email text,
  progress_percentage int default 0,
  updated_at timestamptz default now()
);

create index if not exists student_progress_email_idx on student_progress(student_email);
