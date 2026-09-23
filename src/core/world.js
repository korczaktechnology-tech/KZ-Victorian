import { MEMORY_CAPACITIES } from "./constants.js";
import { EntityRegistry } from "./ecs.js";
import { EntityType, spawnInitialEntity } from "./entities.js";

export function createSimulationWorld(memory = null, capacity = MEMORY_CAPACITIES.entities) {
  const externalData = memory?.regions ? {
    Position: memory.regions.positions,
    Velocity: memory.regions.velocities
  } : {};
  const entities = new EntityRegistry(capacity, externalData);
  const world = {
    entities,
    memory,
    tick: 0,
    events: [],
    metrics: { population: 0, moving: 0, lowNeeds: 0, completedConstruction: 0, produced: 0, logistics: 0 },
    spawn(type, x = 0, y = 0, z = 0) { return spawnInitialEntity(world, type, x, y, z); },
    emit(type, payload = null) { world.events.push({ type, payload }); }
  };
  world.bootstrap = () => {
    if (entities.size !== 0) return;
    world.spawn(EntityType.HOUSE, 0, 0, 0);
    world.spawn(EntityType.WAREHOUSE, 4, 0, 0);
    world.spawn(EntityType.SAWMILL, 8, 0, 0);
    world.spawn(EntityType.ROAD, 2, 0, 0);
    world.spawn(EntityType.HABITANT, 0, 0, 0);
    world.spawn(EntityType.HABITANT, 1, 0, 0);
    world.spawn(EntityType.TREE, 6, 0, 0);
    world.spawn(EntityType.RESOURCE, 10, 0, 0);
    world.spawn(EntityType.ANIMAL, 12, 0, 0);
  };
  return world;
}
