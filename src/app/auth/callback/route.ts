import { NextResponse } from "next/server";
import { safeNextPath } from "@/contracts/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/server/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!isSupabaseConfigured()) return NextResponse.redirect(new URL(next, url.origin));
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureProfile(data.user);
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  const errorUrl = new URL("/entrar", url.origin);
  errorUrl.searchParams.set("message", "O link de autenticação expirou ou é inválido.");
  return NextResponse.redirect(errorUrl);
}
