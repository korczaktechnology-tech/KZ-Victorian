export function updatePathfinding(world) {
  let directed = 0;
  world.entities.query("Position", "Movement").forEach((id) => {
    const movement = world.entities.get(id, "Movement");
    if (movement[3] > 0) directed += 1;
  });
  return directed;
}
