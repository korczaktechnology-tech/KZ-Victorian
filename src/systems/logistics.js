import { EntityType, EntityTypeCode } from "../core/entities.js";
import { transferInventory } from "./economy.js";

export const JOB_STATE = Object.freeze({ IDLE: 0, ASSIGNED: 1, READY: 2, COMPLETED: 3 });
export const JOB_TYPE = Object.freeze({ DELIVERY: 1, SUPPLY: 2, CONSTRUCTION: 3 });

function distanceSq(world, aId, bId) {
  const a = world.entities.get(aId, "Position");
  const b = world.entities.get(bId, "Position");
  if (!a || !b) return Infinity;
  const dx = a[0] - b[0], dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

export function createLogisticsRequest(world, { sourceId, destinationId, resource, quantity, type = JOB_TYPE.DELIVERY }) {
  if (![sourceId, destinationId].every(id => world.entities.has(id))) return { ok: false, reason: "entity-not-found" };
  if (!Number.isInteger(resource) || resource < 0 || resource >= 4 || !Number.isInteger(quantity) || quantity <= 0) return { ok: false, reason: "invalid-request" };
  const source = world.entities.get(sourceId, "Inventory");
  const destination = world.entities.get(destinationId, "Inventory");
  if (!source || !destination) return { ok: false, reason: "inventory-required" };

  const existing = [...world.logisticsRequests.values()].find(r =>
    r.sourceId === sourceId && r.destinationId === destinationId &&
    r.resource === resource && r.type === type && r.status !== "completed"
  );
  if (existing) return { ok: true, requestId: existing.id, existing: true };

  const id = world.nextLogisticsRequestId++;
  const request = { id, sourceId, destinationId, resource, quantity, type, workerId: null, status: "pending", createdTick: world.tick, assignedTick: null };
  world.logisticsRequests.set(id, request);
  world.emit("taskCreated", { requestId: id, sourceId, destinationId, resource, quantity, type });
  return { ok: true, requestId: id, request };
}

export function createLogisticsTask(world, { workerId, sourceId, destinationId, resource, quantity, type = JOB_TYPE.DELIVERY, requestId = null }) {
  if (![workerId, sourceId, destinationId].every(id => world.entities.has(id))) return { ok: false, reason: "entity-not-found" };
  if (!Number.isInteger(resource) || resource < 0 || resource > 3 || !Number.isInteger(quantity) || quantity <= 0) return { ok: false, reason: "invalid-task" };
  const job = world.entities.get(workerId, "Job");
  const source = world.entities.get(sourceId, "Inventory");
  const destination = world.entities.get(destinationId, "Inventory");
  if (!job || !source || !destination) return { ok: false, reason: "logistics-components-required" };
  if (job[2] !== JOB_STATE.IDLE) return { ok: false, reason: "worker-busy" };
  if (source[resource] < quantity) return { ok: false, reason: "insufficient-stock" };

  job[0] = destinationId;
  job[1] = resource;
  job[2] = JOB_STATE.ASSIGNED;
  world.logisticsTasks.set(workerId, {
    requestId, sourceId, destinationId, resource, quantity, type,
    distance: Math.sqrt(distanceSq(world, workerId, destinationId))
  });

  if (requestId !== null && world.logisticsRequests.has(requestId)) {
    const request = world.logisticsRequests.get(requestId);
    request.workerId = workerId;
    request.status = "assigned";
    request.assignedTick = world.tick;
  }
  world.emit("taskAssigned", { workerId, requestId, sourceId, destinationId, resource, quantity, type });
  return { ok: true, workerId, sourceId, destinationId, resource, quantity, requestId };
}

function findNearestAvailableWorker(world, destinationId) {
  let selected = null, bestDistance = Infinity;
  world.entities.query("Job", "Position", "Inventory").forEach(id => {
    const job = world.entities.get(id, "Job");
    if (job[2] !== JOB_STATE.IDLE) return;
    const distance = distanceSq(world, id, destinationId);
    if (distance < bestDistance) {
      bestDistance = distance;
      selected = id;
    }
  });
  return selected;
}

export function generateWarehouseRequests(world) {
  for (const warehouseId of world.warehouseIds()) {
    const warehouse = world.entities.get(warehouseId, "Inventory");
    if (!warehouse) continue;
    world.entities.query("Production", "Inventory", "Position").forEach(destinationId => {
      const job = world.productionJobs.get(destinationId);
      const inventory = world.entities.get(destinationId, "Inventory");
      if (!job || job.state !== "waiting-input") return;
      const needed = Math.max(0, job.inputQty - inventory[job.input]);
      const quantity = Math.min(needed, warehouse[job.input]);
      if (quantity > 0) createLogisticsRequest(world, {
        sourceId: warehouseId, destinationId, resource: job.input, quantity, type: JOB_TYPE.SUPPLY
      });
    });
  }
}

function assignPendingRequests(world) {
  for (const request of world.logisticsRequests.values()) {
    if (request.status !== "pending") continue;
    const source = world.entities.get(request.sourceId, "Inventory");
    if (!source || source[request.resource] < request.quantity) continue;
    const workerId = findNearestAvailableWorker(world, request.destinationId);
    if (workerId !== null) createLogisticsTask(world, { ...request, workerId });
  }
}

export function updateLogistics(world) {
  generateWarehouseRequests(world);
  assignPendingRequests(world);
  let completed = 0;

  for (const [workerId, task] of [...world.logisticsTasks.entries()]) {
    const job = world.entities.get(workerId, "Job");
    if (!job) {
      world.logisticsTasks.delete(workerId);
      continue;
    }
    if (job[2] === JOB_STATE.ASSIGNED) {
      job[2] = JOB_STATE.READY;
      world.emit("taskReady", { entityId: workerId, targetId: task.destinationId, requestId: task.requestId });
      continue;
    }
    if (job[2] === JOB_STATE.READY) {
      const result = transferInventory(world, task.sourceId, task.destinationId, task.resource, task.quantity);
      if (!result.ok) {
        job[2] = JOB_STATE.IDLE;
        if (task.requestId !== null && world.logisticsRequests.has(task.requestId)) {
          const request = world.logisticsRequests.get(task.requestId);
          request.status = "pending";
          request.workerId = null;
        }
        world.emit("taskFailed", { entityId: workerId, requestId: task.requestId, reason: result.reason });
        world.logisticsTasks.delete(workerId);
        continue;
      }
      job[2] = JOB_STATE.COMPLETED;
      world.emit("taskTransported", { entityId: workerId, requestId: task.requestId, sourceId: task.sourceId, destinationId: task.destinationId, resource: task.resource, quantity: task.quantity });
      continue;
    }
    if (job[2] === JOB_STATE.COMPLETED) {
      job[2] = JOB_STATE.IDLE;
      completed += 1;
      if (task.requestId !== null && world.logisticsRequests.has(task.requestId)) world.logisticsRequests.get(task.requestId).status = "completed";
      world.emit("taskCompleted", { entityId: workerId, requestId: task.requestId, targetId: task.destinationId, quantity: task.quantity });
      world.logisticsTasks.delete(workerId);
    }
  }
  if (world.memory?.regions.logistics) Atomics.store(world.memory.regions.logistics, 0, completed);
  world.metrics.logistics = completed;
  return completed;
}