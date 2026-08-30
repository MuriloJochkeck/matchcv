 "use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function updateImprovementConsentAction(formData: FormData) {
  const enabled = formData.get("productImprovementConsent") === "on";
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return;
  const { error } = await supabase.from("profiles").update({ product_improvement_consent_at: enabled ? new Date().toISOString() : null }).eq("id", auth.user.id);
  if (error) throw error;
  revalidatePath("/configuracoes");
}

export async function deleteAccountAction(formData: FormData) {
  if (formData.get("confirmation") !== "EXCLUIR") return;

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return;

  const { data: resumes, error: resumesError } = await supabase.from("resumes").select("storage_key").eq("user_id", auth.user.id);
  if (resumesError) throw resumesError;

  const admin = createAdminClient();
  const storageKeys = (resumes ?? []).map((resume) => resume.storage_key).filter((key): key is string => typeof key === "string" && key.length > 0);
  if (storageKeys.length) {
    const { error: storageError } = await admin.storage.from("resumes").remove(storageKeys);
    if (storageError) throw storageError;
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(auth.user.id);
  if (deleteError) throw deleteError;

  await supabase.auth.signOut();
  redirect("/");
}