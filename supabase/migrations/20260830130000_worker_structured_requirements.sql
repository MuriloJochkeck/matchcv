drop function if exists public.claim_analysis_job(uuid);

create or replace function public.claim_analysis_job(p_job_id uuid default null)
returns table (job_id uuid, analysis_id uuid, attempts smallint, resume_text text, job_text text, structured_json jsonb)
language plpgsql security definer set search_path = public as $$
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
  select j.raw_text, jv.structured_json into job_text, structured_json from public.job_versions jv join public.jobs j on j.id = jv.job_id where jv.id = v_analysis.job_version_id;
  return next;
end; $$;

revoke execute on function public.claim_analysis_job(uuid) from public, anon, authenticated;
grant execute on function public.claim_analysis_job(uuid) to service_role;