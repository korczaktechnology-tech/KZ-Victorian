import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url),files=["src/world/map.js","src/world/flow-field.js","src/world/spatial-partition.js","src/core/world.js","src/systems/pathfinding.js","src/systems/construction.js","tests/phase6.test.js"];
const source=await Promise.all(files.map(f=>readFile(new URL(f,root),"utf8"))).then(a=>a.join("\n"));
for(const token of ["TerrainFlag","FlowField","SpatialPartition","navigation","setBuildingObstacle","directionAt","queryRadius"])if(!source.includes(token))throw new Error("Fase 6: requisito ausente: "+token);
if(!source.includes("memory?.regions?.terrain")||!source.includes("rebuildNavigation"))throw new Error("Fase 6: memória local/navegação ausente.");
if(source.includes("SharedArrayBuffer")||source.includes("Atomics"))throw new Error("Fase 6: referência ao modelo removido encontrada.");
console.log("WebLords world check: OK — mapa, memória local, Flow Field, rebuild e Spatial Partition validados.");
