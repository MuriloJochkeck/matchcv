import assert from "node:assert/strict";
import test from "node:test";
import { extractJobRequirements, normalizeJobRequirements } from "../src/contracts/job.ts";

test("extrai requisitos conhecidos e classifica o contexto obrigatório/desejável", () => {
  const requirements = extractJobRequirements("É obrigatório conhecer React e TypeScript. Inglês é desejável como diferencial.");
  assert.deepEqual(requirements.map((item) => item.title), ["TypeScript", "React", "Inglês"]);
  assert.equal(requirements.find((item) => item.title === "Inglês")?.kind, "desirable");
});

test("normaliza requisitos revisados sem aceitar estrutura inválida", () => {
  const requirements = normalizeJobRequirements([{ id: "x", title: "React", kind: "required", keywords: ["React"], sourceText: "React" }], "");
  assert.equal(requirements[0]?.id, "req-1");
  assert.deepEqual(normalizeJobRequirements([{ title: "React" }], ""), []);
});
