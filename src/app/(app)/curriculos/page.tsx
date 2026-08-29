import Link from "next/link";
import type { Metadata } from "next";
import { FileIcon, PlusIcon, ShieldIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Currículos" };

function formatBytes(bytes: number) { return `${Math.max(0.1, bytes / 1024 / 1024).toFixed(1)} MB`; }

export default async function ResumesPage() {
  const supabase = await createClient();
  const { data: resumes, error } = await supabase.from("resumes").select("id, original_name, size_bytes, status, created_at").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  return <div><header><p className="text-sm font-semibold text-[#145c43]">Documentos</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">Seus currículos</h1><p className="mt-3 max-w-2xl leading-7 text-[#5b655e]">Documentos privados usados nas suas próximas comparações.</p></header><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]"><section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-[#e3e6e1] px-5 py-4 sm:px-6"><h2 className="font-extrabold">{resumes.length} {resumes.length === 1 ? "currículo" : "currículos"}</h2><Link className="button-primary min-h-10! px-4! py-2!" href="/analises/nova"><PlusIcon size={17} /> Adicionar</Link></div>{resumes.length === 0 ? <div className="p-6 text-sm leading-6 text-[#5b655e]">Você ainda não enviou um currículo.</div> : <div className="divide-y divide-[#e3e6e1]">{resumes.map((resume) => <article className="flex items-center gap-4 p-5 sm:p-6" key={resume.id}><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#dff3e8] text-[#145c43]"><FileIcon size={22} /></span><div className="min-w-0"><h3 className="truncate font-extrabold">{resume.original_name}</h3><p className="mt-1 text-sm text-[#5b655e]">{formatBytes(resume.size_bytes)} · {resume.status === "ready" ? "texto extraído" : "em processamento"}</p></div></article>)}</div>}</section><aside className="rounded-[1.125rem] border border-[#c9d6cb] bg-[#eef6f1] p-6"><ShieldIcon className="text-[#145c43]" /><h2 className="mt-4 font-extrabold">Privado por padrão</h2><p className="mt-2 text-sm leading-6 text-[#4e6055]">Somente sua sessão pode acessar os arquivos e versões de currículo.</p><Link className="mt-4 inline-block text-sm font-bold text-[#145c43]" href="/privacidade">Ler política de privacidade</Link></aside></div></div>;
}