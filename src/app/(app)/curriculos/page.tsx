import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, FileIcon, PlusIcon, ShieldIcon, TrashIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { deleteResumeAction } from "./actions";

export const metadata: Metadata = { title: "Currículos" };

type Resume = { id: string; original_name: string; size_bytes: number; status: string; created_at: string; expires_at: string | null };

function formatBytes(bytes: number) { return `${Math.max(0.1, bytes / 1024 / 1024).toFixed(1)} MB`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
function statusLabel(status: string) { if (status === "ready") return "Pronto para análise"; if (status === "extracting") return "Lendo documento"; if (status === "failed") return "Falha na leitura"; return "Enviado"; }
function statusClass(status: string) { return status === "ready" ? "bg-[#dff3e8] text-[#145c43]" : status === "failed" ? "bg-[#fff0ee] text-[#9a3e34]" : "bg-[#fff1d9] text-[#8b5d16]"; }

export default async function ResumesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resumes").select("id, original_name, size_bytes, status, created_at, expires_at").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  const resumes = (data ?? []) as Resume[];

  return <div>
    <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Documentos</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Seus currículos</h1><p className="mt-4 max-w-xl leading-7 text-[#5b655e]">Mantenha versões prontas para comparar com as próximas oportunidades.</p></div><Link className="button-primary shrink-0" href="/curriculos/novo"><PlusIcon size={18} /> Adicionar currículo</Link></header>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="card overflow-hidden" aria-labelledby="resume-list-title"><div className="flex items-center justify-between border-b border-[#e8ebe6] px-5 py-4 sm:px-6"><div><h2 className="font-extrabold" id="resume-list-title">Documentos salvos</h2><p className="mt-1 text-xs text-[#69736c]">{resumes.length} {resumes.length === 1 ? "arquivo" : "arquivos"}</p></div><FileIcon className="text-[#145c43]" size={22} /></div>
        {resumes.length === 0 ? <div className="bg-[#fafbf8] p-7 sm:p-8"><h3 className="text-xl font-extrabold">Você ainda não enviou um currículo</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#5b655e]">Envie um PDF com texto selecionável para começar sua próxima análise.</p><Link className="button-primary mt-5 w-fit" href="/curriculos/novo">Enviar primeiro currículo <ArrowRightIcon size={17} /></Link></div> : <div className="divide-y divide-[#e8ebe6]">{resumes.map((resume) => <article className="flex flex-col gap-4 p-5 transition-colors hover:bg-[#fafcf9] sm:flex-row sm:items-center sm:px-6" key={resume.id}><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#dff3e8] text-[#145c43]"><FileIcon size={22} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-extrabold">{resume.original_name}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(resume.status)}`}>{statusLabel(resume.status)}</span></div><p className="mt-1 text-sm text-[#5b655e]">{formatBytes(resume.size_bytes)} · enviado em {formatDate(resume.created_at)}</p>{resume.expires_at && <p className="mt-1 text-xs text-[#89928c]">Retenção até {formatDate(resume.expires_at)}</p>}</div><div className="flex items-center justify-between gap-4 sm:justify-end"><Link className="text-sm font-bold text-[#145c43] hover:underline" href={`/analises/nova?resumeId=${resume.id}`}>Usar em análise <ArrowRightIcon className="ml-1 inline" size={15} /></Link><form action={deleteResumeAction}><input name="resumeId" type="hidden" value={resume.id} /><button aria-label={`Excluir ${resume.original_name}`} className="rounded-lg p-2 text-[#b4493d] hover:bg-[#fff0ee]" type="submit"><TrashIcon size={17} /></button></form></div></article>)}</div>}
      </section>
      <aside className="h-fit rounded-[1.35rem] border border-[#c9d6cb] bg-[#eef6f1] p-6 sm:p-7"><span className="grid size-11 place-items-center rounded-2xl bg-[#dff3e8] text-[#145c43]"><ShieldIcon size={21} /></span><h2 className="mt-5 text-xl font-extrabold">Privado por padrão</h2><p className="mt-2 text-sm leading-6 text-[#4e6055]">Seus arquivos ficam em armazenamento privado e só podem ser acessados pela sua sessão.</p><div className="mt-5 border-t border-[#c9d6cb] pt-5"><p className="text-xs font-bold uppercase tracking-[.1em] text-[#145c43]">Como funciona</p><p className="mt-2 text-sm leading-6 text-[#4e6055]">O texto é extraído para gerar evidências. Você pode revisar o conteúdo antes de analisar uma vaga.</p></div><Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#145c43]" href="/privacidade">Ler política de privacidade <ArrowRightIcon size={15} /></Link></aside>
    </div>
  </div>;
}