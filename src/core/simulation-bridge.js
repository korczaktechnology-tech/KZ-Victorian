import { SIMULATION } from "./constants.js";

export function createSimulationBridge() {
  let worker = null;
  let running = false;
  let snapshot = Object.freeze({ tick: 0 });

  return {
    start() {
      if (running) return;

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

      worker.postMessage({ type: "start" });
      running = true;
    },

    stop() {
      if (!worker) return;

      worker.postMessage({ type: "stop" });
      worker.terminate();
      worker = null;
      running = false;
      snapshot = Object.freeze({ tick: 0 });
    },

    getSnapshot() {
      return snapshot;
    },

    get tickRate() {
      return SIMULATION.TARGET_TICKS_PER_SECOND;
    }
  };
}
