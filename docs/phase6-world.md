# WebLords — Fase 6: Mapa e Flow Field

## Objetivo

A Fase 6 transforma o mundo da simulação em uma grade espacial navegável. O mapa passa a ter células identificáveis, custos, obstáculos, estradas e estado de navegação compartilhado. Sobre essa grade é construído um Flow Field que fornece uma direção por célula para um destino ou grupo de destinos.

## Mapa

O WorldMap trabalha com uma grade de até 128 × 128 células, alinhada à capacidade definida para a memória compartilhada. Cada célula possui coordenadas inteiras e um índice linear determinístico.

A região terrain do SharedArrayBuffer armazena os flags espaciais da célula. A região navigation armazena a direção calculada, o custo integrado e um marcador de validade do campo ativo.

Os estados espaciais incluem:

- célula livre;
- obstáculo;
- água;
- estrada;
- construção;
- custo de terreno.

## Navegabilidade

Uma célula é considerada bloqueada quando possui obstáculo, água ou construção. Estradas removem o bloqueio da própria célula e recebem custo de deslocamento reduzido.

Quando uma construção ou estrada altera a malha espacial, a revisão do mapa é incrementada. O Flow Field ativo pode então ser reconstruído, mantendo a navegação coerente com o estado atual do mundo.

## Flow Field

O Flow Field utiliza uma propagação de custo a partir dos destinos. A implementação usa uma fila de prioridade para calcular o custo acumulado até cada célula alcançável.

Depois do campo de custo, cada célula livre recebe uma direção para um vizinho com custo inferior. O campo suporta:

- um ou vários destinos;
- consulta por coordenada;
- custos de terreno;
- estradas;
- obstáculos;
- diagonais;
- prevenção de corte diagonal por cantos bloqueados;
- reconstrução após mudança do mapa.

O campo ativo é escrito na região de navegação compartilhada para que o estado espacial permaneça disponível ao restante da aplicação.

## Spatial Partitioning

O SpatialPartition divide o mundo em células e mantém entidades agrupadas espacialmente. A estrutura oferece:

- inserção;
- reconstrução;
- consulta por célula;
- consulta por raio.

A partição é reconstruída pelo núcleo da simulação a cada tick, permitindo buscas locais sem percorrer todas as entidades para cada consulta espacial.

## Integração com entidades

O SimulationWorld agora possui:

- map;
- spatial;
- flowFields;
- revisão de navegação;
- campo ativo;
- sincronização de entidades com o mapa.

Construções e estradas são refletidas no mapa. O sistema de Pathfinding consulta o Flow Field ativo e converte a direção da célula em destino de movimento para entidades que possuem velocidade de movimento.

## Integração com o ciclo da simulação

A cada tick:

1. a partição espacial é reconstruída;
2. alterações pendentes do mapa são detectadas;
3. o Flow Field ativo é reconstruído quando necessário;
4. Population executa;
5. Pathfinding consulta a navegação;
6. Movement aplica o deslocamento;
7. os demais sistemas executam;
8. Construction pode alterar a navegabilidade;
9. a próxima iteração encontra a nova revisão e reconstrói o campo.

## Validação

A Fase 6 possui testes para:

- indexação e coordenadas;
- terreno, custos e flags;
- obstáculos e água;
- estradas;
- Flow Field;
- múltiplos destinos;
- diagonais e prevenção de corner cutting;
- reconstrução;
- Spatial Partition;
- integração com construções;
- integração do Pathfinding;
- SharedArrayBuffer;
- SimulationCore.

A fase somente deve permanecer marcada como concluída quando o conjunto completo de testes e o verificador estrutural terminarem sem erros.
