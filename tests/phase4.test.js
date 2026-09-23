import test from "node:test";
import assert from "node:assert/strict";

const workerMessages = [];
globalThis.self = { postMessage(message) { workerMessages.push(message); } };

const { Simulation } = await import("../src/systems/simulation.js");
const { createSharedMemory, createMemoryView } = await import("../src/core/memory.js");
const { MEMORY } = await import("../src/core/constants.js");

function createSimulation() {
  workerMessages.length = 0;
  const simulation = new Simulation();
  const buffer = createSharedMemory(MEMORY.INITIAL_BYTES);
  const view = createMemoryView(buffer);
  simulation.initializeMemory(buffer, view.layout);
  return { simulation, view };
}

test("Fase 4: Simulation cria o SimulationCore no Worker", () => {
  const { simulation } = createSimulation();
  assert.ok(simulation.core);
  assert.equal(simulation.core.world.entities.size, 9);
});

test("Fase 4: um passo executa o núcleo e atualiza o SharedArrayBuffer", () => {
  const { simulation, view } = createSimulation();
  const result = simulation.step();
  assert.equal(result.tick, 1);
  assert.equal(Atomics.load(view.regions.states, 0), 1);
  assert.equal(result.metrics.population, 2);
});

test("Fase 4: comandos são aplicados no limite de um tick e geram evento", () => {
  const { simulation } = createSimulation();
  simulation.handleCommand({ type: "build", payload: { x: 4, y: 0 } });
  const result = simulation.step();
  assert.equal(result.events[0]?.type, "commandReceived");
  assert.equal(result.events[0]?.payload.type, "build");
});

test("Fase 4: reset retorna o estado compartilhado para o tick zero", () => {
  const { simulation, view } = createSimulation();
  simulation.step();
  simulation.handleCommand({ type: "reset" });
  assert.equal(Atomics.load(view.regions.states, 0), 0);
  assert.ok(workerMessages.some((message) => message.type === "simulation-reset"));
});

test("Fase 4: passo manual não deixa o loop rodando", () => {
  const { simulation } = createSimulation();
  simulation.step();
  assert.equal(simulation.running, false);
});
