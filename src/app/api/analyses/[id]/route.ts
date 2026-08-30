import type { ApiErrorResponse } from "../../../../contracts/analysis";
import { createClient } from "../../../../lib/supabase/server.ts";
import { getAnalysisById } from "../../../../server/analysis/service.ts";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

function errorResponse(code: ApiErrorResponse["code"], message: string, requestId: string, status: number) {
  return Response.json({ code, message, requestId } satisfies ApiErrorResponse, { status, headers: NO_STORE_HEADERS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID();
  const { id } = await params;
  const supabase = await createClient();
  let result;

  try {
    result = await getAnalysisById(supabase, id, requestId);
  } catch (error) {
    console.error("analysis.read.failed", {
      requestId,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : undefined,
    });
    return errorResponse("INTERNAL_ERROR", "Não foi possível carregar a análise.", requestId, 500);
  }

  if (!result) return errorResponse("ANALYSIS_NOT_FOUND", "Análise não encontrada.", requestId, 404);
  return Response.json(result, { headers: NO_STORE_HEADERS });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return errorResponse("ANALYSIS_NOT_FOUND", "Análise não encontrada.", requestId, 404);
  }

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return errorResponse("UNAUTHENTICATED", "Entre novamente para excluir a análise.", requestId, 401);

  try {
    const { data, error } = await supabase.from("analyses").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return errorResponse("ANALYSIS_NOT_FOUND", "Análise não encontrada.", requestId, 404);
    return Response.json({ analysisId: data.id, deleted: true, requestId }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("analysis.delete.failed", {
      requestId,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : undefined,
    });
    return errorResponse("INTERNAL_ERROR", "Não foi possível excluir a análise.", requestId, 500);
  }
}