"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteAnalysisAction(formData: FormData) {
  const id = typeof formData.get("analysisId") === "string" ? formData.get("analysisId") : "";
  if (!id) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_analysis", { p_analysis_id: id });
  if (error) throw error;
  revalidatePath("/analises");
  revalidatePath("/painel");
}
export async function submitFeedbackAction(formData: FormData) {
  const analysisIdValue = formData.get("analysisId");
  const commentValue = formData.get("comment");
  const analysisId = typeof analysisIdValue === "string" ? analysisIdValue : "";
  const rating = Number(formData.get("rating"));
  const comment = typeof commentValue === "string" ? commentValue.trim() : "";
  if (!analysisId || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 2000) return;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const { error } = await supabase.from("feedback").upsert({ analysis_id: analysisId, user_id: auth.user.id, rating, comment: comment || null }, { onConflict: "analysis_id,user_id" });
  if (error) throw error;
  revalidatePath(`/analises/${analysisId}`);
}
