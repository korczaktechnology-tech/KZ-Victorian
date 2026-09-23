import { Simulation } from "./systems/simulation.js";

const simulation = new Simulation();

self.onmessage = ({ data }) => {
  if (!data || typeof data.type !== "string") return;

  switch (data.type) {
    case "start":
      simulation.start();
      break;
    case "stop":
      simulation.stop();
      break;
    default:
      simulation.handleCommand(data);
  }
};
