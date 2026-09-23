import { SIMULATION } from "../core/constants.js";
import { createMemoryView } from "../core/memory.js";

export class Simulation {
  #running = false;
  #timer = null;
  #tick = 0;
  #memory = null;

  initializeMemory(buffer, layout) {
    this.#memory = createMemoryView(buffer, layout);
    Atomics.store(this.#memory.regions.states, 0, 0);
    return this.#memory;
  }

  get memory() {
    return this.#memory;
  }

  start() {
    if (!this.#memory) {
      throw new Error("WebLords: a memória compartilhada precisa ser inicializada antes da simulação.");
    }
    if (this.#running) return;

    this.#running = true;
    this.#timer = setInterval(() => this.tick(), SIMULATION.TICK_INTERVAL_MS);
  }

  stop() {
    this.#running = false;
    if (this.#timer !== null) clearInterval(this.#timer);
    this.#timer = null;
  }

  tick() {
    if (!this.#running || !this.#memory) return;
    this.#tick += 1;
    Atomics.store(this.#memory.regions.states, 0, this.#tick);
    self.postMessage({ type: "snapshot", payload: { tick: this.#tick } });
  }

  handleCommand(command) {
    if (command?.type === "reset") {
      this.#tick = 0;
      if (this.#memory) Atomics.store(this.#memory.regions.states, 0, 0);
    }
  }
}
