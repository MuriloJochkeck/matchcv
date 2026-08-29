import type { Metadata } from "next";
import { AnalysisWizard } from "@/components/analysis-wizard";

export const metadata: Metadata = { title: "Nova análise" };

export default function NewAnalysisPage() {
  return <AnalysisWizard />;
}
