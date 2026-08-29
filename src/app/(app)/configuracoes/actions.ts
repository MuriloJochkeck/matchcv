"use server";

import { revalidatePath } from "next/cache";
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