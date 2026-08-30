# Contratos HTTP — fundação integrada

## Matriz de autenticação

| Operação | Produtor | Consumidor | Entrada/saída | Falha | Segurança | Teste |
| --- | --- | --- | --- | --- | --- | --- |
| Cadastro | Formulário | Supabase Auth | e-mail, senha, `display_name` | mensagem genérica + erros de campo | callback permitido; senha mínima 8 | normalização e inválidos |
| Login | Formulário | Supabase Auth | e-mail e senha | mensagem genérica | sessão em cookie; validação no servidor | validação contratual |
| `GET /auth/callback` | Supabase Auth | aplicação | `code` + `next` local | redireciona para `/entrar` | bloqueia open redirect | `safeNextPath` |
| Recuperação | Formulário | Supabase Auth | e-mail | resposta não enumera contas | callback para redefinição | e-mail inválido |
| Área privada | Proxy + layout | Server Components | claims/sessão | redirect `/entrar` | `getClaims()` no proxy e `getUser()` no servidor | build + fluxo configurado |

`user_metadata.display_name` é usado somente para apresentação; nunca participa de autorização. O `user_id` de recursos vem da sessão ou de RLS, não de campos livres enviados pelo cliente.

## Matriz da análise

| Operação | Produtor | Consumidor | Entrada/saída canônica | Erro | Compatibilidade | Teste |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /api/analyses` | Wizard | API/BFF | `CreateAnalysisRequest` / `CreateAnalysisResponse` | `ApiErrorResponse`, 400/422/500 | `schemaVersion: analysis-v1` | válido, consentimento ausente, campos inválidos |
| `GET /api/analyses/:id` | API/BFF | clientes HTTP | `GetAnalysisResponse` | `ANALYSIS_NOT_FOUND`, 404 | `schemaVersion: analysis-v1` | demo existente e id inexistente |
| Leitura do relatório | Serviço de análise | Server Component | `Analysis` | resultado nulo vira `notFound()` | contrato interno tipado | build e teste do serviço |

O campo opcional `job.requirements` carrega os requisitos detectados e revisados pelo usuário; cada item contém `title`, `kind`, `keywords` e `sourceText` e é persistido em `job_versions.structured_json`.

O formato de erro segue `{ code, message, fieldErrors?, requestId }`. Conteúdo de currículo e vaga não é escrito em logs; somente o identificador da requisição e o nome sanitizado da classe de erro podem ser registrados.

## Fluxos adicionados

- `GET /api/analyses` exige sessão autenticada e retorna histórico paginado com `limit` (1–50) e `cursor` opaco.
- `DELETE /api/analyses/:id` exige sessão autenticada e exclui somente análise pertencente ao usuário.
- `PATCH /api/resumes/:id` exige sessão autenticada e cria uma nova versão do texto revisado do currículo.
- GET /api/resumes/:id exige sessão autenticada e retorna a versão mais recente, texto extraído e expiração, sem expor storage_key.
- POST /api/internal/retention exige CRON_SECRET ou PROCESSING_WORKER_SECRET e marca logicamente currículos expirados como excluídos; a limpeza física do Storage deve ser executada por operação autorizada.
- `POST /api/analyses` enfileira a análise com `Idempotency-Key`, processa imediatamente quando o worker server-side está configurado e retorna `202` somente enquanto o processamento estiver pendente.
- `GET /api/internal/processing` e `POST /api/internal/processing` são rotas internas protegidas por `CRON_SECRET` ou `PROCESSING_WORKER_SECRET`; processam jobs e aplicam até três tentativas.

A migration `20260829200000_async_analysis_processing.sql` contém as funções transacionais de enqueue, claim, conclusão e retry. A migration `20260830110000_lifecycle_safety.sql` adiciona o cancelamento transacional de jobs ao excluir uma análise e o índice de expiração de currículos. A chave privilegiada do Supabase é usada exclusivamente pelo worker server-side.

## Exclusão completa da conta

A ação de configurações exige a confirmação literal `EXCLUIR`, remove os objetos privados do bucket `resumes`, exclui a conta pelo Admin API e encerra a sessão. `SUPABASE_SERVICE_ROLE_KEY` permanece somente no ambiente server-side.

A migration 20260830120000_cancel_analysis_invoker.sql mantém o cancelamento como SECURITY INVOKER, protegido pela policy de atualização do próprio usuário e por grant de colunas limitado.
A migration 20260830130000_worker_structured_requirements.sql faz o worker assíncrono consumir os requisitos revisados persistidos em job_versions.structured_json.

## Currículos, vagas e privacidade

- `POST /api/resumes/upload-url` exige sessão e recebe `{ name, sizeBytes, mimeType: "application/pdf" }`. Retorna `resumeId`, `storagePath`, `uploadUrl`, `uploadToken` e `expiresAt`; o limite é de cinco intenções por usuário/hora.
- Após enviar o PDF ao Storage privado usando a intenção, `POST /api/resumes/:id/finalize` valida a assinatura, extrai texto, gera o perfil estruturado versionado e altera o currículo para `ready`. Falhas deixam o currículo como `failed` e não expõem o conteúdo em logs.
- `GET /api/resumes/:id` retorna a versão mais recente do currículo pertencente à sessão; `PATCH /api/resumes/:id` cria uma nova versão revisada.
- `POST /api/jobs` cria uma vaga independente, estrutura requisitos e retorna `jobId`, `versionId` e `requirements`. O texto deve ter entre 80 e 20.000 caracteres.
- `GET /api/account/export` exporta os dados JSON da conta autenticada, sem `storage_key`; a resposta é privada e marcada como download.
- `DELETE /api/account` exige `{ confirmation: "EXCLUIR" }`, remove os PDFs privados, exclui a conta pelo Auth Admin API e encerra a sessão.
- O consentimento obrigatório da análise é gravado em `profiles.accepted_terms_at`; o consentimento opcional de melhoria continua em `profiles.product_improvement_consent_at`.
- A política operacional atual retém currículos por `RESUME_RETENTION_DAYS` (padrão: 30 dias). O cron protegido por segredo remove os objetos expirados do bucket e marca os registros como `deleted`; a exclusão da conta é imediata.
- Subprocessadores atualmente registrados: Supabase Auth, Database e Storage, usados para autenticação e persistência; Vercel Functions/Runtime, quando o projeto é executado nessa plataforma. A região efetiva do banco e do Storage é a região configurada no projeto Supabase e deve ser confirmada no painel antes de produção; não é inferida pela aplicação.

Todas as rotas de criação de análise e upload aplicam limite best-effort em memória por usuário. Em múltiplas instâncias, deve ser substituído por um backend distribuído antes de uso em escala.