export type JobRequirementKind = "required" | "desirable";

export type JobRequirement = {
  id: string;
  title: string;
  kind: JobRequirementKind;
  keywords: string[];
  sourceText: string;
};

const ALIASES: Array<[RegExp, string, string[]]> = [
  [/\btypescript\b|\bts\b/i, "TypeScript", ["typescript", "ts"]],
  [/\bjavascript\b|\bjs\b/i, "JavaScript", ["javascript", "js"]],
  [/\breact(?:\.js)?\b/i, "React", ["react"]],
  [/\bnext(?:\.js)?\b/i, "Next.js", ["nextjs", "next"]],
  [/\bnode(?:\.js)?\b/i, "Node.js", ["nodejs", "node"]],
  [/\brest(?:ful)?\s*api(?:s)?\b|\bapi(?:s)?\s*rest\b/i, "APIs REST", ["api", "rest"]],
  [/\bpostgres(?:ql)?\b/i, "PostgreSQL", ["postgresql", "postgres"]],
  [/\bsql\b/i, "SQL", ["sql"]],
  [/\bdocker\b/i, "Docker", ["docker"]],
  [/\bgit\b/i, "Git", ["git"]],
  [/\btest(?:es|ing)?\b|\bjest\b|\bvitest\b/i, "Testes automatizados", ["testes", "testing", "jest", "vitest"]],
  [/\bingl(?:ê|e)s\b|\benglish\b/i, "Inglês", ["ingles", "english"]],
  [/\bgradua(?:ç|c)[aã]o\b|\bforma(?:ç|c)[aã]o\b/i, "Formação", ["graduacao", "formacao"]],
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function kindFor(sourceText: string, index: number): JobRequirementKind {
  const normalized = normalize(sourceText);
  if (/desejavel|diferencial|plus|nice to have/.test(normalized)) return "desirable";
  if (/obrigatorio|necessario|requisito|must have|essencial/.test(normalized)) return "required";
  return index < 6 ? "required" : "desirable";
}

export function extractJobRequirements(description: string): JobRequirement[] {
  const sentences = description.split(/(?<=[.!?])\s+|\n+/).map((item) => item.trim()).filter(Boolean);
  const requirements: JobRequirement[] = [];
  for (const [pattern, title, keywords] of ALIASES) {
    const sourceText = sentences.find((sentence) => pattern.test(sentence)) ?? "";
    if (!sourceText) continue;
    requirements.push({ id: `req-${requirements.length + 1}`, title, kind: kindFor(sourceText, requirements.length), keywords, sourceText: sourceText.slice(0, 500) });
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
    if (!title || !sourceText || !keywords.length || (candidate.kind !== "required" && candidate.kind !== "desirable")) return [];
    return [{ id: `req-${index + 1}`, title, kind: candidate.kind, keywords, sourceText }];
  });
}
