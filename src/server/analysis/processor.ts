import type { SupabaseClient } from "@supabase/supabase-js";
import { computeAnalysis } from "./engine";

type ClaimedJob = { job_id: string; analysis_id: string; attempts: number; resume_text: string | null; job_text: string | null };
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
    const computed = computeAnalysis(job.resume_text, job.job_text);
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
