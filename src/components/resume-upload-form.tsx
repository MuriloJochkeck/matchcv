"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResumeApiError, uploadResume } from "@/client/resume/upload-resume";
export function ResumeUploadForm() {
 const router=useRouter(); const [file,setFile]=useState<File|null>(null); const [error,setError]=useState(""); const [pending,setPending]=useState(false);
 async function submit(){if(!file){setError("Selecione um PDF para continuar.");return;}setError("");setPending(true);try{await uploadResume(file);router.push("/curriculos");router.refresh();}catch(caught){setError(caught instanceof ResumeApiError?caught.message:"Não foi possível enviar o currículo.");setPending(false);}}
 return <div className="mx-auto max-w-2xl"><p className="text-sm font-semibold text-[#145c43]">Documentos</p><h1 className="mt-1 text-3xl font-extrabold">Enviar currículo</h1><p className="mt-3 leading-7 text-[#5b655e]">Envie um PDF com texto selecionável, de até 5 MB. O arquivo permanece privado.</p><section className="card mt-7 space-y-5 p-6"><label className="field-label">Arquivo PDF<input accept="application/pdf,.pdf" className="field-input mt-2" onChange={(e)=>setFile(e.target.files?.[0]??null)} type="file"/></label>{file&&<p className="text-sm text-[#5b655e]">Selecionado: {file.name}</p>}{error&&<p className="text-sm font-semibold text-[#9a3e34]">{error}</p>}<button className="button-primary" disabled={pending} onClick={submit} type="button">{pending?"Enviando...":"Enviar currículo"}</button></section></div>;
}