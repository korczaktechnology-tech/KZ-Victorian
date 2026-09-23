import {readFile} from "node:fs/promises";
const required=[
  "src/ui/event-store.js","src/ui/ui.js","src/ui/input.js","src/ui/error-boundary.js",
  "tests/phase8.test.js","docs/phase8-ui-events.md"
];
for(const path of required){await readFile(path,"utf8");}
const files=await Promise.all(required.slice(0,4).map(path=>readFile(path,"utf8")));
const text=files.join("\n");
for(const token of ["populationChanged","resourceChanged","selectionChanged","worldStateChanged","commandRejected","selection.request","createGameUI","createInputController"]) {
  if(!text.includes(token)) throw new Error("WebLords: contrato ausente na Fase 8: "+token);
}
console.log("WebLords UI check: OK — UI, eventos, seleção, input e tratamento de erros presentes.");
