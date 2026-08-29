create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.resume_source as enum ('upload', 'demo');
create type public.resume_status as enum ('uploaded', 'extracting', 'ready', 'failed', 'deleted');
create type public.analysis_status as enum ('queued', 'processing', 'completed', 'failed', 'cancelled');
create type public.match_status as enum ('matched', 'partial', 'missing', 'not_applicable');
create type public.processing_status as enum ('queued', 'processing', 'completed', 'failed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  locale text not null default 'pt-BR' check (locale = 'pt-BR'),
  accepted_terms_at timestamptz,
  product_improvement_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source public.resume_source not null default 'upload',
  original_name text not null check (char_length(original_name) between 1 and 255),
  storage_key text unique,
  status public.resume_status not null default 'uploaded',
  mime_type text not null default 'application/pdf' check (mime_type = 'application/pdf'),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint resume_storage_by_source check (
    (source = 'upload' and storage_key is not null) or
    (source = 'demo' and storage_key is null)
  )
);

create table public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  version integer not null check (version > 0),
  extracted_text text not null default '',
  structured_json jsonb not null default '{}'::jsonb,
  schema_version text not null,
  created_at timestamptz not null default now(),
  unique (resume_id, version)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text check (title is null or char_length(title) <= 120),
  company_label text check (company_label is null or char_length(company_label) <= 120),
  raw_text text not null check (char_length(raw_text) between 80 and 20000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.job_versions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  version integer not null check (version > 0),
  structured_json jsonb not null default '{}'::jsonb,
  schema_version text not null,
  created_at timestamptz not null default now(),
  unique (job_id, version)
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_version_id uuid not null references public.resume_versions(id) on delete restrict,
  job_version_id uuid not null references public.job_versions(id) on delete restrict,
  status public.analysis_status not null default 'queued',
  score smallint check (score is null or score between 0 and 100),
  algorithm_version text not null,
  schema_version text not null,
  prompt_version text,
  model_version text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  deleted_at timestamptz
);

create table public.analysis_dimensions (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  dimension text not null check (dimension in ('technical', 'experience', 'required', 'education', 'evidence')),
  weight smallint not null check (weight between 0 and 100),
  score smallint not null check (score between 0 and 100),
  rationale text not null,
  unique (analysis_id, dimension)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  requirement_id text not null,
  title text not null,
  requirement_kind text not null check (requirement_kind in ('required', 'desirable')),
  status public.match_status not null,
  confidence smallint not null check (confidence between 0 and 100),
  evidence text,
  note text not null,
  unique (analysis_id, requirement_id)
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  priority smallint not null check (priority between 1 and 3),
  category text not null check (category in ('resume', 'preparation', 'clarity')),
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  unique (analysis_id, user_id)
);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('resume_extraction', 'job_extraction', 'analysis')),
  resource_id uuid not null,
  status public.processing_status not null default 'queued',
  attempts smallint not null default 0 check (attempts between 0 and 3),
  idempotency_key text not null,
  error_code text,
  available_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index resumes_user_created_idx on public.resumes (user_id, created_at desc) where deleted_at is null;
create index resumes_status_idx on public.resumes (status, created_at) where deleted_at is null;
create index resume_versions_resume_idx on public.resume_versions (resume_id, version desc);
create index jobs_user_created_idx on public.jobs (user_id, created_at desc) where deleted_at is null;
create index job_versions_job_idx on public.job_versions (job_id, version desc);
create index analyses_user_created_idx on public.analyses (user_id, created_at desc) where deleted_at is null;
create index analyses_status_idx on public.analyses (status, created_at) where deleted_at is null;
create index analysis_dimensions_analysis_idx on public.analysis_dimensions (analysis_id);
create index matches_analysis_status_idx on public.matches (analysis_id, status);
create index recommendations_analysis_priority_idx on public.recommendations (analysis_id, priority);
create index processing_jobs_ready_idx on public.processing_jobs (status, available_at) where status in ('queued', 'failed');

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.jobs enable row level security;
alter table public.job_versions enable row level security;
alter table public.analyses enable row level security;
alter table public.analysis_dimensions enable row level security;
alter table public.matches enable row level security;
alter table public.recommendations enable row level security;
alter table public.feedback enable row level security;
alter table public.processing_jobs enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy "resumes_select_own" on public.resumes for select to authenticated using ((select auth.uid()) = user_id);
create policy "resumes_insert_own" on public.resumes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "resumes_update_own" on public.resumes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "resumes_delete_own" on public.resumes for delete to authenticated using ((select auth.uid()) = user_id);

