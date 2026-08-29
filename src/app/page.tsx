import Link from "next/link";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { ArrowRightIcon, CheckIcon, FileIcon, LockIcon, ShieldIcon, SparkIcon } from "@/components/icons";

const dimensions = [
  { label: "Competências técnicas", score: 78, width: "78%" },
  { label: "Experiência relacionada", score: 72, width: "72%" },
  { label: "Requisitos obrigatórios", score: 75, width: "75%" },
];

const steps = [
  { number: "01", title: "Envie seu currículo", description: "Use um PDF com texto selecionável. Você revisa o conteúdo antes de qualquer análise." },
  { number: "02", title: "Cole a descrição da vaga", description: "O MatchCV separa os requisitos e considera o que é obrigatório ou desejável." },
  { number: "03", title: "Entenda o diagnóstico", description: "Veja critérios, trechos do currículo, lacunas e ações específicas — nunca só uma porcentagem." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <MarketingHeader />
      <main>
        <section className="overflow-hidden border-b border-[#dfe3dc] py-16 sm:py-24 lg:py-28">
          <div className="page-shell grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
            <div>
              <span className="eyebrow">Análise explicável de currículo</span>
              <h1 className="text-balance mt-5 max-w-3xl text-[2.7rem] leading-[1.02] font-extrabold tracking-[-0.06em] sm:text-6xl lg:text-[4.5rem]">
                Sua experiência, <span className="text-[#145c43]">bem conectada</span> à vaga.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b655e] sm:text-xl">
                Descubra o que seu currículo já comprova, o que não foi identificado e como comunicar melhor sua trajetória — sem inventar nada.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="button-primary" href="/cadastro">Analisar meu currículo <ArrowRightIcon size={18} /></Link>
                <Link className="button-secondary" href="/analises/demo">Ver relatório demonstrativo</Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#5b655e]">
                <span className="flex items-center gap-2"><CheckIcon className="text-[#145c43]" size={17} /> Explicações com evidências</span>
                <span className="flex items-center gap-2"><CheckIcon className="text-[#145c43]" size={17} /> Seus dados sob controle</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:mx-0">
              <div aria-hidden="true" className="absolute -inset-6 -z-0 rounded-[2.5rem] border border-[#cbd7cd] bg-[#e9efe7] [transform:rotate(-2deg)]" />
              <div className="relative rounded-[1.75rem] border border-[#cfd7d0] bg-white p-5 shadow-[0_28px_70px_rgba(23,33,27,.12)] sm:p-7">
                <div className="flex items-start justify-between gap-5 border-b border-[#e5e8e3] pb-5">
                  <div><p className="text-xs font-bold tracking-[.08em] text-[#69736c] uppercase">Relatório de aderência</p><h2 className="mt-1 text-lg font-extrabold">Front-end Júnior</h2><p className="mt-1 text-sm text-[#69736c]">Horizonte Tecnologia</p></div>
                  <span className="rounded-full bg-[#dff3e8] px-3 py-1 text-xs font-bold text-[#145c43]">Concluída</span>
                </div>
                <div className="grid gap-6 py-6 sm:grid-cols-[126px_1fr] sm:items-center">
                  <div className="relative mx-auto grid size-29 place-items-center rounded-full bg-[conic-gradient(#145c43_0deg_274deg,#e4e8e2_274deg_360deg)]">
                    <div className="absolute inset-2 rounded-full bg-white" />
                    <div className="relative"><strong className="text-4xl tracking-[-.06em]">76</strong><span className="text-xs font-bold text-[#69736c]">/100</span></div>
                  </div>
                  <div><p className="font-bold text-[#145c43]">Boa base para a vaga</p><p className="mt-1 text-sm leading-6 text-[#5b655e]">Seu currículo demonstra 3 dos 4 requisitos obrigatórios.</p></div>
                </div>
                <div className="space-y-4">
                  {dimensions.map((dimension) => (
                    <div key={dimension.label}>
                      <div className="mb-1.5 flex justify-between text-xs font-semibold"><span>{dimension.label}</span><span>{dimension.score}</span></div>
                      <div className="h-2 rounded-full bg-[#e9ece7]"><div className="h-2 rounded-full bg-[#145c43]" style={{ width: dimension.width }} /></div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f3f6f1] p-4">
                  <SparkIcon className="mt-0.5 shrink-0 text-[#145c43]" size={19} />
                  <p className="text-sm leading-6"><strong>Próxima ação:</strong> detalhe as ferramentas usadas nos seus testes de interface.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="trust-title" className="border-b border-[#dfe3dc] bg-white py-7">
          <div className="page-shell flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="font-semibold" id="trust-title">Uma análise para orientar — não para julgar.</p>
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-[#5b655e] sm:justify-end">
              <span className="flex items-center gap-2"><ShieldIcon size={17} /> Sem atributos sensíveis</span>
              <span className="flex items-center gap-2"><LockIcon size={17} /> Arquivos privados</span>
              <span className="flex items-center gap-2"><FileIcon size={17} /> Exclusão sob seu controle</span>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28" id="como-funciona">
          <div className="page-shell">
            <div className="max-w-2xl"><span className="eyebrow">Como funciona</span><h2 className="text-balance mt-4 text-3xl font-extrabold tracking-[-.045em] sm:text-5xl">Da vaga à próxima ação, em três passos claros.</h2></div>
            <ol className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-[#dfe3dc] bg-[#dfe3dc] lg:grid-cols-3">
              {steps.map((step) => (
                <li className="bg-white p-7 sm:p-9" key={step.number}>
                  <span className="font-mono text-sm font-bold text-[#145c43]">{step.number}</span>
                  <h3 className="mt-8 text-xl font-extrabold tracking-[-.03em]">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#5b655e]">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-[#17211b] py-20 text-white sm:py-28" id="relatorio">
          <div className="page-shell grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-20">
            <div><span className="eyebrow text-[#8ed1aa]!">Não é uma nota solta</span><h2 className="text-balance mt-4 text-3xl font-extrabold tracking-[-.045em] sm:text-5xl">Cada conclusão mostra de onde veio.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-[#bec7c0]">O relatório separa presença, evidência parcial e item não identificado. Isso ajuda você a decidir o que melhorar sem tratar uma ferramenta como verdade absoluta.</p><Link className="mt-8 inline-flex items-center gap-2 font-bold text-[#a8dfbd] hover:text-white" href="/analises/demo">Explorar relatório completo <ArrowRightIcon size={18} /></Link></div>
            <div className="grid gap-3">
              {[
                ["Atendido", "React e componentização", "Trecho direto do projeto acadêmico", "#a8dfbd", "#204f39"],
                ["Parcial", "Testes automatizados", "Há evidência, mas faltam ferramenta e escopo", "#f6cf8c", "#60471e"],
                ["Não identificado", "Inglês intermediário", "O currículo não informa o nível", "#cbd2cc", "#3f4942"],
              ].map(([status, title, note, color, bg]) => (
                <div className="rounded-2xl border border-white/12 bg-white/[.06] p-5" key={title}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-[#bec7c0]">{note}</p></div><span className="w-fit rounded-full px-3 py-1 text-xs font-bold" style={{ background: bg, color }}>{status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="page-shell rounded-[2rem] border border-[#c9d6cb] bg-[#dff3e8] px-6 py-12 text-center sm:px-12 sm:py-16">
            <span className="eyebrow">Comece pelo que é real</span>
            <h2 className="text-balance mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-[-.05em] sm:text-5xl">Transforme seu currículo em uma conversa melhor com a vaga.</h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#4e6055]">Experimente o fluxo demonstrativo do MVP e veja como a análise explicável funciona.</p>
            <Link className="button-primary mt-8" href="/cadastro">Criar minha análise <ArrowRightIcon size={18} /></Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
