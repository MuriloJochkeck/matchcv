# ADR 0001 — Monólito modular com fronteiras explícitas

- Estado: aceito
- Data: 2026-08-29

## Contexto

O pré-projeto recomenda um monólito modular em Next.js para um produto inicialmente mantido por uma pessoa e com baixo volume. O protótipo existente misturava fixture, cálculo e apresentação e ainda não possuía uma fronteira HTTP real. Banco, autenticação, storage e provedor de IA continuam decisões abertas.

## Decisão

Manter um único deploy Next.js e separar o código por responsabilidade:

- `src/contracts`: tipos, versões e validação compartilhada dos contratos;
- `src/client`: adaptadores usados pela interface para acessar a API;
- `src/app/api`: transporte HTTP/BFF, status e serialização;
- `src/server`: regras de negócio, casos de uso e acesso a dados;
- `src/components` e `src/app`: apresentação e rotas de interface.

Leituras de Server Components acessam `src/server` diretamente. A criação iniciada pelo wizard usa `POST /api/analyses` porque esse contrato já faz parte do produto planejado e deverá servir integrações futuras. O endpoint atual opera somente em modo demonstrativo e não recebe o conteúdo do PDF.

## Consequências

- Frontend não importa fixtures nem regras internas do backend.
- Validação e formato de erro têm uma fonte de verdade testável.
- A API pode ser extraída para outro deploy no futuro sem antecipar custo operacional agora.
- Autenticação, persistência e filas ainda precisam ser implementadas antes de aceitar dados reais.

## Alternativas

- Dois deploys agora: melhora isolamento operacional, mas duplica configuração, observabilidade e autenticação sem necessidade demonstrada.
- Manter tudo na camada visual: mais rápido no curtíssimo prazo, mas não prova o fluxo integrado nem protege contratos.
