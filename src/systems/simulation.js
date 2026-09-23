import{SIMULATION}from"../core/constants.js";
import{createLocalMemory,createMemoryView}from"../core/memory.js";
import{SimulationCore}from"./simulation-core.js";
function createRenderPositions(world){
 let count=0;world.entities.query("Position").forEach(id=>{if(id!==world.playerId)count++;});
 const positions=new Float32Array(count*3);let cursor=0;
 world.entities.query("Position").forEach(id=>{if(id===world.playerId)return;const p=world.entities.get(id,"Position");positions[cursor++]=p[0];positions[cursor++]=p[1];positions[cursor++]=p[2]??0;});
 return positions;
}
export class Simulation{
 #running=false;#timer=null;#lastTime=0;#accumulator=0;#memory=null;#core=null;#commandQueue=[];#tickInterval=SIMULATION.TICK_INTERVAL_MS;#maxCatchUpSteps=5;
 initializeMemory(byteLength){this.stop();this.#memory=createMemoryView(createLocalMemory(byteLength));this.#core=new SimulationCore(this.#memory);this.#commandQueue.length=0;this.#memory.regions.states[0]=0;this.#lastTime=0;this.#accumulator=0;return this.#memory;}
 get memory(){return this.#memory}get core(){return this.#core}get running(){return this.#running}
 start(){if(!this.#memory||!this.#core)throw new Error("WebLords: a memória local precisa ser inicializada antes da simulação.");if(this.#running)return;this.#running=true;this.#lastTime=performance.now();this.#accumulator=0;self.postMessage({type:"simulation-started",payload:{tickRate:SIMULATION.TARGET_TICKS_PER_SECOND}});this.#scheduleNext();}
 stop(){this.#running=false;if(this.#timer!==null)clearTimeout(this.#timer);this.#timer=null;this.#lastTime=0;this.#accumulator=0;}
 reset(){if(!this.#memory)throw new Error("WebLords: não é possível reiniciar sem memória local.");const wasRunning=this.#running;this.stop();this.#core=new SimulationCore(this.#memory);this.#commandQueue.length=0;this.#memory.regions.states[0]=0;this.#lastTime=0;this.#accumulator=0;self.postMessage({type:"simulation-reset",payload:{tick:0}});if(wasRunning)this.start();}
 #scheduleNext(){if(!this.#running)return;const now=performance.now(),elapsed=Math.max(0,Math.min(now-this.#lastTime,this.#tickInterval*this.#maxCatchUpSteps));this.#lastTime=now;this.#accumulator+=elapsed;let steps=0;while(this.#accumulator>=this.#tickInterval&&steps<this.#maxCatchUpSteps){this.#accumulator-=this.#tickInterval;this.tick(this.#tickInterval/1000);steps++;}this.#timer=setTimeout(()=>this.#scheduleNext(),Math.max(0,this.#tickInterval-this.#accumulator));}
 tick(deltaSeconds=this.#tickInterval/1000){
  if(!this.#running||!this.#core)return null;
  const result=this.#core.tick(deltaSeconds);this.#applyQueuedCommands(result.events);
  const player=this.#core.world.playerController.update(deltaSeconds);
  this.#core.world.syncEntityToMap(this.#core.world.playerId);this.#core.world.rebuildSpatial();this.#memory.regions.states[0]=result.tick;
  const positions=createRenderPositions(this.#core.world),ppos=this.#core.world.entities.get(this.#core.world.playerId,"Position"),pvel=this.#core.world.entities.get(this.#core.world.playerId,"Velocity");
  const snapshot={tick:result.tick,metrics:{...result.metrics},events:result.events.slice(),positions:positions.buffer,player:{position:[ppos[0],ppos[1],ppos[2]],velocity:[pvel[0],pvel[1],pvel[2]],facing:this.#core.world.playerFacing,animation:player.animation,grounded:player.grounded}};
  self.postMessage({type:"snapshot",payload:snapshot},[positions.buffer]);if(result.events.length>0)self.postMessage({type:"events",payload:result.events.slice()});return result;
 }
 step(deltaSeconds=this.#tickInterval/1000){if(!this.#memory||!this.#core)throw new Error("WebLords: uma simulação precisa ser inicializada antes de executar um passo.");const wasRunning=this.#running;if(!wasRunning)this.#running=true;const result=this.tick(deltaSeconds);this.#running=wasRunning;return result;}
 handleCommand(command){if(!command||typeof command.type!=="string")return;if(command.type==="reset"){this.reset();return;}this.#commandQueue.push(command);}
 #applyQueuedCommands(events){if(this.#commandQueue.length===0)return;for(const command of this.#commandQueue.splice(0)){const payload=command.payload??{};let result={ok:false,reason:"unknown-command"};try{switch(command.type){case"player.input":this.#core.world.playerController.setInput(payload);result={ok:true};break;case"construction.request":result=this.#core.world.requestConstruction(payload.type,payload.x,payload.y,payload.z??0);break;case"logistics.create":result=this.#core.world.createLogisticsTask(payload);break;case"production.queue":result=this.#core.world.queueProduction(payload.entityId,payload.recipe);break;case"selection.request":result=this.#core.world.selectAt(payload.x,payload.y,payload.radius);break;default:result={ok:false,reason:"unknown-command"};}}catch(error){result={ok:false,reason:error instanceof Error?error.message:String(error)};}if(command.type!=="player.input"){events.push({type:"commandReceived",payload:{type:command.type,payload}});events.push({type:result.ok?"commandAccepted":"commandRejected",payload:{type:command.type,result}});}}}
}
