export type ComputedDimension = {
  dimension: "technical" | "experience" | "required" | "education" | "evidence";
  weight: number;
  score: number;
  rationale: string;
};

export type ComputedMatch = {
  requirementId: string;
  title: string;
  kind: "required" | "desirable";
  status: "matched" | "partial" | "missing";
  confidence: number;
  evidence: string | null;
  note: string;
};

export type ComputedRecommendation = {
  priority: number;
  category: "resume" | "preparation" | "clarity";
  title: string;
  description: string;
};

const STOP_WORDS = new Set([
  "para", "com", "uma", "um", "das", "dos", "que", "por", "como", "mais", "menos", "entre", "sobre", "ser", "ter", "sua", "seu", "nos", "nas", "the", "and", "with", "from", "this", "that", "will", "vaga", "pessoa", "profissional", "experiencia", "experiência", "conhecimento", "conhecimentos", "desejavel", "desejável", "obrigatorio", "obrigatório",
]);

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function keywords(jobText: string) {
  const words = normalize(jobText).match(/[a-z0-9+#.]{3,}/g) ?? [];
  return [...new Set(words.filter((word) => !STOP_WORDS.has(word) && !/^\d+$/.test(word)))].slice(0, 10);
}

function evidenceFor(keyword: string, resumeText: string) {
  const sentence = resumeText.split(/(?<=[.!?])\s+/).find((item) => normalize(item).includes(keyword));
  return sentence ? sentence.slice(0, 500) : null;
}

export function computeAnalysis(resumeText: string, jobText: string) {
  const terms = keywords(jobText);
  const matches: ComputedMatch[] = terms.map((term, index) => {
    const evidence = evidenceFor(term, resumeText);
    const partial = !evidence && term.length > 5 && normalize(resumeText).includes(term.slice(0, -2));
    const status = evidence ? "matched" : partial ? "partial" : "missing";
    return {
      requirementId: `term-${index + 1}`,
      title: term.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      kind: index < 6 ? "required" : "desirable",
      status,
      confidence: evidence ? 90 : partial ? 55 : 80,
      evidence,
      note: evidence ? "Termo da vaga encontrado no texto extraído do currículo." : partial ? "Há um termo relacionado, mas sem correspondência direta." : "Nenhuma evidência direta foi identificada no texto extraído.",
    };
  });
  const matched = matches.filter((item) => item.status === "matched").length;
  const partial = matches.filter((item) => item.status === "partial").length;
  const coverage = terms.length ? Math.round(((matched + partial * 0.5) / terms.length) * 100) : 0;
  const dimensions: ComputedDimension[] = [
    { dimension: "technical", weight: 40, score: coverage, rationale: "Pontuação baseada na correspondência entre termos da vaga e o currículo." },
    { dimension: "experience", weight: 25, score: coverage, rationale: "Evidências encontradas no texto do currículo para os termos analisados." },
    { dimension: "required", weight: 20, score: coverage, rationale: `${matched} correspondência(s) direta(s) e ${partial} parcial(is) dentre ${terms.length} termo(s) analisado(s).` },
    { dimension: "education", weight: 10, score: Math.min(100, coverage), rationale: "Esta versão não infere qualificações que não estejam escritas no currículo." },
    { dimension: "evidence", weight: 5, score: Math.min(100, matched * 15), rationale: "Reflete a quantidade de trechos diretos encontrados no documento." },
  ];
  const missing = matches.filter((item) => item.status === "missing").slice(0, 3);
  const recommendations: ComputedRecommendation[] = missing.map((item, index) => ({
    priority: index === 0 ? 1 : 2,
    category: "resume",
    title: `Esclareça sua experiência com ${item.title}`,
    description: `Se você possui experiência real com ${item.title}, descreva-a no currículo com contexto e resultado. Não adicione competências que não possa sustentar.`,
  }));
  if (!recommendations.length) recommendations.push({ priority: 2, category: "preparation", title: "Prepare evidências para a entrevista", description: "Escolha exemplos reais do currículo para explicar as experiências relacionadas à vaga." });
  return { dimensions, matches, recommendations, score: Math.round(dimensions.reduce((total, item) => total + item.score * item.weight, 0) / 100) };
}