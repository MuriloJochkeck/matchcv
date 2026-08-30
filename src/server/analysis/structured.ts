import type { JobRequirement } from "../../contracts/job.ts";
import { extractJobRequirements, normalize, normalizeJobRequirements } from "../../contracts/job.ts";

export const STRUCTURED_SCHEMA_VERSION = "structured-v1" as const;
export const PROMPT_VERSION = "none-deterministic-v1" as const;
export const MODEL_VERSION = "rules-v2" as const;

export type ResumeExperience = { title: string; years: number | null; evidence: string };
export type ResumeProfile = {
  skills: string[];
  experiences: ResumeExperience[];
  education: string[];
  languages: string[];
  seniority: "intern" | "junior" | "mid" | "senior" | "lead" | "unknown";
  schemaVersion: typeof STRUCTURED_SCHEMA_VERSION;
};
export type JobProfile = { requirements: JobRequirement[]; seniority: ResumeProfile["seniority"]; education: string[]; languages: string[]; experienceYears: number | null; schemaVersion: typeof STRUCTURED_SCHEMA_VERSION };

const INJECTION_PATTERNS = /ignore\s+(all|any|previous)|system\s*prompt|developer\s+message|reveal\s+(your|the)|jailbreak|act\s+as/i;

export function sanitizeUntrustedText(value: string, maxLength = 100_000) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").slice(0, maxLength);
}

export function containsPromptInjection(value: string) {
  return INJECTION_PATTERNS.test(value);
}

export function createSafeModelContext(resumeText: string, jobText: string) {
  const resume = sanitizeUntrustedText(resumeText);
  const job = sanitizeUntrustedText(jobText, 20_000);
  return `<resume_data>\n${resume}\n</resume_data>\n<job_data>\n${job}\n</job_data>`;
}

function seniorityFor(value: string): ResumeProfile["seniority"] {
  const text = normalize(value);
  if (/estagi|intern/.test(text)) return "intern";
  if (/lider|lead|principal/.test(text)) return "lead";
  if (/senior|sr\.?|especialista/.test(text)) return "senior";
  if (/pleno|mid-level|mid level/.test(text)) return "mid";
  if (/junior|jr\.?|entry-level|entry level/.test(text)) return "junior";
  return "unknown";
}

function yearsFor(value: string) {
  const match = value.match(/(\d+)\s*\+?\s*anos?/i);
  return match ? Number(match[1]) : null;
}

export function extractResumeProfile(rawText: string): ResumeProfile {
  const text = sanitizeUntrustedText(rawText);
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const skills = [...new Set(lines.flatMap((line) => extractJobRequirements(line).filter((item) => item.category === "technical").map((item) => item.title)))].slice(0, 30);
  const education = lines.filter((line) => /gradua|forma|bacharel|licenc|p[oó]s-grad|mba|curso/i.test(line)).slice(0, 10);
  const languages = lines.filter((line) => /ingl[eê]s|espanhol|franc[eê]s|idioma|language/i.test(line)).slice(0, 10);
  const experiences = lines.filter((line) => /desenvolv|engenheir|analist|estagi|lider|gerente|experi[eê]ncia|atuou/i.test(line)).slice(0, 10).map((line) => ({ title: line.slice(0, 120), years: yearsFor(line), evidence: line.slice(0, 500) }));
  return { skills, experiences, education, languages, seniority: seniorityFor(text), schemaVersion: STRUCTURED_SCHEMA_VERSION };
}

export function extractJobProfile(rawText: string, reviewedRequirements?: unknown): JobProfile {
  const text = sanitizeUntrustedText(rawText, 20_000);
  const requirements = normalizeJobRequirements(reviewedRequirements, text);
  return { requirements, seniority: seniorityFor(text), education: text.split(/\n+/).filter((line) => /gradua|forma|bacharel|licenc|pos|mba/i.test(line)).slice(0, 5), languages: text.split(/\n+/).filter((line) => /ingl[eê]s|espanhol|franc[eê]s|idioma/i.test(line)).slice(0, 5), experienceYears: yearsFor(text), schemaVersion: STRUCTURED_SCHEMA_VERSION };
}

export function validateStructuredProfile(value: unknown): value is ResumeProfile | JobProfile {
  if (typeof value !== "object" || value === null || (value as { schemaVersion?: unknown }).schemaVersion !== STRUCTURED_SCHEMA_VERSION) return false;
  const candidate = value as Record<string, unknown>;
  const validSeniority = ["intern", "junior", "mid", "senior", "lead", "unknown"].includes(String(candidate.seniority));
  if (!validSeniority || !Array.isArray(candidate.education) || !Array.isArray(candidate.languages)) return false;
  if ("skills" in candidate && (!Array.isArray(candidate.skills) || !Array.isArray(candidate.experiences))) return false;
  if ("requirements" in candidate && (!Array.isArray(candidate.requirements) || !candidate.requirements.every((item) => typeof item === "object" && item !== null))) return false;
  return true;
}