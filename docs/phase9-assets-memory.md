# Fase 9 — Assets e memória

A Fase 9 segue a arquitetura de referência: modelos em GLB, texturas em KTX2 quando suportado, áudio em OGG, compressão Meshopt ou Draco quando aplicável, carregamento dos assets essenciais primeiro, conteúdo adicional sob demanda, cache controlado e descarregamento de recursos sem referências.

## Política de assets
- Modelos: GLB.
- Texturas: KTX2.
- Áudio: OGG quando adequado.
- Fontes: WOFF2/WOFF.
- A pasta pública é `assets/`.
- Formatos fora da política são rejeitados pelo gerenciador.

## Carregamento e memória
O carregamento é assíncrono. Assets essenciais podem ser carregados na inicialização e conteúdo adicional deve usar `load()` somente quando necessário. O gerenciador mantém cache, contagem de referências, tamanho em bytes e permite liberar entradas sem referências.

O SharedArrayBuffer mantém o orçamento de referência de 64 MiB. A meta de assets é 15 MiB. Essa meta é uma referência de otimização, não uma garantia; o valor real deve ser medido em produção.

Meshopt ou Draco podem ser aplicados aos modelos quando a cadeia de produção demonstrar benefício. KTX2 deve ser usado para texturas compatíveis. A Fase 9 não inventa decoders no navegador: a conversão/compressão é responsabilidade do pipeline de assets.

O InstanceBuffer reutiliza o TypedArray para evitar alocações de CPU por frame quando a capacidade existente é suficiente.

## Manifesto de carregamento
O manifesto separa explicitamente assets essenciais de conteúdo opcional. A lista pode crescer sem obrigar o catálogo inteiro a ser carregado no boot; assets essenciais são o único conjunto autorizado a participar da inicialização obrigatória.

## Critérios
- Formatos e localização validados.
- Carregamento assíncrono.
- Cache e referências.
- Descarregamento sem referências.
- Estatísticas de memória.
- Orçamentos explícitos.
- Buffer de instâncias reutilizável.
- Testes e checker automatizados.
