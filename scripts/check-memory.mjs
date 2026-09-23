import { MEMORY, MEMORY_REGION_NAMES } from "../src/core/constants.js";
import { createLocalMemory, createMemoryView, validateMemoryLayout } from "../src/core/memory.js";

validateMemoryLayout(MEMORY.LAYOUT, MEMORY.INITIAL_BYTES);
const buffer = createLocalMemory(MEMORY.INITIAL_BYTES);
const view = createMemoryView(buffer);
let previousEnd = 0;
for (const name of MEMORY_REGION_NAMES) {
  const region = MEMORY.LAYOUT.regions[name];
  if (region.offset < previousEnd) throw new Error(`Sobreposição na região ${name}.`);
  if (region.end > buffer.byteLength) throw new Error(`Região ${name} ultrapassa o buffer.`);
  previousEnd = region.end;
}
if (buffer.byteLength !== MEMORY.INITIAL_BYTES) throw new Error("A memória local inicial possui tamanho inesperado.");
console.log(`WebLords memory check: OK — ${buffer.byteLength} bytes locais, ${MEMORY_REGION_NAMES.length} regiões e sem sobreposição.`);
