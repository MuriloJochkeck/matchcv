import { createAdminClient, getProcessingWorkerSecret } from "@/lib/supabase/admin";
import { computeAnalysis } from "@/server/analysis/engine";

const headers = { "Cache-Control": "no-store" };

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers });
}

function authorized(request: Request) {
  const secret = getProcessingWorkerSecret();
  const provided = request.headers.get("x-processing-worker-secret")?.trim();
  const authorization = request.headers.get("authorization")?.trim();
  return Boolean(secret && ((provided && provided === secret) || authorization === `Bearer ${secret}`));
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (!authorized(request)) return response({ error: "Não autorizado.", requestId }, 401);

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return response({ error: "Worker não configurado.", requestId }, 503);
  }

  const requestedJobId = request.headers.get("x-processing-job-id")?.trim() || null;
  const { data: claimed, error: claimError } = await supabase.rpc("claim_analysis_job", { p_job_id: requestedJobId });
  const job = Array.isArray(claimed) ? claimed[0] : claimed;
  if (claimError) {
    console.error("processing.claim.failed", { requestId, errorName: claimError.name, errorMessage: claimError.message });
    return response({ error: "Não foi possível reivindicar o job.", requestId }, 500);
  }
  if (!job) return response({ status: "idle", requestId });

  try {
    if (!job.resume_text || !job.job_text) throw new Error("PROCESSING_INPUT_UNAVAILABLE");
    const computed = computeAnalysis(job.resume_text, job.job_text);
    const { error: completeError } = await supabase.rpc("complete_analysis_job", {
      p_job_id: job.job_id,
      p_analysis_id: job.analysis_id,
      p_score: computed.score,
      p_dimensions: computed.dimensions.map((item) => ({ dimension: item.dimension, weight: item.weight, score: item.score, rationale: item.rationale })),
      p_matches: computed.matches.map((item) => ({ requirement_id: item.requirementId, title: item.title, requirement_kind: item.kind, status: item.status, confidence: item.confidence, evidence: item.evidence, note: item.note })),
      p_recommendations: computed.recommendations,
    });
    if (completeError) throw completeError;
    return response({ status: "completed", analysisId: job.analysis_id, attempts: job.attempts, requestId });
  } catch (error) {
    const { data: failed, error: failError } = await supabase.rpc("fail_analysis_job", {
      p_job_id: job.job_id,
      p_analysis_id: job.analysis_id,
      p_error_code: error instanceof Error ? error.name : "PROCESSING_FAILED",
      p_max_attempts: 3,
    });
    if (failError) {
      console.error("processing.fail.update-failed", { requestId, jobId: job.job_id, errorName: failError.name });
      return response({ error: "Não foi possível registrar a falha do job.", requestId }, 500);
    }
    const retry = Array.isArray(failed) ? failed[0]?.retry : failed?.retry;
    console.error("processing.analysis.failed", { requestId, jobId: job.job_id, retry });
    return response({ status: retry ? "retry_scheduled" : "failed", analysisId: job.analysis_id, requestId }, retry ? 202 : 500);
  }
}

export async function GET(request: Request) {
  return POST(request);
}
