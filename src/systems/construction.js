export function updateConstruction(world) {
  let completed = 0;
  world.entities.query("Building").forEach((id) => {
    const building = world.entities.get(id, "Building");
    if (building[1] === 1 && building[2] < building[3]) {
      building[2] += 1;
      if (building[2] >= building[3]) {
        building[2] = building[3];
        building[1] = 2;
        completed += 1;
        world.emit("constructionCompleted", { entityId: id });
      }
    }
  });
  world.metrics.completedConstruction = completed;
  return completed;
}
