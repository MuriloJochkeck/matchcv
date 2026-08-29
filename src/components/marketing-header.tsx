import Link from "next/link";
import { ArrowRightIcon, MenuIcon } from "./icons";
import { Logo } from "./logo";

const navItems = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#relatorio", label: "O relatório" },
  { href: "/privacidade", label: "Privacidade" },
];

export function MarketingHeader() {
  return (
    <header className="border-b border-[#dfe3dc]/80 bg-[#f7f7f2]/95 backdrop-blur">
      <div className="page-shell flex h-18 items-center justify-between">
        <Logo />
        <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link className="text-sm font-medium text-[#5b655e] hover:text-[#145c43]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link className="button-quiet" href="/entrar">Entrar</Link>
          <Link className="button-primary min-h-10! px-4! py-2!" href="/cadastro">
            Criar conta <ArrowRightIcon size={17} />
          </Link>
        </div>
        <details className="group relative md:hidden">
          <summary aria-label="Abrir menu" className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-[#bbc3bc] bg-white [&::-webkit-details-marker]:hidden">
            <MenuIcon />
          </summary>
          <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-[#dfe3dc] bg-white p-3 shadow-xl">
            <nav aria-label="Navegação móvel" className="flex flex-col">
              {navItems.map((item) => (
                <Link className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[#f0f1eb]" href={item.href} key={item.href}>{item.label}</Link>
              ))}
              <div className="my-2 border-t border-[#dfe3dc]" />
              <Link className="rounded-xl px-3 py-3 text-sm font-semibold" href="/entrar">Entrar</Link>
              <Link className="button-primary mt-2" href="/cadastro">Criar conta</Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
