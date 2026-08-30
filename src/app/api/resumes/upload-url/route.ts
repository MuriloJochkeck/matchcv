import { RESUME_BUCKET, parseResumeUploadIntent } from "@/contracts/resume";
import { createClient } from "@/lib/supabase/server";
import { getResumeExpiryDate } from "@/server/resume/retention";
import { consumeRateLimit } from "@/server/ops/rate-limit";

const headers = { "Cache-Control": "private, no-store" };
function fail(code: string, message: string, requestId: string, status: number, fieldErrors?: Record<string, string>) {
  return Response.json({ code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const body = await request.json().catch(() => null);
  const parsed = parseResumeUploadIntent(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise os dados do arquivo.", requestId, 422, parsed.fieldErrors);

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para enviar um currículo.", requestId, 401);
  const rate = consumeRateLimit(`resume:${auth.user.id}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) return new Response(JSON.stringify({ code: "RATE_LIMITED", message: "Limite de uploads atingido. Tente novamente mais tarde.", requestId }), { status: 429, headers: { ...headers, "Retry-After": String(rate.retryAfterSeconds), "Content-Type": "application/json" } });

  const storagePath = `${auth.user.id}/${crypto.randomUUID()}/document.pdf`;
  const { data: signed, error: signedError } = await supabase.storage.from(RESUME_BUCKET).createSignedUploadUrl(storagePath);
  if (signedError || !signed?.signedUrl || !signed.token) return fail("INTERNAL_ERROR", "Não foi possível preparar o upload.", requestId, 500);

  const { data: resume, error: resumeError } = await supabase.from("resumes").insert({
    user_id: auth.user.id,
    original_name: parsed.data.name,
    storage_key: storagePath,
    size_bytes: parsed.data.sizeBytes,
    mime_type: parsed.data.mimeType,
    status: "uploaded",
    expires_at: getResumeExpiryDate().toISOString(),
  }).select("id, expires_at").single();
  if (resumeError || !resume) return fail("INTERNAL_ERROR", "Não foi possível registrar o currículo.", requestId, 500);

  return Response.json({ resumeId: resume.id, storagePath, uploadUrl: signed.signedUrl, uploadToken: signed.token, expiresAt: resume.expires_at, requestId }, { status: 201, headers });
}