import {MEMORY_CAPACITIES,WORLD} from "../core/constants.js";
import {EntityRegistry} from "../core/ecs.js";
import {EntityType,EntityTypeCode,spawnInitialEntity} from "../core/entities.js";
import {WorldMap} from "../world/map.js";
import {FlowField} from "../world/flow-field.js";
import {SpatialPartition} from "../world/spatial-partition.js";
import {requestConstruction} from "../systems/construction.js";
import {createLogisticsTask,createLogisticsRequest} from "../systems/logistics.js";
import {queueProduction} from "../systems/production.js";

export function createSimulationWorld(memory=null,capacity=MEMORY_CAPACITIES.entities,width=WORLD.DEFAULT_WIDTH,height=WORLD.DEFAULT_HEIGHT){
 const externalData=memory?.regions?{Position:memory.regions.positions,Velocity:memory.regions.velocities}:{};
 const entities=new EntityRegistry(capacity,externalData),map=new WorldMap(width,height,memory),spatial=new SpatialPartition(width,height,1),flowFields=new FlowField(map);
 const world={entities,memory,map,spatial,flowFields,tick:0,events:[],metrics:{population:0,moving:0,lowNeeds:0,completedConstruction:0,produced:0,logistics:0,economyTransfers:0,navigationRevision:0,resources:{}},navigation:{activeField:null},logisticsTasks:new Map(),logisticsRequests:new Map(),nextLogisticsRequestId:1,productionJobs:new Map(),
 warehouseIds(){const ids=[];world.entities.query("Inventory").forEach(id=>{if(world.entities.type(id)===EntityTypeCode[EntityType.WAREHOUSE])ids.push(id);});return ids;},
 resourceTotals(){const totals=[0,0,0,0];world.entities.query("Inventory").forEach(id=>{const inventory=world.entities.get(id,"Inventory");for(let i=0;i<4;i+=1)totals[i]+=inventory[i];});return{wood:totals[0],planks:totals[1],food:totals[2],stone:totals[3]};},
 spawn(type,x=0,y=0,z=0){const id=spawnInitialEntity(world,type,x,y,z);world.syncEntityToMap(id);return id;},
 emit(type,payload=null){world.events.push({type,payload});},
 syncEntityToMap(id){if(!entities.has(id))return false;const position=entities.get(id,"Position");return position?map.syncEntity(id,entities.type(id),position):false;},
 rebuildSpatial(){spatial.rebuild(entities);},
 rebuildNavigation(fieldId=world.navigation.activeField){if(fieldId===null||fieldId===undefined)return null;const field=flowFields.rebuild(fieldId);if(field){world.metrics.navigationRevision=map.navigationRevision;world.emit("navigationUpdated",{fieldId,revision:map.navigationRevision});}return field;},
 setFlowField(fieldId,destinations,options={}){const field=flowFields.create(fieldId,destinations,options);world.navigation.activeField=fieldId;world.metrics.navigationRevision=map.navigationRevision;world.emit("navigationUpdated",{fieldId,revision:map.navigationRevision});return field;},
 requestConstruction(type,x,y,z=0){return requestConstruction(world,type,x,y,z);},
 createLogisticsTask(payload){return createLogisticsTask(world,payload);},
 createLogisticsRequest(payload){return createLogisticsRequest(world,payload);},
 queueProduction(entityId,recipe){const result=queueProduction(world,entityId,recipe);if(result.ok)world.emit("productionQueued",{entityId,recipe,duration:result.duration});return result;},
 selectAt(x,y,radius=1.5){let selected=null;world.spatial.queryRadius(x,y,radius,id=>entities.get(id,"Position"),(id,position)=>{if(!selected)selected={entityId:id,entityType:entities.type(id),x:position[0],y:position[1],z:position[2]??0};});world.emit("selectionChanged",selected);return{ok:true,selection:selected};}
 };
 world.bootstrap=()=>{if(entities.size!==0)return;world.spawn(EntityType.HOUSE,0,0,0);world.spawn(EntityType.WAREHOUSE,4,0,0);world.spawn(EntityType.SAWMILL,8,0,0);world.spawn(EntityType.ROAD,2,0,0);world.spawn(EntityType.HABITANT,0,0,0);world.spawn(EntityType.HABITANT,1,0,0);world.spawn(EntityType.TREE,6,0,0);world.spawn(EntityType.RESOURCE,10,0,0);world.spawn(EntityType.ANIMAL,12,0,0);world.rebuildSpatial();world.setFlowField("default",[{x:2,y:0}]);world.metrics.resources=world.resourceTotals();};
 return world;
}
