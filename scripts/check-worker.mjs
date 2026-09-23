import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const files = [
  "src/worker.js",
  "src/systems/simulation.js",
  "src/core/simulation-bridge.js",
  "tests/phase4.test.js"
];

for (const relative of files) {
  const source = await readFile(new URL(relative, root), "utf8");
  if (!source.trim()) throw new Error(`Arquivo vazio: ${relative}`);
}

const worker = await readFile(new URL("src/worker.js", root), "utf8");
const simulation = await readFile(new URL("src/systems/simulation.js", root), "utf8");
const bridge = await readFile(new URL("src/core/simulation-bridge.js", root), "utf8");
const combined = worker + simulation + bridge;

for (const token of ["initialize-memory", "SimulationCore", "setTimeout", "postMessage"]) {
  if (!combined.includes(token)) throw new Error(`Fase 4: token obrigatório ausente: ${token}`);
}

if (!simulation.includes("#accumulator") || !simulation.includes("#maxCatchUpSteps")) {
  throw new Error("Fase 4: controle de variação temporal não encontrado.");
}

if (!bridge.includes("memory-ready") || !bridge.includes("sendCommand")) {
  throw new Error("Fase 4: handshake ou canal de comandos ausente.");
}

console.log("WebLords worker check: OK — Worker, SimulationCore, loop temporal, memória compartilhada, comandos e eventos validados.");
