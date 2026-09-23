import{SIMULATION}from"./constants.js";
export function createSimulationBridge(){
 let worker=null,running=false,ready=false;const pendingCommands=[];
 let snapshot=Object.freeze({tick:0,metrics:{},events:[],positions:new Float32Array(),player:null});
 const eventListeners=new Set(),stateListeners=new Set(),errorListeners=new Set();
 function emit(listeners,payload){for(const listener of listeners){try{listener(payload);}catch(error){console.error("WebLords: erro em listener da Simulation Bridge.",error);}}}
 return{
  start(){
   if(worker)return;
   worker=new Worker(new URL("../worker.js",import.meta.url),{type:"module"});
   worker.onmessage=({data})=>{
    if(!data||typeof data.type!=="string")return;
    if(data.type==="simulation-ready"){ready=true;worker.postMessage({type:"start"});for(const command of pendingCommands.splice(0))worker.postMessage(command);return;}
    if(data.type==="snapshot"){const payload=data.payload??{};let positions=new Float32Array();if(payload.positions instanceof ArrayBuffer)positions=new Float32Array(payload.positions);else if(payload.positions instanceof Float32Array)positions=payload.positions;snapshot=Object.freeze({tick:payload.tick??0,metrics:payload.metrics??{},events:payload.events??[],positions,player:payload.player??null});emit(stateListeners,snapshot);return;}
    if(data.type==="events"){emit(eventListeners,data.payload??[]);return;}
    if(data.type==="simulation-started"){running=true;return;}
    if(data.type==="simulation-stopped"){running=false;return;}
    if(data.type==="simulation-reset"){snapshot=Object.freeze({tick:0,metrics:{},events:[],positions:new Float32Array(),player:null});emit(stateListeners,snapshot);emit(eventListeners,[{type:"worldStateChanged",payload:{tick:0,reset:true}}]);return;}
    if(data.type==="error"){const error=new Error(data.payload?.message??"Erro desconhecido no Simulation Worker.");emit(errorListeners,error);running=false;}
   };
   worker.onerror=event=>{emit(errorListeners,event.error||new Error(event.message||"Erro no Simulation Worker."));running=false;ready=false;};
   worker.onmessageerror=()=>{emit(errorListeners,new Error("WebLords: mensagem inválida recebida do Simulation Worker."));running=false;};
   worker.postMessage({ type: "initialize" });
  },
  stop(){if(!worker)return;worker.postMessage({type:"stop"});worker.terminate();worker=null;running=false;ready=false;pendingCommands.length=0;snapshot=Object.freeze({tick:0,metrics:{},events:[],positions:new Float32Array(),player:null});},
  sendCommand(type,payload=null){
   if(!worker)throw new Error("WebLords: Simulation Worker não foi iniciado.");
   const command={type,payload};
   if(!ready){pendingCommands.push(command);return;}
   worker.postMessage(command);
  },
  onEvent(listener){if(typeof listener!=="function")throw new TypeError("listener precisa ser uma função.");eventListeners.add(listener);return()=>eventListeners.delete(listener);},
  onState(listener){if(typeof listener!=="function")throw new TypeError("listener precisa ser uma função.");stateListeners.add(listener);return()=>stateListeners.delete(listener);},
  onError(listener){if(typeof listener!=="function")throw new TypeError("listener precisa ser uma função.");errorListeners.add(listener);return()=>errorListeners.delete(listener);},
  isReady(){return ready;},isRunning(){return running;},getSnapshot(){return snapshot;},getMemoryView(){return null;},getMemoryLayout(){return null;},getSharedMemory(){return null;},tickRate:SIMULATION.TARGET_TICKS_PER_SECOND
 };
}
