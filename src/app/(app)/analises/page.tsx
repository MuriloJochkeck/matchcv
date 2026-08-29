import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ChartIcon, PlusIcon } from "@/components/icons";
import { ScoreRing } from "@/components/score-ring";
import { demoAnalysis } from "@/server/analysis/demo-analysis";
import { calculateOverallScore } from "@/server/analysis/scoring";

export const metadata: Metadata = { title: "Análises" };

export default function AnalysesPage() {
  const score = calculateOverallScore(demoAnalysis.dimensions);
  return (
    <div>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-[#145c43]">Histórico</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">Suas análises</h1><p className="mt-3 max-w-2xl leading-7 text-[#5b655e]">Retome relatórios e acompanhe as vagas já comparadas. A persistência será ativada quando o Supabase estiver conectado.</p></div>
        <Link className="button-primary shrink-0" href="/analises/nova"><PlusIcon size={18} /> Nova análise</Link>
      </header>
      <section aria-labelledby="history-heading" className="card mt-8 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#e3e6e1] px-5 py-4 sm:px-6"><ChartIcon className="text-[#145c43]" size={19} /><h2 className="font-extrabold" id="history-heading">1 análise concluída</h2></div>
        <article className="grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
          <ScoreRing score={score} size="small" />
          <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">{demoAnalysis.jobTitle}</h3><span className="rounded-full bg-[#dff3e8] px-2.5 py-1 text-xs font-bold text-[#145c43]">Concluída</span></div><p className="mt-1 text-sm text-[#5b655e]">{demoAnalysis.companyLabel} · {demoAnalysis.createdAt}</p><p className="mt-2 text-xs text-[#7a847d]">{demoAnalysis.resumeName} · fixture demonstrativa</p></div>
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#145c43]" href={`/analises/${demoAnalysis.id}`}>Abrir relatório <ArrowRightIcon size={16} /></Link>
        </article>
      </section>
    </div>
  );
}
