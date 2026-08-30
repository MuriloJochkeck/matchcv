import { MAX_EXTRACTED_TEXT_LENGTH } from "@/contracts/resume";
import { createClient } from "@/lib/supabase/server";

const headers = { "Cache-Control": "private, no-store" };

function fail(code: string, message: string, requestId: string, status: number, fieldErrors?: Record<string, string>) {
  return Response.json({ code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  const { id } = await context.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return fail("RESUME_NOT_FOUND", "Currículo não encontrado.", requestId, 404);
  }

  const body = await request.json().catch(() => null);
  const extractedText = typeof body?.extractedText === "string" ? body.extractedText.trim() : "";
  if (!extractedText) return fail("VALIDATION_ERROR", "Informe o texto revisado do currículo.", requestId, 422, { extractedText: "O texto não pode ficar vazio." });
  if (extractedText.length > MAX_EXTRACTED_TEXT_LENGTH) {
    return fail("VALIDATION_ERROR", "O texto revisado excede o limite permitido.", requestId, 422, { extractedText: `Use no máximo ${MAX_EXTRACTED_TEXT_LENGTH.toLocaleString("pt-BR")} caracteres.` });
  }

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para revisar o currículo.", requestId, 401);

  const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, status, deleted_at").eq("id", id).is("deleted_at", null).single();
  if (resumeError || !resume) return fail("RESUME_NOT_FOUND", "Currículo não encontrado.", requestId, 404);
  if (resume.status !== "ready") return fail("VALIDATION_ERROR", "Este currículo ainda não está pronto para revisão.", requestId, 409);

  const { data: latest, error: latestError } = await supabase.from("resume_versions").select("version").eq("resume_id", id).order("version", { ascending: false }).limit(1).maybeSingle();
  if (latestError) {
    console.error("resume.review.latest-failed", { requestId, errorName: latestError.name, errorMessage: latestError.message });
    return fail("INTERNAL_ERROR", "Não foi possível revisar o currículo. Tente novamente.", requestId, 500);
  }

  const nextVersion = (latest?.version ?? 0) + 1;
  const { error: insertError } = await supabase.from("resume_versions").insert({
    resume_id: id,
    version: nextVersion,
    extracted_text: extractedText,
    schema_version: "resume-v1",
  });
  if (insertError) {
    console.error("resume.review.insert-failed", { requestId, errorName: insertError.name, errorMessage: insertError.message });
    return fail("INTERNAL_ERROR", "Não foi possível salvar a revisão. Tente novamente.", requestId, 500);
  }

  return Response.json({ resumeId: id, version: nextVersion, extractedText, updatedAt: new Date().toISOString() }, { headers });
}