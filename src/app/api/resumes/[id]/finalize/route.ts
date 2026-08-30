import { MAX_EXTRACTED_TEXT_LENGTH, RESUME_BUCKET } from "@/contracts/resume";
import { createClient } from "@/lib/supabase/server";
import { extractPdfText, hasPdfSignature, sha256Hex } from "@/server/resume/file-validation";
import { extractResumeProfile, validateStructuredProfile } from "@/server/analysis/structured";

const headers = { "Cache-Control": "private, no-store" };
function fail(code: string, message: string, requestId: string, status: number) {
  return Response.json({ code, message, requestId }, { status, headers });
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para finalizar o upload.", requestId, 401);

  const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, storage_key, status, expires_at").eq("id", id).is("deleted_at", null).single();
  if (resumeError || !resume) return fail("RESUME_NOT_FOUND", "Currículo não encontrado.", requestId, 404);
  if (resume.status === "ready") return Response.json({ resume: { id: resume.id, status: resume.status, expiresAt: resume.expires_at }, requestId }, { headers });
  if (!resume.storage_key) return fail("UPLOAD_INCOMPLETE", "O upload não possui um arquivo associado.", requestId, 409);

  await supabase.from("resumes").update({ status: "extracting" }).eq("id", id);
  try {
    const { data: file, error: downloadError } = await supabase.storage.from(RESUME_BUCKET).download(resume.storage_key);
    if (downloadError || !file) throw new Error("upload_missing");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasPdfSignature(bytes)) throw new Error("invalid_pdf");
    const extractedText = (await extractPdfText(bytes.slice())).slice(0, MAX_EXTRACTED_TEXT_LENGTH);
    if (!extractedText.trim()) throw new Error("empty_pdf");
    const structured = extractResumeProfile(extractedText);
    if (!validateStructuredProfile(structured)) throw new Error("invalid_structured_profile");

    const { data: latest } = await supabase.from("resume_versions").select("version").eq("resume_id", id).order("version", { ascending: false }).limit(1).maybeSingle();
    const version = (latest?.version ?? 0) + 1;
    const { error: versionError } = await supabase.from("resume_versions").insert({ resume_id: id, version, extracted_text: extractedText, structured_json: structured, schema_version: "resume-v1" });
    if (versionError) throw versionError;
    const { error: updateError } = await supabase.from("resumes").update({ status: "ready", sha256: await sha256Hex(bytes) }).eq("id", id);
    if (updateError) throw updateError;
    return Response.json({ resume: { id, status: "ready", version, expiresAt: resume.expires_at }, requestId }, { headers });
  } catch (error) {
    await supabase.from("resumes").update({ status: "failed" }).eq("id", id);
    const code = error instanceof Error && ["invalid_pdf", "empty_pdf", "upload_missing"].includes(error.message) ? (error.message === "upload_missing" ? "UPLOAD_INCOMPLETE" : "INVALID_PDF") : "INTERNAL_ERROR";
    return fail(code, code === "INVALID_PDF" ? "O PDF é inválido ou não possui texto selecionável." : code === "UPLOAD_INCOMPLETE" ? "Envie o arquivo antes de finalizar." : "Não foi possível processar o currículo.", requestId, code === "INTERNAL_ERROR" ? 500 : 422);
  }
}