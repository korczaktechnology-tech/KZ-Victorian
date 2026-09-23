export function updateLogistics(world) {
  let tasks = 0;
  world.entities.query("Job", "Inventory", "Position").forEach((id) => {
    const job = world.entities.get(id, "Job");
    const inventory = world.entities.get(id, "Inventory");
    if (job[1] === 2) {
      inventory[0] += 1;
      job[1] = 0;
      tasks += 1;
      world.emit("taskCompleted", { entityId: id });
    }
  });
  if (world.memory?.regions.logistics) Atomics.store(world.memory.regions.logistics, 0, tasks);
  world.metrics.logistics = tasks;
  return tasks;
}
