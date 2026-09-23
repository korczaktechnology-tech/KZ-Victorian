import test from "node:test";
import assert from "node:assert/strict";
import {createAssetManager,validateAssetPath} from "../src/core/asset-manager.js";
import {MEMORY_BUDGET,validateMemoryBudget} from "../src/core/memory-budget.js";
test("Fase 9: valida formatos",()=>{assert.equal(validateAssetPath("assets/models/house.glb").type,"model");assert.equal(validateAssetPath("assets/textures/house.ktx2").type,"texture");assert.equal(validateAssetPath("assets/audio/step.ogg").type,"audio");assert.throws(()=>validateAssetPath("src/house.obj"));});
test("Fase 9: cache, referências e descarregamento",async()=>{const m=createAssetManager({fetchImpl:async()=>({ok:true,status:200,arrayBuffer:async()=>new Uint8Array(1024).buffer})});const a=await m.load("assets/models/house.glb");assert.equal(a.bytes,1024);m.release(a.path);assert.equal(m.unload(a.path),true);assert.equal(m.getStats().count,0);});
test("Fase 9: cache evita download duplicado",async()=>{let calls=0;const m=createAssetManager({fetchImpl:async()=>{calls++;return{ok:true,status:200,arrayBuffer:async()=>new ArrayBuffer(8)}}});await m.load("assets/models/a.glb");await m.load("assets/models/a.glb");assert.equal(calls,1);assert.equal(m.getStats().entries[0].refs,2);});
test("Fase 9: orçamento explícito",()=>{assert.equal(MEMORY_BUDGET.sharedArrayBufferBytes,64*1024*1024);assert.equal(MEMORY_BUDGET.targetAssetBytes,15*1024*1024);assert.equal(validateMemoryBudget({sharedArrayBufferBytes:64*1024*1024,assetBytes:15*1024*1024}).assetsWithinTarget,true);});
