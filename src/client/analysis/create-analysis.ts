import {
  isApiErrorResponse,
  isCreateAnalysisResponse,
} from "../../contracts/analysis.ts";
import type {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
} from "../../contracts/analysis";

export class AnalysisApiError extends Error {
  constructor(
    message: string,
    readonly requestId?: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AnalysisApiError";
  }
}

export async function createAnalysis(
  input: CreateAnalysisRequest,
): Promise<CreateAnalysisResponse> {
  let response: Response;
  try {
    response = await fetch("/api/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(input),
    });
  } catch {
    throw new AnalysisApiError("Não foi possível conectar ao serviço. Tente novamente.");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorResponse(payload)) {
      throw new AnalysisApiError(payload.message, payload.requestId, payload.fieldErrors);
    }
    throw new AnalysisApiError("O serviço retornou uma resposta inesperada. Tente novamente.");
  }
  if (!isCreateAnalysisResponse(payload)) {
    throw new AnalysisApiError("O serviço retornou uma resposta incompatível. Tente novamente.");
  }
  return payload;
}
