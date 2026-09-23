# WebLords

## Status geral do projeto

**Estado atual: 🟡 Em andamento**

O WebLords é uma aplicação web de simulação e estratégia em tempo real, planejada para navegador moderno com WebGL 2.0. A arquitetura de referência define uma separação entre **Main Thread**, **Simulation Worker**, **SharedArrayBuffer** e uma simulação orientada a **ECS (Entity Component System)**.

> **Legenda**
>
> 🔴 **Não implementada** — a fase ainda não está implementada no repositório.
>
> 🟡 **Em andamento** — existem trabalhos, preparação ou implementação parcial relacionados à fase.
>
> 🟢 **Concluída** — a fase foi implementada, integrada e validada.

### Estado verificado do repositório

A fundação inicial da aplicação já foi criada no repositório: ponto de entrada HTML, folha de estilos, Main Thread, Simulation Worker, núcleo inicial, estrutura de renderização, sistemas-base e diretórios de suporte. Essa fundação corresponde à **Fase 0** e serve como preparação para a Fase 1.

A Fase 0 não é uma das dez fases funcionais do roadmap principal. Ela existe para estabelecer a base física do projeto sem antecipar as implementações das fases seguintes.

A arquitetura completa estabelece que o WebLords só deve ser considerado concluído quando as dez fases estiverem implementadas, integradas e validadas. [Arquitetura de referência]

---

# Fase 0 — Fundação da aplicação

**Situação: 🟢 Concluída**

A fundação inicial do WebLords foi criada no repositório. Ela estabelece a estrutura física necessária para começar a implementação das dez fases do roadmap sem ainda considerar os sistemas de jogo como concluídos.

### Estrutura criada
- `index.html` — ponto de entrada da aplicação.
- `style.css` — base visual da aplicação.
- `src/main.js` — entrada da Main Thread.
- `src/worker.js` — entrada do Simulation Worker.
- `src/core/` — memória, constantes, entidades, ECS e ponte de simulação.
- `src/systems/` — pontos de entrada dos sistemas de simulação.
- `src/render/` — base do renderer, câmera, shaders, meshes e instâncias.
- `assets/` — diretório reservado para recursos.
- `tests/` — diretório reservado para testes.
- `docs/` — diretório reservado para documentação complementar.
- `scripts/` — diretório reservado para automações auxiliares.

### O que a Fase 0 entrega
- Aplicação com entrada HTML definida.
- Carregamento por ES Modules.
- Canvas preparado para WebGL 2.0.
- Ponte inicial entre Main Thread e Worker.
- Worker capaz de iniciar e interromper um loop de simulação.
- Ferramentas locais de teste e validação.
- Servidor de desenvolvimento sem dependências externas.
- Testes automatizados do núcleo da fundação.
- GitHub Actions para validação automática em push e pull request.
- Núcleo inicial preparado para receber SharedArrayBuffer, ECS e sistemas futuros.
- Estrutura de pastas alinhada à arquitetura de referência.

> A Fase 0 cria a fundação. Ela não significa que as funcionalidades das Fases 1–10 já estejam implementadas.

---

# Roadmap de implementação

## 🟢 Fase 1 — Estrutura e pipeline

**Situação: 🟢 Concluída**

Objetivo: estabelecer a estrutura física e o pipeline básico do projeto.

### Deve conter
- index.html como ponto de entrada.
- style.css para a interface.
- src/main.js para a Main Thread.
- src/worker.js para o Simulation Worker.
- src/core/ para a infraestrutura de dados.
- src/systems/ para as regras de simulação.
- src/render/ para as responsabilidades gráficas.
- assets/ separado do código.
- tests/ para testes.
- docs/ para documentação.
- scripts/ para automações auxiliares.
- Uso de ES Modules durante o desenvolvimento.
- Separação entre interface e regras da simulação.

A arquitetura especifica que nenhum sistema de jogo deve depender diretamente do DOM.

