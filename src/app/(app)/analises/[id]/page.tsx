import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisFeedbackForm } from "@/components/analysis-feedback-form";
import { createClient } from "@/lib/supabase/server";
import { getAnalysisById } from "@/server/analysis/service";

const statusLabels = {
  matched: "Atendido",
  partial: "Parcial",
  missing: "Não identificado",
} as const;

export default async function AnalysisReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const result = await getAnalysisById(supabase, id, crypto.randomUUID());
  if (!result) notFound();
  const { analysis } = result;
  const isPending = analysis.status !== "completed";
  const analysisStatusLabel = analysis.status === "queued" ? "Análise na fila" : analysis.status === "processing" ? "Análise em processamento" : analysis.status === "failed" ? "Análise não concluída" : "Análise cancelada";
  const score = Math.round(analysis.dimensions.reduce((total, item) => total + item.score * item.weight, 0) / 100);

  return <div className="mx-auto max-w-4xl"><Link className="text-sm font-bold text-[#145c43]" href="/analises">← Análises</Link><header className="mt-5"><p className="text-sm font-semibold text-[#145c43]">{isPending ? analysisStatusLabel : "Análise concluída"}</p><h1 className="mt-1 text-3xl font-extrabold">{analysis.jobTitle}</h1><p className="mt-2 text-[#5b655e]">{analysis.companyLabel} · {analysis.resumeName}</p></header><section className="card mt-7 p-6">{isPending ? <><p className="text-sm font-semibold text-[#145c43]">{analysisStatusLabel}</p><p className="mt-2 text-sm leading-6 text-[#5b655e]">O relatório será preenchido assim que o worker concluir o processamento. Atualize esta página em alguns instantes.</p></> : <><p className="text-sm text-[#5b655e]">Aderência identificada</p><strong className="text-5xl">{score}%</strong></>}<p className="mt-3 text-sm text-[#5b655e]">Algoritmo {analysis.algorithmVersion} · {analysis.createdAt}</p></section><section className="mt-8"><h2 className="text-2xl font-extrabold">Dimensões</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{analysis.dimensions.map((item) => <article className="card p-5" key={item.key}><div className="flex justify-between"><strong>{item.label}</strong><strong>{item.score}/100</strong></div><p className="mt-3 text-sm text-[#5b655e]">{item.rationale}</p></article>)}</div></section><section className="mt-8"><h2 className="text-2xl font-extrabold">Termos e evidências</h2><div className="mt-4 space-y-3">{analysis.requirements.map((item) => <article className="card p-5" key={item.id}><div className="flex justify-between gap-3"><strong>{item.title}</strong><span>{statusLabels[item.status]}</span></div><p className="mt-2 text-sm text-[#5b655e]">{item.note}</p>{item.evidence && <blockquote className="mt-3 border-l-2 pl-3 text-sm">{item.evidence}</blockquote>}</article>)}</div></section><section className="mt-8"><h2 className="text-2xl font-extrabold">Próximas ações</h2><div className="mt-4 space-y-3">{analysis.recommendations.map((item) => <article className="card p-5" key={item.id}><strong>{item.title}</strong><p className="mt-2 text-sm text-[#5b655e]">{item.description}</p></article>)}</div></section><AnalysisFeedbackForm analysisId={id}/></div>;
}
