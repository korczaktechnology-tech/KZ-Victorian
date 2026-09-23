import test from "node:test";
import assert from "node:assert/strict";
import {createUIEventStore} from "../src/ui/event-store.js";
import {createSimulationWorld} from "../src/core/world.js";
import {EntityType} from "../src/core/entities.js";

test("Fase 8: store mantém população, recursos, seleção e mensagens",()=>{const s=createUIEventStore(),received=[];s.subscribe(e=>received.push(e.type));s.apply({type:"populationChanged",payload:{population:2}});s.apply({type:"worldStateChanged",payload:{tick:1,metrics:{resources:{wood:7,planks:2,food:0,stone:3}}}});s.apply({type:"selectionChanged",payload:{entityId:5,entityType:1,x:0,y:0}});s.apply({type:"constructionCompleted",payload:{entityId:10}});assert.equal(s.state.population,2);assert.equal(s.state.resources.get("wood"),7);assert.equal(s.state.selection.entityId,5);assert.equal(s.state.messages.length,1);assert.deepEqual(received,["populationChanged","worldStateChanged","selectionChanged","constructionCompleted"]);});
test("Fase 8: seleção usa Spatial Partition e emite evento",()=>{const w=createSimulationWorld(null,32,32,32);w.bootstrap();const r=w.selectAt(0,0,1);assert.equal(r.ok,true);assert.equal(r.selection.entityId,1);assert.equal(w.events.at(-1).type,"selectionChanged");});
test("Fase 8: comando inválido não altera o mundo",()=>{const w=createSimulationWorld(null,32,32,32);w.bootstrap();const before=w.entities.size;const r=w.requestConstruction(EntityType.HOUSE,20,20);assert.equal(r.ok,false);assert.equal(r.reason,"insufficient-construction-stock");assert.equal(w.entities.size,before);});
test("Fase 8: recursos do mundo podem ser calculados para a UI",()=>{const w=createSimulationWorld();const totals=w.resourceTotals();assert.deepEqual(totals,{wood:0,planks:0,food:0,stone:0});});
