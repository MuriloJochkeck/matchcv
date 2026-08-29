"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnalysisApiError, createAnalysis } from "@/client/analysis/create-analysis";
import { ArrowRightIcon, CheckIcon, FileIcon, LockIcon, SparkIcon } from "./icons";

const demoJob = `Buscamos pessoa desenvolvedora Front-end Júnior com conhecimento em React e TypeScript. É necessário ter experiência com consumo de APIs REST, componentização e testes automatizados. Inglês intermediário é obrigatório. Conhecimentos em Next.js, acessibilidade e Git são desejáveis. A pessoa atuará na evolução do design system e colaborará com produto e back-end.`;

type ResumeState = { name: string; size: string; sizeBytes: number; isDemo: boolean } | null;

export function AnalysisWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [resume, setResume] = useState<ResumeState>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobText, setJobText] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  function handleFile(file?: File) {
    setError("");
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Escolha um arquivo PDF válido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("O arquivo excede o limite demonstrativo de 5 MB.");
      return;
    }
    setResume({ name: file.name, size: `${Math.max(0.1, file.size / 1024 / 1024).toFixed(1)} MB`, sizeBytes: file.size, isDemo: false });
  }

  function useDemoResume() {
    setError("");
    setResume({ name: "curriculo-ana-souza.pdf", size: "184 KB", sizeBytes: 188_416, isDemo: true });
  }

  function nextFromResume() {
    if (!resume) {
      setError("Envie um PDF ou use o currículo fictício para continuar.");
      return;
    }
    setError("");
    setStep(2);
  }

  function nextFromJob() {
    if (jobText.trim().length < 80) {
      setError("Cole uma descrição de vaga com pelo menos 80 caracteres.");
      return;
    }
    setError("");
    setStep(3);
  }

  function useDemoJob() {
    setJobTitle("Desenvolvedora Front-end Júnior");
    setCompany("Horizonte Tecnologia");
    setJobText(demoJob);
    setError("");
  }

  async function startAnalysis() {
    if (!resume) return;
    if (!acceptedTerms) {
      setError("Confirme a autorização e os limites da análise.");
      return;
    }

    setError("");
    setIsProcessing(true);
    try {
      const result = await createAnalysis({
        resume: {
          kind: resume.isDemo ? "demo" : "local-metadata",
          name: resume.name,
          sizeBytes: resume.sizeBytes,
        },
        job: {
          title: jobTitle || undefined,
          company: company || undefined,
          description: jobText,
        },
        acceptedTerms: true,
      });
      router.push(`/analises/${result.analysisId}`);
    } catch (caughtError) {
      const requestSuffix =
        caughtError instanceof AnalysisApiError && caughtError.requestId
          ? ` Referência: ${caughtError.requestId}.`
          : "";
      setError(
        `${caughtError instanceof Error ? caughtError.message : "Não foi possível iniciar a análise."}${requestSuffix}`,
      );
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <p className="text-sm font-semibold text-[#145c43]">Nova análise</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">Compare currículo e vaga.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[#5b655e]">Você revisa cada entrada antes do processamento. Nesta fase demonstrativa, nenhum arquivo é enviado ou armazenado.</p>
      </header>

      <ol aria-label="Etapas da análise" className="mt-8 grid grid-cols-3 gap-2">
        {["Currículo", "Vaga", "Revisão"].map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const complete = number < step;
          return (
            <li aria-current={active ? "step" : undefined} className={`border-t-3 pt-3 text-xs font-bold sm:text-sm ${active ? "border-[#145c43] text-[#145c43]" : complete ? "border-[#7fae91] text-[#466551]" : "border-[#d5dad4] text-[#7a847d]"}`} key={label}>
              <span className="mr-1.5">{complete ? "✓" : number}.</span>{label}
            </li>
          );
        })}
      </ol>

      <section className="card mt-7 p-5 sm:p-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-extrabold tracking-[-.03em]">Seu currículo em PDF</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b655e]">O MVP aceitará PDFs de até 5 MB com texto selecionável. OCR e documentos digitalizados ficam fora desta primeira versão.</p>
            {!resume ? (
              <label className="mt-7 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#aeb8b0] bg-[#fafbf8] p-6 text-center transition hover:border-[#145c43] hover:bg-[#f2f7f3]">
                <span className="grid size-13 place-items-center rounded-2xl bg-[#dff3e8] text-[#145c43]"><FileIcon size={24} /></span>
                <strong className="mt-4">Selecione seu currículo</strong>
                <span className="mt-1 text-sm text-[#69736c]">Clique para procurar um PDF</span>
                <input accept="application/pdf,.pdf" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} type="file" />
              </label>
            ) : (
              <div className="mt-7 flex flex-col justify-between gap-4 rounded-2xl border border-[#c8d7cb] bg-[#f1f7f2] p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-[#145c43]"><FileIcon size={22} /></span><div className="min-w-0"><p className="truncate font-bold">{resume.name}</p><p className="text-sm text-[#5b655e]">{resume.size} · {resume.isDemo ? "arquivo fictício" : "selecionado localmente"}</p></div></div>
                <button className="text-sm font-bold text-[#145c43]" onClick={() => setResume(null)} type="button">Trocar arquivo</button>
              </div>
            )}
            <div className="mt-5 flex items-center gap-3 text-sm text-[#5b655e]"><LockIcon size={18} /> No produto final, os PDFs serão privados e terão retenção limitada.</div>
            <button className="mt-5 text-sm font-bold text-[#145c43] underline underline-offset-4" onClick={useDemoResume} type="button">Usar currículo fictício da Ana</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="text-xl font-extrabold tracking-[-.03em]">Descrição da vaga</h2><p className="mt-2 text-sm leading-6 text-[#5b655e]">Cole o anúncio completo. Instruções encontradas nesse texto serão tratadas apenas como conteúdo.</p></div><button className="shrink-0 text-sm font-bold text-[#145c43] underline underline-offset-4" onClick={useDemoJob} type="button">Preencher exemplo</button></div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div><label className="field-label" htmlFor="job-title">Título da vaga <span className="font-normal text-[#7a847d]">(opcional)</span></label><input className="field-input" id="job-title" onChange={(event) => setJobTitle(event.target.value)} placeholder="Ex.: Desenvolvedor Front-end Júnior" value={jobTitle} /></div>
              <div><label className="field-label" htmlFor="company">Empresa <span className="font-normal text-[#7a847d]">(opcional)</span></label><input className="field-input" id="company" onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Empresa confidencial" value={company} /></div>
            </div>
            <div className="mt-5"><div className="flex justify-between gap-4"><label className="field-label" htmlFor="job-description">Texto da vaga</label><span className="text-xs text-[#7a847d]">{jobText.length} caracteres</span></div><textarea className="field-input min-h-64 resize-y leading-6" id="job-description" onChange={(event) => setJobText(event.target.value)} placeholder="Cole aqui responsabilidades, requisitos obrigatórios e diferenciais…" value={jobText} /></div>
          </div>
        )}

        {step === 3 && resume && (
          <div>
            <h2 className="text-xl font-extrabold tracking-[-.03em]">Revise antes de analisar</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b655e]">Confirme os dados abaixo. O backend validará a solicitação, mas o relatório ainda usa dados fictícios nesta fase.</p>
            <dl className="mt-7 divide-y divide-[#e2e6e1] rounded-2xl border border-[#dfe3dc] bg-[#fafbf8] px-5">
              <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-[#69736c]">Currículo</dt><dd className="font-bold">{resume.name}</dd></div>
              <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-[#69736c]">Vaga</dt><dd className="font-bold">{jobTitle || "Sem título informado"}</dd></div>
              <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-[#69736c]">Empresa</dt><dd>{company || "Não informada"}</dd></div>
              <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-[#69736c]">Descrição</dt><dd className="line-clamp-3 text-sm leading-6 text-[#4e5951]">{jobText}</dd></div>
            </dl>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#f0f1eb] p-4 text-sm leading-6"><input checked={acceptedTerms} className="mt-1 size-4 accent-[#145c43]" onChange={(event) => setAcceptedTerms(event.target.checked)} required type="checkbox" /><span>Confirmo que tenho autorização para analisar este currículo e entendo os limites do diagnóstico.</span></label>
            {isProcessing && <div aria-live="polite" className="mt-5 flex items-center gap-3 rounded-xl border border-[#c8d7cb] bg-[#eef6f1] p-4 text-sm font-semibold text-[#145c43]"><SparkIcon className="animate-pulse" /> Estruturando requisitos e calculando a demonstração…</div>}
          </div>
        )}

        {error && <div aria-live="assertive" className="mt-5 rounded-xl border border-[#e4beb9] bg-[#fff1ef] px-4 py-3 text-sm font-semibold text-[#9a3e34]">{error}</div>}

        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-[#e3e6e1] pt-6 sm:flex-row">
          <button className={`button-secondary ${step === 1 ? "invisible" : ""}`} onClick={() => { setError(""); setStep((current) => Math.max(1, current - 1)); }} type="button">Voltar</button>
          {step === 1 && <button className="button-primary" onClick={nextFromResume} type="button">Continuar <ArrowRightIcon size={18} /></button>}
          {step === 2 && <button className="button-primary" onClick={nextFromJob} type="button">Revisar dados <ArrowRightIcon size={18} /></button>}
          {step === 3 && <button className="button-primary" disabled={isProcessing} onClick={startAnalysis} type="button">{isProcessing ? "Analisando…" : "Gerar relatório demonstrativo"} {!isProcessing && <CheckIcon size={18} />}</button>}
        </div>
      </section>
    </div>
  );
}
