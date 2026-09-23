import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
async function source(path) { return readFile(resolve(root, path), "utf8"); }
test("pipeline principal mantém a separação Main Thread → Worker", async () => {
  const html = await source("index.html"); const main = await source("src/main.js"); const worker = await source("src/worker.js");
  assert.match(html, /type="module" src="\.\/src\/main\.js"/);
  assert.match(main, /createRenderer\(canvas\)/); assert.match(main, /createSimulationBridge\(\)/);
  assert.match(main, /simulation\.start\(\)/); assert.match(main, /requestAnimationFrame/);
  assert.match(worker, /new Simulation\(\)/); assert.match(worker, /case "start"/); assert.match(worker, /case "stop"/);
});
test("camadas de simulação não dependem diretamente do DOM", async () => {
  const files = ["src/core/constants.js","src/core/memory.js","src/core/ecs.js","src/core/entities.js","src/core/simulation-bridge.js","src/systems/simulation.js","src/systems/population.js","src/systems/movement.js","src/systems/needs.js","src/systems/economy.js","src/systems/production.js","src/systems/construction.js","src/systems/logistics.js","src/systems/pathfinding.js"];
  for (const file of files) { const content = await source(file); assert.doesNotMatch(content, /\bdocument\b/); assert.doesNotMatch(content, /\bwindow\b/); }
});
test("Worker não importa responsabilidades de renderização ou interface", async () => { const worker = await source("src/worker.js"); assert.doesNotMatch(worker, /\/render\//); assert.doesNotMatch(worker, /document/); });
test("sistemas e renderização permanecem separados", async () => {
  const files = ["src/render/renderer.js","src/render/camera.js","src/render/shaders.js","src/render/meshes.js","src/render/instances.js"];
  for (const file of files) { const content = await source(file); assert.doesNotMatch(content, /\/systems\//); }
});