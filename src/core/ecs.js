export const Component = Object.freeze({
  POSITION: "Position",
  VELOCITY: "Velocity",
  JOB: "Job",
  INVENTORY: "Inventory",
  NEEDS: "Needs",
  BUILDING: "Building",
  PRODUCTION: "Production",
  MOVEMENT: "Movement",
  HEALTH: "Health"
});

export const COMPONENTS = Object.freeze({
  [Component.POSITION]: { type: Float32Array, fields: 3 },
  [Component.VELOCITY]: { type: Float32Array, fields: 3 },
  [Component.JOB]: { type: Int32Array, fields: 3 },
  [Component.INVENTORY]: { type: Int32Array, fields: 4 },
  [Component.NEEDS]: { type: Int16Array, fields: 4 },
  [Component.BUILDING]: { type: Int32Array, fields: 4 },
  [Component.PRODUCTION]: { type: Int32Array, fields: 4 },
  [Component.MOVEMENT]: { type: Float32Array, fields: 4 },
  [Component.HEALTH]: { type: Int16Array, fields: 2 }
});

const componentNames = Object.freeze(Object.keys(COMPONENTS));
const componentBits = Object.freeze(Object.fromEntries(componentNames.map((name, index) => [name, 1 << index])));

export class ComponentStore {
  #capacity;
  #definitions;
  #data = new Map();

  constructor(capacity, definitions = COMPONENTS, externalData = {}) {
    if (!Number.isInteger(capacity) || capacity <= 0) throw new RangeError("WebLords: capacidade do ECS inválida.");
    this.#capacity = capacity;
    this.#definitions = definitions;
    for (const [name, definition] of Object.entries(definitions)) {
      const external = externalData[name];
      if (external !== undefined) {
        if (!(external instanceof definition.type) || external.length < capacity * definition.fields) {
          throw new TypeError(`WebLords: armazenamento externo inválido para ${name}.`);
        }
        this.#data.set(name, external);
      } else {
        this.#data.set(name, new definition.type(capacity * definition.fields));
      }
    }
  }

  data(name) {
    if (!this.#data.has(name)) throw new Error(`WebLords: componente desconhecido: ${name}.`);
    return this.#data.get(name);
  }

  view(name, id) {
    const definition = this.#definitions[name];
    if (!definition || id < 1 || id > this.#capacity) return null;
    const data = this.#data.get(name);
    const start = (id - 1) * definition.fields;
    return data.subarray(start, start + definition.fields);
  }

  clear(id) {
    for (const [name, definition] of Object.entries(this.#definitions)) {
      this.data(name).fill(0, (id - 1) * definition.fields, id * definition.fields);
    }
  }

  get capacity() { return this.#capacity; }
}

export class EntityRegistry {
  #capacity;
  #nextId = 1;
  #alive;
  #types;
  #masks;
  #freeIds;
  #freeCount = 0;
  #store;

  constructor(capacity = 4096, externalData = {}) {
    if (!Number.isInteger(capacity) || capacity <= 0) throw new RangeError("WebLords: capacidade de entidades inválida.");
    this.#capacity = capacity;
    this.#alive = new Uint8Array(capacity);
    this.#types = new Uint8Array(capacity);
    this.#masks = new Uint32Array(capacity);
    this.#freeIds = new Uint32Array(capacity);
    this.#store = new ComponentStore(capacity, COMPONENTS, externalData);
  }

  create(typeCode = 0) {
    if (this.#freeCount > 0) {
      const id = this.#freeIds[--this.#freeCount];
      this.#alive[id - 1] = 1;
      this.#types[id - 1] = typeCode;
      this.#masks[id - 1] = 0;
      return id;
    }
    if (this.#nextId > this.#capacity) throw new RangeError("WebLords: capacidade máxima de entidades atingida.");
    const id = this.#nextId++;
    this.#alive[id - 1] = 1;
    this.#types[id - 1] = typeCode;
    this.#masks[id - 1] = 0;
    return id;
  }

  destroy(id) {
    if (!this.has(id)) return false;
    this.#store.clear(id);
    this.#alive[id - 1] = 0;
    this.#types[id - 1] = 0;
    this.#masks[id - 1] = 0;
    this.#freeIds[this.#freeCount++] = id;
    return true;
  }

  has(id) { return Number.isInteger(id) && id > 0 && id <= this.#capacity && this.#alive[id - 1] === 1; }
  get size() { return this.#nextId - 1 - this.#freeCount; }
  get capacity() { return this.#capacity; }
  type(id) { return this.#types[id - 1] || 0; }
  mask(id) { return this.#masks[id - 1] || 0; }
  get components() { return this.#store; }

  add(id, component, values) {
    this.#assertEntity(id);
    const bit = componentBits[component];
    if (!bit) throw new Error(`WebLords: componente desconhecido: ${component}.`);
    const view = this.#store.view(component, id);
    if (values !== undefined) view.set(values);
    this.#masks[id - 1] |= bit;
    return view;
  }

  remove(id, component) {
    this.#assertEntity(id);
    const bit = componentBits[component];
    if (!bit) throw new Error(`WebLords: componente desconhecido: ${component}.`);
    this.#store.view(component, id).fill(0);
    this.#masks[id - 1] &= ~bit;
  }

  hasComponent(id, component) {
    const bit = componentBits[component];
    return this.has(id) && Boolean(bit && (this.#masks[id - 1] & bit));
  }

  get(id, component) {
    if (!this.hasComponent(id, component)) return null;
    return this.#store.view(component, id);
  }

  query(...required) {
    const requiredMask = required.reduce((mask, component) => mask | (componentBits[component] || 0), 0);
    const registry = this;
    return {
      forEach(callback) {
        for (let id = 1; id < registry.#nextId; id += 1) {
          const index = id - 1;
          if (registry.#alive[index] && (registry.#masks[index] & requiredMask) === requiredMask) callback(id);
        }
      },
      get mask() { return requiredMask; }
    };
  }

  #assertEntity(id) {
    if (!this.has(id)) throw new Error(`WebLords: entidade inválida: ${id}.`);
  }
}

export const ComponentBits = componentBits;
export const componentNamesList = componentNames;
