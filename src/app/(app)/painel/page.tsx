import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, ChartIcon, ClockIcon, FileIcon, PlusIcon, SparkIcon } from "@/components/icons";
import { ScoreRing } from "@/components/score-ring";
import { demoAnalysis } from "@/server/analysis/demo-analysis";
import { calculateOverallScore } from "@/server/analysis/scoring";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const score = calculateOverallScore(demoAnalysis.dimensions);
  return (
    <div>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-[#145c43]">Olá, {user?.displayName.split(" ")[0] || "candidato"}</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">Onde você quer chegar agora?</h1><p className="mt-3 text-[#5b655e]">Compare seu currículo com uma vaga ou retome uma análise.</p></div>
        <Link className="button-primary shrink-0" href="/analises/nova"><PlusIcon size={18} /> Nova análise</Link>
      </header>

      <section aria-labelledby="summary-heading" className="mt-9 grid gap-4 sm:grid-cols-3">
        <h2 className="sr-only" id="summary-heading">Resumo da conta</h2>
        {[{ icon: ChartIcon, value: "1", label: "Análise concluída" }, { icon: FileIcon, value: "1", label: "Currículo ativo" }, { icon: ClockIcon, value: "30 dias", label: "Retenção demonstrativa" }].map((item) => {
          const Icon = item.icon;
          return <div className="card flex items-center gap-4 p-5" key={item.label}><span className="grid size-11 place-items-center rounded-xl bg-[#dff3e8] text-[#145c43]"><Icon size={20} /></span><div><strong className="text-xl tracking-[-.03em]">{item.value}</strong><p className="text-sm text-[#5b655e]">{item.label}</p></div></div>;
        })}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section aria-labelledby="recent-heading" className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e3e6e1] px-5 py-4 sm:px-6"><h2 className="font-extrabold" id="recent-heading">Análise mais recente</h2><Link className="text-sm font-bold text-[#145c43]" href="/analises/demo">Abrir relatório</Link></div>
          <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-7">
            <ScoreRing score={score} size="small" />
            <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-extrabold">{demoAnalysis.jobTitle}</h3><span className="rounded-full bg-[#dff3e8] px-2.5 py-1 text-xs font-bold text-[#145c43]">Concluída</span></div><p className="mt-1 text-sm text-[#5b655e]">{demoAnalysis.companyLabel} · hoje, 14:32</p><p className="mt-4 text-sm leading-6 text-[#5b655e]">Boa base técnica. O maior ganho agora está em detalhar testes e contextualizar o nível de inglês.</p><Link className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#145c43]" href="/analises/demo">Ver evidências e ações <ArrowRightIcon size={16} /></Link></div>
          </div>
        </section>

        <aside className="rounded-[1.125rem] border border-[#bed6c5] bg-[#dff3e8] p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-white text-[#145c43]"><SparkIcon size={21} /></span>
          <h2 className="mt-5 text-xl font-extrabold tracking-[-.03em]">Uma vaga nova em vista?</h2>
          <p className="mt-3 text-sm leading-6 text-[#4e6055]">Use o mesmo currículo ou selecione outro PDF. Você sempre poderá revisar tudo antes da análise.</p>
          <Link className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#145c43]" href="/analises/nova">Começar comparação <ArrowRightIcon size={17} /></Link>
        </aside>
      </div>
    </div>
  );
}
