import { RESOURCE } from "./economy.js";

export const RECIPES = Object.freeze({
  SAWMILL_PLANKS: Object.freeze({ input: RESOURCE.WOOD, inputQty: 2, output: RESOURCE.PLANKS, outputQty: 1, duration: 30 })
});

export function queueProduction(world, entityId, recipeName) {
  const recipe = RECIPES[recipeName];
  const production = world.entities.get(entityId, "Production");
  const inventory = world.entities.get(entityId, "Inventory");
  if (!recipe || !production || !inventory) return { ok: false, reason: "invalid-production-request" };

  const existing = world.productionJobs.get(entityId);
  if (existing && ["queued", "running", "waiting-input"].includes(existing.state)) return { ok: false, reason: "production-busy" };

  production[0] = recipe.input;
  production[1] = recipe.output;
  production[2] = recipe.inputQty;
  production[3] = recipe.outputQty;
  world.productionJobs.set(entityId, {
    recipe: recipeName, input: recipe.input, inputQty: recipe.inputQty,
    output: recipe.output, outputQty: recipe.outputQty, duration: recipe.duration,
    remaining: recipe.duration,
    state: inventory[recipe.input] >= recipe.inputQty ? "running" : "waiting-input",
    startedTick: world.tick
  });
  return { ok: true, recipe: recipeName, duration: recipe.duration };
}

export function updateProduction(world) {
  let produced = 0;
  for (const [entityId, job] of world.productionJobs.entries()) {
    const inventory = world.entities.get(entityId, "Inventory");
    if (!inventory) {
      world.productionJobs.delete(entityId);
      continue;
    }
    if (job.state === "waiting-input") {
      if (inventory[job.input] < job.inputQty) continue;
      job.state = "running";
      job.remaining = job.duration;
      job.startedTick = world.tick;
      world.emit("productionStarted", { entityId, recipe: job.recipe, duration: job.duration });
    }
    if (job.state !== "running") continue;
    job.remaining -= 1;
    if (job.remaining > 0) continue;
    if (inventory[job.input] < job.inputQty) {
      job.state = "waiting-input";
      job.remaining = job.duration;
      world.emit("productionWaiting", { entityId, reason: "insufficient-stock", resource: job.input });
      continue;
    }
    inventory[job.input] -= job.inputQty;
    inventory[job.output] += job.outputQty;
    produced += job.outputQty;
    world.emit("inventoryChanged", { entityId, resource: job.input, quantity: -job.inputQty });
    world.emit("inventoryChanged", { entityId, resource: job.output, quantity: job.outputQty });
    world.emit("productionCompleted", { entityId, recipe: job.recipe, input: job.input, inputQty: job.inputQty, output: job.output, outputQty: job.outputQty, duration: job.duration });
    world.productionJobs.delete(entityId);
  }
  world.metrics.produced = produced;
  return produced;
}