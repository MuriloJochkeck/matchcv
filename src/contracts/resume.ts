export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
export const RESUME_BUCKET = "resumes" as const;
export const MAX_EXTRACTED_TEXT_LENGTH = 100_000;

export type ResumeStatus = "uploaded" | "extracting" | "ready" | "failed";
export type ResumeSummary = { id: string; originalName: string; sizeBytes: number; status: ResumeStatus; createdAt: string };
export type CreateResumeUploadIntentRequest = { name: string; sizeBytes: number; mimeType: "application/pdf" };
export type CreateResumeUploadIntentResponse = { resumeId: string; uploadToken: string };
export type FinalizeResumeUploadResponse = { resume: ResumeSummary };
export type UpdateResumeTextRequest = { extractedText: string };
export type UpdateResumeTextResponse = { resumeId: string; version: number; extractedText: string; updatedAt: string };

export type ResumeApiErrorCode = "INVALID_JSON" | "VALIDATION_ERROR" | "UNAUTHENTICATED" | "RESUME_NOT_FOUND" | "UPLOAD_INCOMPLETE" | "INVALID_PDF" | "INTERNAL_ERROR";
export type ResumeApiErrorResponse = { code: ResumeApiErrorCode; message: string; fieldErrors?: Record<string, string>; requestId: string };

type ParseResult =
  | { success: true; data: CreateResumeUploadIntentRequest }
  | { success: false; fieldErrors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseResumeUploadIntent(input: unknown): ParseResult {
  if (!isRecord(input)) return { success: false, fieldErrors: { request: "Envie um objeto JSON válido." } };
  const fieldErrors: Record<string, string> = {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const sizeBytes = input.sizeBytes;
  const mimeType = input.mimeType;

  if (!name) fieldErrors.name = "Informe o nome do currículo.";
  else if (name.length > 255) fieldErrors.name = "Use no máximo 255 caracteres.";
  else if (!name.toLowerCase().endsWith(".pdf")) fieldErrors.name = "O arquivo deve ter extensão .pdf.";
  if (!Number.isInteger(sizeBytes) || (sizeBytes as number) <= 0) fieldErrors.sizeBytes = "Informe um tamanho de arquivo válido.";
  else if ((sizeBytes as number) > MAX_RESUME_SIZE_BYTES) fieldErrors.sizeBytes = "O PDF deve ter no máximo 5 MB.";
  if (mimeType !== "application/pdf") fieldErrors.mimeType = "O arquivo deve usar o tipo application/pdf.";

  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };
  return {
    success: true,
    data: { name, sizeBytes: sizeBytes as number, mimeType: "application/pdf" },
  };
}

export function isResumeApiErrorResponse(value: unknown): value is ResumeApiErrorResponse {
  return isRecord(value) && typeof value.code === "string" && typeof value.message === "string" && typeof value.requestId === "string";
}

export function isUploadIntentResponse(value: unknown): value is CreateResumeUploadIntentResponse {
  return isRecord(value) && typeof value.resumeId === "string" && typeof value.uploadToken === "string";
}

export function isFinalizeResumeResponse(value: unknown): value is FinalizeResumeUploadResponse {
  if (!isRecord(value) || !isRecord(value.resume)) return false;
  return typeof value.resume.id === "string" && typeof value.resume.originalName === "string" && typeof value.resume.sizeBytes === "number" && typeof value.resume.status === "string" && typeof value.resume.createdAt === "string";
}

export function isUpdateResumeTextResponse(value: unknown): value is UpdateResumeTextResponse {
  return isRecord(value) && typeof value.resumeId === "string" && Number.isInteger(value.version) && typeof value.extractedText === "string" && typeof value.updatedAt === "string";
}