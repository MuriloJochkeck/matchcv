"use server";

import { revalidatePath } from "next/cache";
import { RESUME_BUCKET } from "@/contracts/resume";
import { createClient } from "@/lib/supabase/server";

export async function deleteResumeAction(formData: FormData) {
  const resumeId = typeof formData.get("resumeId") === "string" ? formData.get("resumeId") : "";
  if (!resumeId) return;
  const supabase = await createClient();
  const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, storage_key").eq("id", resumeId).single();
  if (resumeError || !resume) return;
  const { data: versions, error: versionsError } = await supabase.from("resume_versions").select("id").eq("resume_id", resume.id);
  if (versionsError) throw versionsError;
  const versionIds = (versions ?? []).map((version) => version.id);
  if (versionIds.length) {
    const { error } = await supabase.from("analyses").delete().in("resume_version_id", versionIds);
    if (error) throw error;
  }
  if (resume.storage_key) {
    const { error } = await supabase.storage.from(RESUME_BUCKET).remove([resume.storage_key]);
    if (error) throw error;
  }
  const { error } = await supabase.from("resumes").delete().eq("id", resume.id);
  if (error) throw error;
  revalidatePath("/curriculos");
  revalidatePath("/analises");
  revalidatePath("/painel");
}