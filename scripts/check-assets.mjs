import {readFile} from "node:fs/promises";
for(const path of ["src/core/asset-manager.js","src/core/memory-budget.js","src/core/asset-manifest.js","docs/phase9-assets-memory.md","tests/phase9.test.js"])await readFile(path,"utf8");
const source=await readFile("src/core/asset-manager.js","utf8");for(const token of [".glb",".ktx2",".ogg","clearUnused","getStats"])if(!source.includes(token))throw new Error("WebLords: requisito ausente: "+token);
const doc=await readFile("docs/phase9-assets-memory.md","utf8");for(const token of ["15 MiB","64 MiB","Meshopt","Draco","sob demanda"])if(!doc.includes(token))throw new Error("WebLords: requisito ausente: "+token);
console.log("WebLords assets check: OK — assets e memória validados.");