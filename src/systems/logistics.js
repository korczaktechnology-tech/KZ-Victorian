import {transferInventory} from "./economy.js";
export const JOB_STATE=Object.freeze({IDLE:0,ASSIGNED:1,READY:2,COMPLETED:3});
export const JOB_TYPE=Object.freeze({DELIVERY:1,SUPPLY:2,CONSTRUCTION:3});
export function createLogisticsTask(world,{workerId,sourceId,destinationId,resource,quantity}){
 if(![workerId,sourceId,destinationId].every(id=>world.entities.has(id)))return{ok:false,reason:"entity-not-found"};
 if(![resource,quantity].every(Number.isInteger)||resource<0||resource>3||quantity<=0)return{ok:false,reason:"invalid-task"};
 const job=world.entities.get(workerId,"Job");if(!job||job[2]!==JOB_STATE.IDLE)return{ok:false,reason:"worker-busy"};
 const source=world.entities.get(sourceId,"Inventory");const destination=world.entities.get(destinationId,"Inventory");
 if(!source||!destination||source[resource]<quantity)return{ok:false,reason:"insufficient-stock"};
 job[0]=destinationId;job[1]=resource;job[2]=JOB_STATE.ASSIGNED;
 world.logisticsTasks.set(workerId,{sourceId,destinationId,resource,quantity});
 world.emit("taskCreated",{workerId,sourceId,destinationId,resource,quantity});
 return{ok:true,workerId,sourceId,destinationId,resource,quantity};
}
export function updateLogistics(world){
 let tasks=0;
 world.entities.query("Job","Inventory","Position").forEach(id=>{
  const job=world.entities.get(id,"Job");const task=world.logisticsTasks.get(id);
  if(job[2]===JOB_STATE.ASSIGNED){job[2]=JOB_STATE.READY;world.emit("taskReady",{entityId:id,targetId:job[0]});}
  else if(job[2]===JOB_STATE.READY&&task){const result=transferInventory(world,task.sourceId,task.destinationId,task.resource,task.quantity);if(result.ok){job[2]=JOB_STATE.COMPLETED;world.emit("taskTransported",{entityId:id,quantity:task.quantity,resource:task.resource});}else{job[2]=JOB_STATE.IDLE;world.emit("taskFailed",{entityId:id,reason:result.reason});world.logisticsTasks.delete(id);}}
  else if(job[2]===JOB_STATE.COMPLETED){job[2]=JOB_STATE.IDLE;tasks+=1;world.emit("taskCompleted",{entityId:id,targetId:job[0]});world.logisticsTasks.delete(id);}
 });
 if(world.memory?.regions.logistics)Atomics.store(world.memory.regions.logistics,0,tasks);
 world.metrics.logistics=tasks;return tasks;
}