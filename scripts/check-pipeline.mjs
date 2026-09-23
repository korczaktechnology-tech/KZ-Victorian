import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const required = ["index.html","style.css","src/main.js","src/worker.js","src/core","src/systems","src/render","assets","tests","docs","scripts"];
const missing = required.filter((entry) => !existsSync(resolve(root, entry)));
if (missing.length) { console.error("Pipeline check falhou. Estruturas ausentes:"); for (const entry of missing) console.error(`- ${entry}`); process.exit(1); }
const read = (file) => readFileSync(resolve(root, file), "utf8");
const html = read("index.html"); const main = read("src/main.js"); const worker = read("src/worker.js");
const checks = [[
  [html.includes('type="module" src="./src/main.js"'), "index.html deve iniciar a Main Thread por ES Module."],
  [main.includes("createRenderer(canvas)"), "Main Thread deve inicializar o renderer."],
  [main.includes("createSimulationBridge()"), "Main Thread deve inicializar a ponte com o Worker."],
  [main.includes("requestAnimationFrame"), "Main Thread deve possuir o ciclo de renderização."],
  [worker.includes("new Simulation()"), "Worker deve possuir a simulação."],
  [worker.includes('case "start"'), "Worker deve tratar start."],
  [worker.includes('case "stop"'), "Worker deve tratar stop."]
]];
for (const [ok, message] of checks) { if (!ok) { console.error(`Pipeline check falhou: ${message}`); process.exit(1); } }
const simulationFiles = ["src/core/constants.js","src/core/memory.js","src/core/ecs.js","src/core/entities.js","src/core/simulation-bridge.js","src/systems/simulation.js","src/systems/population.js","src/systems/movement.js","src/systems/needs.js","src/systems/economy.js","src/systems/production.js","src/systems/construction.js","src/systems/logistics.js","src/systems/pathfinding.js"];
for (const file of simulationFiles) { const content = read(file); if (/\bdocument\b|\bwindow\b/.test(content)) { console.error(`Pipeline check falhou: ${file} possui dependência direta do DOM/window.`); process.exit(1); } }
if (/\/render\//.test(worker) || /\bdocument\b/.test(worker)) { console.error("Pipeline check falhou: worker.js possui dependência de interface/renderização."); process.exit(1); }
console.log("WebLords pipeline check: OK — estrutura, fluxo e separação de responsabilidades validados.");