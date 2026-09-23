export const ASSET_MANIFEST=Object.freeze({essential:Object.freeze(["assets/models/web-lords-triangle.glb"]),optional:Object.freeze([]),policy:Object.freeze({models:".glb",textures:".ktx2",audio:".ogg",fonts:[".woff2",".woff"],compression:["Meshopt","Draco"]})});
export async function loadEssentialAssets(manager){return Promise.all(ASSET_MANIFEST.essential.map(path=>manager.load(path)));}
