import { createRenderer } from "./render/renderer.js";
import { createSimulationBridge } from "./core/simulation-bridge.js";

const canvas = document.querySelector("#game-canvas");

if (!canvas) {
  throw new Error("WebLords: canvas principal não encontrado.");
}

const renderer = createRenderer(canvas);
const simulation = createSimulationBridge();

simulation.start();

function frame(time) {
  renderer.render(time, simulation.getSnapshot());
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

window.addEventListener("beforeunload", () => {
  simulation.stop();
});
