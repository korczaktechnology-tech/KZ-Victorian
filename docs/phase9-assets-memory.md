# Fase 9 — Assets e memória

A Fase 9 implementa o pipeline de assets da arquitetura WebLords: formatos definidos, catálogo, carregamento assíncrono, cache, referências, descarregamento, orçamento, inspeção de containers e telemetria de memória/CPU/GPU.

## Política
- Modelos: GLB.
- Texturas: KTX2.
- Áudio: OGG.
- Fontes: WOFF2/WOFF.
- Compressão: Meshopt ou Draco quando aplicável.
- Pasta pública: assets/.
- Formatos fora da política são rejeitados.

## Catálogo real
O manifesto contém o asset essencial real assets/models/web-lords-triangle.glb. O GLB é validado pelo pipeline antes de ser considerado carregado.

## Carregamento
O manager valida o caminho, baixa assincronamente, verifica o orçamento, mantém cache por caminho, conta referências e libera memória somente quando a referência chega a zero. Conteúdo opcional é carregado por loadAssetOnDemand() e não participa do boot.

## Memória
O SharedArrayBuffer permanece em 64 MiB. O alvo de assets é 15 MiB. O manager recusa um carregamento que ultrapassaria o orçamento configurado. As estatísticas expõem bytes, MiB, referências e utilização do orçamento.

## Profiling
O profiler mede tempo de frame, memória JS quando performance.memory existe e disponibilidade de EXT_disjoint_timer_query_webgl2 para medição GPU. A ausência dessas APIs é registrada, não mascarada.

## Containers
GLB é validado como glTF 2.0. KTX2 é validado pela assinatura e metadados principais. OGG e WOFF/WOFF2 são classificados pelo formato. Meshopt/Draco e KTX2 são decisões do pipeline de produção, não operações por frame.

## Critérios de conclusão
- [x] formatos suportados
- [x] asset real no catálogo
- [x] carregamento assíncrono
- [x] cache e referências
- [x] descarregamento
- [x] orçamento de memória
- [x] inspeção de containers
- [x] carregamento essencial
- [x] carregamento sob demanda
- [x] telemetria CPU/memória/GPU
- [x] testes e checker automatizados
