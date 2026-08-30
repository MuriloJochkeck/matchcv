import type { Metadata } from "next";
import { AlertIcon, ShieldIcon, UserIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/server/auth/session";
import { deleteAccountAction, updateImprovementConsentAction } from "./actions";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: profile } = user ? await supabase.from("profiles").select("product_improvement_consent_at").eq("id", user.id).maybeSingle() : { data: null };
  const consented = Boolean(profile?.product_improvement_consent_at);

  return <div className="max-w-4xl">
    <header><p className="text-sm font-semibold text-[#145c43]">Conta</p><h1 className="mt-1 text-3xl font-extrabold">Configurações e privacidade</h1><p className="mt-3 leading-7 text-[#5b655e]">Controle como seus dados são usados no MatchCV.</p></header>
    <section className="card mt-8 overflow-hidden"><div className="flex items-center gap-3 border-b border-[#e3e6e1] px-5 py-4"><UserIcon className="text-[#145c43]" size={19}/><h2 className="font-extrabold">Perfil conectado</h2></div><div className="grid gap-5 p-5 sm:grid-cols-2"><div><p className="text-sm text-[#5b655e]">Nome</p><p className="mt-1 font-bold">{user?.displayName}</p></div><div><p className="text-sm text-[#5b655e]">E-mail</p><p className="mt-1 font-bold">{user?.email}</p></div></div></section>
    <section className="card mt-5 p-5"><div className="flex items-center gap-3"><ShieldIcon className="text-[#145c43]" size={19}/><h2 className="font-extrabold">Uso para melhoria do produto</h2></div><p className="mt-3 text-sm leading-6 text-[#5b655e]">Opcional. Não ativa treinamento com seu currículo; apenas registra sua preferência para futuras funcionalidades de melhoria.</p><form action={updateImprovementConsentAction} className="mt-4 flex items-center justify-between gap-4"><label className="flex items-center gap-3 text-sm font-semibold"><input defaultChecked={consented} name="productImprovementConsent" type="checkbox"/>Permitir uso futuro com consentimento</label><button className="button-secondary" type="submit">Salvar</button></form><p className="mt-3 text-xs text-[#69736c]">Status atual: {consented ? "consentimento registrado" : "desativado"}.</p></section>
    <section className="mt-5 rounded-[1.125rem] border border-[#e4beb9] bg-[#fff7f5] p-5"><div className="flex items-start gap-3"><AlertIcon className="mt-0.5 shrink-0 text-[#9a3e34]"/><div className="min-w-0"><h2 className="font-extrabold text-[#7f3028]">Excluir conta e dados</h2><p className="mt-2 text-sm leading-6 text-[#6c5652]">Essa ação remove sua conta, currículos, análises, preferências e arquivos privados. Ela não pode ser desfeita.</p><form action={deleteAccountAction} className="mt-4 space-y-3"><label className="field-label">Digite EXCLUIR para confirmar<input aria-describedby="delete-account-help" className="field-input mt-2" name="confirmation" pattern="EXCLUIR" required /></label><p id="delete-account-help" className="text-xs leading-5 text-[#6c5652]">A exclusão só será executada quando o texto for exatamente EXCLUIR.</p><button className="rounded-lg bg-[#9a3e34] px-4 py-2.5 text-sm font-bold text-white" type="submit">Excluir minha conta</button></form></div></div></section>
  </div>;
}