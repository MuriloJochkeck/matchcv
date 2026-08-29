import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_RESUME_SIZE_BYTES,
  parseCreateAnalysisRequest,
} from "../src/contracts/analysis.ts";

const validRequest = {
  resume: { kind: "demo", name: "curriculo-ana.pdf", sizeBytes: 188_416 },
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
    assert.equal(result.data.resume.name, "curriculo-ana.pdf");
  }
});

test("rejeita descrição curta, consentimento ausente e arquivo acima do limite", () => {
  const result = parseCreateAnalysisRequest({
    ...validRequest,
    resume: { ...validRequest.resume, sizeBytes: MAX_RESUME_SIZE_BYTES + 1 },
    job: { description: "Vaga curta" },
    acceptedTerms: false,
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.fieldErrors["resume.sizeBytes"], /5 MB/);
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
