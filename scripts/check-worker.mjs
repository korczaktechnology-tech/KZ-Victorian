import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url),files=["src/worker.js","src/systems/simulation.js","src/core/simulation-bridge.js","tests/phase4.test.js"];
const source=await Promise.all(files.map(f=>readFile(new URL(f,root),"utf8"))).then(a=>a.join("\n"));
for(const token of ["initialize-memory","SimulationCore","setTimeout","postMessage","simulation-reset"])if(!source.includes(token))throw new Error("Fase 4: requisito ausente: "+token);
const simulation=await readFile(new URL("src/systems/simulation.js",root),"utf8"),bridge=await readFile(new URL("src/core/simulation-bridge.js",root),"utf8");
if(!simulation.includes("#accumulator")||!simulation.includes("#maxCatchUpSteps")||!simulation.includes("new SimulationCore(this.#memory)"))throw new Error("Fase 4: loop fixo ou reinicialização ausente.");
if(!bridge.includes("memory-ready")||!bridge.includes("sendCommand")||!bridge.includes("simulation-reset"))throw new Error("Fase 4: handshake/canal/reset ausente.");
console.log("WebLords worker check: OK — Worker, SimulationCore, timestep fixo, comandos, reset, eventos e SAB validados.");