create policy "resume_versions_select_own" on public.resume_versions for select to authenticated using (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = (select auth.uid())));

create policy "jobs_select_own" on public.jobs for select to authenticated using ((select auth.uid()) = user_id);
create policy "jobs_insert_own" on public.jobs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "jobs_update_own" on public.jobs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "jobs_delete_own" on public.jobs for delete to authenticated using ((select auth.uid()) = user_id);

create policy "job_versions_select_own" on public.job_versions for select to authenticated using (exists (select 1 from public.jobs j where j.id = job_id and j.user_id = (select auth.uid())));

create policy "analyses_select_own" on public.analyses for select to authenticated using ((select auth.uid()) = user_id);
create policy "analyses_insert_own" on public.analyses for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.resume_versions rv
    join public.resumes r on r.id = rv.resume_id
    where rv.id = resume_version_id and r.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.job_versions jv
    join public.jobs j on j.id = jv.job_id
    where jv.id = job_version_id and j.user_id = (select auth.uid())
  )
);
create policy "analyses_delete_own" on public.analyses for delete to authenticated using ((select auth.uid()) = user_id);

create policy "analysis_dimensions_select_own" on public.analysis_dimensions for select to authenticated using (exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));

create policy "matches_select_own" on public.matches for select to authenticated using (exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));

create policy "recommendations_select_own" on public.recommendations for select to authenticated using (exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));

create policy "feedback_select_own" on public.feedback for select to authenticated using ((select auth.uid()) = user_id);
create policy "feedback_insert_own" on public.feedback for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy "feedback_update_own" on public.feedback for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy "feedback_delete_own" on public.feedback for delete to authenticated using ((select auth.uid()) = user_id);

create policy "processing_jobs_select_own" on public.processing_jobs for select to authenticated using ((select auth.uid()) = user_id);
create policy "processing_jobs_insert_own" on public.processing_jobs for insert to authenticated with check (
  (select auth.uid()) = user_id and (
    (kind = 'resume_extraction' and exists (select 1 from public.resumes r where r.id = resource_id and r.user_id = (select auth.uid())))
    or (kind = 'job_extraction' and exists (select 1 from public.jobs j where j.id = resource_id and j.user_id = (select auth.uid())))
    or (kind = 'analysis' and exists (select 1 from public.analyses a where a.id = resource_id and a.user_id = (select auth.uid())))
  )
);

grant usage on schema public to authenticated;
grant select, insert, delete on public.profiles to authenticated;
grant update (display_name, locale, accepted_terms_at, product_improvement_consent_at, updated_at) on public.profiles to authenticated;
grant select, insert, delete on public.resumes to authenticated;
grant select, insert, delete on public.jobs to authenticated;
grant update (title, company_label, raw_text, deleted_at) on public.jobs to authenticated;
grant select, insert, delete on public.analyses to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select on public.resume_versions, public.job_versions, public.analysis_dimensions, public.matches, public.recommendations to authenticated;
grant select, insert on public.processing_jobs to authenticated;
revoke all on all tables in schema public from anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "resume_objects_select_own" on storage.objects for select to authenticated
using (bucket_id = 'resumes' and owner_id = (select auth.uid()::text));

create policy "resume_objects_insert_own" on storage.objects for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "resume_objects_delete_own" on storage.objects for delete to authenticated
using (bucket_id = 'resumes' and owner_id = (select auth.uid()::text));

comment on table public.analyses is 'Versioned aggregate; score is server-calculated and never supplied by an AI model.';
comment on column public.resumes.storage_key is 'Private object key. Never serialize this column to browser contracts.';
comment on column public.matches.status is 'missing means not identified in the document, not absence of candidate ability.';
