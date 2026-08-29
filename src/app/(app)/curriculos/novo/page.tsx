import type { Metadata } from "next";
import { ResumeUploadForm } from "@/components/resume-upload-form";
export const metadata: Metadata = { title: "Enviar currículo" };
export default function NewResumePage(){ return <ResumeUploadForm/>; }