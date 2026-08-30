import { isResumeApiErrorResponse, isUpdateResumeTextResponse } from "@/contracts/resume";
import type { UpdateResumeTextRequest, UpdateResumeTextResponse } from "@/contracts/resume";

export class ResumeReviewApiError extends Error {
  constructor(message: string, readonly requestId?: string) {
    super(message);
    this.name = "ResumeReviewApiError";
  }
}

export async function updateResumeText(resumeId: string, input: UpdateResumeTextRequest): Promise<UpdateResumeTextResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ResumeReviewApiError("Não foi possível conectar ao serviço de documentos.");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isResumeApiErrorResponse(payload)) throw new ResumeReviewApiError(payload.message, payload.requestId);
    throw new ResumeReviewApiError("O serviço de documentos retornou uma resposta inesperada.");
  }
  if (!isUpdateResumeTextResponse(payload)) {
    throw new ResumeReviewApiError("O serviço de documentos retornou uma resposta incompatível.");
  }
  return payload;
}
