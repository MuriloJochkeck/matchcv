import type { SupabaseClient } from "@supabase/supabase-js";
import { ANALYSIS_SCHEMA_VERSION } from "../../contracts/analysis.ts";
import type {
  AnalysisDimension,
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  GetAnalysisResponse,
  Recommendation,
  RequirementMatch,
} from "../../contracts/analysis";
import { demoAnalysis } from "./demo-analysis.ts";

const dimensionLabels: Record<AnalysisDimension["key"], string> = {
  technical: "Competências técnicas",
  experience: "Experiência relacionada",
  required: "Requisitos obrigatórios",
  education: "Formação e idiomas",
  evidence: "Clareza das evidências",
};

const dimensionOrder: AnalysisDimension["key"][] = [
  "technical",
  "experience",
  "required",
  "education",
  "evidence",
];

const kindLabels: Record<"required" | "desirable", RequirementMatch["kind"]> = {
  required: "Obrigatório",
  desirable: "Desejável",
};

const priorityLabels: Record<number, Recommendation["priority"]> = {
  1: "Alta",
  2: "Média",
  3: "Baixa",
};

const categoryLabels: Record<"resume" | "preparation" | "clarity", Recommendation["category"]> = {
  resume: "currículo",
  preparation: "preparação",
  clarity: "clareza",
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export function createDemoAnalysis(
  _input: CreateAnalysisRequest,
  requestId: string,
): CreateAnalysisResponse {
  return {
    analysisId: demoAnalysis.id,
    status: "queued",
    mode: "demo",
    schemaVersion: ANALYSIS_SCHEMA_VERSION,
    requestId,
  };
}

export async function getAnalysisById(
  supabase: SupabaseClient,
  id: string,
  requestId: string,
): Promise<GetAnalysisResponse | null> {
  if (id === demoAnalysis.id) {
    return { analysis: demoAnalysis, schemaVersion: ANALYSIS_SCHEMA_VERSION, requestId };
  }

  const { data: analysis, error } = await supabase
    .from("analyses")
    .select("id, status, score, algorithm_version, created_at, resume_version_id, job_version_id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!analysis) return null;

  const [
    { data: dimensions, error: dimensionsError },
    { data: matches, error: matchesError },
    { data: recommendations, error: recommendationsError },
    { data: resumeVersion, error: resumeError },
    { data: jobVersion, error: jobError },
  ] = await Promise.all([
    supabase
      .from("analysis_dimensions")
      .select("dimension, weight, score, rationale")
      .eq("analysis_id", id),
    supabase
      .from("matches")
      .select("requirement_id, title, requirement_kind, status, confidence, evidence, note")
      .eq("analysis_id", id),
    supabase
      .from("recommendations")
      .select("id, priority, category, title, description")
      .eq("analysis_id", id)
      .order("priority", { ascending: true }),
    supabase
      .from("resume_versions")
      .select("resumes(original_name)")
      .eq("id", analysis.resume_version_id)
      .single(),
    supabase
      .from("job_versions")
      .select("jobs(title, company_label)")
      .eq("id", analysis.job_version_id)
      .single(),
  ]);

  const readError = dimensionsError ?? matchesError ?? recommendationsError ?? resumeError ?? jobError;
  if (readError) throw readError;

  const resume = firstRelation(
    (resumeVersion as { resumes?: { original_name: string } | { original_name: string }[] } | null)?.resumes,
  );
  const job = firstRelation(
    (jobVersion as { jobs?: { title: string | null; company_label: string | null } | { title: string | null; company_label: string | null }[] } | null)?.jobs,
  );

  return {
    analysis: {
      id: analysis.id,
      status: analysis.status,
      jobTitle: job?.title || "Vaga analisada",
      companyLabel: job?.company_label || "Empresa não informada",
      resumeName: resume?.original_name || "Currículo",
      createdAt: formatCreatedAt(analysis.created_at),
      algorithmVersion: analysis.algorithm_version,
      dimensions: (dimensions ?? [])
        .map((item) => ({
          key: item.dimension as AnalysisDimension["key"],
          label: dimensionLabels[item.dimension as AnalysisDimension["key"]] ?? item.dimension,
          score: item.score,
          weight: item.weight,
          rationale: item.rationale,
        }))
        .sort((a, b) => dimensionOrder.indexOf(a.key) - dimensionOrder.indexOf(b.key)),
      requirements: (matches ?? []).map((item) => ({
        id: item.requirement_id,
        title: item.title,
        kind: kindLabels[item.requirement_kind as "required" | "desirable"] ?? "Obrigatório",
        status: item.status as RequirementMatch["status"],
        confidence: item.confidence,
        evidence: item.evidence ?? undefined,
        note: item.note,
      })),
      recommendations: (recommendations ?? []).map((item) => ({
        id: item.id,
        priority: priorityLabels[item.priority] ?? "Baixa",
        category: categoryLabels[item.category as "resume" | "preparation" | "clarity"] ?? "clareza",
        title: item.title,
        description: item.description,
      })),
    },
    schemaVersion: ANALYSIS_SCHEMA_VERSION,
    requestId,
  };
}
