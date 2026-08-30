import { getProcessingWorkerSecret } from "@/lib/supabase/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const expected = getProcessingWorkerSecret();
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return Response.json({ code: "UNAUTHORIZED", message: "Não autorizado." }, { status: 401 });
  const admin = createAdminClient();
  const { data: expired, error } = await admin.from("resumes").select("id").not("expires_at", "is", null).lte("expires_at", new Date().toISOString()).is("deleted_at", null).limit(100);
  if (error) return Response.json({ code: "RETENTION_QUERY_FAILED", message: "Não foi possível consultar currículos expirados." }, { status: 500 });
  const ids = (expired ?? []).map((resume) => resume.id);
  if (!ids.length) return Response.json({ expired: 0, marked: 0 });
  const { data: marked, error: markError } = await admin.from("resumes").update({ status: "deleted", deleted_at: new Date().toISOString() }).in("id", ids).is("deleted_at", null).select("id");
  if (markError) return Response.json({ code: "RETENTION_UPDATE_FAILED", message: "Não foi possível expirar os currículos." }, { status: 500 });
  return Response.json({ expired: ids.length, marked: marked?.length ?? 0 });
}

export async function GET(request: Request) {
  return POST(request);
}
