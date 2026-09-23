# Fase 10 — Produção, isolamento e deploy

A Fase 10 fecha o ciclo de engenharia do WebLords: validação completa, build de produção, minificação, otimização de CSS, servidor com isolamento, smoke test real em navegador e publicação.

## Pipeline

1. GitHub Actions executa `npm run check:all`.
2. `npm run check:production` valida todos os artefatos da etapa.
3. `npm run build:production` recria `_dist/` de forma limpa.
4. Todos os módulos JavaScript são minificados com Terser.
5. CSS é compactado para produção.
6. `index.html`, `src/` e `assets/` são copiados para a distribuição.
7. O servidor de produção de validação responde com HTTPS-compatible isolation headers.
8. Playwright abre a aplicação em Chromium real e valida execução, SharedArrayBuffer, cross-origin isolation, WebGL 2.0 e a interface.
9. O artefato validado é publicado no GitHub Pages como distribuição pública/preview.
10. Para operar SharedArrayBuffer no domínio definitivo, o host definitivo deve entregar efetivamente os headers de isolamento.

## Isolamento

A resposta HTTP de produção deve conter:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Resource-Policy: same-origin`

O servidor de validação incluído no projeto entrega esses cabeçalhos. O smoke test verifica os cabeçalhos na resposta real e confirma `crossOriginIsolated === true` no Chromium.

`src/core/runtime-capabilities.js` também expõe uma verificação independente para o runtime.

## GitHub Pages

O GitHub Pages continua sendo o destino público do artefato estático. Ele fornece HTTPS, mas não deve ser considerado a prova de que COOP/COEP estão ativos: o formato `_headers` é mantido como contrato para hosts que o suportem, e o servidor de produção incluído no projeto demonstra o comportamento obrigatório.

Portanto, o pacote está **production-ready**, enquanto a ativação efetiva de SharedArrayBuffer no domínio público depende de o host definitivo fornecer os cabeçalhos acima. A validação automatizada não finge que um arquivo `_headers` por si só altera respostas HTTP.

## Segurança

- Somente caminhos dentro de `_dist` são servidos.
- Recursos externos devem ser compatíveis com `require-corp`.
- A aplicação não deve depender de recursos cross-origin sem política de incorporação compatível.
- O build é reconstruído do zero a cada execução.

## Critérios de conclusão

- [x] validação completa antes do build;
- [x] build limpo e reprodutível;
- [x] JavaScript minificado;
- [x] CSS otimizado;
- [x] assets incluídos;
- [x] HTTPS como requisito de produção;
- [x] COOP;
- [x] COEP;
- [x] CORP;
- [x] servidor de validação isolado;
- [x] smoke test Chromium real;
- [x] validação de SharedArrayBuffer;
- [x] validação de cross-origin isolation;
- [x] validação de WebGL 2.0;
- [x] publicação automatizada;
- [x] CI verde.
