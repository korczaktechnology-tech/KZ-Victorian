export const WEBLORDS_VERSION = "0.2.0-memory";

export const SIMULATION = Object.freeze({
  TARGET_TICKS_PER_SECOND: 30,
  TICK_INTERVAL_MS: 1000 / 30
});

export const WORLD = Object.freeze({
  DEFAULT_WIDTH: 128,
  DEFAULT_HEIGHT: 128
});

/**
 * Capacidades de armazenamento da memória compartilhada.
 * Elas são referências iniciais e permanecem configuráveis.
 */
export const MEMORY_CAPACITIES = Object.freeze({
  entities: 4096,
  population: 8192,
  terrainCells: WORLD.DEFAULT_WIDTH * WORLD.DEFAULT_HEIGHT,
  resources: 4096,
  buildings: 4096,
  economyEntries: 1024,
  logisticsEntries: 4096,
  navigationCells: WORLD.DEFAULT_WIDTH * WORLD.DEFAULT_HEIGHT
});

export const MEMORY_REGION_NAMES = Object.freeze([
  "positions",
  "velocities",
  "states",
  "population",
  "terrain",
  "resources",
  "buildings",
  "economy",
  "logistics",
  "navigation"
]);

const BYTES_PER = Object.freeze({
  int32: Int32Array.BYTES_PER_ELEMENT,
  float32: Float32Array.BYTES_PER_ELEMENT,
  uint8: Uint8Array.BYTES_PER_ELEMENT
});

/**
 * Cada região possui uma finalidade única. Os offsets são calculados
 * exclusivamente aqui para impedir que sistemas individuais inventem
 * posições de memória.
 */
const REGION_DEFINITIONS = Object.freeze({
  positions: { bytesPerElement: BYTES_PER.float32, length: MEMORY_CAPACITIES.entities * 3 },
  velocities: { bytesPerElement: BYTES_PER.float32, length: MEMORY_CAPACITIES.entities * 3 },
  states: { bytesPerElement: BYTES_PER.int32, length: MEMORY_CAPACITIES.entities },
  population: { bytesPerElement: BYTES_PER.int32, length: MEMORY_CAPACITIES.population * 4 },
  terrain: { bytesPerElement: BYTES_PER.uint8, length: MEMORY_CAPACITIES.terrainCells * 4 },
  resources: { bytesPerElement: BYTES_PER.int32, length: MEMORY_CAPACITIES.resources * 4 },
  buildings: { bytesPerElement: BYTES_PER.int32, length: MEMORY_CAPACITIES.buildings * 4 },
  economy: { bytesPerElement: BYTES_PER.int32, length: MEMORY_CAPACITIES.economyEntries * 4 },
  logistics: { bytesPerElement: BYTES_PER.int32, length: MEMORY_CAPACITIES.logisticsEntries * 4 },
  navigation: { bytesPerElement: BYTES_PER.int32, length: MEMORY_CAPACITIES.navigationCells * 4 }
});

const align = (value, alignment) => Math.ceil(value / alignment) * alignment;

export function createMemoryLayout() {
  let offset = 0;
  const regions = {};

  for (const name of MEMORY_REGION_NAMES) {
    const definition = REGION_DEFINITIONS[name];
    offset = align(offset, Math.max(8, definition.bytesPerElement));
    const byteLength = definition.length * definition.bytesPerElement;

    regions[name] = Object.freeze({
      name,
      offset,
      byteLength,
      length: definition.length,
      bytesPerElement: definition.bytesPerElement,
      end: offset + byteLength
    });

    offset += byteLength;
  }

  const totalBytes = align(offset, 8);

  return Object.freeze({
    totalBytes,
    regions: Object.freeze(regions)
  });
}

export const MEMORY_LAYOUT = createMemoryLayout();

export const MEMORY = Object.freeze({
  INITIAL_BYTES: 64 * 1024 * 1024,
  ALIGNMENT_BYTES: 8,
  LAYOUT: MEMORY_LAYOUT
});

if (MEMORY_LAYOUT.totalBytes > MEMORY.INITIAL_BYTES) {
  throw new Error(
    `WebLords: o layout inicial exige ${MEMORY_LAYOUT.totalBytes} bytes, acima do orçamento de referência de ${MEMORY.INITIAL_BYTES} bytes.`
  );
}
