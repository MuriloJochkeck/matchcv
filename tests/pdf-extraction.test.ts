import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { extractPdfText } from "../src/server/resume/file-validation.ts";

test("preserva a estrutura textual de um PDF ao extrair currículo", async () => {
  const bytes = new Uint8Array(await readFile("Pre-Projeto-MatchCV.pdf"));
  const extracted = await extractPdfText(bytes.slice());
  assert.match(extracted, /MATCHCV/);
  assert.match(extracted, /planejamento/);
  assert.ok(extracted.split("\n").length > 5);
  assert.match(extracted, /VISÃO/);
});