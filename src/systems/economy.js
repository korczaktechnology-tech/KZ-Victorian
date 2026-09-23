export function updateEconomy(world) {
  let transfers = 0;
  world.entities.query("Inventory", "Job").forEach((id) => {
    const inventory = world.entities.get(id, "Inventory");
    const job = world.entities.get(id, "Job");
    if (job[1] === 1 && inventory[0] > 0) {
      inventory[0] -= 1;
      transfers += 1;
    }
  });
  if (world.memory?.regions.economy) Atomics.store(world.memory.regions.economy, 0, transfers);
  return transfers;
}
