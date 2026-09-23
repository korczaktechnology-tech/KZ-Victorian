export class SpatialPartition {
  constructor(width, height, cellSize = 1) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) throw new RangeError("WebLords: dimensões da partição inválidas.");
    if (!Number.isFinite(cellSize) || cellSize <= 0) throw new RangeError("WebLords: cellSize inválido.");
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.buckets = Array.from({ length: width * height }, () => []);
    this.entityCells = new Map();
  }

  cellFor(x, y) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    if (cx < 0 || cy < 0 || cx >= this.width || cy >= this.height) return -1;
    return cy * this.width + cx;
  }

  clear() {
    for (const bucket of this.buckets) bucket.length = 0;
    this.entityCells.clear();
  }

  insert(entityId, x, y) {
    const cell = this.cellFor(x, y);
    if (cell < 0) return false;
    this.buckets[cell].push(entityId);
    this.entityCells.set(entityId, cell);
    return true;
  }

  rebuild(entities, positionComponent = "Position") {
    this.clear();
    entities.query(positionComponent).forEach(id => {
      const position = entities.get(id, positionComponent);
      this.insert(id, position[0], position[1]);
    });
    return this;
  }

  queryRadius(x, y, radius, getPosition, callback) {
    if (typeof getPosition !== "function" || typeof callback !== "function") throw new TypeError("WebLords: queryRadius exige getPosition e callback.");
    if (!Number.isFinite(radius) || radius < 0) throw new RangeError("WebLords: raio inválido.");
    const minX = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxX = Math.min(this.width - 1, Math.floor((x + radius) / this.cellSize));
    const minY = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxY = Math.min(this.height - 1, Math.floor((y + radius) / this.cellSize));
    const radiusSq = radius * radius;
    for (let cy = minY; cy <= maxY; cy += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) {
        for (const id of this.buckets[cy * this.width + cx]) {
          const position = getPosition(id);
          if (!position) continue;
          const dx = position[0] - x, dy = position[1] - y;
          if (dx * dx + dy * dy <= radiusSq) callback(id, position);
        }
      }
    }
  }

  queryCell(x, y, callback) {
    const cell = this.cellFor(x, y);
    if (cell < 0) return;
    for (const id of this.buckets[cell]) callback(id);
  }
}
