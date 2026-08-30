import type { Analysis } from "../../contracts/analysis";

export const demoAnalysis: Analysis = {
  id: "demo",
  status: "completed",
  jobTitle: "Desenvolvedora Front-end Júnior",
  companyLabel: "Horizonte Tecnologia",
  resumeName: "curriculo-ana-souza.pdf",
  createdAt: "29 de agosto de 2026, 14:32",
  algorithmVersion: "score-v1.0",
  dimensions: [
    { key: "technical", label: "Competências técnicas", score: 78, weight: 40, rationale: "React, TypeScript e consumo de APIs aparecem com evidências diretas." },
    { key: "experience", label: "Experiência relacionada", score: 72, weight: 25, rationale: "Dois projetos demonstram atuação prática, ainda sem experiência formal longa." },
    { key: "required", label: "Requisitos obrigatórios", score: 75, weight: 20, rationale: "Três dos quatro requisitos obrigatórios foram identificados." },
    { key: "education", label: "Formação e idiomas", score: 65, weight: 10, rationale: "Formação compatível; nível de inglês não está descrito com clareza." },
    { key: "evidence", label: "Clareza das evidências", score: 85, weight: 5, rationale: "Projetos têm contexto, tecnologias e resultados mensuráveis." },
  ],
  requirements: [
    { id: "req-1", title: "React e componentização", kind: "Obrigatório", status: "matched", confidence: 96, evidence: "Desenvolvi uma plataforma acadêmica em React com componentes reutilizáveis e testes de interface.", note: "Evidência direta em projeto acadêmico recente." },
    { id: "req-2", title: "TypeScript", kind: "Obrigatório", status: "matched", confidence: 92, evidence: "Aplicação desenvolvida com React, TypeScript e integração com API REST.", note: "Tecnologia citada em contexto de entrega." },
    { id: "req-3", title: "Testes automatizados", kind: "Obrigatório", status: "partial", confidence: 71, evidence: "Testes de interface para os principais componentes.", note: "Há menção a testes, mas ferramentas e cobertura não foram detalhadas." },
    { id: "req-4", title: "Inglês intermediário", kind: "Obrigatório", status: "missing", confidence: 88, note: "O nível de inglês não foi identificado no currículo." },
    { id: "req-5", title: "Next.js", kind: "Desejável", status: "partial", confidence: 64, evidence: "Estudos em frameworks React e renderização no servidor.", note: "Conhecimento relacionado, sem projeto explícito em Next.js." },
  ],
  recommendations: [
    { id: "rec-1", priority: "Alta", title: "Detalhe como os testes foram usados", description: "Se isso for verdadeiro, inclua a ferramenta, o tipo de teste e qual risco do projeto foi coberto.", category: "currículo" },
    { id: "rec-2", priority: "Alta", title: "Informe seu nível de inglês com honestidade", description: "Adicione o nível apenas se puder sustentá-lo; cursos, certificações ou situações reais ajudam a contextualizar.", category: "clareza" },
    { id: "rec-3", priority: "Média", title: "Prepare um exemplo de decisão técnica", description: "Use um dos projetos para explicar uma escolha de componentização, o trade-off e o resultado obtido.", category: "preparação" },
  ],
};
