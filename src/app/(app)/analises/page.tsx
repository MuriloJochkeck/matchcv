import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, ChartIcon, ClockIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { deleteAnalysisAction } from "./actions";

export const metadata: Metadata = { title: "Análises" };

type Job = { title: string | null; company_label: string | null };
type JobVersion = { jobs?: Job | Job[] };
type AnalysisRow = { id: string; score: number | null; status: string; created_at: string; job_versions?: JobVersion | JobVersion[] };

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function jobFromAnalysis(analysis: AnalysisRow) {
  const version = firstRelation(analysis.job_versions);
  return firstRelation(version?.jobs);
}

function statusLabel(status: string) {
  if (status === "completed") return "Concluída";
  if (status === "processing") return "Processando";
  if (status === "queued") return "Na fila";
  return "Não concluída";
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function AnalysesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("analyses").select("id, score, status, created_at, job_versions(jobs(title, company_label))").is("deleted_at", null).order("created_at", { ascending: false });
  const analyses = (data ?? []) as unknown as AnalysisRow[];

  return (
    <div>
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><p className="eyebrow">Histórico</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Suas análises</h1><p className="mt-4 max-w-xl leading-7 text-[#5b655e]">Compare suas oportunidades e entenda exatamente onde seu currículo pode ficar mais forte.</p></div>
        <Link className="button-primary shrink-0" href="/analises/nova"><PlusIcon size={18} /> Nova análise</Link>
      </header>

      {analyses.length === 0 ? (
        <section className="card mt-8 border-dashed bg-[#eef6f1] p-8"><span className="grid size-12 place-items-center rounded-2xl bg-[#dff3e8] text-[#145c43]"><ChartIcon size={22} /></span><h2 className="mt-6 text-2xl font-extrabold">Nenhuma análise ainda</h2><p className="mt-3 max-w-lg leading-7 text-[#5b655e]">Selecione um currículo e cole a descrição de uma vaga para receber uma leitura clara da sua aderência.</p><Link className="button-primary mt-6 w-fit" href="/analises/nova">Começar agora <ArrowRightIcon size={17} /></Link></section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-[1.35rem] border border-[#dfe3dc] bg-white" aria-label="Histórico de análises">
          <div className="hidden grid-cols-[1fr_170px_120px_92px] gap-4 border-b border-[#e8ebe6] bg-[#fafbf8] px-6 py-3 text-xs font-bold uppercase tracking-[.1em] text-[#69736c] md:grid"><span>Oportunidade</span><span>Status</span><span>Data</span><span className="text-right">Aderência</span></div>
          <div className="divide-y divide-[#e8ebe6]">{analyses.map((analysis) => { const job = jobFromAnalysis(analysis); const completed = analysis.status === "completed"; return <article className="grid gap-4 px-5 py-5 transition-colors hover:bg-[#fafcf9] md:grid-cols-[1fr_170px_120px_92px] md:items-center md:px-6" key={analysis.id}><Link className="group min-w-0" href={`/analises/${analysis.id}`}><h2 className="truncate font-extrabold group-hover:text-[#145c43]">{job?.title || "Vaga analisada"}</h2><p className="mt-1 truncate text-sm text-[#5b655e]">{job?.company_label || "Empresa não informada"}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-[#89928c] md:hidden"><ClockIcon size={13} /> {dateLabel(analysis.created_at)}</p></Link><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${completed ? "bg-[#dff3e8] text-[#145c43]" : "bg-[#fff1d9] text-[#8b5d16]"}`}>{statusLabel(analysis.status)}</span><span className="hidden text-sm text-[#5b655e] md:block">{dateLabel(analysis.created_at)}</span><div className="flex items-center justify-between gap-3 md:justify-end"><Link className="text-xl font-extrabold text-[#145c43]" href={`/analises/${analysis.id}`}>{analysis.score === null ? "—" : `${Math.round(analysis.score)}%`}<ArrowRightIcon className="ml-1 inline" size={15} /></Link><form action={deleteAnalysisAction}><input name="analysisId" type="hidden" value={analysis.id} /><button aria-label={`Excluir análise de ${job?.title || "vaga"}`} className="rounded-lg p-2 text-[#b4493d] hover:bg-[#fff0ee]" type="submit"><TrashIcon size={16} /></button></form></div></article>; })}</div>
        </section>
      )}
    </div>
  );
}