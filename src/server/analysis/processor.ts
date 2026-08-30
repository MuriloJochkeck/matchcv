import type { SupabaseClient } from "@supabase/supabase-js";
import { computeAnalysis } from "./engine.ts";
import { extractJobProfile, extractResumeProfile, MODEL_VERSION, PROMPT_VERSION } from "./structured.ts";

type ClaimedJob = { job_id: string; analysis_id: string; attempts: number; resume_text: string | null; job_text: string | null; structured_json: unknown };
export type ProcessingResult =
  | { status: "completed"; analysisId: string; attempts: number }
  | { status: "retry_scheduled" | "failed"; analysisId: string; attempts?: number }
  | { status: "idle" };

export async function processAnalysisJob(supabase: SupabaseClient, requestedJobId: string | null = null): Promise<ProcessingResult> {
  const { data: claimed, error: claimError } = await supabase.rpc("claim_analysis_job", { p_job_id: requestedJobId });
  if (claimError) throw claimError;
  const job = (Array.isArray(claimed) ? claimed[0] : claimed) as ClaimedJob | null | undefined;
  if (!job) return { status: "idle" };
  try {
    if (!job.resume_text?.trim() || !job.job_text?.trim()) throw new Error("PROCESSING_INPUT_UNAVAILABLE");
    const structured = typeof job.structured_json === "object" && job.structured_json !== null ? job.structured_json as { requirements?: unknown } : null;
    const resumeProfile = extractResumeProfile(job.resume_text);
    const jobProfile = extractJobProfile(job.job_text, structured?.requirements);
    if (resumeProfile.schemaVersion !== jobProfile.schemaVersion) throw new Error("STRUCTURED_SCHEMA_MISMATCH");
    const computed = computeAnalysis(job.resume_text, job.job_text, jobProfile.requirements);
    await supabase.from("analyses").update({ prompt_version: PROMPT_VERSION, model_version: MODEL_VERSION }).eq("id", job.analysis_id);
    const { error } = await supabase.rpc("complete_analysis_job", {
      p_job_id: job.job_id, p_analysis_id: job.analysis_id, p_score: computed.score,
      p_dimensions: computed.dimensions,
      p_matches: computed.matches.map((item) => ({ requirement_id: item.requirementId, title: item.title, requirement_kind: item.kind, status: item.status, confidence: item.confidence, evidence: item.evidence, note: item.note })),
      p_recommendations: computed.recommendations,
    });
    if (error) throw error;
    return { status: "completed", analysisId: job.analysis_id, attempts: job.attempts };
  } catch (error) {
    const { data: failed, error: failError } = await supabase.rpc("fail_analysis_job", { p_job_id: job.job_id, p_analysis_id: job.analysis_id, p_error_code: error instanceof Error ? error.name : "PROCESSING_FAILED", p_max_attempts: 3 });
    if (failError) throw failError;
    const retry = Array.isArray(failed) ? failed[0]?.retry : failed?.retry;
    return { status: retry ? "retry_scheduled" : "failed", analysisId: job.analysis_id, attempts: job.attempts };
  }
}
