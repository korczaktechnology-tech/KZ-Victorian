import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file) => readFile(resolve(root, file), "utf8");

test("Fase 2 mantém o mapa de memória centralizado", async () => {
  const constants = await read("src/core/constants.js");
  const memory = await read("src/core/memory.js");
  assert.match(constants, /MEMORY_CAPACITIES/);
  assert.match(constants, /MEMORY_REGION_NAMES/);
  assert.match(constants, /createMemoryLayout/);
  assert.match(memory, /createMemoryView/);
  assert.match(memory, /validateMemoryLayout/);
});

test("Fase 2 inicializa memória antes do loop", async () => {
  const bridge = await read("src/core/simulation-bridge.js");
  const simulation = await read("src/systems/simulation.js");
  const worker = await read("src/worker.js");
  assert.match(bridge, /createSharedMemory/);
  assert.match(bridge, /initialize-memory/);
  assert.match(simulation, /memória compartilhada precisa ser inicializada antes/);
  assert.match(worker, /initialize-memory/);
});

test("nenhum sistema declara offsets locais", async () => {
  const files = [
    "src/systems/simulation.js","src/systems/population.js","src/systems/movement.js",
    "src/systems/needs.js","src/systems/economy.js","src/systems/production.js",
    "src/systems/construction.js","src/systems/logistics.js","src/systems/pathfinding.js"
  ];
  for (const file of files) {
    const content = await read(file);
    assert.doesNotMatch(content, /byteOffset\s*=|offset\s*=\s*\d+/);
  }
});
