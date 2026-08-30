create index if not exists resumes_expiration_idx on public.resumes (expires_at) where deleted_at is null and expires_at is not null;

create or replace function public.cancel_analysis(p_analysis_id uuid)
returns boolean
language plpgsql
security definer
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

revoke all on function public.cancel_analysis(uuid) from public, anon;
grant execute on function public.cancel_analysis(uuid) to authenticated;
