import { Simulation } from "./systems/simulation.js";

const simulation = new Simulation();

function postError(error) {
  self.postMessage({
    type: "error",
    payload: {
      message: error instanceof Error ? error.message : String(error)
    }
  });
}

self.onmessage = ({ data }) => {
  if (!data || typeof data.type !== "string") return;

  try {
    switch (data.type) {
      case "initialize-memory":
        simulation.initializeMemory(data.buffer, data.layout);
        self.postMessage({
          type: "memory-ready",
          payload: {
            tickRate: simulation.core ? 30 : null
          }
        });
        break;
      case "start":
        simulation.start();
        break;
      case "stop":
        simulation.stop();
        self.postMessage({ type: "simulation-stopped" });
        break;
      case "reset":
        simulation.handleCommand(data);
        break;
      default:
        simulation.handleCommand(data);
        break;
    }
  } catch (error) {
    postError(error);
  }
};

self.addEventListener("error", (event) => {
  postError(event.error || event.message || "Erro desconhecido no Simulation Worker.");
});
