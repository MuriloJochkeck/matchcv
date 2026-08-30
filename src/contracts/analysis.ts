export const ANALYSIS_SCHEMA_VERSION = "analysis-v1" as const;
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
import type { JobRequirement } from "./job.ts";
import { normalizeJobRequirements } from "./job.ts";

export type AnalysisStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export type MatchStatus = "matched" | "partial" | "missing";

export type AnalysisDimension = {
  key: "technical" | "experience" | "required" | "education" | "evidence";
  label: string;
  score: number;
  weight: number;
  rationale: string;
};

export type RequirementMatch = {
  id: string;
  title: string;
  kind: "Obrigatório" | "Desejável";
  status: MatchStatus;
  confidence: number;
  evidence?: string;
  note: string;
};

export type Recommendation = {
  id: string;
  priority: "Alta" | "Média" | "Baixa";
  title: string;
  description: string;
  category: "currículo" | "preparação" | "clareza";
};

export type Analysis = {
  id: string;
  status: AnalysisStatus;
  jobTitle: string;
  companyLabel: string;
  resumeName: string;
  createdAt: string;
  algorithmVersion: string;
  dimensions: AnalysisDimension[];
  requirements: RequirementMatch[];
  recommendations: Recommendation[];
};

export type CreateAnalysisRequest = {
  resumeId: string;
  job: {
    title?: string;
    company?: string;
    description: string;
    requirements?: JobRequirement[];
  };
  acceptedTerms: true;
};

export type CreateAnalysisResponse = {
  analysisId: string;
  status: "queued" | "processing" | "completed";
  mode?: "demo" | "integrated";
  schemaVersion: typeof ANALYSIS_SCHEMA_VERSION;
  requestId: string;
};

export type AnalysisListItem = {
  id: string;
  score: number | null;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  createdAt: string;
  jobTitle: string;
  companyLabel: string;
};

export type ListAnalysesResponse = {
  analyses: AnalysisListItem[];
  nextCursor: string | null;
  schemaVersion: typeof ANALYSIS_SCHEMA_VERSION;
  requestId: string;
};
export type GetAnalysisResponse = {
  analysis: Analysis;
  schemaVersion: typeof ANALYSIS_SCHEMA_VERSION;
  requestId: string;
};

export type ApiErrorCode =
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "ANALYSIS_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "UNAUTHENTICATED"
  | "RESUME_NOT_FOUND";

export type ApiErrorResponse = {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  requestId: string;
};

export type ValidationResult =
  | { success: true; data: CreateAnalysisRequest }
  | { success: false; fieldErrors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalTrimmedString(
  value: unknown,
  field: string,
  maxLength: number,
  fieldErrors: Record<string, string>,
) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    fieldErrors[field] = "Informe um texto válido.";
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    fieldErrors[field] = `Use no máximo ${maxLength} caracteres.`;
  }
  return normalized;
}

export function parseCreateAnalysisRequest(input: unknown): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  if (!isRecord(input)) {
    return { success: false, fieldErrors: { request: "Envie um objeto JSON válido." } };
  }

  const resumeId = typeof input.resumeId === "string" ? input.resumeId.trim() : "";
  const job = isRecord(input.job) ? input.job : {};
  const description = typeof job.description === "string" ? job.description.trim() : "";
  const title = optionalTrimmedString(job.title, "job.title", 120, fieldErrors);
  const company = optionalTrimmedString(job.company, "job.company", 120, fieldErrors);
  const requirements = Array.isArray(job.requirements) ? job.requirements : undefined;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resumeId)) {
    fieldErrors.resumeId = "Selecione um currículo válido.";
  }
  if (description.length < 80) {
    fieldErrors["job.description"] = "A descrição da vaga deve ter pelo menos 80 caracteres.";
  } else if (description.length > 20_000) {
    fieldErrors["job.description"] = "A descrição da vaga deve ter no máximo 20.000 caracteres.";
  }
  if (input.acceptedTerms !== true) {
    fieldErrors.acceptedTerms = "Confirme a autorização e os limites da análise.";
  }

  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };

  return {
    success: true,
    data: {
      resumeId,
      job: { title, company, description, requirements: normalizeJobRequirements(requirements, description) },
      acceptedTerms: true,
    },
  };
}

export function isCreateAnalysisResponse(value: unknown): value is CreateAnalysisResponse {
  if (!isRecord(value)) return false;
  return (
    typeof value.analysisId === "string" &&
    (value.status === "queued" || value.status === "processing" || value.status === "completed") &&
    (value.mode === undefined || value.mode === "demo" || value.mode === "integrated") &&
    value.schemaVersion === ANALYSIS_SCHEMA_VERSION &&
    typeof value.requestId === "string"
  );
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.message === "string" &&
    typeof value.requestId === "string"
  );
}

export function isListAnalysesResponse(value: unknown): value is ListAnalysesResponse {
  if (!isRecord(value) || !Array.isArray(value.analyses)) return false;
  return (value.nextCursor === null || typeof value.nextCursor === "string") && value.schemaVersion === ANALYSIS_SCHEMA_VERSION && typeof value.requestId === "string";
}
