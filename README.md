# MatchCV

Plataforma web de análise explicável entre currículo e vaga. O produto ajuda candidatos a entender o que o currículo comprova, o que não foi identificado e como melhorar sua apresentação sem inventar experiências.

O projeto possui a Fase 0 navegável e a fundação da Fase 1: autenticação SSR por e-mail, recuperação de senha, sessão protegida, schema PostgreSQL, RLS por proprietário e bucket privado de currículos. Sem variáveis do Supabase, a aplicação continua disponível em modo demonstração; análise, extração do PDF e persistência do relatório ainda usam fixtures.

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

O backend de análise ainda recebe apenas metadados do arquivo e devolve uma fixture. Upload real, extração de texto, jobs, IA estruturada, histórico persistido, feedback e exclusão completa permanecem no backlog da Fase 2 em diante. A pontuação demonstrativa não representa chance de contratação.
