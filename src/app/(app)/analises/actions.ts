"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteAnalysisAction(formData: FormData) {
  const id = typeof formData.get("analysisId") === "string" ? formData.get("analysisId") : "";
  if (!id) return;
  const supabase = await createClient();
  const { error } = await supabase.from("analyses").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/analises");
  revalidatePath("/painel");
}