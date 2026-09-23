# WebLords — Fase 3: ECS e núcleo da simulação

## Objetivo

A Fase 3 implementa o núcleo de dados e regras que representa o mundo do WebLords. Ela estabelece entidades, componentes, armazenamento orientado a dados, consultas lineares e os sistemas básicos que processam o estado do mundo.

A fase não implementa WebGL, Flow Field, produção de assets ou deploy. Esses assuntos permanecem nas fases correspondentes da arquitetura.

## Entidades

As oito entidades previstas na arquitetura estão representadas:

- Habitante
- Árvore
- Casa
- Armazém
- Serraria
- Estrada
- Recurso
- Animal

Cada entidade recebe um ID inteiro estável enquanto estiver ativa. IDs destruídos podem ser reutilizados por uma pilha interna de IDs livres, evitando crescimento desnecessário.

## Componentes

O ECS possui os nove componentes previstos:

1. Position — posição tridimensional.
2. Velocity — velocidade tridimensional.
3. Job — função, estado e alvo da tarefa.
4. Inventory — quatro categorias de estoque.
5. Needs — fome, sede, descanso e valor associado às necessidades.
6. Building — tipo, estado, progresso e requisito de conclusão.
7. Production — entrada, saída, quantidade de entrada e quantidade de saída.
8. Movement — alvo tridimensional e velocidade.
9. Health — vida atual e máxima.

Os dados são armazenados em TypedArrays contíguos. Position e Velocity podem utilizar diretamente as regiões correspondentes do SharedArrayBuffer da Fase 2.

## ECS

O núcleo em src/core/ecs.js possui:

- EntityRegistry;
- ComponentStore;
- máscaras de componentes em Uint32Array;
- armazenamento por componente;
- consultas por conjunto de componentes;
- criação e destruição;
- reutilização de IDs;
- limpeza de componentes ao destruir uma entidade;
- capacidade máxima configurável.

As consultas percorrem os IDs de forma linear e não criam coleções de entidades a cada tick.

## Mundo

src/core/world.js cria o contexto do mundo e conecta o ECS à memória compartilhada quando ela é fornecida.

O bootstrap inicial cria uma amostra determinística contendo as oito categorias arquiteturais, com dois habitantes para permitir validação populacional.

O mundo também possui:

- contador de tick;
- fila de eventos;
- métricas básicas;
- função de criação de entidades;
- emissão de eventos.

## Sistemas

A Fase 3 implementa os oito sistemas definidos pela arquitetura:

### Population

Conta habitantes por tipo de entidade e sincroniza o total com a região population do SharedArrayBuffer.

### Pathfinding

Estabelece a etapa de direcionamento necessária ao movimento. O Flow Field completo e a atualização espacial avançada permanecem na Fase 6.

### Movement

Calcula velocidade em direção ao alvo e atualiza posição de maneira linear utilizando o delta de tempo.

### Needs

Reduz necessidades ao longo dos ticks, mantém os valores dentro dos limites definidos e afeta a saúde quando necessidades críticas permanecem baixas.

### Economy

Processa a operação econômica básica sobre inventários e tarefas e sincroniza a métrica com a região economy.

### Production

Processa receitas representadas pelo componente Production, consumindo a entrada disponível e adicionando a saída ao inventário.

### Construction

Avança o progresso de construções e emite constructionCompleted quando uma construção alcança seu requisito.

### Logistics

Processa tarefas de transporte simples, atualiza inventários e emite taskCompleted.

## Núcleo de execução

src/systems/simulation-core.js fornece SimulationCore.

A ordem determinística é:

1. Population
2. Pathfinding
3. Movement
4. Needs
5. Economy
6. Production
7. Construction
8. Logistics

Cada chamada a tick incrementa o contador, limpa eventos do tick anterior e executa os sistemas em sequência.

## SharedArrayBuffer

Quando um SimulationCore recebe as views da memória da Fase 2, Position e Velocity utilizam diretamente as regiões compartilhadas.

Isso mantém o ECS compatível com a arquitetura estabelecida anteriormente sem criar um segundo mapa de offsets.

A Fase 3 não altera o layout oficial de dez regiões criado na Fase 2.

## Desempenho

A implementação segue as diretrizes da arquitetura:

- TypedArrays;
- dados contíguos;
- consultas lineares;
- IDs reutilizáveis;
- ausência de criação de arrays de entidades dentro dos loops;
- componentes armazenados por tipo;
- máscaras bitwise para composição de entidades.

O objetivo de 30 ticks/s continua sendo referência de engenharia. Medição detalhada de desempenho pertence às etapas posteriores de validação e profiling.

## Testes

tests/phase3.test.js verifica:

- os nove componentes;
- os oito tipos de entidade;
- máscaras e consultas;
- armazenamento contíguo;
- destruição e reutilização de IDs;
- integração Position/Velocity com SharedArrayBuffer;
- movimento;
- necessidades;
- construção e eventos;
- produção;
- ordem dos sistemas;
- execução do núcleo;
- sincronização populacional;
- limite de capacidade.

scripts/check-ecs.mjs executa uma validação adicional da estrutura e do comportamento básico do núcleo.

## Critério de conclusão

A Fase 3 é considerada concluída quando:

- todas as oito entidades existem;
- todos os nove componentes estão implementados;
- o ECS possui armazenamento orientado a dados;
- as consultas funcionam;
- os oito sistemas existem e executam;
- o núcleo executa ticks determinísticos;
- o estado essencial pode permanecer conectado ao SharedArrayBuffer;
- os testes automatizados passam;
- a validação estrutural passa.

Status: 🟢 Concluída e validada.
