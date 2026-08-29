import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { DemoAuthForm } from "@/components/demo-auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignupPage() {
  const isConfigured = isSupabaseConfigured();
  return (
    <AuthShell description={isConfigured ? "Crie sua conta e mantenha suas análises sob seu controle." : "Explore o fluxo demonstrativo do MatchCV."} isConfigured={isConfigured} title="Comece com clareza.">
      <DemoAuthForm isConfigured={isConfigured} mode="signup" />
    </AuthShell>
  );
}
