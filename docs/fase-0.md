# MatchCV — Fase 0 e fundação

Este documento traduz o pré-projeto em decisões executáveis para a primeira entrega. O escopo atual é um protótipo navegável com dados fictícios; nenhum documento real deve ser usado enquanto autenticação, autorização, banco e storage privado não estiverem integrados.

## Objetivo da fatia

Validar a promessa central do produto em um fluxo demonstrável:

1. entrar em uma conta fictícia;
2. selecionar um currículo PDF ou fixture;
3. informar uma vaga;
4. revisar as entradas;
5. abrir um relatório explicável;
6. compreender dimensões, evidências, lacunas e próximas ações.

## Decisões implementadas

- Interface em português do Brasil, responsiva a partir de 360 px.
- Linguagem não julgadora: `não identificado` em vez de afirmar ausência de competência.
- Nota geral calculada deterministicamente a partir das dimensões e pesos `40/25/20/10/5`.
- Contratos TypeScript separados da fixture e da apresentação.
- Dados fictícios identificados em todas as áreas autenticadas.
- Avisos preliminares de privacidade, interpretação e limitações do protótipo.
- Estados de validação, processamento e ação indisponível comunicados na interface.

## Mapa entregue

| Rota | Estado atual |
| --- | --- |
| `/` | Landing page completa |
| `/entrar` e `/cadastro` | Acesso demonstrativo local |
| `/painel` | Resumo e análise recente fictícia |
| `/analises/nova` | Wizard interativo com validação local |
| `/analises/demo` | Relatório explicável completo |
| `/curriculos` | Gerenciamento demonstrativo |
| `/configuracoes` | Controles planejados e limitações |
| `/privacidade` e `/termos` | Textos preliminares do MVP |

## Contrato da pontuação v1

O arquivo `src/features/analysis/types.ts` é a fonte de verdade dos dados exibidos. `src/features/analysis/scoring.ts` calcula a média ponderada sem participação do modelo de IA. A fixture em `src/features/analysis/fixtures.ts` simula a saída já validada do pipeline.

## Próximo backlog técnico

### P0 — Fundação integrada

- Escolher o serviço gerenciado de PostgreSQL, autenticação e storage.
- Criar esquema inicial, migrations e autorização por proprietário.
- Substituir o acesso demonstrativo por sessão real e recuperação por e-mail.
- Definir retenção final do PDF e validar os textos com revisão jurídica.
- Adicionar CI com lint, typecheck, testes e build.

### P0 — Documentos e vaga

- Upload privado com URL temporária, allowlist de MIME, assinatura `%PDF` e limite no servidor.
- Extração de texto selecionável e estado de revisão.
- Persistência versionada do currículo e da vaga.
- Exclusão idempotente e cancelamento de jobs associados.

### P0 — Motor de análise

- Esquemas JSON versionados e validação estrita na fronteira do gateway de IA.
- Normalização de requisitos e competências.
- Testes unitários da pontuação, denominadores e dimensões não aplicáveis.
- Fixture/dataset fictício para precisão, evidência e prompt injection.

### P1 — Qualidade

- Testes E2E da jornada crítica e de autorização horizontal.
- Auditoria WCAG 2.2 AA e revisão manual por teclado.
- Estados de erro integrados, observabilidade com `requestId` e métricas de jobs.
- Feedback de utilidade no relatório.

## Decisões ainda abertas

- Provedor gerenciado de auth/banco/storage.
- Provedor e modelo de IA.
- Prazo definitivo de retenção.
- Estratégia de processamento assíncrono no ambiente escolhido.
- Conteúdo jurídico final.
