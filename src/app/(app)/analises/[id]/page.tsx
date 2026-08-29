import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertIcon, ArrowRightIcon, PlusIcon, SparkIcon } from "@/components/icons";
import { ScoreRing } from "@/components/score-ring";
import type { MatchStatus } from "@/contracts/analysis";
import { calculateOverallScore, getScoreLabel } from "@/server/analysis/scoring";
import { getAnalysisById } from "@/server/analysis/service";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = getAnalysisById(id, "metadata");
  return { title: result ? `Relatório — ${result.analysis.jobTitle}` : "Análise não encontrada" };
}

const statusConfig: Record<MatchStatus, { label: string; className: string }> = {
  matched: { label: "Atendido", className: "bg-[#dff3e8] text-[#145c43]" },
  partial: { label: "Parcial", className: "bg-[#fff0d6] text-[#7a5417]" },
  missing: { label: "Não identificado", className: "bg-[#ecefeb] text-[#58625b]" },
};

export default async function AnalysisReportPage({ params }: PageProps) {
  const { id } = await params;
  const result = getAnalysisById(id, crypto.randomUUID());
  if (!result) notFound();
  const demoAnalysis = result.analysis;

  const score = calculateOverallScore(demoAnalysis.dimensions);
  const matchedCount = demoAnalysis.requirements.filter((item) => item.status === "matched").length;
  const partialCount = demoAnalysis.requirements.filter((item) => item.status === "partial").length;
  const missingCount = demoAnalysis.requirements.filter((item) => item.status === "missing").length;

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-sm text-[#5b655e]"><Link className="hover:text-[#145c43]" href="/painel">Painel</Link><span aria-hidden="true" className="mx-2">/</span><span>Análises</span><span aria-hidden="true" className="mx-2">/</span><span className="text-[#17211b]">Relatório</span></nav>
      <header className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#dff3e8] px-3 py-1 text-xs font-bold text-[#145c43]">Análise concluída</span><span className="text-xs text-[#69736c]">{demoAnalysis.createdAt}</span></div><h1 className="mt-3 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{demoAnalysis.jobTitle}</h1><p className="mt-2 text-[#5b655e]">{demoAnalysis.companyLabel} · {demoAnalysis.resumeName}</p></div>
        <Link className="button-secondary shrink-0" href="/analises/nova"><PlusIcon size={18} /> Nova análise</Link>
      </header>

      <div className="mt-8 rounded-xl border border-[#ead6af] bg-[#fff8e9] px-4 py-3 text-sm leading-6 text-[#664c1d]"><strong>Como interpretar:</strong> esta pontuação indica evidências encontradas no currículo para esta vaga. Ela não representa sua capacidade nem a chance de contratação.</div>

      <section aria-labelledby="overview-heading" className="card mt-6 grid gap-8 p-5 sm:p-8 lg:grid-cols-[210px_1fr] lg:items-center">
        <ScoreRing score={score} />
        <div><span className="text-sm font-bold text-[#145c43]">{getScoreLabel(score)}</span><h2 className="text-balance mt-2 text-2xl font-extrabold tracking-[-.035em] sm:text-3xl" id="overview-heading">Seu currículo demonstra uma base relevante para avançar nesta vaga.</h2><p className="mt-4 max-w-3xl leading-7 text-[#5b655e]">As evidências mais fortes estão em React, TypeScript e projetos práticos. Os principais pontos a esclarecer são testes automatizados, nível de inglês e uso explícito de Next.js.</p><div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold"><span className="rounded-full bg-[#dff3e8] px-3 py-1.5 text-[#145c43]">{matchedCount} atendidos</span><span className="rounded-full bg-[#fff0d6] px-3 py-1.5 text-[#7a5417]">{partialCount} parciais</span><span className="rounded-full bg-[#ecefeb] px-3 py-1.5 text-[#58625b]">{missingCount} não identificado</span></div></div>
      </section>

      <nav aria-label="Seções do relatório" className="mt-6 flex gap-2 overflow-x-auto border-b border-[#dfe3dc] pb-2 text-sm font-bold text-[#5b655e]"><a className="whitespace-nowrap rounded-full px-4 py-2 hover:bg-white hover:text-[#145c43]" href="#dimensoes">Dimensões</a><a className="whitespace-nowrap rounded-full px-4 py-2 hover:bg-white hover:text-[#145c43]" href="#requisitos">Requisitos e evidências</a><a className="whitespace-nowrap rounded-full px-4 py-2 hover:bg-white hover:text-[#145c43]" href="#recomendacoes">Próximas ações</a></nav>

      <section className="mt-10 scroll-mt-6" id="dimensoes">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="eyebrow">Pontuação transparente</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-.035em]">Resultado por dimensão</h2></div><span className="font-mono text-xs text-[#69736c]">Algoritmo {demoAnalysis.algorithmVersion}</span></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {demoAnalysis.dimensions.map((dimension) => (
            <article className="card p-5 sm:p-6" key={dimension.key}>
              <div className="flex items-baseline justify-between gap-4"><h3 className="font-extrabold">{dimension.label}</h3><strong className="text-2xl tracking-[-.04em]">{dimension.score}<span className="text-xs text-[#69736c]">/100</span></strong></div>
              <div className="mt-4 h-2.5 rounded-full bg-[#e7ebe6]"><div className="h-2.5 rounded-full bg-[#145c43]" style={{ width: `${dimension.score}%` }} /></div>
              <p className="mt-4 text-sm leading-6 text-[#5b655e]">{dimension.rationale}</p><p className="mt-3 text-xs font-semibold text-[#7a847d]">Peso no cálculo: {dimension.weight}%</p>
            </article>
          ))}
        </div>
        <details className="card mt-4 p-5"><summary className="cursor-pointer font-bold text-[#145c43]">Como a nota foi calculada?</summary><p className="mt-3 text-sm leading-6 text-[#5b655e]">O servidor aplica os pesos versionados do pré-projeto: técnica 40%, experiência 25%, obrigatórios 20%, formação e idiomas 10%, clareza das evidências 5%. A nota é reproduzível com as mesmas dimensões.</p></details>
      </section>

      <section className="mt-14 scroll-mt-6" id="requisitos">
        <p className="eyebrow">O que sustenta o resultado</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-.035em]">Requisitos e evidências</h2><p className="mt-3 max-w-3xl leading-7 text-[#5b655e]">“Não identificado” significa apenas que não encontramos evidência no documento — nunca que você não possui a competência.</p>
        <div className="mt-6 space-y-3">
          {demoAnalysis.requirements.map((requirement) => {
            const status = statusConfig[requirement.status];
            return (
              <article className="card p-5 sm:p-6" key={requirement.id}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">{requirement.title}</h3><span className="text-xs font-semibold text-[#7a847d]">{requirement.kind}</span></div><p className="mt-2 text-sm leading-6 text-[#5b655e]">{requirement.note}</p></div><span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span></div>
                {requirement.evidence ? <blockquote className="mt-5 border-l-3 border-[#7fae91] bg-[#f3f6f1] px-4 py-3 text-sm leading-6 text-[#3e4d43]"><span className="mb-1 block text-xs font-bold tracking-[.05em] text-[#69736c] uppercase">Trecho do currículo</span>“{requirement.evidence}”</blockquote> : <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f0f1eb] p-4 text-sm leading-6 text-[#58625b]"><AlertIcon className="mt-0.5 shrink-0" size={18} /> Nenhum trecho suficiente foi encontrado no currículo fictício.</div>}
                <p className="mt-3 text-xs text-[#7a847d]">Confiança da extração: {requirement.confidence}%</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14 scroll-mt-6" id="recomendacoes">
        <p className="eyebrow">Plano acionável</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-.035em]">Próximas ações honestas</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {demoAnalysis.recommendations.map((recommendation, index) => (
            <article className="card flex flex-col p-5 sm:p-6" key={recommendation.id}><div className="flex items-center justify-between"><span className="font-mono text-sm font-bold text-[#145c43]">0{index + 1}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${recommendation.priority === "Alta" ? "bg-[#fff0d6] text-[#7a5417]" : "bg-[#ecefeb] text-[#58625b]"}`}>{recommendation.priority}</span></div><h3 className="mt-6 font-extrabold">{recommendation.title}</h3><p className="mt-3 text-sm leading-6 text-[#5b655e]">{recommendation.description}</p><span className="mt-5 text-xs font-semibold text-[#7a847d]">{recommendation.category}</span></article>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[1.5rem] border border-[#bed6c5] bg-[#dff3e8] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div className="flex max-w-2xl items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#145c43]"><SparkIcon size={21} /></span><div><h2 className="text-xl font-extrabold tracking-[-.03em]">Use o relatório como ponto de partida.</h2><p className="mt-2 text-sm leading-6 text-[#4e6055]">Revise cada evidência, corrija extrações e só adicione ao currículo fatos que você consegue sustentar.</p></div></div><Link className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-[#145c43]" href="/analises/nova">Comparar outra vaga <ArrowRightIcon size={17} /></Link></div>
      </section>
    </div>
  );
}
