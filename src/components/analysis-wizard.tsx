"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnalysisApiError, createAnalysis } from "@/client/analysis/create-analysis";

type Resume = { id: string; originalName: string };

export function AnalysisWizard({ resumes }: { resumes: Resume[] }) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit() {
    setError(""); setPending(true);
    try {
      const result = await createAnalysis({ resumeId, job: { title, company, description }, acceptedTerms: acceptedTerms as true });
      router.push(`/analises/${result.analysisId}`); router.refresh();
    } catch (caught) { setError(caught instanceof AnalysisApiError ? caught.message : "Não foi possível concluir a análise."); setPending(false); }
  }
  if (!resumes.length) return <div className="card p-6"><h1 className="text-2xl font-extrabold">Envie um currículo antes de analisar</h1><a className="button-primary mt-5 w-fit" href="/curriculos">Ir para currículos</a></div>;
  return <div className="mx-auto max-w-3xl"><p className="text-sm font-semibold text-[#145c43]">Nova análise</p><h1 className="mt-1 text-3xl font-extrabold">Compare seu currículo com uma vaga</h1><div className="card mt-7 space-y-5 p-6"><label className="field-label">Currículo<select className="field-input mt-2" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.originalName}</option>)}</select></label><label className="field-label">Título da vaga<input className="field-input mt-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label><label className="field-label">Empresa<input className="field-input mt-2" value={company} onChange={(e) => setCompany(e.target.value)} /></label><label className="field-label">Descrição da vaga<textarea className="field-input mt-2 min-h-48" value={description} onChange={(e) => setDescription(e.target.value)} /></label><label className="flex gap-3 text-sm"><input checked={acceptedTerms} type="checkbox" onChange={(e) => setAcceptedTerms(e.target.checked)} />Autorizo a comparação deste currículo com a vaga.</label>{error && <p className="text-sm text-red-700">{error}</p>}<button className="button-primary" disabled={pending} onClick={submit} type="button">{pending ? "Analisando..." : "Analisar vaga"}</button></div></div>;
}