## 🟢 Fase 2 — Bootstrapping e memória

**Situação: 🟢 Concluída**

Objetivo: criar e organizar a memória compartilhada utilizada pela simulação.

### Deve conter
- Inicialização do SharedArrayBuffer.
- Capacidade inicial de referência de 64 MB, configurável.
- constants.js centralizando offsets e capacidades.
- Mapeamento dos TypedArrays.
- Regiões de memória documentadas.
- Validação do tamanho total antes da inicialização.
- Tratamento claro para navegadores sem suporte ao SharedArrayBuffer.

O mapa de memória previsto inclui posições, velocidades, estados, população, terreno, recursos, construções, economia, logística e navegação/Flow Field.

## 🟢 Fase 3 — ECS e núcleo da simulação

**Situação: 🟢 Concluída**

Objetivo: construir o núcleo de dados e regras que representam o mundo.

### Entidades iniciais
- Habitante
- Árvore
- Casa
- Armazém
- Serraria
- Estrada
- Recurso
- Animal

### Componentes
- Position
- Velocity
- Job
- Inventory
- Needs
- Building
- Production
- Movement
- Health

### Sistemas
- Population
- Movement
- Needs
- Economy
- Production
- Construction
- Logistics
- Pathfinding

A implementação utiliza armazenamento contíguo com TypedArrays, máscaras de componentes, IDs reutilizáveis, consultas lineares e integração das posições/velocidades com as regiões correspondentes do SharedArrayBuffer. O núcleo executa os oito sistemas definidos na ordem arquitetural, sem introduzir dependência do DOM.

## 🟢 Fase 4 — Simulation Worker

**Situação: 🟢 Concluída**

Objetivo: transferir o processamento pesado do mundo para o Worker.

### Deve executar
- Inicialização dos sistemas.
- População.
- Movimento.
- Necessidades.
- Economia.
- Produção.
- Tarefas.
- Construção.
- Navegação.
- Atualização do SharedArrayBuffer.
- Emissão de eventos relevantes.

A referência arquitetural utiliza 30 ticks por segundo, mas essa frequência é uma referência de engenharia e deverá ser medida na prática.

## 🟢 Fase 5 — WebGL 2.0

**Situação: 🟢 Concluída**

Objetivo: criar o sistema de renderização gráfica.

### Deve conter
- Contexto WebGL 2.0.
- Shaders.
- VBOs.
- Índices.
- Buffers de instância.
- Câmera.
- Matrizes.
- Instanced Rendering.
- Culling quando houver benefício mensurável.
- Medição de draw calls.
- Medição do tempo de GPU.

A renderização deve permanecer independente da execução das regras econômicas e da simulação populacional.

## 🟢 Fase 6 — Mapa e Flow Field

**Situação: 🟢 Concluída**

Objetivo: criar o sistema espacial utilizado pelo mundo e pela navegação.

### Deve conter
- Grade de terreno.
- Representação de navegabilidade.
- Células livres.
- Obstáculos.
- Estradas.
- Custos especiais.
- Flow Fields por destino ou grupo.
- Consulta de direção por célula.
- Atualização das regiões afetadas por construções.
- Grid Spatial Partitioning para buscas espaciais.

A construção de estradas deve alterar a navegação do mundo.

## 🔴 Fase 7 — Construção, economia e logística

**Situação: 🔴 Não implementada**

Objetivo: conectar as ações do jogador aos sistemas econômicos e logísticos do mundo.

### Construção
- Receber input da Main Thread.
- Enviar comando ao Worker.
- Validar o comando.
- Alterar o mundo somente após validação.
- Atualizar a navegação quando necessário.

### Economia
- Estoques.
- Produção.
- Consumo.
- Transferências.

### Logística
- Armazéns gerando pedidos.
- Busca de agentes disponíveis próximos.
- Transporte.
- Entrega.
- Atualização de estoques.
- Atualização de tarefas.

