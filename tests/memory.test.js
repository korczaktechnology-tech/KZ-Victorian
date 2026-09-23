import test from "node:test";
import assert from "node:assert/strict";
import { MEMORY, MEMORY_REGION_NAMES, MEMORY_CAPACITIES, createMemoryLayout } from "../src/core/constants.js";
import { createSharedMemory, createMemoryView, validateMemoryLayout } from "../src/core/memory.js";

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
  assert.ok(layout.totalBytes <= MEMORY.INITIAL_BYTES);
});

test("memória padrão cria 64 MiB", () => {
  assert.equal(createSharedMemory().byteLength, 64 * 1024 * 1024);
});

test("tamanho abaixo do layout é rejeitado", () => {
  assert.throws(() => createSharedMemory(MEMORY.LAYOUT.totalBytes - 1), /memória insuficiente/i);
});

test("tamanho inválido é rejeitado", () => {
  assert.throws(() => createSharedMemory(0), /inteiro positivo/i);
  assert.throws(() => createSharedMemory(-1), /inteiro positivo/i);
  assert.throws(() => createSharedMemory(1.5), /inteiro positivo/i);
});

test("views são mapeadas nos offsets centrais", () => {
  const buffer = createSharedMemory();
  const view = createMemoryView(buffer);
  for (const name of MEMORY_REGION_NAMES) {
    const region = view.layout.regions[name];
    assert.equal(view.regions[name].byteOffset, region.offset);
    assert.equal(view.regions[name].length, region.length);
  }
});

test("views compartilham o mesmo SharedArrayBuffer", () => {
  const buffer = createSharedMemory();
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
