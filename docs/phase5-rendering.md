# Fase 5 — WebGL 2.0 e renderização

## Objetivo
Implementar a camada gráfica da aplicação sem misturar renderização com as regras do mundo. A Main Thread possui o renderer; o Simulation Worker permanece responsável pela simulação.

## Pipeline
1. A Main Thread obtém um contexto WebGL 2.0.
2. Os shaders GLSL ES 3.00 são compilados e vinculados.
3. A geometria é enviada para VBO e índice.
4. Um VAO registra os atributos.
5. Posições e escala são enviadas em buffer de instâncias.
6. A câmera gera a matriz de transformação.
7. O renderer faz culling pelo volume visível antes do upload das instâncias.
8. Objetos visíveis são desenhados com `drawElementsInstanced`, reduzindo draw calls.
9. O renderer mede draw calls, quantidade visível e quantidade removida pelo culling.
10. Quando disponível, `EXT_disjoint_timer_query_webgl2` mede o tempo real da GPU de cada frame de renderização.

## Culling
O culling é executado no espaço da câmera. Apenas posições dentro do retângulo visível são enviadas ao InstanceBuffer. O renderer informa `visibleInstances` e `culledInstances` para permitir medição objetiva do benefício.

## GPU timing
O projeto não assume que todo navegador possua a extensão de timer. O profiler detecta `EXT_disjoint_timer_query_webgl2` e, quando disponível, mede `TIME_ELAPSED_EXT`, ignorando resultados marcados como GPU-disjoint. Quando indisponível, o estado permanece explicitamente `false`.

## Recursos implementados
- Contexto WebGL 2.0.
- GLSL ES 3.00.
- Compilação e linkedição com diagnóstico.
- VBO.
- Índices.
- VAO.
- Atributos de vértice.
- Câmera e matriz.
- Instanced rendering.
- Culling.
- Draw-call counter.
- GPU timer query.
- Integração à Main Thread.
- Profiling CPU complementar.

## Limites
A fase implementa a infraestrutura gráfica. O mapa visual completo, terrenos e representação especializada das entidades continuam pertencendo às fases posteriores. A validação automatizada comprova a estrutura e os contratos; o teste de GPU depende de um navegador/dispositivo que exponha WebGL 2.0 e a extensão de timer.
