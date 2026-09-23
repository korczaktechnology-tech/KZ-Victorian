const INF = 0x3fffffff;

export class FlowField {
  constructor(map) {
    this.map = map;
    this.fields = new Map();
  }

  create(id, destinations, options = {}) {
    if (id === undefined || id === null) throw new TypeError("WebLords: Flow Field precisa de um identificador.");
    const field = this.#build(destinations, options);
    this.fields.set(id, field);
    this.#writeNavigation(field);
    return field;
  }

  get(id) { return this.fields.get(id) ?? null; }

  remove(id) {
    const removed = this.fields.delete(id);
    if (removed) this.map.navigation.fill(0);
    return removed;
  }

  rebuild(id) {
    const previous = this.get(id);
    if (!previous) return null;
    return this.create(id, previous.destinations, previous.options);
  }

  directionAt(id, x, y) {
    const field = this.get(id);
    const index = this.map.index(x, y);
    if (!field || index < 0) return null;
    return { x: field.directionX[index], y: field.directionY[index], cost: field.cost[index] >= INF ? -1 : field.cost[index] };
  }

  #build(destinations, options) {
    const diagonal = options?.diagonal !== false;
    const normalized = [...new Set((destinations ?? []).map(d => this.map.index(d.x, d.y)).filter(i => i >= 0))];
    if (normalized.length === 0) throw new RangeError("WebLords: Flow Field precisa de pelo menos um destino válido.");
    const cost = new Int32Array(this.map.cells);
    cost.fill(INF);
    const directionX = new Int8Array(this.map.cells);
    const directionY = new Int8Array(this.map.cells);
    const queue = new MinHeap();

    for (const index of normalized) {
      if (this.map.isBlockedIndex(index)) continue;
      cost[index] = 0;
      queue.push(0, index);
    }
    if (queue.size === 0) throw new Error("WebLords: todos os destinos do Flow Field estão bloqueados.");

    while (queue.size > 0) {
      const current = queue.pop();
      if (current.cost !== cost[current.index]) continue;
      this.map.neighbors(current.index, (next, dx, dy) => {
        if (this.map.isBlockedIndex(next)) return;
        if (dx !== 0 && dy !== 0) {
          const currentCoords = this.map.coordinates(current.index);
          if (this.map.isBlocked(currentCoords.x + dx, currentCoords.y) || this.map.isBlocked(currentCoords.x, currentCoords.y + dy)) return;
        }
        const step = Math.max(1, this.map.getCostIndex(next)) * (dx !== 0 && dy !== 0 ? 1.4142 : 1);
        const nextCost = Math.min(INF, Math.floor(current.cost + step));
        if (nextCost < cost[next]) {
          cost[next] = nextCost;
          queue.push(nextCost, next);
        }
      }, diagonal);
    }

    for (let index = 0; index < this.map.cells; index += 1) {
      if (cost[index] === INF || this.map.isBlockedIndex(index)) continue;
      let bestCost = cost[index];
      this.map.neighbors(index, (next, dx, dy) => {
        if (cost[next] < bestCost) {
          bestCost = cost[next];
          directionX[index] = dx;
          directionY[index] = dy;
        }
      }, diagonal);
    }

    return Object.freeze({
      destinations: Object.freeze(normalized.map(index => this.map.coordinates(index))),
      options: Object.freeze({ diagonal }),
      cost, directionX, directionY,
      revision: this.map.revision
    });
  }

  #writeNavigation(field) {
    const navigation = this.map.navigation;
    for (let index = 0; index < this.map.cells; index += 1) {
      const base = index * 4;
      navigation[base] = field.directionX[index];
      navigation[base + 1] = field.directionY[index];
      navigation[base + 2] = field.cost[index] >= INF ? -1 : field.cost[index];
      navigation[base + 3] = 1;
    }
    this.map.markNavigationRevision();
  }
}

class MinHeap {
  constructor() { this.items = []; }
  get size() { return this.items.length; }
  push(cost, index) {
    const item = { cost, index };
    this.items.push(item);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.items[p].cost <= item.cost) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = item;
  }
  pop() {
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length) {
      let i = 0;
      while (true) {
        const l = i * 2 + 1, r = l + 1;
        if (l >= this.items.length) break;
        const child = r < this.items.length && this.items[r].cost < this.items[l].cost ? r : l;
        if (this.items[child].cost >= last.cost) break;
        this.items[i] = this.items[child];
        i = child;
      }
      this.items[i] = last;
    }
    return root;
  }
}