A cadeia prevista é: **Jogador → Input → Main Thread → Comando → Worker → Validação → Alteração do mundo → Atualização da navegação → Evento → UI.**

## 🔴 Fase 8 — UI e eventos

**Situação: 🔴 Não implementada**

Objetivo: construir a interface que apresenta o estado do mundo sem incorporar as regras da simulação.

### Interface prevista
- Recursos.
- População.
- Construção.
- Seleção.
- Menus.
- Mensagens.
- Informações contextuais.

### Eventos previstos
- resourceChanged
- populationChanged
- constructionCompleted
- taskCreated
- taskCompleted
- selectionChanged
- worldStateChanged

A UI deve reagir a eventos relevantes, evitando polling agressivo da memória compartilhada.

## 🔴 Fase 9 — Assets e memória

**Situação: 🔴 Não implementada**

Objetivo: organizar, otimizar e carregar os recursos gráficos e sonoros.

### Formatos previstos
- Modelos: GLB.
- Texturas: KTX2 quando suportado.
- Áudio: OGG quando adequado.
- Meshopt ou Draco quando aplicável.

### Estratégia de carregamento
- Assets essenciais primeiro.
- Conteúdo adicional sob demanda.
- Cache controlado.
- Descarregamento de conteúdo quando necessário.
- Medição de RAM.
- Medição de VRAM.

A arquitetura define 15 MB como meta de otimização, e não como garantia fixa.

## 🔴 Fase 10 — Produção, isolamento e deploy

**Situação: 🔴 Não implementada**

Objetivo: preparar o projeto para execução em produção.

### Deve conter
- Execução dos testes antes do build.
- Minificação do JavaScript.
- Otimização dos assets.
- Geração da versão de produção.
- Ambiente compatível com SharedArrayBuffer.
- HTTPS.
- Cross-Origin-Opener-Policy: same-origin.
- Cross-Origin-Embedder-Policy: require-corp.
- Verificação de recursos externos.
- Teste da versão publicada em navegador real.

---

# Testes e validação

**Situação geral: 🔴 Não implementada**

Os testes fazem parte da conclusão do projeto e devem abranger:

### Testes unitários
- Memória
- ECS
- Economia
- Pathfinding
- Logística
- Construção
- Utilitários

### Testes de integração
- Main Thread ↔ Worker
- Worker ↔ SharedArrayBuffer
- UI ↔ Eventos
- Input ↔ Comandos
- Renderer ↔ Estado

### Testes de desempenho
- FPS
- Tempo por tick
- CPU
- RAM
- VRAM
- Tempo de carregamento
- Quantidade de entidades

### Compatibilidade
- Chrome
- Edge
- Firefox, quando compatível
- Safari, quando compatível

---

# Critérios de desempenho

| Métrica | Referência |
|---|---:|
| Renderização | 60 FPS |
| Simulação | 30 ticks/s |
| Memória | Orçamento definido |
| Carregamento | O menor possível |

Os valores devem ser medidos com ferramentas de profiling e ajustados conforme os resultados reais.

---

# Critérios de conclusão

O WebLords **não deve ser marcado como concluído apenas porque o código foi criado**.

Para uma fase receber 🟢, ela deverá estar:

1. Implementada.
2. Integrada aos sistemas relacionados.
3. Testada.
4. Validada no ambiente correspondente.
5. Sem erros críticos conhecidos que impeçam seu funcionamento.

O projeto completo somente será considerado concluído quando as **dez fases** estiverem implementadas, integradas e validadas.

---

# Progresso atual

| Fase | Status |
|---|:---:|
| 1. Estrutura e pipeline | 🟢 |
| 2. Bootstrapping e memória | 🟢 |
| 3. ECS e núcleo da simulação | 🟢 |
| 4. Simulation Worker | 🟢 |
| 5. WebGL 2.0 | 🟢 |
| 6. Mapa e Flow Field | 🟢 |
| 7. Construção, economia e logística | 🟢 |
| 8. UI e eventos | 🔴 |
| 9. Assets e memória | 🔴 |
| 10. Produção, isolamento e deploy | 🔴 |

