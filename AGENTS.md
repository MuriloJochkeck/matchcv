## Browser testing

Após implementar ou corrigir uma funcionalidade web:

1. Inicie a aplicação local.
2. Abra a aplicação usando Browser Use.
3. Teste manualmente o fluxo alterado.
4. Verifique o console do navegador.
5. Verifique requisições de rede com falha.
6. Corrija quaisquer regressões encontradas.
7. Repita o teste até o fluxo funcionar corretamente.

## Git e commits

Durante o desenvolvimento, siga obrigatoriamente estas regras de versionamento:

- Após cada alteração considerável e funcionalmente completa, crie um commit.
- Considere uma alteração "considerável" quando ela representar uma unidade lógica de trabalho, como:
  - implementação de uma funcionalidade;
  - correção de um bug;
  - refatoração relevante;
  - alteração de banco de dados ou migration;
  - alteração relevante de configuração;
  - criação ou atualização significativa de testes.
- Não crie commits para alterações triviais ou incompletas.
- Antes de criar o commit:
  1. revise as alterações com `git diff`;
  2. verifique o estado do repositório com `git status`;
  3. execute os testes, lint ou validações relevantes disponíveis no projeto;
  4. confirme que arquivos temporários, segredos, `.env`, credenciais ou artefatos indesejados não serão commitados.
- Faça commits pequenos, coesos e relacionados a uma única unidade lógica de trabalho.
- Utilize mensagens de commit claras e profissionais, preferencialmente seguindo Conventional Commits, por exemplo:
  - `feat: adiciona criação de demandas`
  - `fix: corrige validação do formulário`
  - `refactor: simplifica autenticação`
  - `test: adiciona testes para criação de demanda`
  - `docs: atualiza documentação da API`
- Não crie, troque ou utilize uma nova branch para realizar o trabalho. Trabalhe na branch atualmente selecionada pelo usuário.
- Nunca execute `git checkout -b`, `git switch -c` ou comandos equivalentes para criar branches, salvo quando explicitamente solicitado pelo usuário.
- Não altere `git config user.name` ou `git config user.email`.
- Utilize exclusivamente a identidade Git já configurada pelo usuário no ambiente.
- Nunca adicione o Codex, OpenAI, IA, agente ou qualquer outra identidade como autor ou coautor.
- Nunca adicione trailers como:
  - `Co-authored-by: Codex`
  - `Co-authored-by: OpenAI`
  - `Generated-by: Codex`
  - `Assisted-by: AI`
  - ou qualquer equivalente.
- Não mencione na mensagem de commit que o código foi criado, modificado ou auxiliado por IA.
- Não sobrescreva autoria utilizando `--author`.
- Não utilize `git commit --amend` em commits anteriores do usuário sem solicitação explícita.
- Não faça `push` automaticamente, salvo quando explicitamente solicitado pelo usuário.
- Nunca use `git push --force` ou `git push --force-with-lease` sem autorização explícita.
- Se houver alterações preexistentes feitas pelo usuário que não pertencem à tarefa atual, não as inclua no commit.
- Ao finalizar uma unidade lógica de trabalho, faça o commit antes de iniciar outra alteração considerável.

## Documentação do projeto

A documentação faz parte da implementação e deve permanecer sincronizada com o estado real do projeto.

### Regras gerais

- Sempre avalie se uma alteração realizada exige atualização da documentação.
- Quando uma alteração considerável modificar comportamento, arquitetura, configuração, instalação, API, banco de dados ou fluxo de desenvolvimento, atualize a documentação correspondente antes de considerar a tarefa concluída.
- Não documente funcionalidades planejadas como se já estivessem implementadas.
- Não invente comportamentos, endpoints, configurações ou decisões arquiteturais.
- A documentação deve refletir exclusivamente o estado atual e verificável do projeto.
- Preserve a estrutura, idioma, estilo e padrão já utilizados na documentação existente.
- Prefira atualizar documentação existente em vez de criar novos arquivos desnecessariamente.

### README

Atualize o `README.md` quando houver mudanças relevantes em:

- instalação e configuração do projeto;
- dependências importantes;
- requisitos do ambiente;
- comandos para desenvolvimento, build, testes ou execução;
- variáveis de ambiente;
- estrutura principal do projeto;
- funcionalidades disponíveis;
- integrações externas;
- processo de desenvolvimento;
- instruções necessárias para executar o projeto.

Não transforme o `README.md` em documentação técnica excessivamente detalhada. Informações específicas devem permanecer em documentação própria quando existir.

### APIs

Quando endpoints forem criados, removidos ou modificados, atualize a documentação correspondente, incluindo quando aplicável:

- método HTTP;
- rota;
- parâmetros;
- query parameters;
- body;
- autenticação necessária;
- formato da resposta;
- códigos de status relevantes;
- possíveis erros;
- exemplos necessários para compreender o contrato.

A documentação deve permanecer consistente com os tipos, schemas, validações e implementação reais.

### Banco de dados

Quando houver alterações relevantes no banco de dados, documente quando necessário:

- novas tabelas;
- alterações de tabelas;
- relacionamentos;
- migrations;
- constraints importantes;
- índices relevantes;
- enums;
- decisões estruturais que afetem desenvolvimento ou manutenção.

Não substitua migrations por documentação. A migration continua sendo a fonte executável da alteração.

### Variáveis de ambiente

Quando uma variável de ambiente for adicionada, removida ou alterada:

- atualize `.env.example` ou arquivo equivalente;
- nunca coloque valores reais, tokens, senhas ou secrets na documentação;
- explique brevemente a finalidade da variável quando seu propósito não for evidente;
- remova da documentação variáveis que deixaram de existir.

### Arquitetura

Quando uma alteração modificar significativamente a arquitetura do sistema:

- atualize a documentação arquitetural existente;
- registre novas responsabilidades entre módulos, serviços ou aplicações;
- documente integrações relevantes;
- mantenha diagramas atualizados quando existirem.

Decisões arquiteturais importantes e não óbvias devem ser registradas no formato utilizado pelo projeto, como ADRs, quando esse padrão existir.

### Código

Use comentários no código apenas quando eles explicarem algo que não seja evidente pela própria implementação.

- Não adicione comentários que simplesmente descrevam literalmente o código.
- Prefira nomes claros de funções, classes, tipos e variáveis.
- Documente regras de negócio complexas, limitações, decisões não óbvias e comportamentos importantes.
- Atualize ou remova comentários que ficarem incorretos após uma alteração.

### Antes de finalizar uma tarefa

Antes de considerar uma alteração considerável concluída:

1. verifique se a documentação foi impactada;
2. atualize os arquivos necessários;
3. confira se exemplos e comandos continuam funcionando;
4. confira se `.env.example` permanece sincronizado;
5. procure documentação obsoleta relacionada à alteração;
6. inclua a atualização da documentação no mesmo commit da funcionalidade quando ela fizer parte da mesma unidade lógica.

Uma implementação que exige atualização documental não deve ser considerada concluída enquanto código e documentação estiverem inconsistentes.

### Commits de documentação

- Quando a documentação for consequência direta de uma alteração de código, inclua-a no mesmo commit da alteração.
- Quando a documentação for uma alteração independente, utilize um commit próprio, preferencialmente seguindo Conventional Commits:

  `docs: atualiza instruções de instalação`

  `docs: documenta endpoints de demandas`

  `docs: atualiza arquitetura de autenticação`

- Não crie commits separados apenas para pequenas correções documentais que pertencem diretamente à implementação atual.