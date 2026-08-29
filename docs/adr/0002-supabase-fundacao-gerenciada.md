# ADR 0002 — Supabase para autenticação, PostgreSQL e storage

- Estado: aceito
- Data: 2026-08-29

## Contexto

O pré-projeto pede serviços gerenciados de autenticação, PostgreSQL e armazenamento privado, com baixo custo operacional para um desenvolvedor individual. O fornecedor ainda estava em aberto ao fim da Fase 0.

## Decisão

Adotar Supabase na fundação do MVP, usando:

- `@supabase/ssr` para sessão em cookies no Next.js;
- PostgreSQL como fonte persistente e RLS como defesa em profundidade;
- Storage privado para currículos, com objetos organizados por `auth.uid()`;
- chave publicável no browser e nenhuma chave privilegiada no runtime web.

O domínio permanece separado em `src/contracts` e `src/server`; os clientes do fornecedor ficam em `src/lib/supabase`. Sem configuração externa, a aplicação opera em modo demonstração.

## Consequências

- Auth, banco e storage compartilham a mesma identidade e reduzem integração operacional.
- RLS precisa ser testada como parte do contrato, não tratada como configuração opcional.
- Migrations e dependências ficam versionadas no repositório.
- A implantação real depende da criação ou conexão de um projeto Supabase exclusivo do MatchCV.
- Trocar de fornecedor exigirá novos adaptadores, mas não deve alterar o contrato de análise.

## Alternativas

- Serviços separados: maior liberdade por componente, com mais configuração e pontos de falha.
- Auth e persistência próprias: controle amplo, mas risco e esforço incompatíveis com o MVP individual.
- Permanecer apenas com fixtures: não atende autorização, privacidade ou histórico do pré-projeto.
