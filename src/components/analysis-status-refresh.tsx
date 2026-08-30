"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AnalysisStatusRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 5000);
    return () => window.clearInterval(interval);
  }, [router]);

  return <p className="mt-4 text-xs text-[#69736c]">Atualizando automaticamente a cada 5 segundos.</p>;
}