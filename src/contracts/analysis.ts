export const ANALYSIS_SCHEMA_VERSION = "analysis-v1" as const;
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

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
  resume: {
    kind: "demo" | "local-metadata";
    name: string;
    sizeBytes: number;
  };
  job: {
    title?: string;
    company?: string;
    description: string;
  };
  acceptedTerms: true;
};

export type CreateAnalysisResponse = {
  analysisId: string;
  status: "queued";
  mode: "demo";
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
  | "INTERNAL_ERROR";

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

  const resume = isRecord(input.resume) ? input.resume : {};
  const job = isRecord(input.job) ? input.job : {};
  const kind = resume.kind;
  const name = typeof resume.name === "string" ? resume.name.trim() : "";
  const sizeBytes = resume.sizeBytes;
  const description = typeof job.description === "string" ? job.description.trim() : "";
  const title = optionalTrimmedString(job.title, "job.title", 120, fieldErrors);
  const company = optionalTrimmedString(job.company, "job.company", 120, fieldErrors);

  if (kind !== "demo" && kind !== "local-metadata") {
    fieldErrors["resume.kind"] = "Origem do currículo inválida.";
  }
  if (!name) fieldErrors["resume.name"] = "Informe o nome do currículo.";
  else if (name.length > 255) fieldErrors["resume.name"] = "Use no máximo 255 caracteres.";
  if (!Number.isInteger(sizeBytes) || (sizeBytes as number) <= 0) {
    fieldErrors["resume.sizeBytes"] = "Informe um tamanho de arquivo válido.";
  } else if ((sizeBytes as number) > MAX_RESUME_SIZE_BYTES) {
    fieldErrors["resume.sizeBytes"] = "O PDF deve ter no máximo 5 MB.";
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
      resume: { kind: kind as CreateAnalysisRequest["resume"]["kind"], name, sizeBytes: sizeBytes as number },
      job: { title, company, description },
      acceptedTerms: true,
    },
  };
}

export function isCreateAnalysisResponse(value: unknown): value is CreateAnalysisResponse {
  if (!isRecord(value)) return false;
  return (
    typeof value.analysisId === "string" &&
    value.status === "queued" &&
    value.mode === "demo" &&
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
