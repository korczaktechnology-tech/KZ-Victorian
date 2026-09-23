import { SIMULATION } from "./constants.js";

export function createSimulationBridge() {
  let worker = null;
  let running = false;
  let snapshot = Object.freeze({ tick: 0 });

  return {
    start() {
      if (running) return;
      worker = new Worker(new URL("../worker.js", import.meta.url), { type: "module" });
      worker.postMessage({ type: "start" });
      worker.onmessage = ({ data }) => {
        if (data?.type === "snapshot") snapshot = data.payload;
      };
      running = true;
    },

    stop() {
      if (!worker) return;
      worker.postMessage({ type: "stop" });
      worker.terminate();
      worker = null;
      running = false;
    },

    getSnapshot() {
      return snapshot;
    },

    get tickRate() {
      return SIMULATION.TARGET_TICKS_PER_SECOND;
    }
  };
}
