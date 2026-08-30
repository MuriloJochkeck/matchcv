import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, ChartIcon, FileIcon, PlusIcon, SparkIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Visão geral" };

type RecentAnalysis = {
  id: string;
  score: number | null;
  status: string;
  created_at: string;
  job_versions?: { jobs?: { title: string | null; company_label: string | null } | { title: string | null; company_label: string | null }[] } | { jobs?: { title: string | null; company_label: string | null } | { title: string | null; company_label: string | null }[] }[];
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function jobFromAnalysis(analysis: RecentAnalysis) {
  const version = firstRelation(analysis.job_versions);
  return firstRelation(version?.jobs);
}

function scoreLabel(score: number | null) {
  return score === null ? "Em andamento" : `${Math.round(score)}%`;
}

function statusLabel(status: string) {
  if (status === "completed") return "Concluída";
  if (status === "processing") return "Processando";
  if (status === "queued") return "Na fila";
  return "Não concluída";
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ count: resumeCount }, { count: analysisCount }, { data: recentData }] = await Promise.all([
    supabase.from("resumes").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("analyses").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("analyses").select("id, score, status, created_at, job_versions(jobs(title, company_label))").is("deleted_at", null).order("created_at", { ascending: false }).limit(4),
  ]);
  const recent = (recentData ?? []) as unknown as RecentAnalysis[];
  const featured = recent[0];
  const featuredJob = featured ? jobFromAnalysis(featured) : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Prepare-se melhor para cada oportunidade.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#5b655e]">Veja o que já está pronto, acompanhe sua aderência e escolha o próximo passo com clareza.</p>
        </div>
        <Link className="button-primary shrink-0" href="/analises/nova"><PlusIcon size={18} /> Nova análise</Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumo da conta">
        <article className="card flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#dff3e8] text-[#145c43]"><FileIcon size={21} /></span>
          <div><p className="text-sm text-[#5b655e]">Currículos</p><p className="mt-0.5 text-2xl font-extrabold">{resumeCount ?? 0}</p></div>
        </article>
        <article className="card flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#fff1d9] text-[#9a6416]"><ChartIcon size={21} /></span>
          <div><p className="text-sm text-[#5b655e]">Análises feitas</p><p className="mt-0.5 text-2xl font-extrabold">{analysisCount ?? 0}</p></div>
        </article>
        <article className="card flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#edf0f4] text-[#40536a]"><SparkIcon size={21} /></span>
          <div><p className="text-sm text-[#5b655e]">Próximo passo</p><p className="mt-0.5 text-base font-extrabold">Compare uma vaga</p></div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        {featured ? (
          <Link className="group relative overflow-hidden rounded-[1.75rem] bg-[#145c43] p-6 text-white shadow-[0_20px_55px_rgba(20,92,67,.18)] transition-transform hover:-translate-y-0.5 sm:p-8" href={`/analises/${featured.id}`}>
            <div className="absolute -right-16 -top-20 size-64 rounded-full border-[32px] border-white/10" aria-hidden="true" />
            <div className="relative flex flex-col justify-between gap-10 sm:flex-row sm:items-end">
              <div className="max-w-lg">
                <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[.12em] text-[#c9f0d7]">Última análise · {statusLabel(featured.status)}</span>
                <h2 className="mt-5 text-2xl font-extrabold tracking-[-.04em] sm:text-3xl">{featuredJob?.title || "Vaga analisada"}</h2>
                <p className="mt-2 text-sm text-[#c4ddcd]">{featuredJob?.company_label || "Empresa não informada"} · {dateLabel(featured.created_at)}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">Abrir relatório <ArrowRightIcon className="transition-transform group-hover:translate-x-1" size={18} /></span>
              </div>
              <div className="shrink-0"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#c4ddcd]">Aderência</p><p className="mt-1 text-6xl font-extrabold tracking-[-.08em]">{scoreLabel(featured.score)}</p></div>
            </div>
          </Link>
        ) : (
          <section className="rounded-[1.75rem] border border-dashed border-[#a9c9b5] bg-[#eef6f1] p-7 sm:p-8">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#dff3e8] text-[#145c43]"><SparkIcon size={22} /></span>
            <h2 className="mt-6 text-2xl font-extrabold tracking-[-.035em]">Sua primeira análise começa aqui.</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#5b655e]">Envie seu currículo, cole uma vaga e veja quais pontos já estão claros para o recrutador.</p>
            <Link className="button-primary mt-6 w-fit" href="/analises/nova">Começar agora <ArrowRightIcon size={17} /></Link>
          </section>
        )}

        <section className="card p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Atividade</p><h2 className="mt-3 text-xl font-extrabold">Análises recentes</h2></div><ChartIcon className="text-[#145c43]" size={23} /></div>
          {recent.length ? <div className="mt-6 divide-y divide-[#e8ebe6]">{recent.map((item) => { const job = jobFromAnalysis(item); return <Link className="group flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0" href={`/analises/${item.id}`} key={item.id}><div className="min-w-0"><p className="truncate text-sm font-bold">{job?.title || "Vaga analisada"}</p><p className="mt-1 text-xs text-[#69736c]">{statusLabel(item.status)} · {dateLabel(item.created_at)}</p></div><span className="shrink-0 text-lg font-extrabold text-[#145c43]">{scoreLabel(item.score)} <ArrowRightIcon className="inline transition-transform group-hover:translate-x-1" size={15} /></span></Link>; })}</div> : <p className="mt-6 text-sm leading-6 text-[#5b655e]">Suas análises aparecerão aqui assim que você comparar uma vaga.</p>}
          <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#145c43]" href="/analises">Ver todas <ArrowRightIcon size={16} /></Link>
        </section>
      </section>
    </div>
  );
}