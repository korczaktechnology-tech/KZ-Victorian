import { MEMORY } from "./constants.js";

export function createSharedMemory(byteLength = MEMORY.INITIAL_BYTES) {
  if (typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "WebLords: SharedArrayBuffer não está disponível neste ambiente."
    );
  }

  if (!Number.isInteger(byteLength) || byteLength <= 0) {
    throw new RangeError("O tamanho da memória compartilhada deve ser positivo.");
  }

  return new SharedArrayBuffer(byteLength);
}

export function createMemoryView(buffer) {
  if (!(buffer instanceof SharedArrayBuffer)) {
    throw new TypeError("O buffer precisa ser um SharedArrayBuffer.");
  }

  return {
    bytes: new Uint8Array(buffer),
    int32: new Int32Array(buffer),
    float32: new Float32Array(buffer)
  };
}
