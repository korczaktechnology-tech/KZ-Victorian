import { MEMORY, MEMORY_REGION_NAMES, createMemoryLayout } from "./constants.js";

export function createSharedMemory(byteLength = MEMORY.INITIAL_BYTES) {
  if (typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "WebLords: SharedArrayBuffer não está disponível neste ambiente. A aplicação precisa de um ambiente compatível com memória compartilhada."
    );
  }

  if (!Number.isInteger(byteLength) || byteLength <= 0) {
    throw new RangeError("O tamanho da memória compartilhada deve ser um inteiro positivo.");
  }

  const requiredBytes = MEMORY.LAYOUT.totalBytes;
  if (byteLength < requiredBytes) {
    throw new RangeError(
      `WebLords: memória insuficiente. São necessários pelo menos ${requiredBytes} bytes para o layout atual; recebido: ${byteLength}.`
    );
  }

  try {
    return new SharedArrayBuffer(byteLength);
  } catch (error) {
    throw new Error(
      "WebLords: não foi possível criar o SharedArrayBuffer. Verifique se o ambiente permite memória compartilhada.",
      { cause: error }
    );
  }
}

export function createMemoryLayout(byteLength = MEMORY.INITIAL_BYTES) {
  const layout = createMemoryLayoutInternal();
  if (byteLength < layout.totalBytes) {
    throw new RangeError(
      `WebLords: o buffer informado é menor que o layout de memória. Necessário: ${layout.totalBytes}; recebido: ${byteLength}.`
    );
  }
  return layout;
}

function createMemoryLayoutInternal() {
  return createMemoryLayout();
}

export function createMemoryView(buffer, layout = MEMORY.LAYOUT) {
  if (typeof SharedArrayBuffer === "undefined" || !(buffer instanceof SharedArrayBuffer)) {
    throw new TypeError("WebLords: o buffer precisa ser um SharedArrayBuffer.");
  }

  if (buffer.byteLength < layout.totalBytes) {
    throw new RangeError(
      `WebLords: o SharedArrayBuffer possui ${buffer.byteLength} bytes, mas o layout exige ${layout.totalBytes}.`
    );
  }

  const views = {};
  for (const name of MEMORY_REGION_NAMES) {
    const region = layout.regions[name];
    const Constructor = name === "terrain" ? Uint8Array : (
      ["positions", "velocities"].includes(name) ? Float32Array : Int32Array
    );

    if (region.offset % Constructor.BYTES_PER_ELEMENT !== 0) {
      throw new RangeError(`WebLords: offset inválido para a região ${name}.`);
    }

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
    if (region.offset < previousEnd) {
      throw new Error(`WebLords: sobreposição detectada na região ${name}.`);
    }
    if (region.end !== region.offset + region.byteLength) {
      throw new Error(`WebLords: região ${name} possui tamanho inconsistente.`);
    }
    previousEnd = region.end;
  }

  if (layout.totalBytes < previousEnd) {
    throw new Error("WebLords: totalBytes é menor que o fim do layout.");
  }

  if (byteLength < layout.totalBytes) {
    throw new RangeError(
      `WebLords: tamanho insuficiente para o layout. Necessário: ${layout.totalBytes}; recebido: ${byteLength}.`
    );
  }

  return true;
}
