import test from "node:test";
import assert from "node:assert/strict";
import { Simulation } from "../src/systems/simulation.js";

test("Simulation só inicia após a memória local do Worker ser inicializada", () => {
  const simulation = new Simulation();
  assert.throws(() => simulation.start(), /memória local precisa ser inicializada/i);
});

test("Simulation inicializa e publica snapshot com buffer transferível", () => {
  const previousSelf = globalThis.self;
  const messages = [];
  globalThis.self = { postMessage(message) { messages.push(message); } };
  try {
    const simulation = new Simulation();
    simulation.initializeMemory();
    simulation.step();
    simulation.stop();
    const snapshot = messages.find(message => message.type === "snapshot");
    assert.ok(snapshot);
    assert.ok(snapshot.payload.tick >= 1);
    assert.ok(snapshot.payload.positions instanceof ArrayBuffer);
  } finally {
    globalThis.self = previousSelf;
  }
});
