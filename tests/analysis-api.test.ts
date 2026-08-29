import assert from "node:assert/strict";
import test from "node:test";
import { computeAnalysis } from "../src/server/analysis/engine.ts";

test("a análise determinística usa apenas evidências do currículo", () => {
  const result = computeAnalysis("Experiência com React, TypeScript e APIs REST.", "Vaga para React, TypeScript, testes e APIs REST em uma equipe de produto com boas práticas de qualidade.");
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.matches.some((item) => item.status === "matched"));
  assert.ok(result.recommendations.length > 0);
});