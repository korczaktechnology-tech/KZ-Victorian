import { createSharedMemory, createMemoryView } from "../src/core/memory.js";
import { Component, componentNamesList, EntityRegistry } from "../src/core/ecs.js";
import { EntityType } from "../src/core/entities.js";
import { SimulationCore, SIMULATION_SYSTEM_ORDER } from "../src/systems/simulation-core.js";
import { MEMORY_CAPACITIES } from "../src/core/constants.js";

const expectedComponents = [
  "Position", "Velocity", "Job", "Inventory", "Needs",
  "Building", "Production", "Movement", "Health"
];
const expectedTypes = [
  "habitant", "tree", "house", "warehouse",
  "sawmill", "road", "resource", "animal"
];
if (JSON.stringify(componentNamesList) !== JSON.stringify(expectedComponents)) {
  throw new Error("WebLords ECS check: componentes fora da especificação.");
}
if (JSON.stringify(Object.values(EntityType)) !== JSON.stringify(expectedTypes)) {
  throw new Error("WebLords ECS check: entidades fora da especificação.");
}
if (Object.keys(Component).length !== 9) throw new Error("WebLords ECS check: quantidade de componentes inválida.");

const memory = createMemoryView(createSharedMemory());
const core = new SimulationCore(memory, MEMORY_CAPACITIES.entities);
if (core.world.entities.size !== 9) throw new Error("WebLords ECS check: bootstrap de entidades incompleto.");

const result = core.tick();
if (result.tick !== 1) throw new Error("WebLords ECS check: tick do núcleo inválido.");
if (result.metrics.population !== 2) throw new Error("WebLords ECS check: população inicial inválida.");
if (Atomics.load(memory.regions.population, 0) !== 2) throw new Error("WebLords ECS check: população não sincronizada.");

const registry = new EntityRegistry(2);
const id = registry.create();
registry.add(id, Component.POSITION, [1, 2, 3]);
if (!registry.hasComponent(id, Component.POSITION)) throw new Error("WebLords ECS check: componente não registrado.");
if (registry.get(id, Component.POSITION)[0] !== 1) throw new Error("WebLords ECS check: armazenamento de componente inválido.");

if (SIMULATION_SYSTEM_ORDER.length !== 8) throw new Error("WebLords ECS check: ordem dos sistemas incompleta.");

console.log("WebLords ECS check: OK — ECS orientado a dados, 8 entidades iniciais, 9 componentes e 8 sistemas validados.");
