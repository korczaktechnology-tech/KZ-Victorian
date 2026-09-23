# Fase 10 — Produção, isolamento e deploy

A Fase 10 fecha o ciclo de engenharia do WebLords: validação completa antes do build, preparação de uma distribuição estática, HTTPS e isolamento necessário ao SharedArrayBuffer.

## Pipeline
1. GitHub Actions executa `npm run check:all`.
2. Somente com validação aprovada executa `npm run build:production`.
3. O build publica `index.html`, `style.css`, `src/` e `assets/`.
4. O ambiente de produção deve ser HTTPS.
5. O servidor deve responder com `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp`.
6. Recursos externos devem respeitar a política de isolamento; recursos de terceiros que não possam ser incorporados de forma compatível não devem ser carregados.

## Isolamento
A aplicação expõe uma verificação de runtime para confirmar contexto seguro, SharedArrayBuffer, cross-origin isolation e WebGL 2.0. A verificação não tenta mascarar ausência de isolamento.

## Deploy
O workflow de produção usa GitHub Pages como destino estático. O próprio GitHub Pages fornece HTTPS, mas a arquitetura exige que os cabeçalhos COOP/COEP sejam efetivamente verificados no ambiente publicado; se o host não fornecer esses cabeçalhos, a aplicação deve ser publicada em um host compatível com headers customizados antes de considerar SharedArrayBuffer operacional.

## Critérios de conclusão
- Validação completa antes do build.
- Build reprodutível e sem dependências de runtime.
- Verificação de HTTPS e isolamento.
- Workflow de produção.
- Teste de runtime das capacidades.
- Documentação dos requisitos de headers e recursos externos.
- CI verde.
