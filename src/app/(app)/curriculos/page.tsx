import Link from "next/link";
import type { Metadata } from "next";
import { FileIcon, PlusIcon, ShieldIcon, TrashIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Currículos" };

export default function ResumesPage() {
  return <div><header><p className="text-sm font-semibold text-[#145c43]">Documentos</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">Seus currículos</h1><p className="mt-3 max-w-2xl leading-7 text-[#5b655e]">Gerencie os documentos usados nas comparações. Esta tela usa somente uma fixture local.</p></header>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-[#e3e6e1] px-5 py-4 sm:px-6"><h2 className="font-extrabold">1 currículo</h2><Link className="button-primary min-h-10! px-4! py-2!" href="/analises/nova"><PlusIcon size={17} /> Adicionar</Link></div><article className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6"><div className="flex min-w-0 items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#dff3e8] text-[#145c43]"><FileIcon size={22} /></span><div className="min-w-0"><h3 className="truncate font-extrabold">curriculo-ana-souza.pdf</h3><p className="mt-1 text-sm text-[#5b655e]">184 KB · adicionado hoje · fixture fictícia</p></div></div><button className="inline-flex min-h-10 items-center gap-2 self-start rounded-full px-3 text-sm font-bold text-[#9a3e34] hover:bg-[#fff1ef] sm:self-auto" disabled title="Disponível após integração com o banco" type="button"><TrashIcon size={17} /> Excluir</button></article></section>
      <aside className="rounded-[1.125rem] border border-[#c9d6cb] bg-[#eef6f1] p-6"><ShieldIcon className="text-[#145c43]" /><h2 className="mt-4 font-extrabold">Retenção limitada</h2><p className="mt-2 text-sm leading-6 text-[#4e6055]">A proposta do MVP é apagar o PDF original após o prazo configurado e permitir exclusão antecipada.</p><Link className="mt-4 inline-block text-sm font-bold text-[#145c43]" href="/privacidade">Ler aviso preliminar</Link></aside>
    </div>
  </div>;
}
