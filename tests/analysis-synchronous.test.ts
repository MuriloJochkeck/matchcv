import assert from "node:assert/strict";
import test from "node:test";
import { shouldUseSynchronousFallback } from "../src/server/analysis/synchronous.ts";

test("ativa fallback quando a função de fila ainda não está no schema", () => {
  assert.equal(shouldUseSynchronousFallback({ message: "Could not find the function public.claim_analysis_job(p_job_id) in the schema cache" }), true);
  assert.equal(shouldUseSynchronousFallback({ message: "permission denied" }), false);
});
