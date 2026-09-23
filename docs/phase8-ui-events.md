# Fase 8 — UI e eventos

A Fase 8 implementa a camada de apresentação do WebLords sem mover regras de jogo para o DOM.

## Responsabilidades
- Recursos.
- População.
- Construção e produção.
- Seleção de entidades.
- Menus.
- Mensagens.
- Informações contextuais.
- Entrada do jogador.
- Distribuição de eventos.
- Envio de comandos estruturados ao Worker.

## Fluxo
Main Thread → Input → Simulation Bridge → Worker → validação → alteração do mundo → evento → Bridge → Event Store → UI.

A UI não acessa diretamente o ECS e não executa economia, construção, produção ou logística.

## Eventos
A camada de UI reconhece resourceChanged, populationChanged, constructionStarted, constructionCompleted, taskCreated, taskCompleted, selectionChanged, worldStateChanged, productionCompleted, commandAccepted, commandRejected, taskFailed e navigationUpdated.

## Seleção
O clique do canvas é convertido para coordenadas do mundo e enviado como selection.request. A seleção é resolvida no Worker usando a partição espacial; o resultado retorna como selectionChanged.

## Erros
Falhas de inicialização e falhas de comando são apresentadas por diagnóstico controlado. A UI não assume que o Worker está pronto: comandos são enviados pela Bridge somente depois do handshake de memória.

## Critérios de conclusão
- UI real integrada ao HTML.
- Atualização orientada por eventos.
- Recursos, população, seleção, menus, mensagens e contexto presentes.
- Input conectado ao Worker por comandos.
- Seleção resolvida no Worker.
- Nenhum sistema de jogo depende do DOM.
- Testes automatizados e checker de Fase 8.
