import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { PasswordForm } from "@/components/password-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecoverPasswordPage() {
  const isConfigured = isSupabaseConfigured();
  return <AuthShell description="Enviaremos um link seguro para você definir uma nova senha." isConfigured={isConfigured} title="Recupere seu acesso."><PasswordForm mode="request" /><p className="mt-6 text-center text-sm"><Link className="font-bold text-[#145c43]" href="/entrar">Voltar para entrar</Link></p></AuthShell>;
}
