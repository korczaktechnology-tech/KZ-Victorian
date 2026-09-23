# Fase 4 — Simulation Worker

## Objetivo

A Fase 4 coloca o processamento do mundo dentro do Simulation Worker, mantendo a Main Thread responsável por apresentação, entrada e renderização.

## Fluxo

`Main Thread → Simulation Bridge → Worker → SimulationCore → ECS/sistemas → SharedArrayBuffer`

Eventos e snapshots seguem o caminho inverso:

`Worker → postMessage → Simulation Bridge → consumidores da Main Thread`

## Inicialização

1. A Bridge cria o SharedArrayBuffer e seus TypedArrays.
2. A Bridge cria o Worker como ES Module.
3. A Bridge envia `initialize-memory` com o buffer e o layout.
4. O Worker cria a `SimulationCore` usando as regiões compartilhadas.
5. O Worker responde `memory-ready`.
6. A Bridge envia `start`.
7. O Worker inicia o loop.

## Loop temporal

A arquitetura define 30 ticks/s como referência. O Worker usa tempo real, acumulador, timestep fixo e limite de catch-up. Assim, atrasos do timer não são tratados como se cada chamada tivesse duração perfeita e também não podem provocar catch-up infinito.

## Estado compartilhado

O Worker atualiza as regiões existentes do SharedArrayBuffer. O tick global é publicado atomicamente em `states[0]`. As posições e velocidades permanecem vinculadas às regiões compartilhadas usadas pelo ECS.

## Comandos

A Bridge oferece `sendCommand(type, payload)`. O Worker recebe os comandos e os enfileira. Eles são aplicados no início de um tick, evitando modificar o mundo no meio da execução dos sistemas.

## Eventos e snapshots

Cada tick produz um snapshot com tick, métricas e eventos. Quando existem eventos, o Worker também publica uma mensagem `events` dedicada. Isso permite que a futura UI reaja a mudanças sem polling agressivo.

## Isolamento

O Worker não acessa DOM, canvas ou elementos visuais. Ele trabalha somente com o núcleo da simulação, memória compartilhada, comandos e mensagens.

## Validação

A Fase 4 possui testes automatizados para criação do núcleo no Worker, execução de tick, sincronização com SharedArrayBuffer, comandos, reset e controle do passo temporal, além de uma verificação estrutural específica.
