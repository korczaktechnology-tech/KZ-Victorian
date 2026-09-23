export function updateProduction(world) {
  let produced = 0;
  world.entities.query("Production", "Inventory").forEach((id) => {
    const production = world.entities.get(id, "Production");
    const inventory = world.entities.get(id, "Inventory");
    const input = Math.max(0, production[0]);
    const output = Math.max(0, production[1]);
    const inputQty = Math.max(0, production[2]);
    const outputQty = Math.max(0, production[3]);
    if (input < inventory.length && output < inventory.length && inputQty > 0 && outputQty > 0 && inventory[input] >= inputQty) {
      inventory[input] -= inputQty;
      inventory[output] += outputQty;
      produced += outputQty;
    }
  });
  world.metrics.produced = produced;
  return produced;
}
