import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");

const requiredFiles = [
  "index.html",
  "style.css",
  "package.json",
  ".gitignore",
  "src/main.js",
  "src/worker.js",
  "src/core/constants.js",
  "src/core/memory.js",
  "src/core/ecs.js",
  "src/core/entities.js",
  "src/core/world.js",
  "src/core/simulation-bridge.js",
  "src/systems/simulation.js",
  "src/systems/simulation-core.js",
  "src/systems/population.js",
  "src/systems/movement.js",
  "src/systems/needs.js",
  "src/systems/economy.js",
  "src/systems/production.js",
  "src/systems/construction.js",
  "src/systems/logistics.js",
  "src/systems/pathfinding.js",
  "src/render/renderer.js",
  "src/render/camera.js",
  "src/render/shaders.js",
  "src/render/meshes.js",
  "src/render/instances.js",
  "tests/foundation.test.js",
  "tests/pipeline.test.js",
  "tests/memory.test.js",
  "tests/phase2.test.js",
  "tests/simulation-memory.test.js",
  "tests/phase3.test.js",
  "scripts/dev-server.mjs",
  "scripts/check-pipeline.mjs",
  "scripts/check-memory.mjs",
  "scripts/check-ecs.mjs"
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  console.error("Arquivos obrigatórios ausentes:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const index = readFileSync(resolve(root, "index.html"), "utf8");
const main = readFileSync(resolve(root, "src/main.js"), "utf8");
const worker = readFileSync(resolve(root, "src/worker.js"), "utf8");

const checks = [
  [index.includes('id="game-canvas"'), "index.html precisa conter #game-canvas"],
  [index.includes('type="module"'), "index.html precisa carregar um ES Module"],
  [main.includes('createSimulationBridge'), "main.js precisa inicializar a ponte de simulação"],
  [main.includes("requestAnimationFrame"), "main.js precisa possuir o loop de renderização"],
  [worker.includes('case "start"'), "worker.js precisa tratar o comando start"],
  [worker.includes('case "stop"'), "worker.js precisa tratar o comando stop"]
];

const failed = checks.filter(([ok]) => !ok).length;
if (failed) {
  console.error("Validação estrutural falhou.");
  process.exit(1);
}

const javascriptFiles = [
  "src/main.js",
  "src/worker.js",
  "src/core/constants.js",
  "src/core/memory.js",
  "src/core/ecs.js",
  "src/core/entities.js",
  "src/core/world.js",
  "src/core/simulation-bridge.js",
  "src/systems/simulation.js",
  "src/systems/population.js",
  "src/systems/movement.js",
  "src/systems/needs.js",
  "src/systems/economy.js",
  "src/systems/production.js",
  "src/systems/construction.js",
  "src/systems/logistics.js",
  "src/systems/pathfinding.js",
  "src/render/renderer.js",
  "src/render/camera.js",
  "src/render/shaders.js",
  "src/render/meshes.js",
  "src/render/instances.js",
  "tests/foundation.test.js",
  "tests/pipeline.test.js",
  "tests/memory.test.js",
  "tests/phase2.test.js",
  "tests/phase3.test.js",
  "src/systems/simulation-core.js",
  "scripts/check-foundation.mjs",
  "scripts/check-pipeline.mjs",
  "scripts/check-memory.mjs",
  "scripts/check-ecs.mjs",
  "scripts/dev-server.mjs"
];

try {
  for (const file of javascriptFiles) {
    execFileSync(process.execPath, ["--check", join(root, file)], { stdio: "pipe" });
  }
} catch (error) {
  console.error("Validação de sintaxe JavaScript falhou.");
  console.error(error.stderr?.toString() || error.message);
  process.exit(1);
}

console.log(`WebLords foundation check: OK — ${requiredFiles.length} arquivos essenciais e ${javascriptFiles.length} arquivos JavaScript validados.`);
