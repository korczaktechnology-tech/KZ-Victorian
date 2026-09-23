import { EntityType, EntityTypeCode } from "../core/entities.js";

const NAVIGATION_BUILDINGS = new Set([
  EntityTypeCode[EntityType.HOUSE],
  EntityTypeCode[EntityType.WAREHOUSE],
  EntityTypeCode[EntityType.SAWMILL]
]);

export function updateConstruction(world) {
  let completed = 0;
  let navigationChanged = false;
  world.entities.query("Building", "Position").forEach((id) => {
    const building = world.entities.get(id, "Building");
    const position = world.entities.get(id, "Position");
    if (building[1] === 1 && building[2] < building[3]) {
      building[2] += 1;
      if (building[2] >= building[3]) {
        building[2] = building[3];
        building[1] = 2;
        completed += 1;
        world.emit("constructionCompleted", { entityId: id });
      }
      if (NAVIGATION_BUILDINGS.has(world.entities.type(id))) {
        navigationChanged = world.map.setBuildingObstacle(Math.floor(position[0]), Math.floor(position[1]), true) || navigationChanged;
      }
    }
  });

  if (navigationChanged && world.navigation.activeField !== null) {
    world.rebuildNavigation();
  }
  world.metrics.completedConstruction = completed;
  return completed;
}
