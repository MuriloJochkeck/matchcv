import { isFinalizeResumeResponse, isResumeApiErrorResponse } from "@/contracts/resume";
import type { ResumeSummary } from "@/contracts/resume";

export class ResumeApiError extends Error {
  constructor(message: string, readonly requestId?: string) { super(message); this.name = "ResumeApiError"; }
}

export async function uploadResume(file: File): Promise<ResumeSummary> {
  const form = new FormData();
  form.set("file", file);
  let response: Response;
  try { response = await fetch("/api/resumes", { method: "POST", body: form }); }
  catch { throw new ResumeApiError("Não foi possível conectar ao serviço de documentos."); }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isResumeApiErrorResponse(payload)) throw new ResumeApiError(payload.message, payload.requestId);
    throw new ResumeApiError("O serviço de documentos retornou uma resposta inesperada.");
  }
  if (!isFinalizeResumeResponse(payload)) throw new ResumeApiError("O serviço de documentos retornou uma resposta incompatível.");
  return payload.resume;
}
