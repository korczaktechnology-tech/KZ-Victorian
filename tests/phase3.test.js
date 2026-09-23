import test from "node:test";
import assert from "node:assert/strict";
import { createSharedMemory, createMemoryView } from "../src/core/memory.js";
import { Component, componentNamesList, EntityRegistry } from "../src/core/ecs.js";
import { EntityType, EntityTypeCode } from "../src/core/entities.js";
import { createSimulationWorld } from "../src/core/world.js";
import { SimulationCore, SIMULATION_SYSTEM_ORDER } from "../src/systems/simulation-core.js";
import { updateMovement } from "../src/systems/movement.js";
import { updateNeeds } from "../src/systems/needs.js";
import { updateConstruction } from "../src/systems/construction.js";
import { updateProduction, queueProduction } from "../src/systems/production.js";
import { MEMORY_CAPACITIES } from "../src/core/constants.js";

test("ECS declara exatamente os nove componentes arquiteturais", () => {
  assert.deepEqual(componentNamesList, [
    "Position", "Velocity", "Job", "Inventory", "Needs",
    "Building", "Production", "Movement", "Health"
  ]);
});

test("EntityRegistry usa armazenamento contíguo e máscaras de componentes", () => {
  const registry = new EntityRegistry(8);
  const id = registry.create(EntityTypeCode[EntityType.HABITANT]);
  registry.add(id, Component.POSITION, [1, 2, 3]);
  registry.add(id, Component.HEALTH, [100, 100]);
  assert.equal(registry.has(id), true);
  assert.equal(registry.hasComponent(id, Component.POSITION), true);
  assert.equal(registry.hasComponent(id, Component.VELOCITY), false);
  assert.deepEqual([...registry.get(id, Component.POSITION)], [1, 2, 3]);
  let matches = 0;
  registry.query(Component.POSITION, Component.HEALTH).forEach((entityId) => { if (entityId === id) matches += 1; });
  assert.equal(matches, 1);
});

test("entidades destruídas liberam o ID para reutilização sem preservar componentes", () => {
  const registry = new EntityRegistry(2);
  const first = registry.create();
  registry.add(first, Component.HEALTH, [50, 100]);
  assert.equal(registry.destroy(first), true);
  const reused = registry.create();
  assert.equal(reused, first);
  assert.equal(registry.get(reused, Component.HEALTH), null);
});

test("todos os oito tipos de entidade previstos são representáveis", () => {
  const registry = new EntityRegistry(8);
  for (const type of Object.values(EntityType)) registry.create(EntityTypeCode[type]);
  assert.equal(registry.size, 8);
});

test("posição e velocidade do ECS podem usar diretamente regiões do SharedArrayBuffer", () => {
  const memory = createMemoryView(createSharedMemory());
  const world = createSimulationWorld(memory, MEMORY_CAPACITIES.entities);
  const id = world.spawn(EntityType.HABITANT, 0, 0, 0);
  const position = world.entities.get(id, Component.POSITION);
  position[0] = 10;
  assert.equal(memory.regions.positions[0], 10);
});

test("Movement atualiza posição e velocidade em loop linear", () => {
  const world = createSimulationWorld();
  const id = world.spawn(EntityType.HABITANT, 0, 0, 0);
  world.entities.add(id, Component.MOVEMENT, [10, 0, 0, 3]);
  const moved = updateMovement(world, 1);
  assert.equal(moved, 1);
  assert.equal(world.entities.get(id, Component.POSITION)[0], 3);
  assert.equal(world.entities.get(id, Component.VELOCITY)[0], 3);
});

test("Needs reduz necessidades sem ultrapassar os limites", () => {
  const world = createSimulationWorld();
  const id = world.spawn(EntityType.HABITANT);
  const needs = world.entities.get(id, Component.NEEDS);
  needs.set([1, 1, 1, 100]);
  updateNeeds(world);
  assert.deepEqual([...needs], [0, 0, 0, 100]);
});

test("Construction conclui uma construção e emite evento", () => {
  const world = createSimulationWorld();
  const id = world.spawn(EntityType.HOUSE);
  const building = world.entities.get(id, Component.BUILDING);
  building.set([1, 1, 99, 100]);
  const completed = updateConstruction(world);
  assert.equal(completed, 1);
  assert.equal(building[1], 2);
  assert.equal(building[2], 100);
  assert.equal(world.events[0].type, "constructionCompleted");
});

test("Production respeita a duração da receita e gera saída ao concluir", () => {
  const world = createSimulationWorld();
  const id = world.spawn(EntityType.SAWMILL);
  world.entities.get(id, Component.INVENTORY)[0] = 2;
  assert.equal(queueProduction(world, id, "SAWMILL_PLANKS").ok, true);
  for (let i = 0; i < 29; i += 1) updateProduction(world);
  assert.equal(world.entities.get(id, Component.INVENTORY)[1], 0);
  updateProduction(world);
  assert.equal(world.entities.get(id, Component.INVENTORY)[0], 0);
  assert.equal(world.entities.get(id, Component.INVENTORY)[1], 1);
});

test("SimulationCore executa os oito sistemas na ordem definida", () => {
  const core = new SimulationCore();
  const result = core.tick();
  assert.equal(result.tick, 1);
  assert.deepEqual([...SIMULATION_SYSTEM_ORDER], [
    "Population", "Pathfinding", "Movement", "Needs",
    "Economy", "Production", "Construction", "Logistics"
  ]);
  assert.equal(result.metrics.population, 2);
});

test("SimulationCore mantém estado no SharedArrayBuffer durante o tick", () => {
  const memory = createMemoryView(createSharedMemory());
  const core = new SimulationCore(memory);
  const result = core.tick();
  assert.equal(result.tick, 1);
  assert.equal(Atomics.load(memory.regions.population, 0), 2);
  assert.ok(memory.regions.positions[0] >= 0);
});

test("capacidade ECS respeita o limite definido pela arquitetura", () => {
  const registry = new EntityRegistry(MEMORY_CAPACITIES.entities);
  assert.equal(registry.capacity, MEMORY_CAPACITIES.entities);
  assert.throws(() => {
    const small = new EntityRegistry(1);
    small.create();
    small.create();
  }, RangeError);
});
