import assert from "node:assert/strict";
import test from "node:test";
import { calculateOverallScore, getScoreLabel } from "../src/server/analysis/scoring.ts";

test("calcula a média ponderada determinística", () => {
  const score = calculateOverallScore([
    { key: "technical", label: "Técnica", score: 80, weight: 40, rationale: "Fixture" },
    { key: "experience", label: "Experiência", score: 60, weight: 20, rationale: "Fixture" },
  ]);
  assert.equal(score, 73);
});

test("ignora dimensões não aplicáveis e trata denominador vazio", () => {
  assert.equal(calculateOverallScore([
    { key: "education", label: "Formação", score: 100, weight: 0, rationale: "Não aplicável" },
  ]), 0);
});

test("mantém os rótulos nas fronteiras definidas", () => {
  assert.equal(getScoreLabel(80), "Aderência forte");
  assert.equal(getScoreLabel(65), "Boa base");
  assert.equal(getScoreLabel(45), "Aderência parcial");
  assert.equal(getScoreLabel(44), "Poucas evidências");
});
