import test from "node:test";
import assert from "node:assert/strict";
import { createSharedMemory, createMemoryView } from "../src/core/memory.js";
import { MEMORY } from "../src/core/constants.js";
import { WorldMap, TerrainFlag } from "../src/world/map.js";
import { FlowField } from "../src/world/flow-field.js";
import { SpatialPartition } from "../src/world/spatial-partition.js";
import { createSimulationWorld } from "../src/core/world.js";
import { EntityType } from "../src/core/entities.js";
import { updatePathfinding } from "../src/systems/pathfinding.js";
import { SimulationCore } from "../src/systems/simulation-core.js";

test("Fase 6: mapa cria grade, índices e coordenadas consistentes", () => {
  const map = new WorldMap(8, 6);
  assert.equal(map.cells, 48);
  assert.equal(map.index(3, 4), 35);
  assert.deepEqual(map.coordinates(35), { x: 3, y: 4 });
  assert.equal(map.index(-1, 0), -1);
});

test("Fase 6: terreno registra células livres, obstáculos, água e custos", () => {
  const map = new WorldMap(4, 4);
  map.setTerrain(1, 1, { cost: 7 });
  assert.equal(map.isBlocked(1, 1), false);
  assert.equal(map.getCost(1, 1), 7);
  map.setTerrain(2, 2, { water: true });
  assert.equal(map.isBlocked(2, 2), true);
  map.setRoad(1, 1, true);
  assert.equal(map.flags[map.index(1, 1) * 4] & TerrainFlag.ROAD, TerrainFlag.ROAD);
  assert.equal(map.getCost(1, 1), 1);
});

test("Fase 6: Flow Field calcula custo e direção por célula", () => {
  const map = new WorldMap(7, 3);
  map.setTerrain(3, 1, { blocked: true });
  const flow = new FlowField(map);
  const field = flow.create("warehouse", [{ x: 6, y: 1 }]);
  assert.ok(field);
  const direction = flow.directionAt("warehouse", 5, 1);
  assert.equal(direction.x, 1);
  assert.equal(direction.y, 0);
  assert.ok(direction.cost >= 1);
  assert.equal(map.navigation[map.index(5, 1) * 4], 1);
});

test("Fase 6: Flow Field respeita obstáculos e não corta diagonalmente cantos bloqueados", () => {
  const map = new WorldMap(3, 3);
  map.setTerrain(1, 0, { blocked: true });
  map.setTerrain(0, 1, { blocked: true });
  const flow = new FlowField(map);
  flow.create("target", [{ x: 2, y: 2 }]);
  assert.equal(flow.directionAt("target", 0, 0).cost, -1);
});

test("Fase 6: Flow Fields aceitam múltiplos destinos e são reconstruíveis", () => {
  const map = new WorldMap(8, 8);
  const flow = new FlowField(map);
  flow.create("group", [{ x: 7, y: 7 }, { x: 0, y: 7 }]);
  const first = flow.get("group");
  const revision = first.revision;
  map.setTerrain(4, 4, { blocked: true });
  const rebuilt = flow.rebuild("group");
  assert.notEqual(rebuilt.revision, revision);
  assert.equal(rebuilt.destinations.length, 2);
});

test("Fase 6: Spatial Partition localiza entidades dentro do raio", () => {
  const partition = new SpatialPartition(10, 10, 1);
  partition.insert(1, 1, 1);
  partition.insert(2, 7, 7);
  const positions = new Map([[1, [1, 1]], [2, [7, 7]]]);
  const found = [];
  partition.queryRadius(1, 1, 1.5, id => positions.get(id), id => found.push(id));
  assert.deepEqual(found, [1]);
});

test("Fase 6: construção altera a navegabilidade e permite reconstruir o Flow Field", () => {
  const world = createSimulationWorld(null, undefined, 16, 16);
  world.bootstrap();
  const before = world.map.navigationRevision;
  const building = world.spawn(EntityType.HOUSE, 3, 0, 0);
  assert.ok(world.map.revision > before);
  world.rebuildNavigation();
  assert.equal(world.map.navigationRevision, world.map.revision);
  assert.equal(world.map.isBlocked(3, 0), true);
  assert.ok(building > 0);
});

test("Fase 6: Pathfinding consulta o Flow Field e direciona entidades móveis", () => {
  const world = createSimulationWorld(null, undefined, 16, 16);
  world.bootstrap();
  const id = world.spawn(EntityType.HABITANT, 1, 1, 0);
  world.entities.get(id, "Movement")[3] = 2;
  const directed = updatePathfinding(world);
  assert.equal(directed, 1);
  const movement = world.entities.get(id, "Movement");
  assert.ok(movement[0] !== 0 || movement[1] !== 0);
});

test("Fase 6: terreno e navegação usam o SharedArrayBuffer da arquitetura", () => {
  const memory = createMemoryView(createSharedMemory(MEMORY.INITIAL_BYTES));
  const world = createSimulationWorld(memory);
  assert.equal(world.map.flags.buffer, memory.buffer);
  assert.equal(world.map.navigation.buffer, memory.buffer);
  assert.equal(world.map.cells, 128 * 128);
});

test("Fase 6: SimulationCore mantém navegação atualizada durante o ciclo", () => {
  const memory = createMemoryView(createSharedMemory(MEMORY.INITIAL_BYTES));
  const core = new SimulationCore(memory);
  const result = core.tick();
  assert.equal(result.tick, 1);
  assert.ok(core.world.navigation.activeField);
  assert.equal(core.world.map.navigationRevision, core.world.map.revision);
});
