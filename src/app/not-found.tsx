import Link from "next/link";
import { ArrowRightIcon, FileIcon } from "@/components/icons";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-5"><div className="max-w-md text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#dff3e8] text-[#145c43]"><FileIcon size={25} /></span><p className="mt-6 font-mono text-sm font-bold text-[#145c43]">404</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.045em]">Não encontramos esta página.</h1><p className="mt-4 leading-7 text-[#5b655e]">O endereço pode ter mudado ou a análise não está disponível para esta conta.</p><Link className="button-primary mt-7" href="/painel">Voltar ao painel <ArrowRightIcon size={18} /></Link></div></main>;
}
