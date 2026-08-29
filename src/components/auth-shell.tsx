import Link from "next/link";
import type { ReactNode } from "react";
import { CheckIcon, ShieldIcon } from "./icons";
import { Logo } from "./logo";

export function AuthShell({ children, title, description, isConfigured }: { children: ReactNode; title: string; description: string; isConfigured: boolean }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[.82fr_1.18fr]">
      <section className="flex flex-col bg-[#17211b] px-6 py-7 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-10">
        <Logo inverse />
        <div className="my-auto hidden max-w-lg py-16 lg:block">
          <span className="eyebrow text-[#8ed1aa]!">Orientação, não julgamento</span>
          <h2 className="text-balance mt-5 text-4xl font-extrabold tracking-[-.05em] xl:text-5xl">Entenda a vaga com evidências, critérios e contexto.</h2>
          <ul className="mt-10 space-y-5 text-[#d5ddd7]">
            <li className="flex gap-3"><CheckIcon className="mt-0.5 shrink-0 text-[#8ed1aa]" /> Pontuação calculada por regras transparentes.</li>
            <li className="flex gap-3"><CheckIcon className="mt-0.5 shrink-0 text-[#8ed1aa]" /> Recomendações condicionadas aos fatos do currículo.</li>
            <li className="flex gap-3"><CheckIcon className="mt-0.5 shrink-0 text-[#8ed1aa]" /> Exclusão e privacidade desde o desenho do produto.</li>
          </ul>
        </div>
        <p className="hidden items-center gap-2 text-xs text-[#9da9a0] lg:flex"><ShieldIcon size={16} /> {isConfigured ? "Sessão protegida e dados privados" : "Modo demonstração com dados fictícios"}</p>
      </section>
      <section className="flex items-center justify-center bg-[#f7f7f2] px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{title}</h1>
          <p className="mt-3 leading-7 text-[#5b655e]">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-7 text-center text-sm text-[#5b655e]">Ao continuar, você concorda com os <Link className="font-semibold text-[#145c43] underline underline-offset-4" href="/termos">Termos</Link> e o aviso de <Link className="font-semibold text-[#145c43] underline underline-offset-4" href="/privacidade">Privacidade</Link>.</p>
        </div>
      </section>
    </main>
  );
}
