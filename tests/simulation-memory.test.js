import test from "node:test";
import assert from "node:assert/strict";
import { Simulation } from "../src/systems/simulation.js";
import { createSharedMemory } from "../src/core/memory.js";
import { MEMORY } from "../src/core/constants.js";

test("Simulation só inicia após memória compartilhada ser inicializada", () => {
  const simulation = new Simulation();
  assert.throws(() => simulation.start(), /memória compartilhada precisa ser inicializada/i);
});

test("Simulation inicializa e escreve o tick na memória compartilhada", async () => {
  const previousSelf = globalThis.self;
  const messages = [];
  globalThis.self = { postMessage(message) { messages.push(message); } };

  try {
    const simulation = new Simulation();
    const buffer = createSharedMemory(MEMORY.INITIAL_BYTES);
    simulation.initializeMemory(buffer, MEMORY.LAYOUT);
    simulation.step();
    simulation.stop();

    const snapshot = messages.find((message) => message.type === "snapshot");
    assert.ok(snapshot);
    assert.ok(snapshot.payload.tick >= 1);
    assert.equal(
      new Int32Array(buffer, MEMORY.LAYOUT.regions.states.offset, 1)[0],
      snapshot.payload.tick
    );
  } finally {
    globalThis.self = previousSelf;
  }
});
