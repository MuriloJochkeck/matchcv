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

- Upload e registro do PDF pela interface.
- Extração e revisão de texto.
- Persistência de vaga e análise.
- Worker, IA, retry e idempotência operacional.
- Exclusão completa da conta e retenção automatizada.

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

Implementar F02/F03: upload assinado, assinatura `%PDF`, hash, extração de texto selecionável, revisão do conteúdo e persistência versionada de currículo e vaga.
