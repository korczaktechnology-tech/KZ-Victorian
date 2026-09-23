import { EntityType, EntityTypeCode } from "../core/entities.js";

export function updatePopulation(world) {
  const previous = world.metrics.population;
  let count = 0;
  world.entities.query("Needs", "Health").forEach((id) => {
    if (world.entities.type(id) === EntityTypeCode[EntityType.HABITANT]) count += 1;
  });
  world.metrics.population = count;
  if (world.memory?.regions.population) Atomics.store(world.memory.regions.population, 0, count);
  if (previous !== count) world.emit("populationChanged", { population: count });
  return count;
}
