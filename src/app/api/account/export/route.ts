import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient(); const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return Response.json({ code: "UNAUTHENTICATED", message: "Entre novamente para exportar seus dados." }, { status: 401 });
  const [profiles, resumes, jobs, analyses] = await Promise.all([
    supabase.from("profiles").select("id, display_name, locale, accepted_terms_at, product_improvement_consent_at, created_at, updated_at").eq("id", auth.user.id).maybeSingle(),
    supabase.from("resumes").select("id, original_name, status, mime_type, size_bytes, sha256, expires_at, created_at, deleted_at, resume_versions(version, extracted_text, structured_json, schema_version, created_at)").eq("user_id", auth.user.id).is("deleted_at", null),
    supabase.from("jobs").select("id, title, company_label, raw_text, created_at, deleted_at, job_versions(version, structured_json, schema_version, created_at)").eq("user_id", auth.user.id).is("deleted_at", null),
    supabase.from("analyses").select("id, status, score, algorithm_version, prompt_version, model_version, schema_version, created_at, completed_at, deleted_at, analysis_dimensions(*), matches(*), recommendations(*), feedback(*)").eq("user_id", auth.user.id).is("deleted_at", null),
  ]);
  const failure = profiles.error || resumes.error || jobs.error || analyses.error;
  if (failure) return Response.json({ code: "EXPORT_FAILED", message: "Não foi possível exportar os dados." }, { status: 500 });
  return Response.json({ exportedAt: new Date().toISOString(), account: { id: auth.user.id, email: auth.user.email ?? null }, profile: profiles.data, resumes: resumes.data, jobs: jobs.data, analyses: analyses.data }, { headers: { "Cache-Control": "private, no-store", "Content-Disposition": 'attachment; filename="matchcv-dados.json"' } });
}