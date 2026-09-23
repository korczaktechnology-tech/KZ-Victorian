# WebLords — Mapa de memória compartilhada

## Objetivo

A Fase 2 estabelece o bloco de memória compartilhada utilizado pelo estado da simulação. O projeto usa um único SharedArrayBuffer e um layout centralizado, calculado em src/core/constants.js.

Nenhum sistema deve criar offsets próprios. O layout oficial é exposto por MEMORY.LAYOUT e as views são criadas por createMemoryView().

## Capacidade de referência

- Buffer inicial: 64 MiB.
- Tamanho configurável: createSharedMemory(byteLength).
- O tamanho solicitado precisa ser inteiro positivo e não pode ser menor que o layout calculado.
- O layout atual ocupa 589.824 bytes, deixando espaço livre dentro dos 64 MiB para expansão futura.

## Regiões

| Região | Offset | Bytes | Representação | Finalidade |
|---|---:|---:|---|---|
| positions | 0 | 49.152 | Float32Array | Posição espacial das entidades, reservando 3 valores por entidade. |
| velocities | 49.152 | 49.152 | Float32Array | Velocidade das entidades, reservando 3 valores por entidade. |
| states | 98.304 | 16.384 | Int32Array | Estados inteiros associados às entidades e área de sincronização básica da simulação. |
| population | 114.688 | 131.072 | Int32Array | Área reservada para dados populacionais, com 4 valores inteiros por registro. |
| terrain | 245.760 | 65.536 | Uint8Array | Dados compactos do terreno, com 4 bytes reservados por célula. |
| resources | 311.296 | 65.536 | Int32Array | Dados de recursos, com 4 valores inteiros por registro. |
| buildings | 376.832 | 65.536 | Int32Array | Dados de construções, com 4 valores inteiros por registro. |
| economy | 442.368 | 16.384 | Int32Array | Dados econômicos, com 4 valores inteiros por entrada. |
| logistics | 458.752 | 65.536 | Int32Array | Dados logísticos, com 4 valores inteiros por entrada. |
| navigation | 524.288 | 65.536 | Int32Array | Dados de navegação/Flow Field reservados para as fases posteriores. |

O fim do layout atual é o byte 589.824. Os offsets são alinhados e calculados automaticamente; a tabela documenta o layout produzido pelas capacidades iniciais atuais.

## Fluxo de inicialização

1. A Main Thread cria o SharedArrayBuffer.
2. O layout oficial é obtido de MEMORY.LAYOUT.
3. A Main Thread cria as views locais.
4. A Main Thread envia o buffer e o layout ao Simulation Worker.
5. O Worker cria suas próprias views sobre o mesmo SharedArrayBuffer.
6. A simulação só pode iniciar depois que a memória foi inicializada.
7. Cada tick pode atualizar as regiões compartilhadas sem copiar o estado inteiro.

## Garantias

A implementação valida:

- existência do SharedArrayBuffer;
- tamanho inteiro e positivo;
- capacidade mínima necessária;
- existência de todas as regiões;
- ausência de sobreposição;
- consistência entre offset, byteLength e end;
- compatibilidade do tamanho do buffer com o layout;
- mapeamento das views nos offsets calculados.

## Escopo

Esta estrutura prepara a memória para ECS, população, mundo, economia, logística e navegação. Ela não implementa ainda os componentes ECS, os sistemas econômicos, o mapa, o Flow Field ou a logística; essas responsabilidades pertencem às fases posteriores da arquitetura.
