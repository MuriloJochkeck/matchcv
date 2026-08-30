export type JobRequirementKind = "required" | "desirable";
export type JobRequirementCategory = "technical" | "experience" | "education" | "language" | "clarity";

export type JobRequirement = {
  id: string;
  title: string;
  kind: JobRequirementKind;
  category: JobRequirementCategory;
  weight: number;
  keywords: string[];
  synonyms: string[];
  sourceText: string;
};

const ALIASES: Array<[RegExp, string, JobRequirementCategory, string[], string[]]> = [
  [/\btypescript\b|\bts\b/i, "TypeScript", "technical", ["typescript", "ts"], ["tipagem estática"]],
  [/\bjavascript\b|\bjs\b/i, "JavaScript", "technical", ["javascript", "js"], ["ecmascript"]],
  [/\breact(?:\.js)?\b/i, "React", "technical", ["react"], ["reactjs", "componentização"]],
  [/\bnext(?:\.js)?\b/i, "Next.js", "technical", ["nextjs", "next"], ["next.js"]],
  [/\bnode(?:\.js)?\b/i, "Node.js", "technical", ["nodejs", "node"], ["backend"]],
  [/\brest(?:ful)?\s*api(?:s)?\b|\bapi(?:s)?\s*rest\b/i, "APIs REST", "technical", ["api", "rest"], ["restful"]],
  [/\bpostgres(?:ql)?\b/i, "PostgreSQL", "technical", ["postgresql", "postgres"], ["banco de dados"]],
  [/\bsql\b/i, "SQL", "technical", ["sql"], ["consultas"]],
  [/\bdocker\b/i, "Docker", "technical", ["docker"], ["containers", "containerização"]],
  [/\bgit\b/i, "Git", "technical", ["git"], ["controle de versão"]],
  [/\btest(?:es|ing)?\b|\bjest\b|\bvitest\b/i, "Testes automatizados", "technical", ["testes", "testing", "jest", "vitest"], ["qualidade", "automação"]],
  [/\bingl|\benglish\b/i, "Inglês", "language", ["ingles", "english"], ["idioma"]],
  [/\bgradua(?:ção|c[aã]o)\b|\bforma(?:ção|c[aã]o)\b/i, "Formação", "education", ["graduacao", "formacao"], ["ensino superior", "bacharelado"]],
  [/\b(desenvolvedor|engenheiro|analista|experiência|experiencia)\b/i, "Experiência profissional", "experience", ["experiencia", "experiência", "profissional"], ["vivência", "atuou"]],
];

export function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function kindFor(sourceText: string, index: number): JobRequirementKind {
  const normalized = normalize(sourceText);
  if (/desejavel|diferencial|plus|nice to have|preferencial/.test(normalized)) return "desirable";
  if (/obrigatorio|necessario|requisito|must have|essencial|exigido/.test(normalized)) return "required";
  return index < 6 ? "required" : "desirable";
}

function weightFor(kind: JobRequirementKind, category: JobRequirementCategory) {
  if (category === "experience") return kind === "required" ? 1.3 : 0.9;
  if (category === "education" || category === "language") return kind === "required" ? 1.1 : 0.7;
  return kind === "required" ? 1.2 : 0.8;
}

export function extractJobRequirements(description: string): JobRequirement[] {
  const sentences = description.split(/(?<=[.!?])\s+|\n+/).map((item) => item.trim()).filter(Boolean);
  const requirements: JobRequirement[] = [];
  for (const [pattern, title, category, keywords, synonyms] of ALIASES) {
    const sourceText = sentences.find((sentence) => pattern.test(sentence)) ?? "";
    if (!sourceText) continue;
    const kind = kindFor(sourceText, requirements.length);
    requirements.push({ id: `req-${requirements.length + 1}`, title, kind, category, weight: weightFor(kind, category), keywords, synonyms, sourceText: sourceText.slice(0, 500) });
  }
  return requirements;
}

export function normalizeJobRequirements(value: unknown, description: string): JobRequirement[] {
  if (!Array.isArray(value)) return extractJobRequirements(description);
  return value.slice(0, 30).flatMap((item, index) => {
    if (typeof item !== "object" || item === null) return [];
    const candidate = item as Record<string, unknown>;
    const title = typeof candidate.title === "string" ? candidate.title.trim().slice(0, 120) : "";
    const sourceText = typeof candidate.sourceText === "string" ? candidate.sourceText.trim().slice(0, 500) : "";
    const keywords = Array.isArray(candidate.keywords) ? candidate.keywords.filter((keyword): keyword is string => typeof keyword === "string").map(normalize).slice(0, 12) : [];
    const synonyms = Array.isArray(candidate.synonyms) ? candidate.synonyms.filter((keyword): keyword is string => typeof keyword === "string").map(normalize).slice(0, 12) : [];
    const category = candidate.category === "technical" || candidate.category === "experience" || candidate.category === "education" || candidate.category === "language" || candidate.category === "clarity" ? candidate.category : "technical";
    const kind = candidate.kind === "required" || candidate.kind === "desirable" ? candidate.kind : null;
    if (!title || !sourceText || !keywords.length || !kind) return [];
    const weight = typeof candidate.weight === "number" && Number.isFinite(candidate.weight) && candidate.weight > 0 && candidate.weight <= 3 ? candidate.weight : weightFor(kind, category);
    return [{ id: `req-${index + 1}`, title, kind, category, weight, keywords, synonyms, sourceText }];
  });
}
