import { SIMULATION } from "../core/constants.js";
import { createMemoryView } from "../core/memory.js";
import { SimulationCore } from "./simulation-core.js";

export class Simulation {
  #running = false;
  #timer = null;
  #lastTime = 0;
  #accumulator = 0;
  #memory = null;
  #core = null;
  #commandQueue = [];
  #tickInterval = SIMULATION.TICK_INTERVAL_MS;
  #maxCatchUpSteps = 5;

  initializeMemory(buffer, layout) {
    this.stop();
    this.#memory = createMemoryView(buffer, layout);
    this.#core = new SimulationCore(this.#memory);
    Atomics.store(this.#memory.regions.states, 0, 0);
    this.#lastTime = 0;
    this.#accumulator = 0;
    return this.#memory;
  }

  get memory() { return this.#memory; }
  get core() { return this.#core; }
  get running() { return this.#running; }

  start() {
    if (!this.#memory || !this.#core) {
      throw new Error("WebLords: a memória compartilhada precisa ser inicializada antes da simulação.");
    }
    if (this.#running) return;
    this.#running = true;
    this.#lastTime = performance.now();
    this.#accumulator = 0;
    self.postMessage({ type: "simulation-started", payload: { tickRate: SIMULATION.TARGET_TICKS_PER_SECOND } });
    this.#scheduleNext();
  }

  stop() {
    this.#running = false;
    if (this.#timer !== null) clearTimeout(this.#timer);
    this.#timer = null;
    this.#lastTime = 0;
    this.#accumulator = 0;
  }

  #scheduleNext() {
    if (!this.#running) return;

    const now = performance.now();
    const elapsed = Math.max(0, Math.min(now - this.#lastTime, this.#tickInterval * this.#maxCatchUpSteps));
    this.#lastTime = now;
    this.#accumulator += elapsed;

    let steps = 0;
    while (this.#accumulator >= this.#tickInterval && steps < this.#maxCatchUpSteps) {
      this.#accumulator -= this.#tickInterval;
      this.tick(this.#tickInterval / 1000);
      steps += 1;
    }

    const delay = Math.max(0, this.#tickInterval - this.#accumulator);
    this.#timer = setTimeout(() => this.#scheduleNext(), delay);
  }

  tick(deltaSeconds = this.#tickInterval / 1000) {
    if (!this.#running || !this.#core) return null;

    const result = this.#core.tick(deltaSeconds);
    this.#applyQueuedCommands(result.events);
    Atomics.store(this.#memory.regions.states, 0, result.tick);

    const snapshot = {
      tick: result.tick,
      metrics: { ...result.metrics },
      events: result.events.slice()
    };

    self.postMessage({ type: "snapshot", payload: snapshot });
    if (result.events.length > 0) {
      self.postMessage({ type: "events", payload: result.events.slice() });
    }
    return result;
  }

  step(deltaSeconds = this.#tickInterval / 1000) {
    if (!this.#memory || !this.#core) {
      throw new Error("WebLords: a simulação precisa ser inicializada antes de executar um passo.");
    }
    const wasRunning = this.#running;
    if (!wasRunning) this.#running = true;
    const result = this.tick(deltaSeconds);
    this.#running = wasRunning;
    return result;
  }

  handleCommand(command) {
    if (!command || typeof command.type !== "string") return;

    if (command.type === "reset") {
      this.#commandQueue.length = 0;
      if (this.#core) {
        this.#core.world.tick = 0;
        this.#core.world.events.length = 0;
        this.#core.world.metrics.population = 0;
        Atomics.store(this.#memory.regions.states, 0, 0);
        self.postMessage({ type: "simulation-reset" });
      }
      return;
    }

    this.#commandQueue.push(command);
  }

  #applyQueuedCommands(events) {
    if (this.#commandQueue.length === 0) return;
    const commands = this.#commandQueue.splice(0);
    for (const command of commands) {
      events.push({
        type: "commandReceived",
        payload: { type: command.type, payload: command.payload ?? null }
      });
    }
  }
}
