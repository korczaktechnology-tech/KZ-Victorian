# WebLords — Fase 7: Construção, Economia e Logística

A Fase 7 conecta ações do jogador ao estado econômico e operacional do mundo.

## Construção
A construção recebe um comando, valida tipo, posição e navegabilidade, localiza o estoque de materiais de um armazém e só cria a entidade quando madeira e pedra estão disponíveis. O estoque é debitado e eventos de alteração são emitidos. A célula passa a ser obstáculo e o Flow Field é reconstruído quando necessário.

## Economia
A economia mantém quatro recursos básicos: madeira, tábuas, comida e pedra. Transferências verificam entidades, componentes, recurso, quantidade e saldo antes de movimentar estoque. Cada alteração produz inventoryChanged para permitir que a camada de interface reaja sem polling agressivo.

## Produção
Receitas são declaradas em uma tabela. A receita inicial da serraria converte madeira em tábuas. O sistema verifica os componentes e saldo, consome a entrada e produz a saída, emitindo productionCompleted.

## Logística
Uma tarefa possui trabalhador, origem, destino, recurso e quantidade. O trabalhador precisa estar livre e a origem precisa possuir o material. O ciclo passa por ASSIGNED → READY → COMPLETED → IDLE; no estágio READY o transporte é efetivado. Eventos taskCreated, taskReady, taskTransported, taskCompleted e taskFailed tornam o processo observável.

## Comandos
A Main Thread envia comandos ao Worker pela Simulation Bridge. O Worker mantém a fila até a fronteira de um tick e o núcleo valida a operação. Comandos aceitos geram commandAccepted; rejeitados geram commandRejected. A simulação permanece isolada do DOM.

## SharedArrayBuffer
Os contadores de economia e logística continuam publicados nas regiões economy e logistics da memória compartilhada. Posições, estados e demais regiões seguem a arquitetura das fases anteriores.

## Critério
A fase só deve permanecer verde quando o verificador específico e a suíte completa de testes terminarem sem falhas.
