-- Persist the reviewed, structured requirements alongside each immutable job version.
create or replace function public.enqueue_analysis(
  p_user_id uuid,
  p_resume_id uuid,
  p_title text,
  p_company_label text,
  p_raw_text text,
  p_idempotency_key text,
  p_request_hash text,
  p_structured_json jsonb
)
returns table (analysis_id uuid, analysis_status public.analysis_status)
language plpgsql security definer set search_path = public as $$
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
  insert into public.job_versions (job_id, version, structured_json, schema_version) values (v_job_id, 1, coalesce(p_structured_json, '{}'::jsonb), 'job-v1') returning id into v_job_version_id;
  insert into public.analyses (user_id, resume_version_id, job_version_id, status, algorithm_version, schema_version) values (p_user_id, v_resume_version_id, v_job_version_id, 'queued', 'deterministic-v1', 'analysis-v1') returning id, status into analysis_id, analysis_status;
  insert into public.processing_jobs (user_id, kind, resource_id, idempotency_key, request_hash) values (p_user_id, 'analysis', analysis_id, p_idempotency_key, p_request_hash);
  return next;
end; $$;

revoke execute on function public.enqueue_analysis(uuid, uuid, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.enqueue_analysis(uuid, uuid, text, text, text, text, text, jsonb) to authenticated;
