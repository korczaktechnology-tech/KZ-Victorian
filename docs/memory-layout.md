# WebLords — Mapa de memória local da simulação

## Objetivo

A Fase 2 estabelece um layout centralizado para a memória de trabalho da simulação. O estado autoritativo fica dentro do Simulation Worker, onde ECS e sistemas executam sem depender do DOM.

Nenhum sistema cria offsets próprios. O layout oficial é exposto por MEMORY.LAYOUT e as views são criadas por createMemoryView().

## Capacidade de referência

- Buffer inicial: aproximadamente 576 KiB para as regiões atuais.
- Tamanho configurável: createLocalMemory(byteLength).
- O tamanho solicitado precisa ser inteiro positivo e não pode ser menor que o layout calculado.
- A memória não é compartilhada entre Main Thread e Worker.

## Regiões

As dez regiões continuam organizadas centralmente: positions, velocities, states, population, terrain, resources, buildings, economy, logistics e navigation.

Os offsets são calculados automaticamente por createMemoryLayout(), evitando offsets duplicados dentro dos sistemas.

## Fluxo de inicialização

1. A Main Thread cria o Worker.
2. A Main Thread envia o comando initialize.
3. O Worker cria o ArrayBuffer local e suas TypedArrays.
4. O Worker cria o SimulationCore e inicializa o mundo.
5. O Worker responde simulation-ready.
6. A Main Thread envia start.
7. A simulação executa os ticks dentro do Worker.
8. A cada tick, um snapshot compacto de posições é enviado para a Main Thread usando postMessage com ArrayBuffer transferível.

## Transporte entre threads

O novo modelo substitui memória compartilhada por dois canais:

- Comandos: Main Thread → Worker por postMessage.
- Estado de renderização: Worker → Main Thread por snapshots compactos e ArrayBuffer transferível.
- Eventos: Worker → Main Thread por mensagens de evento.

O estado econômico, ECS, terreno e navegação permanecem privados do Worker. A Main Thread recebe apenas o necessário para renderização e interface.

## Garantias

A implementação valida:

- existência de todas as regiões;
- ausência de sobreposição;
- consistência entre offset, byteLength e end;
- capacidade mínima;
- uso de TypedArrays adequados;
- separação entre memória de simulação e estado visual;
- transporte explícito de snapshots.

## Escopo

Esta estrutura prepara o Worker para ECS, população, mundo, economia, logística e navegação. A comunicação entre threads ocorre por mensagens e buffers transferíveis, mantendo o GitHub Pages compatível sem depender de cabeçalhos de isolamento.
