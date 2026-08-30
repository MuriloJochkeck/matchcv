# MatchCV — Fase 1: fundação integrada

## Objetivo

Preparar a aplicação para dados reais sem quebrar a demonstração existente. Esta fase conecta a identidade do usuário às futuras operações de banco e storage e estabelece autorização por proprietário antes do upload.

## Entregue

- Supabase SSR com cliente por requisição e cookies atualizados pelo `proxy.ts` do Next.js 16.
- Cadastro, login, logout, confirmação por e-mail, recuperação e redefinição de senha.
- Proteção das rotas da área do candidato e validação de sessão no servidor.
- Criação idempotente do perfil após autenticação confirmada.
- Schema PostgreSQL completo do pré-projeto, com constraints, relacionamentos e índices.
- RLS em todas as tabelas expostas, incluindo políticas indiretas para entidades filhas.
- Bucket `resumes` privado, limitado a PDF de 5 MB e pasta por usuário.
- Dependências Supabase fixadas e `.env.example` sem segredos.
- Modo demonstração preservado quando o Supabase não está configurado.

## Não entregue nesta fase

- Upload, validação, extração e revisão do PDF pela interface.
- Estruturação determinística e revisão dos requisitos da vaga.
- Persistência versionada de vaga, requisitos revisados e análise.
- Worker, retry e idempotência operacional.
- Gateway de IA, retenção automatizada e testes E2E ainda pendentes.

## Como ativar

1. Criar ou selecionar um projeto Supabase exclusivo do MatchCV.
2. Aplicar `supabase/migrations/20260829161128_foundation.sql`.
3. Configurar as variáveis descritas em `.env.example`.
4. Permitir o callback `/auth/callback` no Auth.
5. Executar cadastro e validar a criação da linha em `profiles`.

## Segurança

- O servidor valida a sessão antes de renderizar a área privada.
- O proxy usa `getClaims()`; nenhuma autorização confia em `user_metadata`.
- `display_name` pode vir de metadados apenas para apresentação.
- Toda política de dados combina `authenticated` com `auth.uid()`.
- O bucket não é público e não aceita arquivo fora da pasta do proprietário.
- Nenhuma chave privilegiada é necessária no runtime web.

## Próximo marco

Integrar gateway de IA com schema validado, implementar retenção automatizada, exportação e testes E2E.

## Implementação atualizada

O fluxo integrado agora estrutura currículo e vaga em JSON validado (structured-v1), aplica proteção contra padrões de prompt injection, permite revisão dos requisitos detectados e calcula correspondência contextual com pesos, sinônimos, tempo de experiência, confiança de evidência e status não aplicável. O gateway local usa regras determinísticas versionadas (ules-v2); um provedor externo de IA permanece opcional e não é necessário para executar a análise.
