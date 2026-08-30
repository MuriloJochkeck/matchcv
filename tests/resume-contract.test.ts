import assert from "node:assert/strict";
import test from "node:test";
import { isUpdateResumeTextResponse } from "../src/contracts/resume.ts";

test("aceita resposta de revisão versionada do currículo", () => {
  assert.equal(isUpdateResumeTextResponse({
    resumeId: "2e5d7f75-2a2d-4d50-8f01-3f4d54df9b0a",
    version: 2,
    extractedText: "Texto revisado",
    updatedAt: "2026-08-29T12:00:00.000Z",
  }), true);
});

test("rejeita resposta de revisão sem versão válida", () => {
  assert.equal(isUpdateResumeTextResponse({
    resumeId: "2e5d7f75-2a2d-4d50-8f01-3f4d54df9b0a",
    version: "2",
    extractedText: "Texto revisado",
    updatedAt: "2026-08-29T12:00:00.000Z",
  }), false);
});