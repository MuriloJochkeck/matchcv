import type { ApiErrorResponse } from "../../../../contracts/analysis";
import { getAnalysisById } from "../../../../server/analysis/service.ts";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID();
  const { id } = await params;
  const result = getAnalysisById(id, requestId);

  if (!result) {
    const error: ApiErrorResponse = {
      code: "ANALYSIS_NOT_FOUND",
      message: "Análise não encontrada.",
      requestId,
    };
    return Response.json(error, { status: 404, headers: NO_STORE_HEADERS });
  }

  return Response.json(result, { headers: NO_STORE_HEADERS });
}
