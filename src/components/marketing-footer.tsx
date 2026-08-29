import Link from "next/link";
import { Logo } from "./logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#dfe3dc] bg-white py-10">
      <div className="page-shell grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-6 text-[#5b655e]">
            Orientação explicável para candidatos. A pontuação não representa chance de contratação.
          </p>
        </div>
        <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#5b655e]">
          <Link className="hover:text-[#145c43]" href="/privacidade">Privacidade</Link>
          <Link className="hover:text-[#145c43]" href="/termos">Termos</Link>
          <Link className="hover:text-[#145c43]" href="/entrar">Entrar</Link>
        </nav>
      </div>
    </footer>
  );
}