**Progresso das dez fases principais: 8/10 concluídas.**
**Fase 0 — Fundação: 🟢 concluída e validada pelo CI.**  
**Fase 1 — Estrutura e pipeline: 🟢 concluída e validada pelo CI.**  
**Fase 2 — Bootstrapping e memória: 🟢 concluída e validada pelo CI.**  
**Fase 3 — ECS e núcleo da simulação: 🟢 concluída e validada pelo CI.**  
**Fase 4 — Simulation Worker: 🟢 concluída e validada pelo CI.**

> A documentação arquitetural já está definida, mas documentação não é contabilizada como implementação. O status acima reflete o estado efetivamente encontrado no repositório no momento desta atualização.

---

# Ordem oficial de execução

1. 🟢 Estrutura e pipeline
2. 🟢 Bootstrapping e memória
3. 🟢 ECS e núcleo da simulação
4. 🟢 Simulation Worker
5. 🟢 WebGL 2.0
6. 🟢 Mapa e Flow Field
7. 🟢 Construção, economia e logística
8. 🔴 UI e eventos
9. 🔴 Assets e memória
10. 🔴 Produção, isolamento e deploy

Essa ordem segue o roadmap definido na arquitetura do projeto.

---

# Atualização do status

Este README deve ser atualizado conforme o desenvolvimento avançar:

- 🔴 → 🟡 quando a implementação da fase começar.
- 🟡 → 🟢 somente após implementação, integração e validação.


### Validação da Fase 7

A Fase 7 possui validação automatizada para confirmar:

- Construção condicionada à célula válida e ao estoque disponível.
- Consumo de materiais de construção a partir do armazém.
- Atualização da navegabilidade e reconstrução do Flow Field.
- Estoques de madeira, tábuas, comida e pedra.
- Transferências de inventário com validação de saldo.
- Receitas de produção e conversão de insumos em produtos.
- Tarefas logísticas com origem, destino, recurso e quantidade.
- Ciclo de tarefa ASSIGNED → READY → COMPLETED → IDLE.
- Eventos de estoque, construção, produção e logística.
- Comandos Main Thread → Worker → validação do mundo.
- Comandos aceitos e rejeitados sem alteração indevida do estado.
- Regiões economy e logistics do SharedArrayBuffer.
- Testes automatizados e verificador estrutural específico da fase.

A Fase 7 é considerada concluída após a execução bem-sucedida do GitHub Actions no commit correspondente.
\n### Validação da Fase 6

A Fase 6 possui validação automatizada para confirmar:

- Grade de terreno com indexação linear e conversão entre índice e coordenadas.
- Células livres, obstáculos, água, estradas e custos de deslocamento.
- Uso das regiões terrain e navigation do SharedArrayBuffer.
- Flow Fields com um ou múltiplos destinos.
- Cálculo de custo acumulado e direção por célula.
- Navegação diagonal com prevenção de corte por cantos bloqueados.
- Reconstrução do Flow Field após alteração do mapa.
- Spatial Partition para inserção, reconstrução, consulta por célula e consulta por raio.
- Integração de construções e estradas com a navegabilidade do mundo.
- Consulta do Flow Field pelo sistema Pathfinding.
- Atualização da navegação dentro do ciclo do SimulationCore.
- Testes automatizados e verificação estrutural específica da fase.

A Fase 6 é considerada concluída após a execução bem-sucedida do GitHub Actions no commit correspondente.

### Validação da Fase 5

A Fase 5 possui validação automatizada para confirmar:

