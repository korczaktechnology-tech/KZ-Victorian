import {readFile} from "node:fs/promises";
import {existsSync} from "node:fs";
for(const p of ["scripts/production-build.mjs","scripts/production-server.mjs","scripts/browser-smoke.mjs",".github/workflows/production.yml","docs/phase10-production.md","src/core/runtime-capabilities.js"])if(!existsSync(p))throw new Error("WebLords: requisito de produção ausente: "+p);
const workflow=await readFile(".github/workflows/production.yml","utf8");
for(const t of ["npm run check:all","npm run build:production","production-server.mjs","browser-smoke.mjs","playwright","https"])if(!workflow.includes(t))throw new Error("WebLords: requisito de deploy ausente: "+t);
if(/same-origin|require-corp|SharedArrayBuffer|crossOriginIsolated/.test(workflow))throw new Error("WebLords: workflow ainda exige isolamento removido.");
const build=await readFile("scripts/production-build.mjs","utf8");
for(const t of ["_dist","index.html","style.css","src","assets","terser","--mangle"])if(!build.includes(t))throw new Error("WebLords: build de produção incompleto: "+t);
console.log("WebLords production check: OK — build, minificação, servidor simples e smoke test configurados.");
