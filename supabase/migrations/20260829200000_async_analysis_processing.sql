-- Atomic analysis creation and processing transitions.
alter table public.processing_jobs add column if not exists request_hash text;
create index if not exists processing_jobs_processing_started_idx on public.processing_jobs (status, started_at) where status = 'processing';

create or replace function public.enqueue_analysis(p_user_id uuid, p_resume_id uuid, p_title text, p_company_label text, p_raw_text text, p_idempotency_key text, p_request_hash text)
returns table (analysis_id uuid, analysis_status public.analysis_status) language plpgsql security definer set search_path = public as $$
declare v_job_id uuid; v_job_version_id uuid; v_resume_version_id uuid; v_existing public.processing_jobs%rowtype;
begin
  if p_user_id is distinct from (select auth.uid()) then raise exception using errcode = '42501', message = 'user_mismatch'; end if;
  if p_idempotency_key is null or length(p_idempotency_key) not between 16 and 200 then raise exception using errcode = '22023', message = 'invalid_idempotency_key'; end if;
  select * into v_existing from public.processing_jobs where user_id = p_user_id and kind = 'analysis' and idempotency_key = p_idempotency_key for update;
  if found then
    if v_existing.request_hash is distinct from p_request_hash then raise exception using errcode = '23505', message = 'idempotency_key_reused'; end if;
    analysis_id := v_existing.resource_id; select a.status into analysis_status from public.analyses a where a.id = v_existing.resource_id; return next; return;
  end if;
  select rv.id into v_resume_version_id from public.resume_versions rv join public.resumes r on r.id = rv.resume_id where rv.resume_id = p_resume_id and r.user_id = p_user_id and r.deleted_at is null order by rv.version desc limit 1;
  if v_resume_version_id is null then raise exception using errcode = 'P0002', message = 'resume_not_found'; end if;
  insert into public.jobs (user_id, title, company_label, raw_text) values (p_user_id, nullif(trim(p_title), ''), nullif(trim(p_company_label), ''), trim(p_raw_text)) returning id into v_job_id;
  insert into public.job_versions (job_id, version, schema_version) values (v_job_id, 1, 'job-v1') returning id into v_job_version_id;
  insert into public.analyses (user_id, resume_version_id, job_version_id, status, algorithm_version, schema_version) values (p_user_id, v_resume_version_id, v_job_version_id, 'queued', 'deterministic-v1', 'analysis-v1') returning id, status into analysis_id, analysis_status;
  insert into public.processing_jobs (user_id, kind, resource_id, idempotency_key, request_hash) values (p_user_id, 'analysis', analysis_id, p_idempotency_key, p_request_hash);
  return next;
end; $$;

create or replace function public.claim_analysis_job(p_job_id uuid default null)
returns table (job_id uuid, analysis_id uuid, attempts smallint, resume_text text, job_text text) language plpgsql security definer set search_path = public as $$
declare v_job public.processing_jobs%rowtype; v_analysis public.analyses%rowtype;
begin
  update public.processing_jobs set status = 'queued', started_at = null, available_at = now() where kind = 'analysis' and status = 'processing' and started_at < now() - interval '10 minutes';
  select * into v_job from public.processing_jobs where kind = 'analysis' and status = 'queued' and available_at <= now() and (p_job_id is null or id = p_job_id) order by created_at for update skip locked limit 1;
  if not found then return; end if;
  update public.processing_jobs set status = 'processing', attempts = attempts + 1, started_at = now(), error_code = null where id = v_job.id returning * into v_job;
  select * into v_analysis from public.analyses where id = v_job.resource_id for update;
  update public.analyses set status = 'processing' where id = v_analysis.id and status in ('queued', 'processing');
  job_id := v_job.id; analysis_id := v_analysis.id; attempts := v_job.attempts;
  select rv.extracted_text into resume_text from public.resume_versions rv where rv.id = v_analysis.resume_version_id;
  select j.raw_text into job_text from public.job_versions jv join public.jobs j on j.id = jv.job_id where jv.id = v_analysis.job_version_id;
  return next;
end; $$;

create or replace function public.complete_analysis_job(p_job_id uuid, p_analysis_id uuid, p_score smallint, p_dimensions jsonb, p_matches jsonb, p_recommendations jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.processing_jobs where id = p_job_id and resource_id = p_analysis_id and status = 'processing') then raise exception using errcode = 'P0001', message = 'job_not_processing'; end if;
  delete from public.analysis_dimensions where analysis_id = p_analysis_id; delete from public.matches where analysis_id = p_analysis_id; delete from public.recommendations where analysis_id = p_analysis_id;
  insert into public.analysis_dimensions (analysis_id, dimension, weight, score, rationale) select p_analysis_id, x.dimension, x.weight, x.score, x.rationale from jsonb_to_recordset(p_dimensions) x(dimension text, weight smallint, score smallint, rationale text);
  insert into public.matches (analysis_id, requirement_id, title, requirement_kind, status, confidence, evidence, note) select p_analysis_id, x.requirement_id, x.title, x.requirement_kind, x.status::public.match_status, x.confidence, x.evidence, x.note from jsonb_to_recordset(p_matches) x(requirement_id text, title text, requirement_kind text, status text, confidence smallint, evidence text, note text);
  insert into public.recommendations (analysis_id, priority, category, title, description) select p_analysis_id, x.priority, x.category, x.title, x.description from jsonb_to_recordset(p_recommendations) x(priority smallint, category text, title text, description text);
  update public.analyses set status = 'completed', score = p_score, completed_at = now() where id = p_analysis_id;
  update public.processing_jobs set status = 'completed', finished_at = now(), error_code = null where id = p_job_id;
end; $$;

create or replace function public.fail_analysis_job(p_job_id uuid, p_analysis_id uuid, p_error_code text, p_max_attempts smallint default 3)
returns table (retry boolean) language plpgsql security definer set search_path = public as $$
declare v_attempts smallint;
begin
  select attempts into v_attempts from public.processing_jobs where id = p_job_id and status = 'processing' for update; if v_attempts is null then retry := false; return next; return; end if;
  retry := v_attempts < p_max_attempts;
  update public.processing_jobs set status = case when retry then 'queued'::public.processing_status else 'failed'::public.processing_status end, error_code = left(p_error_code, 120), available_at = case when retry then now() + make_interval(secs => 30 * v_attempts) else now() end, started_at = null, finished_at = case when retry then null else now() end where id = p_job_id;
  update public.analyses set status = case when retry then 'queued'::public.analysis_status else 'failed'::public.analysis_status end where id = p_analysis_id;
  return next;
end; $$;

revoke execute on function public.enqueue_analysis(uuid, uuid, text, text, text, text, text) from public, anon;
revoke execute on function public.claim_analysis_job(uuid) from public, anon, authenticated;
revoke execute on function public.complete_analysis_job(uuid, uuid, smallint, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.fail_analysis_job(uuid, uuid, text, smallint) from public, anon, authenticated;
grant execute on function public.enqueue_analysis(uuid, uuid, text, text, text, text, text) to authenticated;
grant execute on function public.claim_analysis_job(uuid) to service_role;
grant execute on function public.complete_analysis_job(uuid, uuid, smallint, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.fail_analysis_job(uuid, uuid, text, smallint) to service_role;
