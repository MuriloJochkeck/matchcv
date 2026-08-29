import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy-layout";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacyPage() {
  const isConfigured = isSupabaseConfigured();
  return <PolicyLayout description="O MatchCV foi planejado para tratar currículos como dados pessoais sensíveis ao contexto. Este aviso descreve a proposta do MVP e deverá passar por revisão jurídica antes de uso comercial." eyebrow="Privacidade por padrão" title="Seus dados continuam sob seu controle.">
    <section><h2>O que pretendemos coletar</h2><p>Dados mínimos de conta, o currículo enviado, a descrição da vaga, versões estruturadas e o resultado das análises. Características protegidas, foto e inferências de personalidade não fazem parte da pontuação.</p></section>
    <section><h2>Para que os dados serão usados</h2><p>Somente para autenticar sua conta, processar a comparação solicitada, exibir seu histórico e manter a segurança do serviço. Documentos não serão usados para treinar modelos sem autorização específica e separada.</p></section>
    <section><h2>Arquivos e retenção</h2><p>O desenho técnico prevê armazenamento privado, acesso por autorização temporária e retenção curta, inicialmente sugerida em 30 dias. O prazo final ainda será confirmado antes do piloto.</p></section>
    <section><h2>Suas escolhas</h2><ul><li>Revisar o texto extraído antes da análise.</li><li>Excluir uma análise ou currículo antecipadamente.</li><li>Solicitar a exclusão da conta e dos dados associados.</li><li>Contestar uma extração ou resultado.</li></ul></section>
    <section><h2>Sobre o estágio atual</h2><p>{isConfigured ? "A autenticação está conectada, mas currículo, vaga e relatório ainda usam fixtures até a conclusão do upload privado e da extração. Não envie documentos reais enquanto este aviso estiver identificado como preliminar." : "O modo demonstração usa fixtures fictícias e não envia dados para autenticação, banco ou storage. Não envie documentos reais enquanto este aviso estiver identificado como preliminar."}</p></section>
  </PolicyLayout>;
}
