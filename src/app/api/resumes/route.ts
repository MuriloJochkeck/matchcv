import { MAX_EXTRACTED_TEXT_LENGTH, RESUME_BUCKET, parseResumeUploadIntent } from "@/contracts/resume";
import { createClient } from "@/lib/supabase/server";
import { extractPdfText, hasPdfSignature, sha256Hex } from "@/server/resume/file-validation";
import { getResumeExpiryDate } from "@/server/resume/retention";
import { extractResumeProfile } from "@/server/analysis/structured";

const headers = { "Cache-Control": "private, no-store" };
const fail = (code: string, message: string, requestId: string, status: number, fieldErrors?: Record<string, string>) => Response.json({ code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers });

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let stage = "form";
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("VALIDATION_ERROR", "Selecione um arquivo PDF.", requestId, 422, { file: "Arquivo obrigatório." });
  const parsed = parseResumeUploadIntent({ name: file.name, sizeBytes: file.size, mimeType: file.type });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise o arquivo informado.", requestId, 422, parsed.fieldErrors);

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail("UNAUTHENTICATED", "Entre novamente para enviar um currículo.", requestId, 401);
  try {
    stage = "read-file";
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasPdfSignature(bytes)) return fail("INVALID_PDF", "O arquivo não possui uma assinatura PDF válida.", requestId, 422);
    stage = "extract-text";
    let extractedText: string;
    try {
      // PDF.js transfers its input to a worker, which detaches that buffer.
      // Preserve the original bytes for Storage and the SHA-256 calculation.
      extractedText = (await extractPdfText(bytes.slice())).slice(0, MAX_EXTRACTED_TEXT_LENGTH);
    } catch (error) {
      console.warn("resume.upload.invalid-pdf", {
        requestId,
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorMessage: error instanceof Error ? error.message : undefined,
      });
      return fail("INVALID_PDF", "Nao foi possivel ler o PDF. Envie um arquivo valido, sem senha e com texto selecionavel.", requestId, 422);
    }
    if (!extractedText) return fail("INVALID_PDF", "Envie um PDF com texto selecionável.", requestId, 422);
    const resumeId = crypto.randomUUID();
    const storageKey = `${auth.user.id}/${resumeId}/document.pdf`;
    stage = "storage-upload";
    const { error: uploadError } = await supabase.storage.from(RESUME_BUCKET).upload(storageKey, bytes, { contentType: "application/pdf", upsert: false });
    if (uploadError) throw uploadError;
    stage = "resume-insert";
    const { data: resume, error: resumeError } = await supabase.from("resumes").insert({ id: resumeId, user_id: auth.user.id, original_name: parsed.data.name, storage_key: storageKey, size_bytes: parsed.data.sizeBytes, sha256: await sha256Hex(bytes), status: "ready", expires_at: getResumeExpiryDate().toISOString() }).select("id, original_name, size_bytes, status, created_at, expires_at").single();
    if (resumeError || !resume) { await supabase.storage.from(RESUME_BUCKET).remove([storageKey]); throw resumeError || new Error("Resume unavailable"); }
    stage = "version-insert";
    const { error: versionError } = await supabase.from("resume_versions").insert({ resume_id: resume.id, version: 1, extracted_text: extractedText, structured_json: extractResumeProfile(extractedText), schema_version: "resume-v1" });
    if (versionError) { await supabase.from("resumes").delete().eq("id", resume.id); await supabase.storage.from(RESUME_BUCKET).remove([storageKey]); throw versionError; }
    return Response.json({ resume: { id: resume.id, originalName: resume.original_name, sizeBytes: resume.size_bytes, status: resume.status, createdAt: resume.created_at, expiresAt: resume.expires_at } }, { status: 201, headers });
  } catch (error) {
    console.error("resume.upload.failed", {
      requestId,
      stage,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : undefined,
      errorCode: typeof error === "object" && error && "code" in error ? String(error.code) : undefined,
      errorStatus: typeof error === "object" && error && "status" in error ? String(error.status) : undefined,
    });
    return fail("INTERNAL_ERROR", "Não foi possível salvar o currículo. Tente novamente.", requestId, 500);
  }
}
