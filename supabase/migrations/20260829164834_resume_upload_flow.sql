-- Allow an authenticated owner to finalize metadata only after Storage upload
-- validation. Ownership continues to be enforced by resumes_update_own.
grant update (status, sha256) on public.resumes to authenticated;

-- Cover foreign keys reported by the Supabase performance advisor.
create index analyses_resume_version_id_idx
  on public.analyses (resume_version_id);

create index analyses_job_version_id_idx
  on public.analyses (job_version_id);

create index feedback_user_id_idx
  on public.feedback (user_id);
