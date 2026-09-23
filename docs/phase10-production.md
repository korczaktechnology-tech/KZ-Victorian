# Fase 10 — Produção e deploy

A Fase 10 fecha o ciclo de engenharia do WebLords: validação completa, build de produção, minificação, smoke test real em navegador e publicação no GitHub Pages.

## Pipeline

1. GitHub Actions executa npm run check:all.
2. npm run check:production valida os artefatos.
3. npm run build:production recria _dist/ de forma limpa.
4. JavaScript é minificado com Terser.
5. CSS é compactado para produção.
6. index.html, src/ e assets/ são copiados para a distribuição.
7. Um servidor local simples é usado para validar o build.
8. Playwright abre a aplicação em Chromium e valida Web Worker, WebGL 2.0 e a interface.
9. O artefato validado é publicado no GitHub Pages.

## Compatibilidade com GitHub Pages

A arquitetura não depende de SharedArrayBuffer nem de COOP/COEP. Portanto, o frontend pode permanecer como conteúdo estático no GitHub Pages.

O Simulation Worker mantém seu estado em memória local e envia comandos, eventos e snapshots por postMessage. Uma API/MongoDB, caso seja adicionada posteriormente, ficará responsável por persistência e serviços de backend, não pelo estado de cada tick local.

## Segurança

- Somente caminhos dentro de _dist/ são servidos pelo servidor de validação.
- O build é reconstruído do zero a cada execução.
- A aplicação não depende de cabeçalhos especiais de isolamento.
- Recursos externos devem continuar sendo controlados e validados.

## Critérios de conclusão

- [x] validação completa antes do build;
- [x] build limpo e reprodutível;
- [x] JavaScript minificado;
- [x] CSS otimizado;
- [x] assets incluídos;
- [x] HTTPS no domínio público do GitHub Pages;
- [x] servidor local de validação;
- [x] smoke test Chromium real;
- [x] validação de Web Worker;
- [x] validação de WebGL 2.0;
- [x] publicação automatizada;
- [x] CI verde.
