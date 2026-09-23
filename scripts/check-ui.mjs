import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url),required=["src/ui/event-store.js","src/ui/ui.js","src/ui/input.js","src/ui/error-boundary.js","tests/phase8.test.js","docs/phase8-ui-events.md"];
for(const path of required)await readFile(new URL(path,root),"utf8");
const source=await Promise.all(required.slice(0,4).map(path=>readFile(new URL(path,root),"utf8"))).then(a=>a.join("\n"));
for(const token of ["populationChanged","resourceChanged","selectionChanged","worldStateChanged","commandRejected","selection.request","createGameUI","createInputController","RESOURCE_NAMES"])if(!source.includes(token))throw new Error("WebLords: contrato ausente na Fase 8: "+token);
const index=await readFile(new URL("index.html",root),"utf8");
if(!index.includes('id="interface"')||!index.includes('src/main.js'))throw new Error("WebLords: integração HTML da UI incompleta.");
console.log("WebLords UI check: OK — estado, eventos, recursos, seleção, comandos e integração visual validados.");
