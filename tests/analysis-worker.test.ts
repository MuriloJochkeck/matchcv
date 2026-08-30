import assert from "node:assert/strict";
import test from "node:test";
import { processAnalysisJob } from "../src/server/analysis/processor.ts";

test("worker usa os requisitos revisados persistidos na vaga", async () => {
  let completedPayload: Record<string, unknown> | undefined;
  const supabase = {
    rpc: async (name: string, payload?: Record<string, unknown>) => {
      if (name === "claim_analysis_job") return { data: [{ job_id: "job-1", analysis_id: "analysis-1", attempts: 1, resume_text: "Experiência profissional com a tecnologia Atlas.", job_text: "Vaga para desenvolvimento de software." , structured_json: { requirements: [{ id: "req-1", title: "Tecnologia Atlas", kind: "required", keywords: ["atlas"], sourceText: "Tecnologia Atlas obrigatória." }] } }], error: null };
      if (name === "complete_analysis_job") { completedPayload = payload; return { data: null, error: null }; }
      throw new Error(`RPC inesperado: ${name}`);
    },
    from: () => ({ update: () => ({ eq: async () => ({ error: null }) }) }),
  } as never;

  const result = await processAnalysisJob(supabase);
  assert.equal(result.status, "completed");
  const matches = completedPayload?.p_matches as Array<{ title: string }>;
  assert.equal(matches[0]?.title, "Tecnologia Atlas");
});