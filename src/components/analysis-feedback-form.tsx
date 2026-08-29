"use client";
import { useState } from "react";
import { submitFeedbackAction } from "@/app/(app)/analises/actions";
export function AnalysisFeedbackForm({ analysisId }: { analysisId: string }) {
  const [sent, setSent] = useState(false);
  return <section className="card mt-8 p-5"><h2 className="text-xl font-extrabold">Esta análise foi útil?</h2><form action={async (data) => { await submitFeedbackAction(data); setSent(true); }} className="mt-4 space-y-3"><input name="analysisId" type="hidden" value={analysisId}/><select className="field-input" defaultValue="5" name="rating"><option value="5">5 — Muito útil</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1 — Pouco útil</option></select><textarea className="field-input" maxLength={2000} name="comment" placeholder="Comentário opcional"/><button className="button-secondary" type="submit">Enviar feedback</button>{sent && <p className="text-sm text-[#145c43]">Feedback registrado.</p>}</form></section>;
}