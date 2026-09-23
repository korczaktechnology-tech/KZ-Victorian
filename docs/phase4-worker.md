# Fase 4 — Simulation Worker

## Objetivo

A Fase 4 coloca o processamento do mundo dentro do Simulation Worker, mantendo a Main Thread responsável por apresentação, entrada e renderização.

## Fluxo

Main Thread → Simulation Bridge → Worker → SimulationCore → ECS/sistemas

Eventos e snapshots seguem o caminho inverso:

Worker → postMessage → Simulation Bridge → consumidores da Main Thread

## Inicialização

1. A Bridge cria o Worker como ES Module.
2. A Bridge envia initialize.
3. O Worker cria sua memória local e suas TypedArrays.
4. O Worker cria a SimulationCore.
5. O Worker responde simulation-ready.
6. A Bridge envia start.
7. O Worker inicia o loop.

## Loop temporal

A arquitetura define 30 ticks/s como referência. O Worker usa tempo real, acumulador, timestep fixo e limite de catch-up. Assim, atrasos do timer não são tratados como se cada chamada tivesse duração perfeita e também não podem provocar catch-up infinito.

## Estado e transporte

O estado autoritativo permanece no Worker. A Main Thread não acessa diretamente ECS, economia, terreno ou navegação.

A comunicação usa:

- comandos estruturados Main Thread → Worker;
- eventos Worker → Main Thread;
- snapshots de renderização Worker → Main Thread;
- ArrayBuffer transferível para transportar posições sem manter estado de simulação compartilhado.

## Comandos

A Bridge oferece sendCommand(type, payload). O Worker recebe os comandos e os enfileira. Eles são aplicados no limite de um tick, evitando modificar o mundo no meio da execução dos sistemas.

## Eventos e snapshots

Cada tick produz um snapshot com tick, métricas, eventos e posições. As posições são compactadas em um Float32Array e transferidas para a Main Thread. Isso mantém a UI e o renderer independentes da estrutura interna do ECS.

## Isolamento

O Worker não acessa DOM, canvas ou elementos visuais. Ele trabalha somente com o núcleo da simulação e mensagens.

## Validação

A Fase 4 possui testes automatizados para criação do núcleo no Worker, execução de tick, transporte de snapshots, comandos, reset e controle do passo temporal, além de uma verificação estrutural específica.
