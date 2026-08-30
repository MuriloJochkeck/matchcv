import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateAnalysisRequest, CreateAnalysisResponse } from "../../contracts/analysis.ts";
import { ANALYSIS_SCHEMA_VERSION } from "../../contracts/analysis.ts";
import { computeAnalysis } from "./engine.ts";

type SynchronousInput = CreateAnalysisRequest & { userId: string; idempotencyKey: string };

function isMissingProcessingFunction(error: unknown) {
  return typeof error === "object" && error !== null && "message" in error && /claim_analysis_job|enqueue_analysis/i.test(String(error.message));
}

export function shouldUseSynchronousFallback(error: unknown) {
  return isMissingProcessingFunction(error);
}

export async function createSynchronousAnalysis(
  supabase: SupabaseClient,
  input: SynchronousInput,
  requestId: string,
): Promise<CreateAnalysisResponse> {
  const { data: existing, error: existingError } = await supabase
    .from("processing_jobs")
    .select("resource_id")
    .eq("user_id", input.userId)
    .eq("kind", "analysis")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.resource_id) {
    return { analysisId: existing.resource_id, status: "completed", mode: "integrated", schemaVersion: ANALYSIS_SCHEMA_VERSION, requestId };
  }

  const { data: resumeVersion, error: resumeError } = await supabase
    .from("resume_versions")
    .select("id, extracted_text, resumes!inner(user_id, deleted_at)")
    .eq("resume_id", input.resumeId)
    .eq("resumes.user_id", input.userId)
    .is("resumes.deleted_at", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (resumeError) throw resumeError;
  if (!resumeVersion?.id || !resumeVersion.extracted_text?.trim()) {
    const error = new Error("resume_not_found");
    error.name = "RESUME_NOT_FOUND";
    throw error;
  }

  const computed = computeAnalysis(resumeVersion.extracted_text, input.job.description);
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({ user_id: input.userId, title: input.job.title ?? null, company_label: input.job.company ?? null, raw_text: input.job.description })
    .select("id")
    .single();
  if (jobError || !job) throw jobError ?? new Error("job_insert_failed");

  try {
    const { data: jobVersion, error: jobVersionError } = await supabase
      .from("job_versions")
      .insert({ job_id: job.id, version: 1, schema_version: "job-v1" })
      .select("id")
      .single();
    if (jobVersionError || !jobVersion) throw jobVersionError ?? new Error("job_version_insert_failed");

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({ user_id: input.userId, resume_version_id: resumeVersion.id, job_version_id: jobVersion.id, status: "completed", score: computed.score, algorithm_version: "deterministic-v1", schema_version: ANALYSIS_SCHEMA_VERSION, completed_at: new Date().toISOString() })
      .select("id")
      .single();
    if (analysisError || !analysis) throw analysisError ?? new Error("analysis_insert_failed");

    const [dimensions, matches, recommendations, processingJob] = await Promise.all([
      supabase.from("analysis_dimensions").insert(computed.dimensions.map((item) => ({ analysis_id: analysis.id, dimension: item.dimension, weight: item.weight, score: item.score, rationale: item.rationale }))),
      supabase.from("matches").insert(computed.matches.map((item) => ({ analysis_id: analysis.id, requirement_id: item.requirementId, title: item.title, requirement_kind: item.kind, status: item.status, confidence: item.confidence, evidence: item.evidence, note: item.note }))),
      supabase.from("recommendations").insert(computed.recommendations.map((item) => ({ analysis_id: analysis.id, priority: item.priority, category: item.category, title: item.title, description: item.description }))),
      supabase.from("processing_jobs").insert({ user_id: input.userId, kind: "analysis", resource_id: analysis.id, idempotency_key: input.idempotencyKey, status: "completed", attempts: 1, finished_at: new Date().toISOString() }),
    ]);
    const writeError = dimensions.error ?? matches.error ?? recommendations.error ?? processingJob.error;
    if (writeError) throw writeError;
    return { analysisId: analysis.id, status: "completed", mode: "integrated", schemaVersion: ANALYSIS_SCHEMA_VERSION, requestId };
  } catch (error) {
    await supabase.from("jobs").delete().eq("id", job.id);
    throw error;
  }
}
