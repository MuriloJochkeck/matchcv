import type { JobRequirement } from "../../contracts/job.ts";
import { extractJobRequirements, normalize } from "../../contracts/job.ts";

export type ComputedDimension = { dimension: "technical" | "experience" | "required" | "education" | "evidence"; weight: number; score: number; rationale: string };
export type ComputedMatch = { requirementId: string; title: string; kind: "required" | "desirable"; status: "matched" | "partial" | "missing" | "not_applicable"; confidence: number; evidence: string | null; note: string };
export type ComputedRecommendation = { priority: number; category: "resume" | "preparation" | "clarity"; title: string; description: string };

function sentenceList(value: string) { return value.split(/(?<=[.!?])\s+|\n+/).map((item) => item.trim()).filter(Boolean); }
function experienceYears(value: string) { const match = value.match(/(\d+)\s*\+?\s*anos?/i); return match ? Number(match[1]) : null; }
function evidenceFor(terms: string[], resumeText: string) {
  const normalizedResume = normalize(resumeText);
  const sentences = sentenceList(resumeText);
  for (const term of terms) { const sentence = sentences.find((item) => normalize(item).includes(normalize(term))); if (sentence) return { text: sentence.slice(0, 500), direct: normalizedResume.includes(normalize(term)) }; }
  return null;
}
function scoreForMatch(requirement: JobRequirement, resumeText: string) {
  if (/nao se aplica|não se aplica|not applicable/.test(normalize(requirement.sourceText))) return { status: "not_applicable" as const, confidence: 100, evidence: null, note: "O próprio texto da vaga indica que este requisito não se aplica." };
  const direct = evidenceFor(requirement.keywords, resumeText);
  if (direct) { const quality = /\d+|resultado|entreg|projeto|atuou|lider/i.test(direct.text) ? 96 : 88; return { status: "matched" as const, confidence: quality, evidence: direct.text, note: "Evidência direta encontrada no texto do currículo." }; }
  const related = evidenceFor(requirement.synonyms, resumeText);
  if (related) return { status: "partial" as const, confidence: 72, evidence: related.text, note: "Foi encontrada uma competência relacionada, mas não a mesma expressão da vaga." };
  if (requirement.category === "experience") {
    const requested = experienceYears(requirement.sourceText); const available = experienceYears(resumeText);
    if (requested !== null && available !== null && available >= requested) return { status: "matched" as const, confidence: 82, evidence: `${available} anos de experiência informados no currículo.`, note: "O tempo de experiência informado atende ao mínimo identificado." };
    if (requested !== null && available !== null && available > 0) return { status: "partial" as const, confidence: 60, evidence: `${available} anos de experiência informados no currículo.`, note: "O tempo informado é inferior ao mínimo identificado na vaga." };
  }
  const title = normalize(requirement.title); if (title.length > 5 && normalize(resumeText).includes(title.slice(0, -2))) return { status: "partial" as const, confidence: 50, evidence: null, note: "Há um termo parcialmente relacionado, mas sem evidência suficiente." };
  return { status: "missing" as const, confidence: 84, evidence: null, note: "Nenhuma evidência confiável foi identificada no texto do currículo." };
}
export function computeAnalysis(resumeText: string, jobText: string, providedRequirements?: JobRequirement[]) {
  const requirements = providedRequirements?.length ? providedRequirements : extractJobRequirements(jobText);
  const matches = requirements.map((requirement) => { const result = scoreForMatch(requirement, resumeText); return { requirementId: requirement.id, title: requirement.title, kind: requirement.kind, ...result }; });
  const applicable = matches.filter((item) => item.status !== "not_applicable");
  const weightedTotal = requirements.reduce((sum, requirement, index) => { const match = matches[index]; const value = match.status === "matched" ? 100 : match.status === "partial" ? 55 : match.status === "not_applicable" ? 0 : 0; return sum + value * requirement.weight; }, 0);
  const weightDenominator = requirements.reduce((sum, requirement, index) => sum + (matches[index].status === "not_applicable" ? 0 : requirement.weight), 0);
  const score = weightDenominator ? Math.round(weightedTotal / weightDenominator) : 0;
  const technical = matches.filter((_, index) => requirements[index].category === "technical");
  const experience = matches.filter((_, index) => requirements[index].category === "experience");
  const education = matches.filter((_, index) => requirements[index].category === "education" || requirements[index].category === "language");
  const coverage = (items: ComputedMatch[]) => items.length ? Math.round(items.reduce((sum, item) => sum + (item.status === "matched" ? 100 : item.status === "partial" ? 55 : item.status === "not_applicable" ? 0 : 0), 0) / Math.max(1, items.filter((item) => item.status !== "not_applicable").length)) : 0;
  const dimensions: ComputedDimension[] = [
    { dimension: "technical", weight: 40, score: coverage(technical), rationale: "Competências técnicas ponderadas por obrigatoriedade, equivalência e qualidade da evidência." },
    { dimension: "experience", weight: 25, score: coverage(experience), rationale: "Experiência considera contexto profissional e tempo informado quando disponível." },
    { dimension: "required", weight: 20, score: score, rationale: `${applicable.filter((item) => item.kind === "required" && item.status === "matched").length} requisito(s) obrigatório(s) atendido(s) entre ${applicable.filter((item) => item.kind === "required").length}.` },
    { dimension: "education", weight: 10, score: coverage(education), rationale: "Formação e idiomas só são considerados quando aparecem explicitamente no currículo." },
    { dimension: "evidence", weight: 5, score: applicable.length ? Math.round(applicable.reduce((sum, item) => sum + item.confidence, 0) / applicable.length) : 0, rationale: "Confiança agregada pela qualidade e especificidade das evidências encontradas." },
  ];
  const missing = matches.filter((item) => item.status === "missing").slice(0, 3);
  const recommendations: ComputedRecommendation[] = missing.map((item, index) => ({ priority: index === 0 ? 1 : 2, category: "resume" as const, title: `Esclareça sua experiência com ${item.title}`, description: `Se você possui experiência real com ${item.title}, descreva contexto e resultado no currículo. Não adicione competências que não possa sustentar.` }));
  if (!recommendations.length) recommendations.push({ priority: 2, category: "preparation", title: "Prepare evidências para a entrevista", description: "Escolha exemplos reais do currículo para explicar as experiências relacionadas à vaga." });
  return { dimensions, matches, recommendations, score };
}