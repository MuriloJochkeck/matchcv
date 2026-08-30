"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnalysisApiError, createAnalysis } from "@/client/analysis/create-analysis";
import { ResumeReviewApiError, updateResumeText } from "@/client/resume/update-resume-text";

type Resume = { id: string; originalName: string; extractedText: string };

export function AnalysisWizard({ resumes }: { resumes: Resume[] }) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [reviewText, setReviewText] = useState(resumes[0]?.extractedText ?? "");
  const [savedText, setSavedText] = useState(resumes[0]?.extractedText ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const hasUnsavedReview = reviewText.trim() !== savedText.trim();

  function selectResume(id: string) {
    const next = resumes.find((item) => item.id === id);
    setResumeId(id);
    setReviewText(next?.extractedText ?? "");
    setSavedText(next?.extractedText ?? "");
    setError("");
  }

  async function saveReview() {
    if (!reviewText.trim()) {
      setError("Revise o texto antes de salvar: ele não pode ficar vazio.");
      return false;
    }
    setError("");
    setSavingReview(true);
    try {
      const result = await updateResumeText(resumeId, { extractedText: reviewText });
      setReviewText(result.extractedText);
      setSavedText(result.extractedText);
      return true;
    } catch (caught) {
      setError(caught instanceof ResumeReviewApiError ? caught.message : "Não foi possível salvar a revisão.");
      return false;
    } finally {
      setSavingReview(false);
    }
  }

  async function submit() {
    if (description.trim().length < 80) {
      setError("A descrição da vaga deve ter pelo menos 80 caracteres.");
      return;
    }
    if (!acceptedTerms) {
      setError("Confirme a autorização e os limites da análise.");
      return;
    }
    setError("");
    setPending(true);
    try {
      if (hasUnsavedReview && !(await saveReview())) {
        setPending(false);
        return;
      }
      const result = await createAnalysis({ resumeId, job: { title, company, description }, acceptedTerms: true });
      router.push(`/analises/${result.analysisId}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof AnalysisApiError ? (caught.fieldErrors ? Object.values(caught.fieldErrors).join(" ") : caught.message) : "Não foi possível concluir a análise.");
      setPending(false);
    }
  }

  if (!resumes.length) return <div className="card p-6"><h1 className="text-2xl font-extrabold">Envie um currículo antes de analisar</h1><a className="button-primary mt-5 w-fit" href="/curriculos">Ir para currículos</a></div>;

  return <div className="mx-auto max-w-3xl">
    <p className="text-sm font-semibold text-[#145c43]">Nova análise</p>
    <h1 className="mt-1 text-3xl font-extrabold">Compare seu currículo com uma vaga</h1>
    <div className="card mt-7 space-y-5 p-6">
      <label className="field-label">Currículo<select className="field-input mt-2" value={resumeId} onChange={(e) => selectResume(e.target.value)}>{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.originalName}</option>)}</select></label>
      <section className="rounded-xl border border-[#c9d6cb] bg-[#eef6f1] p-4">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">Revise o texto extraído</h2><p className="mt-1 text-sm leading-6 text-[#4e6055]">Corrija nomes, datas ou trechos que o PDF tenha lido incorretamente. A versão salva será usada na análise.</p></div><span className="shrink-0 text-xs font-bold text-[#145c43]">{reviewText.length.toLocaleString("pt-BR")} caracteres</span></div>
        <textarea aria-label="Texto extraído do currículo" className="field-input mt-4 min-h-56 whitespace-pre-wrap text-sm leading-6" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#69736c]">{hasUnsavedReview ? "Há alterações não salvas." : "Texto revisado e salvo."}</p><button className="button-secondary" disabled={savingReview || pending || !hasUnsavedReview} onClick={saveReview} type="button">{savingReview ? "Salvando..." : "Salvar revisão"}</button></div>
      </section>
      <label className="field-label">Título da vaga<input className="field-input mt-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="field-label">Empresa<input className="field-input mt-2" value={company} onChange={(e) => setCompany(e.target.value)} /></label>
      <label className="field-label">Descrição da vaga<textarea className="field-input mt-2 min-h-48" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      <label className="flex gap-3 text-sm"><input checked={acceptedTerms} type="checkbox" onChange={(e) => setAcceptedTerms(e.target.checked)} />Autorizo a comparação deste currículo com a vaga.</label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="button-primary" disabled={pending || savingReview} onClick={submit} type="button">{pending ? "Analisando..." : "Analisar vaga"}</button>
    </div>
  </div>;
}
