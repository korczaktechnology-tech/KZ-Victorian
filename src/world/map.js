import { WORLD, MEMORY_CAPACITIES } from "../core/constants.js";
import { EntityType, EntityTypeCode } from "../core/entities.js";

export const TerrainFlag = Object.freeze({
  BLOCKED: 1,
  ROAD: 2,
  BUILDING: 4,
  WATER: 8
});

export const DEFAULT_TERRAIN_COST = 1;
export const ROAD_COST = 1;
export const BUILDING_COST = 0;

export class WorldMap {
  constructor(width = WORLD.DEFAULT_WIDTH, height = WORLD.DEFAULT_HEIGHT, memory = null) {
    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      throw new RangeError("WebLords: dimensões do mapa inválidas.");
    }
    const cells = width * height;
    if (cells > MEMORY_CAPACITIES.navigationCells) {
      throw new RangeError("WebLords: o mapa excede a capacidade de células de navegação configurada.");
    }
    this.width = width;
    this.height = height;
    this.cells = cells;
    this.flags = memory?.regions?.terrain ?? new Uint8Array(cells * 4);
    this.navigation = memory?.regions?.navigation ?? new Int32Array(cells * 4);
    this.costs = new Uint16Array(cells);
    this.costs.fill(DEFAULT_TERRAIN_COST);
    this.revision = 0;
    this.navigationRevision = 0;
  }

  index(x, y) {
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
    return y * this.width + x;
  }

  coordinates(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.cells) return null;
    return { x: index % this.width, y: Math.floor(index / this.width) };
  }

  inBounds(x, y) { return this.index(x, y) >= 0; }

  isBlockedIndex(index) {
    return (this.flags[index * 4] & (TerrainFlag.BLOCKED | TerrainFlag.WATER | TerrainFlag.BUILDING)) !== 0;
  }

  isBlocked(x, y) {
    const index = this.index(x, y);
    return index < 0 || this.isBlockedIndex(index);
  }

  getCostIndex(index) {
    if (index < 0 || index >= this.cells || this.isBlockedIndex(index)) return Infinity;
    return this.costs[index];
  }

  getCost(x, y) {
    return this.getCostIndex(this.index(x, y));
  }

  setTerrain(x, y, { blocked = false, water = false, cost = DEFAULT_TERRAIN_COST } = {}) {
    const index = this.index(x, y);
    if (index < 0) throw new RangeError("WebLords: célula de terreno fora do mapa.");
    const base = index * 4;
    const previous = this.flags[base];
    let flags = previous & ~(TerrainFlag.BLOCKED | TerrainFlag.WATER);
    if (blocked) flags |= TerrainFlag.BLOCKED;
    if (water) flags |= TerrainFlag.WATER | TerrainFlag.BLOCKED;
    this.flags[base] = flags;
    this.costs[index] = Math.max(1, Math.floor(cost));
    if (flags !== previous) this.revision += 1;
    this.revision += 1;
    return index;
  }

  setRoad(x, y, enabled = true) {
    const index = this.index(x, y);
    if (index < 0) throw new RangeError("WebLords: célula de estrada fora do mapa.");
    const base = index * 4;
    const previous = this.flags[base];
    if (enabled) {
      this.flags[base] |= TerrainFlag.ROAD;
      this.flags[base] &= ~TerrainFlag.BLOCKED;
      this.flags[base + 1] = ROAD_COST;
      this.costs[index] = ROAD_COST;
    } else {
      this.flags[base] &= ~TerrainFlag.ROAD;
      this.flags[base + 1] = 0;
      this.costs[index] = DEFAULT_TERRAIN_COST;
    }
    if (this.flags[base] !== previous) this.revision += 1;
    return index;
  }

  setBuildingObstacle(x, y, enabled = true) {
    const index = this.index(x, y);
    if (index < 0) throw new RangeError("WebLords: célula de construção fora do mapa.");
    const base = index * 4;
    const previous = this.flags[base];
    if (enabled) {
      this.flags[base] |= TerrainFlag.BUILDING | TerrainFlag.BLOCKED;
      this.flags[base] &= ~TerrainFlag.ROAD;
    } else {
      this.flags[base] &= ~(TerrainFlag.BUILDING | TerrainFlag.BLOCKED);
    }
    if (this.flags[base] !== previous) this.revision += 1;
    return index;
  }

  markNavigationRevision() {
    this.navigationRevision = this.revision;
  }

  neighbors(index, callback, diagonal = true) {
    const { x, y } = this.coordinates(index) ?? {};
    if (x === undefined) return;
    const directions = diagonal
      ? [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
      : [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dy] of directions) {
      const nx = x + dx, ny = y + dy, ni = this.index(nx, ny);
      if (ni >= 0) callback(ni, dx, dy);
    }
  }

  syncEntity(entityId, entityType, position) {
    if (!position) return false;
    const x = Math.floor(position[0]), y = Math.floor(position[1]);
    if (!this.inBounds(x, y)) return false;
    if (entityType === EntityTypeCode[EntityType.ROAD]) this.setRoad(x, y, true);
    else if ([EntityType.HOUSE, EntityType.WAREHOUSE, EntityType.SAWMILL].some(t => EntityTypeCode[t] === entityType)) {
      this.setBuildingObstacle(x, y, true);
    }
    return true;
  }
}
