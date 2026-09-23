import { MEMORY_CAPACITIES, WORLD } from "./constants.js";
import { EntityRegistry } from "./ecs.js";
import { EntityType, EntityTypeCode, spawnInitialEntity } from "./entities.js";
import { WorldMap } from "../world/map.js";
import { FlowField } from "../world/flow-field.js";
import { SpatialPartition } from "../world/spatial-partition.js";

export function createSimulationWorld(memory = null, capacity = MEMORY_CAPACITIES.entities, width = WORLD.DEFAULT_WIDTH, height = WORLD.DEFAULT_HEIGHT) {
  const externalData = memory?.regions ? {
    Position: memory.regions.positions,
    Velocity: memory.regions.velocities
  } : {};
  const entities = new EntityRegistry(capacity, externalData);
  const map = new WorldMap(width, height, memory);
  const spatial = new SpatialPartition(width, height, 1);
  const flowFields = new FlowField(map);

  const world = {
    entities, memory, map, spatial, flowFields,
    tick: 0,
    events: [],
    metrics: { population: 0, moving: 0, lowNeeds: 0, completedConstruction: 0, produced: 0, logistics: 0, navigationRevision: 0 },
    navigation: { activeField: null },
    spawn(type, x = 0, y = 0, z = 0) {
      const id = spawnInitialEntity(world, type, x, y, z);
      world.syncEntityToMap(id);
      return id;
    },
    emit(type, payload = null) { world.events.push({ type, payload }); },
    syncEntityToMap(id) {
      if (!entities.has(id)) return false;
      const position = entities.get(id, "Position");
      if (!position) return false;
      return map.syncEntity(id, entities.type(id), position);
    },
    rebuildSpatial() { spatial.rebuild(entities); },
    rebuildNavigation(fieldId = world.navigation.activeField) {
      if (fieldId === null || fieldId === undefined) return null;
      const field = flowFields.rebuild(fieldId);
      if (field) {
        world.metrics.navigationRevision = map.navigationRevision;
        world.emit("navigationUpdated", { fieldId, revision: map.navigationRevision });
      }
      return field;
    },
    setFlowField(fieldId, destinations, options = {}) {
      const field = flowFields.create(fieldId, destinations, options);
      world.navigation.activeField = fieldId;
      world.metrics.navigationRevision = map.navigationRevision;
      world.emit("navigationUpdated", { fieldId, revision: map.navigationRevision });
      return field;
    }
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
    world.rebuildSpatial();
    world.setFlowField("default", [{ x: 2, y: 0 }]);
  };
  return world;
}