- Contexto WebGL 2.0 obrigatório.
- Shaders em GLSL ES 3.00.
- Compilação e linkedição de shaders com diagnóstico de erro.
- VBO de geometria e buffer de índices.
- VAO e atributos de vértice.
- Câmera com matriz de transformação e zoom.
- Buffer de instâncias com atributos por instância.
- `vertexAttribDivisor` para instanced rendering.
- `drawElementsInstanced` para renderização de múltiplos objetos em uma chamada.
- Integração do renderer à Main Thread.
- Contagem de draw calls do renderer.
- Testes automatizados dos componentes gráficos e verificação estrutural.

A Fase 5 é considerada concluída após a execução bem-sucedida do GitHub Actions no commit correspondente.

### Validação da Fase 4

A Fase 4 possui validação automatizada para confirmar:

- Inicialização do `SimulationCore` dentro do Simulation Worker.
- Inicialização da memória compartilhada antes do loop.
- Execução da simulação com referência de 30 ticks/s.
- Loop temporal com acumulador, timestep fixo e limite de catch-up.
- Atualização atômica do tick no SharedArrayBuffer.
- Processamento dos oito sistemas do núcleo da simulação dentro do Worker.
- Canal de comandos Main Thread → Worker com processamento no limite do tick.
- Emissão de snapshots e eventos Worker → Main Thread.
- Tratamento de reset e erros do Worker.
- Testes automatizados e verificação estrutural específica da fase.

A Fase 4 é considerada concluída após a execução bem-sucedida do GitHub Actions no commit correspondente.

### Validação da Fase 3

A Fase 3 possui validação automatizada para confirmar:

- As oito entidades iniciais previstas pela arquitetura.
- Os nove componentes: Position, Velocity, Job, Inventory, Needs, Building, Production, Movement e Health.
- ECS orientado a dados com TypedArrays contíguos.
- Máscaras de componentes e consultas lineares.
- Criação, destruição e reutilização de IDs.
- Posições e velocidades vinculadas ao SharedArrayBuffer existente.
- Implementação dos oito sistemas previstos para a fase.
- Ordem determinística dos sistemas no núcleo da simulação.
- Execução de tick e atualização de métricas.
- Eventos de construção e tarefas.
- Validação específica pelo `check-ecs` e testes automatizados.

### Validação da Fase 2

A Fase 2 possui validação automatizada para confirmar:

- Criação do SharedArrayBuffer com capacidade inicial de 64 MiB.
- Layout centralizado em constants.js.
- As dez regiões previstas pela arquitetura.
- Offsets calculados em um único ponto.
- Ausência de sobreposição entre regiões.
- Mapeamento das regiões em Float32Array, Int32Array e Uint8Array.
- Validação de tamanho antes do uso.
- Erros claros para memória insuficiente e ambiente sem SharedArrayBuffer.
- Inicialização da memória antes do início do loop de simulação.
- Compartilhamento do mesmo buffer entre Main Thread e Worker.
- Documentação do mapa de memória em docs/memory-layout.md.

A execução do GitHub Actions no commit de conclusão da Fase 2 deve terminar com sucesso, confirmando a validação automatizada da fase.

### Validação da Fase 1

A Fase 1 possui validação automatizada para confirmar:

- Estrutura física exigida pela arquitetura.
- Entrada HTML por ES Module.
- Fluxo `index.html → Main Thread → Renderer + Simulation Bridge → Worker → Simulation`.
- Separação entre interface/renderização e regras da simulação.
- Ausência de dependências diretas do DOM nas camadas de simulação.
- Tratamento de `start` e `stop` no Worker.
- Sintaxe de todos os módulos JavaScript da fundação.
- Testes unitários e testes específicos do pipeline.

A execução do GitHub Actions no commit de conclusão da Fase 1 terminou com **sucesso**, confirmando a validação automatizada da fase.
- 🟡 → 🔴 caso uma implementação seja abandonada ou removida.
- Uma fase não deve ser marcada como 🟢 apenas porque parte de seus componentes existe.

**Última revisão:** Setembro de 2026  
**Projeto:** WebLords  
**Arquitetura de referência:** WebLords — Arquitetura Completa de Software, Engenharia e Implementação — versão 1.0.