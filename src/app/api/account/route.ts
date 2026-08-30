import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  if (body?.confirmation !== "EXCLUIR") return Response.json({ code: "VALIDATION_ERROR", message: "Confirme a exclusão digitando EXCLUIR." }, { status: 422 });
  const supabase = await createClient(); const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return Response.json({ code: "UNAUTHENTICATED", message: "Entre novamente para excluir a conta." }, { status: 401 });
  const admin = createAdminClient();
  const { data: resumes, error: resumesError } = await admin.from("resumes").select("storage_key").eq("user_id", auth.user.id);
  if (resumesError) return Response.json({ code: "INTERNAL_ERROR", message: "Não foi possível excluir os dados." }, { status: 500 });
  const keys = (resumes ?? []).map((item) => item.storage_key).filter((item): item is string => Boolean(item));
  if (keys.length) { const { error } = await admin.storage.from("resumes").remove(keys); if (error) return Response.json({ code: "INTERNAL_ERROR", message: "Não foi possível excluir os arquivos privados." }, { status: 500 }); }
  const { error: deleteError } = await admin.auth.admin.deleteUser(auth.user.id);
  if (deleteError) return Response.json({ code: "INTERNAL_ERROR", message: "Não foi possível excluir a conta." }, { status: 500 });
  await supabase.auth.signOut();
  return Response.json({ deleted: true });
}