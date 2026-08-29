import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../src/app/api/analyses/[id]/route.ts";
import { POST } from "../src/app/api/analyses/route.ts";

const validBody = {
  resume: { kind: "demo", name: "curriculo-ana.pdf", sizeBytes: 188_416 },
  job: {
    description: "Buscamos uma pessoa desenvolvedora com experiência em React, TypeScript, APIs REST e testes automatizados.",
  },
  acceptedTerms: true,
};

test("POST /api/analyses aceita o contrato e não permite cache", async () => {
  const response = await POST(new Request("http://localhost/api/analyses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validBody),
  }));
  const body = await response.json();

  assert.equal(response.status, 202);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(body.analysisId, "demo");
  assert.equal(body.mode, "demo");
  assert.ok(body.requestId);
});

test("POST /api/analyses devolve erros de campo estáveis", async () => {
  const response = await POST(new Request("http://localhost/api/analyses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validBody, acceptedTerms: false }),
  }));
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.code, "VALIDATION_ERROR");
  assert.ok(body.fieldErrors.acceptedTerms);
  assert.ok(body.requestId);
});

test("GET /api/analyses/:id distingue resultado e recurso inexistente", async () => {
  const found = await GET(new Request("http://localhost/api/analyses/demo"), {
    params: Promise.resolve({ id: "demo" }),
  });
  const missing = await GET(new Request("http://localhost/api/analyses/inexistente"), {
    params: Promise.resolve({ id: "inexistente" }),
  });

  assert.equal(found.status, 200);
  assert.equal((await found.json()).analysis.id, "demo");
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).code, "ANALYSIS_NOT_FOUND");
});
