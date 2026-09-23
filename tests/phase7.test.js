import test from "node:test";
import assert from "node:assert/strict";
import {createSimulationWorld} from "../src/core/world.js";
import {EntityType} from "../src/core/entities.js";
import {RESOURCE} from "../src/systems/economy.js";
import {JOB_STATE,JOB_TYPE,updateLogistics} from "../src/systems/logistics.js";
import {updateProduction} from "../src/systems/production.js";
import {MEMORY} from "../src/core/constants.js";
import {createSharedMemory,createMemoryView} from "../src/core/memory.js";
import {SimulationCore} from "../src/systems/simulation-core.js";

function world(){const w=createSimulationWorld(null,undefined,32,32);w.bootstrap();return w;}

test("Fase 7: construção valida célula, estoque e consome materiais",()=>{
 const w=world(),warehouse=2; w.entities.get(warehouse,"Inventory")[RESOURCE.WOOD]=20; w.entities.get(warehouse,"Inventory")[RESOURCE.STONE]=10;
 const result=w.requestConstruction(EntityType.HOUSE,3,3); assert.equal(result.ok,true); assert.equal(w.entities.get(warehouse,"Inventory")[RESOURCE.WOOD],15); assert.equal(w.map.isBlocked(3,3),true); assert.ok(w.events.some(e=>e.type==="constructionStarted"));
});
test("Fase 7: construção rejeita estoque insuficiente sem alterar o mundo",()=>{
 const w=world(),before=w.entities.size,result=w.requestConstruction(EntityType.HOUSE,3,3); assert.equal(result.ok,false); assert.equal(result.reason,"insufficient-construction-stock"); assert.equal(w.entities.size,before);
});
test("Fase 7: produção respeita duração e consome entrada ao concluir",()=>{
 const w=world(),sawmill=3,inv=w.entities.get(sawmill,"Inventory"); inv[RESOURCE.WOOD]=2; assert.equal(w.queueProduction(sawmill,"SAWMILL_PLANKS").ok,true);
 assert.equal(w.productionJobs.get(sawmill).remaining,30); for(let i=0;i<29;i++) updateProduction(w); assert.equal(inv[RESOURCE.PLANKS],0); assert.equal(inv[RESOURCE.WOOD],2); updateProduction(w);
 assert.equal(inv[RESOURCE.PLANKS],1); assert.equal(inv[RESOURCE.WOOD],0); assert.ok(w.events.some(e=>e.type==="productionCompleted"));
});
test("Fase 7: armazém gera pedido e logística busca agente próximo",()=>{
 const w=world(),warehouse=2,sawmill=3,worker=5; w.entities.get(warehouse,"Inventory")[RESOURCE.WOOD]=4;
 assert.equal(w.queueProduction(sawmill,"SAWMILL_PLANKS").ok,true); assert.equal(w.productionJobs.get(sawmill).state,"waiting-input"); updateProduction(w);
 updateLogistics(w);
 assert.ok(w.logisticsRequests.size>=1); const request=[...w.logisticsRequests.values()][0];
 assert.equal(request.sourceId,warehouse); assert.equal(request.destinationId,sawmill); assert.equal(request.type,JOB_TYPE.SUPPLY); assert.equal(request.workerId,6); assert.equal(request.status,"assigned");
});
test("Fase 7: logística percorre ciclo completo de tarefa",()=>{
 const w=world(),worker=5,source=2,destination=3; w.entities.get(source,"Inventory")[RESOURCE.WOOD]=6;
 const task=w.createLogisticsTask({workerId:worker,sourceId:source,destinationId:destination,resource:RESOURCE.WOOD,quantity:5}); assert.equal(task.ok,true);
 updateLogistics(w); assert.equal(w.entities.get(worker,"Job")[2],JOB_STATE.READY); updateLogistics(w); assert.equal(w.entities.get(source,"Inventory")[RESOURCE.WOOD],1); assert.equal(w.entities.get(destination,"Inventory")[RESOURCE.WOOD],5);
 updateLogistics(w); assert.equal(w.entities.get(worker,"Job")[2],JOB_STATE.IDLE);
});
test("Fase 7: cadeia automática armazém → agente → produção é integrada no Worker",()=>{
 const memory=createMemoryView(createSharedMemory(MEMORY.INITIAL_BYTES));
 const core=new SimulationCore(memory);
 const warehouse=2,sawmill=3;
 core.world.entities.get(warehouse,"Inventory")[RESOURCE.WOOD]=2;
 assert.equal(core.world.queueProduction(sawmill,"SAWMILL_PLANKS").ok,true);
 assert.equal(core.world.productionJobs.get(sawmill).state,"waiting-input");

 core.tick();
 assert.equal(core.world.logisticsRequests.size,1);
 assert.equal(core.world.logisticsRequests.get(1).status,"assigned");

 core.tick();
 assert.equal(core.world.logisticsTasks.size,1);
 core.tick();
 assert.equal(core.world.entities.get(sawmill,"Inventory")[RESOURCE.WOOD],2);

 for(let i=0;i<30;i+=1) core.tick();
 assert.equal(core.world.entities.get(sawmill,"Inventory")[RESOURCE.WOOD],0);
 assert.equal(core.world.entities.get(sawmill,"Inventory")[RESOURCE.PLANKS],1);
});

test("Fase 7: logística rejeita estoque insuficiente",()=>{const w=world();const result=w.createLogisticsTask({workerId:5,sourceId:2,destinationId:3,resource:RESOURCE.WOOD,quantity:1});assert.equal(result.ok,false);assert.equal(result.reason,"insufficient-stock");});
test("Fase 7: serviços econômicos funcionam sobre SharedArrayBuffer",()=>{
 const memory=createMemoryView(createSharedMemory(MEMORY.INITIAL_BYTES)); const core=new SimulationCore(memory); core.world.entities.get(2,"Inventory")[RESOURCE.WOOD]=20; core.world.entities.get(2,"Inventory")[RESOURCE.STONE]=10;
 assert.equal(core.world.requestConstruction(EntityType.HOUSE,20,20).ok,true); assert.equal(core.world.queueProduction(3,"SAWMILL_PLANKS").ok,true); core.world.entities.get(3,"Inventory")[RESOURCE.WOOD]=2;
 const before=core.world.productionJobs.get(3).remaining; core.tick(); assert.ok(core.world.metrics.produced>=0); assert.equal(core.world.productionJobs.get(3)?.remaining??0,before-1);
});
