"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordResetAction, updatePasswordAction } from "@/app/auth/actions";
import { INITIAL_AUTH_STATE } from "@/contracts/auth";

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return <button className="button-primary w-full" disabled={pending} type="submit">{pending ? "Enviando…" : children}</button>;
}

export function PasswordForm({ mode }: { mode: "request" | "update" }) {
  const action = mode === "request" ? requestPasswordResetAction : updatePasswordAction;
  const [state, formAction] = useActionState(action, INITIAL_AUTH_STATE);
  return (
    <form action={formAction} className="space-y-5">
      {mode === "request" ? (
        <div><label className="field-label" htmlFor="email">E-mail da conta</label><input autoComplete="email" className="field-input" id="email" name="email" required type="email" />{state.fieldErrors?.email && <p className="mt-1.5 text-xs font-semibold text-[#9a3e34]">{state.fieldErrors.email}</p>}</div>
      ) : (
        <><div><label className="field-label" htmlFor="password">Nova senha</label><input autoComplete="new-password" className="field-input" id="password" minLength={8} name="password" required type="password" />{state.fieldErrors?.password && <p className="mt-1.5 text-xs font-semibold text-[#9a3e34]">{state.fieldErrors.password}</p>}</div><div><label className="field-label" htmlFor="passwordConfirmation">Confirme a nova senha</label><input autoComplete="new-password" className="field-input" id="passwordConfirmation" minLength={8} name="passwordConfirmation" required type="password" />{state.fieldErrors?.passwordConfirmation && <p className="mt-1.5 text-xs font-semibold text-[#9a3e34]">{state.fieldErrors.passwordConfirmation}</p>}</div></>
      )}
      {state.message && <div aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm leading-5 ${state.status === "success" ? "border-[#c8d7cb] bg-[#eef6f1] text-[#3d5948]" : "border-[#e4beb9] bg-[#fff1ef] text-[#9a3e34]"}`}>{state.message}</div>}
      <Submit>{mode === "request" ? "Enviar instruções" : "Salvar nova senha"}</Submit>
    </form>
  );
}
