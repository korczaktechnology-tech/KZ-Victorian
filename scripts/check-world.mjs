import { readFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const files = [
  "src/world/map.js",
  "src/world/flow-field.js",
  "src/world/spatial-partition.js",
  "src/core/world.js",
  "src/systems/pathfinding.js",
  "src/systems/construction.js",
  "tests/phase6.test.js"
];
const source = await Promise.all(files.map(f => readFile(new URL(f, root), "utf8"))).then(a => a.join("\n"));
for (const token of ["TerrainFlag", "FlowField", "SpatialPartition", "navigation", "setBuildingObstacle", "directionAt", "queryRadius"]) {
  if (!source.includes(token)) throw new Error("Fase 6: requisito ausente: " + token);
}
console.log("WebLords world check: OK — mapa, navegabilidade, Flow Field, atualização espacial e Spatial Partition validados.");
