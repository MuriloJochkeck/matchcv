"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, signupAction } from "@/app/auth/actions";
import { INITIAL_AUTH_STATE } from "@/contracts/auth";
import { ArrowRightIcon } from "./icons";

function SubmitButton({ mode }: { mode: "login" | "signup" }) {
  const { pending } = useFormStatus();
  return (
    <button className="button-primary w-full" disabled={pending} type="submit">
      {pending ? "Conectando…" : mode === "login" ? "Entrar" : "Criar conta"}
      {!pending && <ArrowRightIcon size={18} />}
    </button>
  );
}

export function DemoAuthForm({ mode, isConfigured }: { mode: "login" | "signup"; isConfigured: boolean }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction] = useActionState(action, INITIAL_AUTH_STATE);
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="space-y-5">
      {mode === "signup" && (
        <div>
          <label className="field-label" htmlFor="displayName">Como podemos chamar você?</label>
          <input aria-describedby="displayName-error" autoComplete="name" className="field-input" id="displayName" name="displayName" placeholder="Seu nome" required />
          <p className="mt-1.5 text-xs font-semibold text-[#9a3e34]" id="displayName-error">{fieldError("displayName")}</p>
        </div>
      )}
      <div>
        <label className="field-label" htmlFor="email">E-mail</label>
        <input aria-describedby="email-error" autoComplete="email" className="field-input" id="email" name="email" placeholder="voce@exemplo.com" required type="text" />
        <p className="mt-1.5 text-xs font-semibold text-[#9a3e34]" id="email-error">{fieldError("email")}</p>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="field-label" htmlFor="password">Senha</label>
          {mode === "login" && <Link className="mb-1 text-xs font-semibold text-[#145c43]" href="/recuperar-senha">Esqueci minha senha</Link>}
        </div>
        <input aria-describedby="password-error" autoComplete={mode === "login" ? "current-password" : "new-password"} className="field-input" id="password" minLength={8} name="password" placeholder="Mínimo de 8 caracteres" required type="password" />
        <p className="mt-1.5 text-xs font-semibold text-[#9a3e34]" id="password-error">{fieldError("password")}</p>
      </div>
      {mode === "signup" && <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe3dc] bg-white p-4 text-sm leading-6 text-[#5b655e]"><input className="mt-1 size-4 accent-[#145c43]" required type="checkbox" /><span>Entendo que o MatchCV oferece orientação e não prevê minha chance de contratação.</span></label>}
      {!isConfigured && <div aria-live="polite" className="rounded-xl border border-[#d8e2da] bg-[#eef6f1] px-4 py-3 text-xs leading-5 text-[#3d5948]">Modo demonstração ativo: nenhum dado é enviado ou armazenado. Configure o Supabase para habilitar contas reais.</div>}
      {state.message && <div aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm leading-5 ${state.status === "success" ? "border-[#c8d7cb] bg-[#eef6f1] text-[#3d5948]" : "border-[#e4beb9] bg-[#fff1ef] text-[#9a3e34]"}`}>{state.message}</div>}
      <SubmitButton mode={mode} />
      <p className="text-center text-sm text-[#5b655e]">{mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"} <Link className="font-bold text-[#145c43]" href={mode === "login" ? "/cadastro" : "/entrar"}>{mode === "login" ? "Cadastre-se" : "Entrar"}</Link></p>
    </form>
  );
}
