import Link from "next/link";
import type { ReactNode } from "react";
import { MarketingFooter } from "./marketing-footer";
import { MarketingHeader } from "./marketing-header";

export function PolicyLayout({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <MarketingHeader />
      <main className="page-shell py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,720px)] lg:justify-center">
          <aside><span className="eyebrow">{eyebrow}</span><p className="mt-5 text-sm leading-6 text-[#5b655e]">Versão preliminar para validação do MVP.<br />Atualizada em 29/08/2026.</p><Link className="mt-6 inline-block text-sm font-bold text-[#145c43]" href="/">← Voltar ao início</Link></aside>
          <article><h1 className="text-balance text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{title}</h1><p className="mt-5 text-lg leading-8 text-[#5b655e]">{description}</p><div className="mt-10 space-y-9 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-[-.03em] [&_p]:mt-3 [&_p]:leading-7 [&_p]:text-[#5b655e] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:leading-7 [&_ul]:text-[#5b655e]">{children}</div></article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
