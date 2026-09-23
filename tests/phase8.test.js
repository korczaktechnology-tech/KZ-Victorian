import test from "node:test";
import assert from "node:assert/strict";
import {createUIEventStore} from "../src/ui/event-store.js";
import {createSimulationWorld} from "../src/core/world.js";
import {EntityType} from "../src/core/entities.js";

test("Fase 8: event store atualiza população, recursos, seleção e mensagens",()=>{
  const store=createUIEventStore();
  const received=[];
  store.subscribe(event=>received.push(event.type));
  store.apply({type:"populationChanged",payload:{population:2}});
  store.apply({type:"resourceChanged",payload:{resource:0,quantity:5}});
  store.apply({type:"selectionChanged",payload:{entityId:5,entityType:1,x:0,y:0}});
  store.apply({type:"constructionCompleted",payload:{entityId:10}});
  assert.equal(store.state.population,2);
  assert.equal(store.state.resources.get("0"),5);
  assert.equal(store.state.selection.entityId,5);
  assert.equal(store.state.messages.length,1);
  assert.deepEqual(received,["populationChanged","resourceChanged","selectionChanged","constructionCompleted"]);
});

test("Fase 8: seleção usa a partição espacial e produz selectionChanged",()=>{
  const world=createSimulationWorld(null,32,32,32);
  world.bootstrap();
  const result=world.selectAt(0,0,1);
  assert.equal(result.ok,true);
  assert.equal(result.selection.entityId,1);
  assert.equal(world.events.at(-1).type,"selectionChanged");
});

test("Fase 8: comandos de UI continuam estruturados e independentes do DOM",()=>{
  const world=createSimulationWorld(null,32,32,32);
  world.bootstrap();
  const result=world.requestConstruction(EntityType.HOUSE,20,20);
  assert.equal(result.ok,false);
  assert.equal(result.reason,"insufficient-construction-stock");
});
