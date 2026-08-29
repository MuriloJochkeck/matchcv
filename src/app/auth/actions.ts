"use server";

import { redirect } from "next/navigation";
import {
  type AuthActionState,
  parseCredentials,
  parseEmail,
  parseNewPassword,
} from "@/contracts/auth";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/server/auth/session";

const GENERIC_AUTH_ERROR = "Não foi possível concluir o acesso. Revise os dados e tente novamente.";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = parseCredentials(formData, "login");
  if (!parsed.success) return { status: "error", fieldErrors: parsed.fieldErrors };
  if (!isSupabaseConfigured()) redirect("/painel");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { status: "error", message: GENERIC_AUTH_ERROR };
  await ensureProfile(data.user);
  redirect("/painel");
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = parseCredentials(formData, "signup");
  if (!parsed.success) return { status: "error", fieldErrors: parsed.fieldErrors };
  if (!isSupabaseConfigured()) redirect("/painel");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/painel`,
    },
  });
  if (error) return { status: "error", message: GENERIC_AUTH_ERROR };
  if (data.user && data.session) {
    await ensureProfile(data.user);
    redirect("/painel");
  }
  return {
    status: "success",
    message: "Confira seu e-mail para confirmar a conta e continuar.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = parseEmail(formData);
  if (!parsed.success) return { status: "error", fieldErrors: parsed.fieldErrors };
  if (!isSupabaseConfigured()) {
    return { status: "success", message: "Modo demonstração: nenhum e-mail foi enviado." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/redefinir-senha`,
  });
  return {
    status: "success",
    message: "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = parseNewPassword(formData);
  if (!parsed.success) return { status: "error", fieldErrors: parsed.fieldErrors };
  if (!isSupabaseConfigured()) redirect("/painel");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: "O link expirou ou não é mais válido." };
  redirect("/painel");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
