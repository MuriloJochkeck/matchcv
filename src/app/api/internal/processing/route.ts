import { createAdminClient, getProcessingWorkerSecret } from "@/lib/supabase/admin";
import { processAnalysisJob } from "@/server/analysis/processor";

const headers = { "Cache-Control": "no-store" };

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers });
}

function authorized(request: Request) {
  const secret = getProcessingWorkerSecret();
  const provided = request.headers.get("x-processing-worker-secret")?.trim();
  const authorization = request.headers.get("authorization")?.trim();
  return Boolean(secret && ((provided && provided === secret) || authorization === `Bearer ${secret}`));
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (!authorized(request)) return response({ error: "Não autorizado.", requestId }, 401);

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return response({ error: "Worker não configurado.", requestId }, 503);
  }

  const requestedJobId = request.headers.get("x-processing-job-id")?.trim() || null;
  try {
    const result = await processAnalysisJob(supabase, requestedJobId);
    return response({ ...result, requestId }, result.status === "failed" ? 500 : result.status === "retry_scheduled" ? 202 : 200);
  } catch (error) {
    console.error("processing.analysis.failed", { requestId, errorName: error instanceof Error ? error.name : "UnknownError" });
    return response({ error: "Não foi possível processar o job.", requestId }, 500);
  }
}

export async function GET(request: Request) {
  return POST(request);
}
