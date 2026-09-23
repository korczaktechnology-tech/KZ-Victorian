export const EntityType = Object.freeze({
  HABITANT: "habitant",
  TREE: "tree",
  HOUSE: "house",
  WAREHOUSE: "warehouse",
  SAWMILL: "sawmill",
  ROAD: "road",
  RESOURCE: "resource",
  ANIMAL: "animal"
});

export const EntityTypeCode = Object.freeze(
  Object.fromEntries(Object.values(EntityType).map((type, index) => [type, index + 1]))
);

export function createEntity(world, type, components = []) {
  const code = EntityTypeCode[type];
  if (!code) throw new Error(`WebLords: tipo de entidade desconhecido: ${type}.`);
  const id = world.entities.create(code);
  for (const component of components) world.entities.add(id, component.name, component.values);
  return id;
}

export function spawnInitialEntity(world, type, x = 0, y = 0, z = 0) {
  const components = [];

  if (type === EntityType.HABITANT) {
    components.push(
      { name: "Position", values: [x, y, z] },
      { name: "Velocity", values: [0, 0, 0] },
      { name: "Job", values: [0, 0, 0] },
      { name: "Inventory", values: [0, 0, 0, 0] },
      { name: "Needs", values: [100, 100, 100, 100] },
      { name: "Movement", values: [0, 0, 0, 0] },
      { name: "Health", values: [100, 100] }
    );
  } else if ([EntityType.HOUSE, EntityType.WAREHOUSE, EntityType.SAWMILL, EntityType.ROAD].includes(type)) {
    components.push(
      { name: "Position", values: [x, y, z] },
      { name: "Building", values: [0, 0, 0, 100] }
    );
  } else if ([EntityType.RESOURCE, EntityType.TREE, EntityType.ANIMAL].includes(type)) {
    components.push({ name: "Position", values: [x, y, z] });
  }

  return createEntity(world, type, components);
}
