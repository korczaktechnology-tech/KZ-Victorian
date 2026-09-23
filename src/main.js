import { createRenderer } from "./render/renderer.js";
import { createSimulationBridge } from "./core/simulation-bridge.js";
import { createUIEventStore } from "./ui/event-store.js";
import { createGameUI } from "./ui/ui.js";
import { createInputController } from "./ui/input.js";
import { createErrorReporter } from "./ui/error-boundary.js";

const canvas=document.querySelector("#game-canvas");
const interfaceRoot=document.querySelector("#interface");
if(!canvas)throw new Error("WebLords: canvas principal não encontrado.");
if(!interfaceRoot)throw new Error("WebLords: interface principal não encontrada.");

const renderer=createRenderer(canvas);
const simulation=createSimulationBridge();
const store=createUIEventStore();
const reporter=createErrorReporter(interfaceRoot);

const ui=createGameUI(interfaceRoot,store,{
  reset:()=>simulation.sendCommand("reset"),
  buildHouse:(x,y)=>simulation.sendCommand("construction.request",{type:"house",x:Math.floor(x)+1,y:Math.floor(y),z:0})
});

simulation.onEvent(event=>store.apply(event));
simulation.onState(snapshot=>{
  store.apply({type:"worldStateChanged",payload:{tick:snapshot.tick,metrics:snapshot.metrics}});
});
simulation.onError(error=>reporter.report("Simulation Worker",error));

const input=createInputController(canvas,{
  camera:renderer.getCamera(),
  sendCommand:(type,payload)=>{
    try{simulation.sendCommand(type,payload);}
    catch(error){reporter.report("Comando",error);}
  }
});

try{
  simulation.start();
}catch(error){
  reporter.report("Inicialização",error);
}

function frame(time){
  renderer.render(time,simulation.getSnapshot());
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener("beforeunload",()=>{
  input.destroy();
  ui.destroy();
  simulation.stop();
});
