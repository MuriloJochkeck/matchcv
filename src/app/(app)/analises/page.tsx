import Link from "next/link";
import type { Metadata } from "next";
import { PlusIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Análises" };
export default async function AnalysesPage() {
  const supabase = await createClient();
  const { data: analyses } = await supabase.from("analyses").select("id, score, status, created_at, job_versions(jobs(title, company_label))").is("deleted_at", null).order("created_at", { ascending: false });
  return <div><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#145c43]">Histórico</p><h1 className="mt-1 text-3xl font-extrabold">Suas análises</h1></div><Link className="button-primary" href="/analises/nova"><PlusIcon size={18} /> Nova análise</Link></div>{!analyses?.length ? <section className="card mt-8 p-6"><h2 className="font-extrabold">Nenhuma análise ainda</h2><p className="mt-2 text-sm text-[#5b655e]">Selecione um currículo e cole a descrição de uma vaga para começar.</p></section> : <div className="mt-8 space-y-3">{analyses.map((analysis) => { const jobVersion = analysis.job_versions?.[0] as unknown as { jobs?: { title: string | null; company_label: string | null }[] } | undefined; const job = jobVersion?.jobs?.[0] ?? null; return <Link className="card block p-5 hover:border-[#7fae91]" href={`/analises/${analysis.id}`} key={analysis.id}><div className="flex justify-between gap-4"><div><h2 className="font-extrabold">{job?.title || "Vaga analisada"}</h2><p className="mt-1 text-sm text-[#5b655e]">{job?.company_label || "Empresa não informada"}</p></div><strong className="text-2xl text-[#145c43]">{analysis.score ?? 0}%</strong></div></Link>; })}</div>}</div>;
}