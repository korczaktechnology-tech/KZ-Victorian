import test from "node:test";
import assert from "node:assert/strict";
import {createAssetManager,validateAssetPath} from "../src/core/asset-manager.js";
import {inspectGLB} from "../src/core/asset-loader.js";
import {loadAssetCatalog} from "../src/core/asset-pipeline.js";
import {MEMORY_BUDGET,validateMemoryBudget} from "../src/core/memory-budget.js";
import {ASSET_MANIFEST} from "../src/core/asset-manifest.js";
import {createAssetProfiler} from "../src/core/asset-profiler.js";

test("Fase 9: formatos e localização",()=>{
 assert.equal(validateAssetPath("assets/models/house.glb").type,"model");
 assert.equal(validateAssetPath("assets/textures/house.ktx2").type,"texture");
 assert.equal(validateAssetPath("assets/audio/step.ogg").type,"audio");
 assert.equal(validateAssetPath("assets/fonts/ui.woff2").type,"font");
 assert.throws(()=>validateAssetPath("src/house.obj"));
});

test("Fase 9: cache, referências e descarregamento",async()=>{
 const m=createAssetManager({fetchImpl:async()=>({ok:true,status:200,arrayBuffer:async()=>new Uint8Array(1024).buffer})});
 const a=await m.load("assets/models/house.glb");
 assert.equal(a.bytes,1024);
 m.release(a.path);
 assert.equal(m.unload(a.path),true);
 assert.equal(m.getStats().count,0);
});

test("Fase 9: cache evita download duplicado",async()=>{
 let calls=0;
 const m=createAssetManager({fetchImpl:async()=>{calls+=1;return{ok:true,status:200,arrayBuffer:async()=>new ArrayBuffer(8)}}});
 await m.load("assets/models/a.glb"); await m.load("assets/models/a.glb");
 assert.equal(calls,1); assert.equal(m.getStats().entries[0].refs,2);
});

test("Fase 9: orçamento impede ultrapassagem",async()=>{
 const m=createAssetManager({maxBytes:8,fetchImpl:async()=>({ok:true,status:200,arrayBuffer:async()=>new ArrayBuffer(9)})});
 await assert.rejects(()=>m.load("assets/models/too-large.glb"),/orçamento/);
});

test("Fase 9: manifesto contém asset essencial real",()=>{
 assert.ok(ASSET_MANIFEST.essential.includes("assets/models/web-lords-triangle.glb"));
 assert.equal(ASSET_MANIFEST.policy.models,".glb");
});

test("Fase 9: pipeline carrega e inspeciona o catálogo essencial",async()=>{
 const glb=new Uint8Array(20);
 new DataView(glb.buffer).setUint32(0,0x46546c67,true);
 new DataView(glb.buffer).setUint32(4,2,true);
 new DataView(glb.buffer).setUint32(8,20,true);
 const m=createAssetManager({fetchImpl:async()=>({ok:true,status:200,arrayBuffer:async()=>glb.buffer})});
 const loaded=await loadAssetCatalog(m);
 assert.equal(loaded.length,1);
 assert.equal(loaded[0].inspection.format,"glb");
});

test("Fase 9: inspeção rejeita GLB inválido",()=>{
 assert.throws(()=>inspectGLB(new ArrayBuffer(20)),/assinatura GLB/);
});

test("Fase 9: orçamento explícito",()=>{
 assert.equal(MEMORY_BUDGET.sharedArrayBufferBytes,64*1024*1024);
 assert.equal(MEMORY_BUDGET.targetAssetBytes,15*1024*1024);
 assert.equal(validateMemoryBudget({sharedArrayBufferBytes:64*1024*1024,assetBytes:15*1024*1024}).assetsWithinTarget,true);
});

test("Fase 9: profiler mede frames sem esconder ausência de APIs",()=>{
 const p=createAssetProfiler(); const token=p.beginFrame(); p.endFrame(token,{drawCalls:1});
 const stats=p.getStats(); assert.equal(stats.samples,1); assert.ok(stats.averageFrameMs>=0);
});
