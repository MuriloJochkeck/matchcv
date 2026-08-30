import type { Metadata } from "next";
import { AnalysisWizard } from "@/components/analysis-wizard";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Nova análise" };
export default async function NewAnalysisPage({ searchParams }: { searchParams: Promise<{ resumeId?: string }> }) {
  const { resumeId } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("resumes").select("id, original_name, resume_versions(extracted_text, version)").eq("status", "ready").is("deleted_at", null).order("created_at", { ascending: false });
  return <AnalysisWizard initialResumeId={resumeId} resumes={(data ?? []).map((item) => { const version = item.resume_versions?.sort((a, b) => b.version - a.version)[0]; return { id: item.id, originalName: item.original_name, extractedText: version?.extracted_text ?? "" }; })} />;
}