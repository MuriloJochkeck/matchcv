grant insert on public.resume_versions, public.job_versions, public.analysis_dimensions, public.matches, public.recommendations to authenticated;

drop policy if exists "resume_versions_insert_own" on public.resume_versions;
drop policy if exists "job_versions_insert_own" on public.job_versions;
drop policy if exists "analysis_dimensions_insert_own" on public.analysis_dimensions;
drop policy if exists "matches_insert_own" on public.matches;
drop policy if exists "recommendations_insert_own" on public.recommendations;

create policy "resume_versions_insert_own" on public.resume_versions for insert to authenticated
with check (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = (select auth.uid())));

create policy "job_versions_insert_own" on public.job_versions for insert to authenticated
with check (exists (select 1 from public.jobs j where j.id = job_id and j.user_id = (select auth.uid())));

create policy "analysis_dimensions_insert_own" on public.analysis_dimensions for insert to authenticated
with check (exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));

create policy "matches_insert_own" on public.matches for insert to authenticated
with check (exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));

create policy "recommendations_insert_own" on public.recommendations for insert to authenticated
with check (exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
