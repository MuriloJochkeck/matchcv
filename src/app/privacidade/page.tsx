import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy-layout";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacyPage() {
  const isConfigured = isSupabaseConfigured();
  return <PolicyLayout description="Este aviso explica como o MatchCV trata os dados usados na comparação entre currículo e vaga. Ele permanece sujeito à revisão jurídica antes de um lançamento público." eyebrow="Privacidade por padrão" title="Seus dados continuam sob seu controle.">
    <section><h2>O que é coletado</h2><p>Dados mínimos de conta, currículos enviados, descrições de vagas, versões revisadas e resultados das análises. Foto, características protegidas e inferências de personalidade não participam da pontuação.</p></section>
    <section><h2>Como os dados são usados</h2><p>Os dados são usados para autenticar sua conta, extrair informações do currículo, comparar o documento com a vaga solicitada, exibir seu histórico e melhorar a segurança do serviço. Currículos não são usados para treinar modelos sem consentimento específico.</p></section>
    <section><h2>Armazenamento e retenção</h2><p>Currículos ficam em bucket privado, separados por usuário e protegidos por autorização. O prazo operacional padrão é de 30 dias, configurável até 3.650 dias; após a expiração, o arquivo é removido e o registro é marcado como excluído. Você também pode excluir um currículo ou a conta antes desse prazo.</p></section>
    <section><h2>Seus controles</h2><ul><li>Revisar o texto extraído antes de iniciar a análise.</li><li>Corrigir o conteúdo e salvar uma nova versão.</li><li>Exportar seus dados em JSON pela página de configurações.</li><li>Revogar o consentimento opcional de melhoria do produto.</li><li>Excluir análises, currículos ou toda a conta.</li></ul></section>
    <section><h2>Serviços envolvidos</h2><p>O ambiente integrado usa Supabase Auth, Database e Storage para autenticação e persistência. Quando hospedado nessa plataforma, o runtime da aplicação usa Vercel Functions. A região efetiva do banco e do Storage depende da configuração do projeto Supabase.</p></section>
    <section><h2>Estado do ambiente</h2><p>{isConfigured ? "A autenticação, o armazenamento privado, a extração e a análise integrada estão habilitados neste ambiente." : "Este ambiente está em modo demonstração: os dados exibidos são fictícios e não são enviados para serviços externos."} O resultado é uma orientação baseada nas evidências fornecidas e não uma decisão de contratação.</p></section>
  </PolicyLayout>;
}