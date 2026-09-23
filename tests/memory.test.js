import test from "node:test";
import assert from "node:assert/strict";
import { MEMORY, MEMORY_REGION_NAMES, MEMORY_CAPACITIES, createMemoryLayout } from "../src/core/constants.js";
import { createLocalMemory, createMemoryView, validateMemoryLayout } from "../src/core/memory.js";

test("layout possui as dez regiões previstas pela arquitetura", () => {
  const layout = createMemoryLayout();
  assert.deepEqual(Object.keys(layout.regions), MEMORY_REGION_NAMES);
  assert.equal(layout.totalBytes, MEMORY.LAYOUT.totalBytes);
});

test("layout não possui regiões sobrepostas", () => {
  const layout = createMemoryLayout();
  let previousEnd = 0;
  for (const name of MEMORY_REGION_NAMES) {
    const region = layout.regions[name];
    assert.ok(region.offset >= previousEnd, `sobreposição em ${name}`);
    assert.equal(region.end, region.offset + region.byteLength);
    previousEnd = region.end;
  }
  assert.ok(layout.totalBytes >= previousEnd);
});

test("memória padrão cria um ArrayBuffer local", () => {
  const buffer = createLocalMemory();
  assert.equal(buffer.byteLength, MEMORY.INITIAL_BYTES);
  assert.equal(buffer.constructor.name, "ArrayBuffer");
});

test("tamanho abaixo do layout é rejeitado", () => {
  assert.throws(() => createLocalMemory(MEMORY.LAYOUT.totalBytes - 1), /memória insuficiente/i);
});

test("tamanho inválido é rejeitado", () => {
  assert.throws(() => createLocalMemory(0), /inteiro positivo/i);
  assert.throws(() => createLocalMemory(-1), /inteiro positivo/i);
  assert.throws(() => createLocalMemory(1.5), /inteiro positivo/i);
});

test("views são mapeadas nos offsets centrais", () => {
  const buffer = createLocalMemory();
  const view = createMemoryView(buffer);
  for (const name of MEMORY_REGION_NAMES) {
    const region = view.layout.regions[name];
    assert.equal(view.regions[name].byteOffset, region.offset);
    assert.equal(view.regions[name].length, region.length);
  }
});

test("views usam o mesmo buffer local", () => {
  const buffer = createLocalMemory();
  const view = createMemoryView(buffer);
  view.regions.states[0] = 1234;
  assert.equal(new Int32Array(buffer, view.layout.regions.states.offset, 1)[0], 1234);
});

test("capacidades são positivas e centralizadas", () => {
  for (const [name, capacity] of Object.entries(MEMORY_CAPACITIES)) {
    assert.ok(Number.isInteger(capacity) && capacity > 0, name);
  }
});

test("validador aceita o layout oficial e rejeita memória insuficiente", () => {
  assert.equal(validateMemoryLayout(), true);
  assert.throws(() => validateMemoryLayout(MEMORY.LAYOUT, MEMORY.LAYOUT.totalBytes - 1), /tamanho insuficiente/i);
});
