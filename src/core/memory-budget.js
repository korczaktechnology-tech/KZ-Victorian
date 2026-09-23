export const MEMORY_BUDGET=Object.freeze({sharedArrayBufferBytes:64*1024*1024,targetAssetBytes:15*1024*1024});
export function validateMemoryBudget({sharedArrayBufferBytes=0,assetBytes=0}){
  if(sharedArrayBufferBytes<0||assetBytes<0)throw new RangeError("WebLords: memória não pode ser negativa.");
  return{sharedArrayBufferBytes,assetBytes,sharedArrayBufferWithinBudget:sharedArrayBufferBytes<=MEMORY_BUDGET.sharedArrayBufferBytes,assetsWithinTarget:assetBytes<=MEMORY_BUDGET.targetAssetBytes,totalBytes:sharedArrayBufferBytes+assetBytes};
}
