import { Simulation } from "./systems/simulation.js";

const simulation = new Simulation();

self.onmessage = ({ data }) => {
  if (!data || typeof data.type !== "string") return;

  try {
    switch (data.type) {
      case "initialize-memory":
        simulation.initializeMemory(data.buffer, data.layout);
        self.postMessage({ type: "memory-ready" });
        break;
      case "start":
        simulation.start();
        break;
      case "stop":
        simulation.stop();
        break;
      default:
        simulation.handleCommand(data);
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      payload: {
        message: error instanceof Error ? error.message : String(error)
      }
    });
  }
};
