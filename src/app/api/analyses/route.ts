import { parseCreateAnalysisRequest } from "../../../contracts/analysis.ts";
import type { ApiErrorResponse } from "../../../contracts/analysis";
import { createDemoAnalysis } from "../../../server/analysis/service.ts";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

function errorResponse(error: ApiErrorResponse, status: number) {
  return Response.json(error, { status, headers: NO_STORE_HEADERS });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      { code: "INVALID_JSON", message: "Envie um JSON válido.", requestId },
      400,
    );
  }

  const parsed = parseCreateAnalysisRequest(body);
  if (!parsed.success) {
    return errorResponse(
      {
        code: "VALIDATION_ERROR",
        message: "Revise os dados informados e tente novamente.",
        fieldErrors: parsed.fieldErrors,
        requestId,
      },
      422,
    );
  }

  try {
    return Response.json(createDemoAnalysis(parsed.data, requestId), {
      status: 202,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("analysis.create.failed", {
      requestId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return errorResponse(
      { code: "INTERNAL_ERROR", message: "Não foi possível iniciar a análise.", requestId },
      500,
    );
  }
}
