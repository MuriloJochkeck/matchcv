import { ANALYSIS_SCHEMA_VERSION } from "../../contracts/analysis.ts";
import type {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  GetAnalysisResponse,
} from "../../contracts/analysis";
import { demoAnalysis } from "./demo-analysis.ts";

export function createDemoAnalysis(
  _input: CreateAnalysisRequest,
  requestId: string,
): CreateAnalysisResponse {
  return {
    analysisId: demoAnalysis.id,
    status: "queued",
    mode: "demo",
    schemaVersion: ANALYSIS_SCHEMA_VERSION,
    requestId,
  };
}

export function getAnalysisById(id: string, requestId: string): GetAnalysisResponse | null {
  if (id !== demoAnalysis.id) return null;
  return { analysis: demoAnalysis, schemaVersion: ANALYSIS_SCHEMA_VERSION, requestId };
}
