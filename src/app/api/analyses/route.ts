import { parseCreateAnalysisRequest } from "../../../contracts/analysis.ts";
import { createClient } from "../../../lib/supabase/server.ts";
import { computeAnalysis } from "../../../server/analysis/engine.ts";

const headers = { "Cache-Control": "private, no-store" };
const fail = (code: string, message: string, requestId: string, status: number, fieldErrors?: Record<string, string>) => Response.json({ code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers });

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const body = await request.json().catch(() => null);
  const parsed = parseCreateAnalysisRequest(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise os dados informados e tente novamente.", requestId, 422, parsed.fieldErrors);
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para iniciar uma análise.", requestId, 401);
  try {
    const { data: version, error: versionError } = await supabase.from("resume_versions").select("id, extracted_text, resumes!inner(user_id)").eq("resume_id", parsed.data.resumeId).order("version", { ascending: false }).limit(1).single();
    if (versionError || !version) return fail("RESUME_NOT_FOUND", "Currículo não encontrado.", requestId, 404);
    const { data: job, error: jobError } = await supabase.from("jobs").insert({ user_id: auth.user.id, title: parsed.data.job.title ?? null, company_label: parsed.data.job.company ?? null, raw_text: parsed.data.job.description }).select("id").single();
    if (jobError || !job) throw jobError ?? new Error("Job unavailable");
    const { data: jobVersion, error: jobVersionError } = await supabase.from("job_versions").insert({ job_id: job.id, version: 1, schema_version: "job-v1" }).select("id").single();
    if (jobVersionError || !jobVersion) throw jobVersionError ?? new Error("Job version unavailable");
    const computed = computeAnalysis(version.extracted_text, parsed.data.job.description);
    const { data: analysis, error: analysisError } = await supabase.from("analyses").insert({ user_id: auth.user.id, resume_version_id: version.id, job_version_id: jobVersion.id, status: "completed", score: computed.score, algorithm_version: "deterministic-v1", schema_version: "analysis-v1", completed_at: new Date().toISOString() }).select("id").single();
    if (analysisError || !analysis) throw analysisError ?? new Error("Analysis unavailable");
    const writes = await Promise.all([
      supabase.from("analysis_dimensions").insert(computed.dimensions.map((item) => ({ analysis_id: analysis.id, dimension: item.dimension, weight: item.weight, score: item.score, rationale: item.rationale }))),
      computed.matches.length ? supabase.from("matches").insert(computed.matches.map((item) => ({ analysis_id: analysis.id, requirement_id: item.requirementId, title: item.title, requirement_kind: item.kind, status: item.status, confidence: item.confidence, evidence: item.evidence, note: item.note }))) : Promise.resolve({ error: null }),
      supabase.from("recommendations").insert(computed.recommendations.map((item) => ({ analysis_id: analysis.id, priority: item.priority, category: item.category, title: item.title, description: item.description }))),
    ]);
    const writeError = writes.find((result) => result.error)?.error;
    if (writeError) throw writeError;
    return Response.json({ analysisId: analysis.id, status: "completed", schemaVersion: "analysis-v1", requestId }, { status: 201, headers });
  } catch (error) {
    console.error("analysis.create.failed", { requestId, errorName: error instanceof Error ? error.name : "UnknownError", errorMessage: error instanceof Error ? error.message : undefined });
    return fail("INTERNAL_ERROR", "Não foi possível concluir a análise.", requestId, 500);
  }
}