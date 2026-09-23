export class EntityRegistry {
  #nextId = 1;
  #entities = new Set();

  create() {
    const id = this.#nextId++;
    this.#entities.add(id);
    return id;
  }

  destroy(id) {
    return this.#entities.delete(id);
  }

  has(id) {
    return this.#entities.has(id);
  }

  get size() {
    return this.#entities.size;
  }
}
