export function updateNeeds(world) {
  let low = 0;
  world.entities.query("Needs", "Health").forEach((id) => {
    const needs = world.entities.get(id, "Needs");
    const health = world.entities.get(id, "Health");
    needs[0] = Math.max(0, needs[0] - 1);
    needs[1] = Math.max(0, needs[1] - 1);
    needs[2] = Math.max(0, needs[2] - 1);
    if (needs[0] < 25 || needs[1] < 25 || needs[2] < 25) low += 1;
    if (needs[0] <= 10 || needs[1] <= 10) health[0] = Math.max(0, health[0] - 1);
  });
  world.metrics.lowNeeds = low;
  return low;
}
