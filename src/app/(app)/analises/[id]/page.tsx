import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AnalysisReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient();
  const { data: analysis } = await supabase.from("analyses").select("id, score, algorithm_version, created_at, resume_version_id, job_version_id").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!analysis) notFound();
  const [{ data: dimensions }, { data: matches }, { data: recommendations }, { data: resumeVersion }, { data: jobVersion }] = await Promise.all([
    supabase.from("analysis_dimensions").select("dimension, weight, score, rationale").eq("analysis_id", id),
    supabase.from("matches").select("title, requirement_kind, status, confidence, evidence, note").eq("analysis_id", id),
    supabase.from("recommendations").select("priority, category, title, description").eq("analysis_id", id).order("priority"),
    supabase.from("resume_versions").select("resumes(original_name)").eq("id", analysis.resume_version_id).single(),
    supabase.from("job_versions").select("jobs(title, company_label)").eq("id", analysis.job_version_id).single(),
  ]);
  const job = jobVersion?.jobs as unknown as { title: string | null; company_label: string | null } | null;
  const resume = resumeVersion?.resumes as unknown as { original_name: string } | null;
  return <div className="mx-auto max-w-4xl"><Link className="text-sm font-bold text-[#145c43]" href="/analises">← Análises</Link><header className="mt-5"><p className="text-sm font-semibold text-[#145c43]">Análise concluída</p><h1 className="mt-1 text-3xl font-extrabold">{job?.title || "Vaga analisada"}</h1><p className="mt-2 text-[#5b655e]">{job?.company_label || "Empresa não informada"} · {resume?.original_name || "Currículo"}</p></header><section className="card mt-7 p-6"><p className="text-sm text-[#5b655e]">Aderência identificada</p><strong className="text-5xl">{analysis.score ?? 0}%</strong><p className="mt-3 text-sm text-[#5b655e]">Algoritmo {analysis.algorithm_version}</p></section><section className="mt-8"><h2 className="text-2xl font-extrabold">Dimensões</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{(dimensions ?? []).map((item) => <article className="card p-5" key={item.dimension}><div className="flex justify-between"><strong>{item.dimension}</strong><strong>{item.score}/100</strong></div><p className="mt-3 text-sm text-[#5b655e]">{item.rationale}</p></article>)}</div></section><section className="mt-8"><h2 className="text-2xl font-extrabold">Termos e evidências</h2><div className="mt-4 space-y-3">{(matches ?? []).map((item) => <article className="card p-5" key={item.title}><div className="flex justify-between gap-3"><strong>{item.title}</strong><span>{item.status}</span></div><p className="mt-2 text-sm text-[#5b655e]">{item.note}</p>{item.evidence && <blockquote className="mt-3 border-l-2 pl-3 text-sm">{item.evidence}</blockquote>}</article>)}</div></section><section className="mt-8"><h2 className="text-2xl font-extrabold">Próximas ações</h2><div className="mt-4 space-y-3">{(recommendations ?? []).map((item) => <article className="card p-5" key={item.title}><strong>{item.title}</strong><p className="mt-2 text-sm text-[#5b655e]">{item.description}</p></article>)}</div></section></div>;
}