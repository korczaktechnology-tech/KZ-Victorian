import test from "node:test";
import assert from "node:assert/strict";
const workerMessages=[];globalThis.self={postMessage(message){workerMessages.push(message);}};
const {Simulation}=await import("../src/systems/simulation.js");
const {createSharedMemory,createMemoryView}=await import("../src/core/memory.js");
const {MEMORY}=await import("../src/core/constants.js");
function createSimulation(){workerMessages.length=0;const simulation=new Simulation(),buffer=createSharedMemory(MEMORY.INITIAL_BYTES),view=createMemoryView(buffer);simulation.initializeMemory(buffer,view.layout);return{simulation,view};}
test("Fase 4: Simulation cria SimulationCore",()=>{const{simulation}=createSimulation();assert.ok(simulation.core);assert.equal(simulation.core.world.entities.size,9);});
test("Fase 4: um passo executa os oito sistemas e atualiza SAB",()=>{const{simulation,view}=createSimulation();const r=simulation.step();assert.equal(r.tick,1);assert.deepEqual(r.systemTrace,["Population","Pathfinding","Movement","Needs","Economy","Production","Construction","Logistics"]);assert.equal(Atomics.load(view.regions.states,0),1);});
test("Fase 4: comando é aplicado no limite do tick",()=>{const{simulation}=createSimulation();simulation.handleCommand({type:"selection.request",payload:{x:0,y:0,radius:1}});const r=simulation.step();assert.ok(r.events.some(e=>e.type==="commandReceived"));assert.ok(r.events.some(e=>e.type==="commandAccepted"));});
test("Fase 4: reset reconstrói o mundo completo",()=>{const{simulation,view}=createSimulation();const before=simulation.core.world.entities.size;simulation.step();simulation.handleCommand({type:"reset"});assert.equal(Atomics.load(view.regions.states,0),0);assert.equal(simulation.core.world.tick,0);assert.equal(simulation.core.world.entities.size,before);assert.ok(workerMessages.some(m=>m.type==="simulation-reset"));});
test("Fase 4: passo manual não mantém o loop",()=>{const{simulation}=createSimulation();simulation.step();assert.equal(simulation.running,false);});
