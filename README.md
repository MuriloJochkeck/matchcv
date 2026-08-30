# MatchCV

Plataforma web de análise explicável entre currículo e vaga. O produto ajuda candidatos a entender o que o currículo comprova, o que não foi identificado e como melhorar sua apresentação sem inventar experiências.

O projeto possui a Fase 0 navegável e a fundação da Fase 1: autenticação SSR por e-mail, recuperação de senha, sessão protegida, schema PostgreSQL, RLS por proprietário e bucket privado de currículos. Com o Supabase configurado, o upload extrai o texto do PDF e a análise compara o currículo real com a vaga. Sem as credenciais, a aplicação continua disponível apenas para as telas demonstrativas.

## Stack

- Next.js 16 (App Router e Proxy)
- React 19 e TypeScript estrito
- Tailwind CSS 4
- Supabase Auth, PostgreSQL e Storage

## Executar em modo demonstração

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Nenhum documento real deve ser usado no modo demonstração.

## Conectar o Supabase

1. Crie um projeto Supabase específico para o MatchCV ou inicie a stack local com Docker.
2. Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável.
3. Aplique `supabase/migrations` ao banco escolhido.
4. Cadastre `http://localhost:3000/auth/callback` entre os redirects permitidos do Auth.

Para desenvolvimento local com o Supabase CLI:

```bash
npx supabase start
npx supabase db reset
```

O navegador recebe somente `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Chaves secretas ou `service_role` não fazem parte da aplicação.

## Verificação

```bash
npm run check
```

Esse comando executa lint, checagem de tipos, testes e build de produção.

## Rotas principais

- `/` — apresentação do produto
- `/entrar`, `/cadastro` e `/recuperar-senha` — autenticação
- `/painel` — resumo da conta
- `/analises` — histórico
- `/analises/nova` — currículo, vaga e revisão
- `/analises/demo` — relatório explicável demonstrativo
- `/curriculos` e `/configuracoes` — documentos, conta e privacidade
- `/privacidade` e `/termos` — políticas e limites

## Arquitetura

- `src/app`: rotas, Server Components, Server Actions e API/BFF.
- `src/components`: apresentação e componentes interativos.
- `src/contracts`: tipos e validação compartilhada.
- `src/lib/supabase`: clientes SSR/browser, configuração e atualização de sessão.
- `src/server`: domínio, casos de uso e acesso autenticado.
- `supabase/migrations`: schema, integridade, RLS e políticas de storage.
- `docs`: fases, contratos e decisões arquiteturais.

## Limites atuais

A análise integrada usa um motor determinístico server-side: o job é enfileirado, processado automaticamente quando o worker está configurado e o relatório persiste dimensões, requisitos, evidências e recomendações. Um worker externo pode chamar a rota POST /api/internal/processing com o segredo configurado para processar jobs pendentes. A pontuação demonstrativa não representa chance de contratação.

## Execução automática

O arquivo ercel.json agenda o processamento de jobs e a expiração lógica de currículos uma vez por dia. Configure CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY e RESUME_RETENTION_DAYS no ambiente de produção. Os cron jobs executam somente em deployments de produção.
