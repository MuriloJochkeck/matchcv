import { parseCreateAnalysisRequest } from "../../../contracts/analysis.ts";
import { createAdminClient } from "../../../lib/supabase/admin.ts";
import { processAnalysisJob } from "../../../server/analysis/processor.ts";
import { createSynchronousAnalysis, shouldUseSynchronousFallback } from "../../../server/analysis/synchronous.ts";
import { createClient } from "../../../lib/supabase/server.ts";

const headers = { "Cache-Control": "private, no-store" };

function fail(code: string, message: string, requestId: string, status: number, fieldErrors?: Record<string, string>) {
  return Response.json({ code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers });
}

function encodeCursor(createdAt: string) {
  return Buffer.from(JSON.stringify({ createdAt }), "utf8").toString("base64url");
}

function decodeCursor(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as { createdAt?: unknown };
    return typeof parsed.createdAt === "string" && !Number.isNaN(Date.parse(parsed.createdAt)) ? parsed.createdAt : null;
  } catch {
    return null;
  }
}

async function hashRequest(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para consultar seu histórico.", requestId, 401);

  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") ?? "20");
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 20;
  const cursorValue = url.searchParams.get("cursor");
  const cursor = decodeCursor(cursorValue);
  if (cursorValue && !cursor) return fail("VALIDATION_ERROR", "O cursor do histórico é inválido.", requestId, 422, { cursor: "Use um cursor retornado pela API." });

  let query = supabase.from("analyses").select("id, score, status, created_at, job_versions(jobs(title, company_label))").is("deleted_at", null).order("created_at", { ascending: false }).limit(limit + 1);
  if (cursor) query = query.lt("created_at", cursor);
  const { data, error } = await query;
  if (error) {
    console.error("analysis.list.failed", { requestId, errorName: error.name, errorMessage: error.message });
    return fail("INTERNAL_ERROR", "Não foi possível carregar o histórico.", requestId, 500);
  }

  const hasMore = (data ?? []).length > limit;
  const rows = hasMore ? data?.slice(0, limit) ?? [] : data ?? [];
  const analyses = rows.map((analysis) => {
    const jobVersion = analysis.job_versions?.[0] as unknown as { jobs?: { title: string | null; company_label: string | null }[] } | undefined;
    const job = jobVersion?.jobs?.[0];
    return { id: analysis.id, score: analysis.score, status: analysis.status, createdAt: analysis.created_at, jobTitle: job?.title ?? "Vaga analisada", companyLabel: job?.company_label ?? "Empresa não informada" };
  });

  return Response.json({ analyses, nextCursor: hasMore && rows.length ? encodeCursor(rows[rows.length - 1].created_at) : null, schemaVersion: "analysis-v1", requestId }, { headers });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const body = await request.json().catch(() => null);
  const parsed = parseCreateAnalysisRequest(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise os dados informados e tente novamente.", requestId, 422, parsed.fieldErrors);

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para iniciar uma análise.", requestId, 401);

  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || crypto.randomUUID();
  if (idempotencyKey.length < 16 || idempotencyKey.length > 200) return fail("VALIDATION_ERROR", "A chave de idempotência é inválida.", requestId, 422, { "Idempotency-Key": "Use entre 16 e 200 caracteres." });

  const requestHash = await hashRequest(parsed.data);
  const { data, error } = await supabase.rpc("enqueue_analysis", {
    p_user_id: auth.user.id,
    p_resume_id: parsed.data.resumeId,
    p_title: parsed.data.job.title ?? null,
    p_company_label: parsed.data.job.company ?? null,
    p_raw_text: parsed.data.job.description,
    p_structured_json: { requirements: parsed.data.job.requirements ?? [] },
    p_idempotency_key: idempotencyKey,
    p_request_hash: requestHash,
  });

  if (error) {
    if (shouldUseSynchronousFallback(error)) {
      try {
        return Response.json(await createSynchronousAnalysis(supabase, { ...parsed.data, userId: auth.user.id, idempotencyKey }, requestId), { headers });
      } catch (fallbackError) {
        if (fallbackError instanceof Error && fallbackError.name === "RESUME_NOT_FOUND") return fail("RESUME_NOT_FOUND", "Currículo não encontrado.", requestId, 404);
        console.error("analysis.synchronous-fallback.failed", { requestId, errorName: fallbackError instanceof Error ? fallbackError.name : "UnknownError" });
        return fail("INTERNAL_ERROR", "Não foi possível concluir a análise.", requestId, 500);
      }
    }
    const message = error.message || "";
    if (message.includes("resume_not_found")) return fail("RESUME_NOT_FOUND", "Currículo não encontrado.", requestId, 404);
    if (message.includes("idempotency_key_reused")) return fail("VALIDATION_ERROR", "A chave de idempotência já foi usada com outros dados.", requestId, 409);
    console.error("analysis.enqueue.failed", { requestId, errorName: error.name, errorMessage: error.message });
    return fail("INTERNAL_ERROR", "Não foi possível iniciar a análise.", requestId, 500);
  }
  const queued = Array.isArray(data) ? data[0] : data;
  if (!queued?.analysis_id) return fail("INTERNAL_ERROR", "A fila retornou uma resposta inválida.", requestId, 500);
  let status = queued.analysis_status;
  try {
    const admin = createAdminClient();
    const { data: processingJob } = await admin.from("processing_jobs").select("id").eq("resource_id", queued.analysis_id).eq("kind", "analysis").maybeSingle();
    if (processingJob?.id) {
      const processed = await processAnalysisJob(admin, processingJob.id);
      if (processed.status === "completed") status = "completed";
    }
  } catch (error) {
    console.warn("analysis.enqueue.processing-deferred", { requestId, errorName: error instanceof Error ? error.name : "UnknownError" });
  }
  return Response.json({ analysisId: queued.analysis_id, status, mode: "integrated", schemaVersion: "analysis-v1", requestId }, { status: status === "queued" || status === "processing" ? 202 : 200, headers });
}