import {ASSET_MANIFEST,loadEssentialAssets} from "./asset-manifest.js";
import {inspectAsset} from "./asset-loader.js";
export async function loadAssetCatalog(manager){const loaded=[];for(const path of ASSET_MANIFEST.essential){const asset=await manager.load(path);loaded.push({asset,inspection:inspectAsset(asset),priority:"essential"});}return loaded;}
export async function loadAssetOnDemand(manager,path){const asset=await manager.load(path);return{asset,inspection:inspectAsset(asset),priority:"optional"};}
export async function preloadEssentialAssets(manager){const assets=await loadEssentialAssets(manager);return assets.map(asset=>({asset,inspection:inspectAsset(asset),priority:"essential"}));}
