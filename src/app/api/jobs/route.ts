import { normalizeJobRequirements } from "@/contracts/job";
import { createClient } from "@/lib/supabase/server";

const headers = { "Cache-Control": "private, no-store" };
function fail(code: string, message: string, requestId: string, status: number, fieldErrors?: Record<string, string>) { return Response.json({ code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers }); }

export async function POST(request: Request) {
  const requestId = crypto.randomUUID(); const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : null;
  const company = typeof body?.company === "string" ? body.company.trim().slice(0, 120) : null;
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (description.length < 80 || description.length > 20_000) return fail("VALIDATION_ERROR", "A descrição da vaga deve ter entre 80 e 20.000 caracteres.", requestId, 422, { description: "Informe uma descrição válida." });
  const supabase = await createClient(); const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para criar a vaga.", requestId, 401);
  const requirements = normalizeJobRequirements(body?.requirements, description);
  const { data: job, error: jobError } = await supabase.from("jobs").insert({ user_id: auth.user.id, title, company_label: company, raw_text: description }).select("id").single();
  if (jobError || !job) return fail("INTERNAL_ERROR", "Não foi possível salvar a vaga.", requestId, 500);
  const { data: version, error: versionError } = await supabase.from("job_versions").insert({ job_id: job.id, version: 1, structured_json: { requirements }, schema_version: "job-v1" }).select("id").single();
  if (versionError || !version) return fail("INTERNAL_ERROR", "Não foi possível estruturar a vaga.", requestId, 500);
  return Response.json({ jobId: job.id, versionId: version.id, requirements, requestId }, { status: 201, headers });
}