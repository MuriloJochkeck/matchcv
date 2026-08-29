import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { PasswordForm } from "@/components/password-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function ResetPasswordPage() {
  const isConfigured = isSupabaseConfigured();
  return <AuthShell description="Escolha uma senha nova e exclusiva para sua conta." isConfigured={isConfigured} title="Defina sua nova senha."><PasswordForm mode="update" /></AuthShell>;
}
