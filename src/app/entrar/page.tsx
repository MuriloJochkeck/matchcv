import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { DemoAuthForm } from "@/components/demo-auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const isConfigured = isSupabaseConfigured();
  const { message } = await searchParams;
  return (
    <AuthShell description="Acesse suas análises e continue de onde parou." isConfigured={isConfigured} title="Que bom ter você de volta.">
      {message && <div className="mb-5 rounded-xl border border-[#ead6af] bg-[#fff8e9] px-4 py-3 text-sm text-[#664c1d]">{message}</div>}
      <DemoAuthForm isConfigured={isConfigured} mode="login" />
    </AuthShell>
  );
}
