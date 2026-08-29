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

O formato de erro segue `{ code, message, fieldErrors?, requestId }`. Conteúdo de currículo e vaga não é escrito em logs; somente o identificador da requisição e o nome sanitizado da classe de erro podem ser registrados.
