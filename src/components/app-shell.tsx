import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/auth/actions";
import type { CurrentUser } from "@/server/auth/session";
import { ChartIcon, FileIcon, HomeIcon, MenuIcon, PlusIcon, SettingsIcon, UserIcon } from "./icons";
import { Logo } from "./logo";

const navItems = [
  { href: "/painel", label: "Visão geral", icon: HomeIcon },
  { href: "/analises/nova", label: "Nova análise", icon: PlusIcon },
  { href: "/analises", label: "Análises", icon: ChartIcon },
  { href: "/curriculos", label: "Currículos", icon: FileIcon },
  { href: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

function AppNav() {
  return (
    <nav aria-label="Área do candidato" className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#5b655e] hover:bg-[#f0f1eb] hover:text-[#145c43]" href={item.href} key={item.href}>
            <Icon size={19} /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, user }: { children: ReactNode; user: CurrentUser }) {
  return (
    <div className="min-h-screen bg-[#f7f7f2] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-[#dfe3dc] bg-white p-5 lg:flex lg:flex-col">
        <Logo />
        <div className="mt-10"><AppNav /></div>
        <div className="mt-auto rounded-2xl bg-[#f0f1eb] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#dff3e8] text-[#145c43]"><UserIcon size={18} /></span>
            <div className="min-w-0"><p className="truncate text-sm font-bold">{user.displayName}</p><p className="truncate text-xs text-[#5b655e]">{user.mode === "demo" ? "Conta demonstrativa" : user.email}</p></div>
          </div>
          <form action={logoutAction}><button className="mt-3 w-full rounded-lg px-2 py-2 text-left text-xs font-bold text-[#5b655e] hover:bg-white hover:text-[#145c43]" type="submit">Sair</button></form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-[#dfe3dc] bg-[#f7f7f2]/95 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Logo />
            <details className="group relative">
              <summary aria-label="Abrir menu do painel" className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-[#bbc3bc] bg-white [&::-webkit-details-marker]:hidden"><MenuIcon /></summary>
              <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-[#dfe3dc] bg-white p-3 shadow-xl"><AppNav /><div className="mt-3 border-t border-[#e3e6e1] pt-3"><p className="truncate px-3 text-sm font-bold">{user.displayName}</p><p className="truncate px-3 text-xs text-[#5b655e]">{user.mode === "demo" ? "Conta demonstrativa" : user.email}</p><form action={logoutAction}><button className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-[#5b655e] hover:bg-[#f0f1eb] hover:text-[#145c43]" type="submit">Sair</button></form></div></div>
            </details>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-7 sm:py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
