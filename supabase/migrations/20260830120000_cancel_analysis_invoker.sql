create policy "processing_jobs_cancel_own" on public.processing_jobs
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant update (status, finished_at, error_code) on public.processing_jobs to authenticated;

create or replace function public.cancel_analysis(p_analysis_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare v_deleted boolean;
begin
  update public.processing_jobs
  set status = 'cancelled', finished_at = now(), error_code = 'analysis_cancelled'
  where kind = 'analysis' and resource_id = p_analysis_id and user_id = auth.uid() and status in ('queued', 'processing');
  delete from public.analyses
  where id = p_analysis_id and user_id = auth.uid()
  returning true into v_deleted;
  return coalesce(v_deleted, false);
end;
$$;