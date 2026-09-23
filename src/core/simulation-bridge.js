import { SIMULATION, MEMORY } from "./constants.js";
import { createMemoryView, createSharedMemory } from "./memory.js";

export function createSimulationBridge() {
  let worker = null;
  let running = false;
  let snapshot = Object.freeze({ tick: 0 });
  let sharedMemory = null;
  let memoryView = null;

  return {
    start() {
      if (running) return;

      sharedMemory = createSharedMemory(MEMORY.INITIAL_BYTES);
      memoryView = createMemoryView(sharedMemory);

      worker = new Worker(new URL("../worker.js", import.meta.url), { type: "module" });

      worker.onmessage = ({ data }) => {
        if (data?.type === "snapshot") {
          snapshot = Object.freeze(data.payload);
        }
      };

      worker.onerror = (event) => {
        console.error("WebLords: erro no Simulation Worker.", event.error || event.message);
      };

      worker.onmessageerror = (event) => {
        console.error("WebLords: mensagem inválida recebida do Simulation Worker.", event);
      };

      worker.postMessage({
        type: "initialize-memory",
        buffer: sharedMemory,
        layout: memoryView.layout
      });

      worker.postMessage({ type: "start" });
      running = true;
    },

    stop() {
      if (!worker) return;

      worker.postMessage({ type: "stop" });
      worker.terminate();
      worker = null;
      running = false;
      sharedMemory = null;
      memoryView = null;
      snapshot = Object.freeze({ tick: 0 });
    },

    getSnapshot() {
      return snapshot;
    },

    getMemoryView() {
      return memoryView;
    },

    getMemoryLayout() {
      return memoryView?.layout ?? null;
    },

    getSharedMemory() {
      return sharedMemory;
    },

    get tickRate() {
      return SIMULATION.TARGET_TICKS_PER_SECOND;
    }
  };
}
