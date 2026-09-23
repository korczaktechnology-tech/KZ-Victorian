import { createSimulationWorld } from "../core/world.js";
import { updatePopulation } from "./population.js";
import { updatePathfinding } from "./pathfinding.js";
import { updateMovement } from "./movement.js";
import { updateNeeds } from "./needs.js";
import { updateEconomy } from "./economy.js";
import { updateProduction } from "./production.js";
import { updateConstruction } from "./construction.js";
import { updateLogistics } from "./logistics.js";
export const SIMULATION_SYSTEM_ORDER=Object.freeze(["Population","Pathfinding","Movement","Needs","Economy","Production","Construction","Logistics"]);
const SYSTEMS=Object.freeze([updatePopulation,updatePathfinding,updateMovement,updateNeeds,updateEconomy,updateProduction,updateConstruction,updateLogistics]);
export class SimulationCore{
  constructor(memory=null,capacity,width,height){this.world=createSimulationWorld(memory,capacity,width,height);this.world.bootstrap();}
  tick(deltaSeconds=1/30){
    this.world.tick+=1;this.world.events.length=0;this.world.systemTrace=[];this.world.rebuildSpatial();
    if(this.world.map.navigationRevision!==this.world.map.revision&&this.world.navigation.activeField!==null)this.world.rebuildNavigation();
    for(let i=0;i<SYSTEMS.length;i+=1){this.world.systemTrace.push(SIMULATION_SYSTEM_ORDER[i]);SYSTEMS[i](this.world,i===2?deltaSeconds:undefined);}
    this.world.metrics.resources=this.world.resourceTotals();
    return{tick:this.world.tick,metrics:this.world.metrics,events:this.world.events,systemTrace:[...this.world.systemTrace]};
  }
}
