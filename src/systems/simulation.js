import { SIMULATION } from "../core/constants.js";

export class Simulation {
  #running = false;
  #timer = null;
  #tick = 0;

  start() {
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
    if (!this.#running) return;
    this.#tick += 1;
    self.postMessage({
      type: "snapshot",
      payload: { tick: this.#tick }
    });
  }

  handleCommand(command) {
    // A fila de comandos será expandida nas fases seguintes.
    if (command?.type === "reset") this.#tick = 0;
  }
}
