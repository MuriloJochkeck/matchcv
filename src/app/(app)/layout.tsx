import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/server/auth/session";

export default async function CandidateAreaLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?message=Entre para acessar sua área.");
  return <AppShell user={user}>{children}</AppShell>;
}
