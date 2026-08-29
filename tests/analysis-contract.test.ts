import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_RESUME_SIZE_BYTES,
  parseCreateAnalysisRequest,
} from "../src/contracts/analysis.ts";

const validRequest = {
  resumeId: "11111111-1111-4111-8111-111111111111",
  job: {
    title: "Pessoa desenvolvedora",
    company: "Empresa fictícia",
    description: "Buscamos uma pessoa desenvolvedora com experiência em React, TypeScript, APIs REST e testes automatizados.",
  },
  acceptedTerms: true,
};

test("normaliza uma solicitação válida", () => {
  const result = parseCreateAnalysisRequest(validRequest);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.job.title, "Pessoa desenvolvedora");
    assert.equal(result.data.resumeId, "11111111-1111-4111-8111-111111111111");
  }
});

test("rejeita descrição curta, consentimento ausente e arquivo acima do limite", () => {
  const result = parseCreateAnalysisRequest({
    ...validRequest,
    resumeId: "invalido",
    job: { description: "Vaga curta" },
    acceptedTerms: false,
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.fieldErrors.resumeId);
    assert.match(result.fieldErrors["job.description"], /80 caracteres/);
    assert.ok(result.fieldErrors.acceptedTerms);
  }
});

test("rejeita payload que não seja um objeto", () => {
  const result = parseCreateAnalysisRequest(null);
  assert.deepEqual(result, {
    success: false,
    fieldErrors: { request: "Envie um objeto JSON válido." },
  });
});
