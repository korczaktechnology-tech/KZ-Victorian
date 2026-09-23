import { SIMULATION, MEMORY } from "./constants.js";
import { createMemoryView, createSharedMemory } from "./memory.js";

export function createSimulationBridge() {
  let worker = null;
  let running = false;
  let ready = false;
  let snapshot = Object.freeze({ tick: 0, metrics: {}, events: [] });
  let sharedMemory = null;
  let memoryView = null;
  const eventListeners = new Set();
  const stateListeners = new Set();

  function emit(listeners, payload) {
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch (error) {
        console.error("WebLords: erro em listener da Simulation Bridge.", error);
      }
    }
  }

  return {
    start() {
      if (running) return;

      sharedMemory = createSharedMemory(MEMORY.INITIAL_BYTES);
      memoryView = createMemoryView(sharedMemory);
      worker = new Worker(new URL("../worker.js", import.meta.url), { type: "module" });

      worker.onmessage = ({ data }) => {
        if (!data || typeof data.type !== "string") return;

        if (data.type === "memory-ready") {
          ready = true;
          worker.postMessage({ type: "start" });
          return;
        }

        if (data.type === "snapshot") {
          snapshot = Object.freeze({
            tick: data.payload?.tick ?? 0,
            metrics: data.payload?.metrics ?? {},
            events: data.payload?.events ?? []
          });
          emit(stateListeners, snapshot);
          return;
        }

        if (data.type === "events") {
          emit(eventListeners, data.payload ?? []);
          return;
        }

        if (data.type === "simulation-stopped") {
          running = false;
          return;
        }

        if (data.type === "simulation-started") {
          running = true;
        }
      };

      worker.onerror = (event) => {
        console.error("WebLords: erro no Simulation Worker.", event.error || event.message);
        running = false;
      };

      worker.onmessageerror = (event) => {
        console.error("WebLords: mensagem inválida recebida do Simulation Worker.", event);
        running = false;
      };

      worker.postMessage({
        type: "initialize-memory",
        buffer: sharedMemory,
        layout: memoryView.layout
      });

      running = true;
    },

    stop() {
      if (!worker) return;
      worker.postMessage({ type: "stop" });
      worker.terminate();
      worker = null;
      running = false;
      ready = false;
      sharedMemory = null;
      memoryView = null;
      snapshot = Object.freeze({ tick: 0, metrics: {}, events: [] });
    },

    sendCommand(type, payload = null) {
      if (!worker || !ready) {
        throw new Error("WebLords: Simulation Worker ainda não está pronto para receber comandos.");
      }
      worker.postMessage({ type, payload });
    },

    onEvent(listener) {
      if (typeof listener !== "function") throw new TypeError("listener precisa ser uma função.");
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },

    onState(listener) {
      if (typeof listener !== "function") throw new TypeError("listener precisa ser uma função.");
      stateListeners.add(listener);
      return () => stateListeners.delete(listener);
    },

    isReady() { return ready; },
    isRunning() { return running; },
    getSnapshot() { return snapshot; },
    getMemoryView() { return memoryView; },
    getMemoryLayout() { return memoryView?.layout ?? null; },
    getSharedMemory() { return sharedMemory; },

    get tickRate() {
      return SIMULATION.TARGET_TICKS_PER_SECOND;
    }
  };
}
