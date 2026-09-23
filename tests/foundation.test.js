import test from "node:test";
import assert from "node:assert/strict";
import { createLocalMemory, createMemoryView } from "../src/core/memory.js";
import { EntityRegistry } from "../src/core/ecs.js";
import { MEMORY, SIMULATION } from "../src/core/constants.js";

test("memória local é criada com o tamanho inicial configurado", () => {
  const buffer = createLocalMemory();
  assert.ok(buffer instanceof ArrayBuffer);
  assert.equal(buffer.byteLength, MEMORY.INITIAL_BYTES);
});

test("createMemoryView cria visões tipadas sobre a memória local", () => {
  const buffer = createLocalMemory();
  const view = createMemoryView(buffer);
  assert.equal(view.buffer, buffer);
  assert.ok(view.regions.positions instanceof Float32Array);
  assert.ok(view.regions.states instanceof Int32Array);
  assert.ok(view.regions.terrain instanceof Uint8Array);
});

test("createLocalMemory rejeita tamanho inválido", () => {
  assert.throws(() => createLocalMemory(0), RangeError);
  assert.throws(() => createLocalMemory(-1), RangeError);
  assert.throws(() => createLocalMemory(1.5), RangeError);
});

test("createMemoryView rejeita buffers pequenos", () => {
  assert.throws(() => createMemoryView(new ArrayBuffer(64)), RangeError);
});

test("EntityRegistry cria, consulta e remove entidades", () => {
  const registry = new EntityRegistry();
  const first = registry.create();
  const second = registry.create();
  assert.equal(first, 1);
  assert.equal(second, 2);
  assert.equal(registry.size, 2);
  assert.equal(registry.has(first), true);
  assert.equal(registry.destroy(first), true);
  assert.equal(registry.has(first), false);
  assert.equal(registry.size, 1);
  assert.equal(registry.destroy(first), false);
});

test("a frequência de simulação de fundação permanece em 30 ticks/s", () => {
  assert.equal(SIMULATION.TARGET_TICKS_PER_SECOND, 30);
  assert.equal(SIMULATION.TICK_INTERVAL_MS, 1000 / 30);
});
