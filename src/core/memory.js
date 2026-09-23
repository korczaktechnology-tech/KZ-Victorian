import { MEMORY, MEMORY_REGION_NAMES, createMemoryLayout as buildMemoryLayout } from "./constants.js";

export function createLocalMemory(byteLength = MEMORY.INITIAL_BYTES) {
  if (!Number.isInteger(byteLength) || byteLength <= 0) {
    throw new RangeError("WebLords: o tamanho da memória local deve ser um inteiro positivo.");
  }
  const requiredBytes = MEMORY.LAYOUT.totalBytes;
  if (byteLength < requiredBytes) {
    throw new RangeError(
      `WebLords: memória insuficiente. São necessários pelo menos ${requiredBytes} bytes; recebido: ${byteLength}.`
    );
  }
  try {
    return new ArrayBuffer(byteLength);
  } catch (error) {
    throw new Error("WebLords: não foi possível criar a memória local da simulação.", { cause: error });
  }
}

export function createMemoryLayout(byteLength = MEMORY.INITIAL_BYTES) {
  const layout = buildMemoryLayout();
  validateMemoryLayout(layout, byteLength);
  return layout;
}

export function createMemoryView(buffer, layout = MEMORY.LAYOUT) {
  if (!(buffer instanceof ArrayBuffer)) {
    throw new TypeError("WebLords: o buffer precisa ser um ArrayBuffer local.");
  }
  validateMemoryLayout(layout, buffer.byteLength);
  const views = {};
  for (const name of MEMORY_REGION_NAMES) {
    const region = layout.regions[name];
    const Constructor = name === "terrain"
      ? Uint8Array
      : (name === "positions" || name === "velocities" ? Float32Array : Int32Array);
    views[name] = new Constructor(buffer, region.offset, region.length);
  }
  return Object.freeze({
    buffer,
    layout,
    regions: Object.freeze(views)
  });
}

export function validateMemoryLayout(layout = MEMORY.LAYOUT, byteLength = MEMORY.INITIAL_BYTES) {
  if (!layout || !Number.isInteger(layout.totalBytes) || layout.totalBytes <= 0) {
    throw new TypeError("WebLords: layout de memória inválido.");
  }
  let previousEnd = 0;
  for (const name of MEMORY_REGION_NAMES) {
    const region = layout.regions[name];
    if (!region) throw new Error(`WebLords: região ausente: ${name}.`);
    if (region.offset < previousEnd) throw new Error(`WebLords: sobreposição detectada na região ${name}.`);
    if (region.end !== region.offset + region.byteLength) throw new Error(`WebLords: região ${name} possui tamanho inconsistente.`);
    previousEnd = region.end;
  }
  if (layout.totalBytes < previousEnd) throw new Error("WebLords: totalBytes é menor que o fim do layout.");
  if (!Number.isInteger(byteLength) || byteLength < layout.totalBytes) {
    throw new RangeError(`WebLords: tamanho insuficiente para o layout. Necessário: ${layout.totalBytes}; recebido: ${byteLength}.`);
  }
  return true;
}
