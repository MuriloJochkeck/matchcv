import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy-layout";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  const isConfigured = isSupabaseConfigured();
  return <PolicyLayout description="Estes termos preliminares comunicam os limites essenciais do protótipo MatchCV. Eles não substituem a versão jurídica necessária antes de um lançamento público." eyebrow="Uso responsável" title="Uma ferramenta de orientação, não uma decisão de carreira.">
    <section><h2>Finalidade</h2><p>O MatchCV ajuda candidatos a relacionar informações do próprio currículo aos requisitos declarados em uma vaga. O serviço não seleciona candidatos, não ranqueia pessoas e não toma decisões de contratação.</p></section>
    <section><h2>Interpretação do resultado</h2><p>A pontuação representa apenas a cobertura das evidências encontradas nos documentos fornecidos. Ela não mede capacidade, potencial ou probabilidade real de contratação.</p></section>
    <section><h2>Responsabilidade do usuário</h2><ul><li>Enviar apenas documentos que tenha autorização para processar.</li><li>Revisar extrações e recomendações antes de utilizá-las.</li><li>Não falsificar experiência, formação, idioma ou credenciais.</li><li>Não usar o produto para avaliar terceiros sem base apropriada.</li></ul></section>
    <section><h2>Limitações do protótipo</h2><p>{isConfigured ? "A autenticação está ativada, mas upload, extração, persistência da análise e inteligência artificial ainda não fazem parte do fluxo disponível." : "A implementação atual opera em modo demonstração com dados fictícios. Integrações externas não estão ativas."}</p></section>
  </PolicyLayout>;
}
