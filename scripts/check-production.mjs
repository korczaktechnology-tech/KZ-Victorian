import {readFile} from "node:fs/promises";import {existsSync} from "node:fs";
for(const p of ["scripts/production-build.mjs","scripts/production-server.mjs","scripts/browser-smoke.mjs",".github/workflows/production.yml","docs/phase10-production.md","src/core/runtime-capabilities.js","_headers"])if(!existsSync(p))throw new Error("WebLords: requisito de produção ausente: "+p);
const workflow=await readFile(".github/workflows/production.yml","utf8");
for(const t of ["npm run check:all","npm run build:production","production-server.mjs","browser-smoke.mjs","playwright","same-origin","require-corp","https"])if(!workflow.includes(t))throw new Error("WebLords: requisito de deploy ausente: "+t);
const build=await readFile("scripts/production-build.mjs","utf8");
for(const t of ["_dist","index.html","style.css","src","assets","terser","--mangle"])if(!build.includes(t))throw new Error("WebLords: build de produção incompleto: "+t);
console.log("WebLords production check: OK — build, minificação, servidor isolado e smoke test configurados.");
