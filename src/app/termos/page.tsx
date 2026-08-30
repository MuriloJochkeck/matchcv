import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy-layout";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  const isConfigured = isSupabaseConfigured();
  return <PolicyLayout description="Estes termos preliminares comunicam os limites essenciais do MatchCV e não substituem a versão jurídica necessária antes de um lançamento público." eyebrow="Uso responsável" title="Uma ferramenta de orientação, não uma decisão de carreira.">
    <section><h2>Finalidade</h2><p>O MatchCV relaciona informações do seu currículo aos requisitos declarados em uma vaga. O serviço não seleciona candidatos, não ranqueia pessoas e não toma decisões de contratação.</p></section>
    <section><h2>Interpretação do resultado</h2><p>A pontuação representa a cobertura das evidências encontradas nos documentos fornecidos. Ela não mede capacidade, potencial ou probabilidade real de contratação. Revise os requisitos, evidências e recomendações antes de tomar uma decisão.</p></section>
    <section><h2>Responsabilidade do usuário</h2><ul><li>Enviar somente documentos que tenha autorização para processar.</li><li>Revisar extrações, requisitos e recomendações antes de utilizá-los.</li><li>Não falsificar experiência, formação, idioma ou credenciais.</li><li>Não usar o produto para avaliar terceiros sem base apropriada.</li></ul></section>
    <section><h2>Currículos e conta</h2><p>Você pode corrigir o texto extraído, criar versões revisadas, exportar os dados e solicitar a exclusão da conta. Currículos enviados têm prazo de retenção operacional e os arquivos expirados são removidos automaticamente.</p></section>
    <section><h2>Estado do serviço</h2><p>{isConfigured ? "Este ambiente usa autenticação, armazenamento privado e análise integrada com regras determinísticas versionadas." : "Este ambiente opera em modo demonstração com dados fictícios e integrações externas desativadas."} Funcionalidades de IA externa, quando habilitadas no futuro, deverão respeitar os mesmos contratos, limites e validações do produto.</p></section>
  </PolicyLayout>;
}