import{EntityType,EntityTypeCode}from "../core/entities.js";
const RADII=Object.freeze({[EntityType.HOUSE]:1.2,[EntityType.WAREHOUSE]:1.5,[EntityType.SAWMILL]:1.5,[EntityType.TREE]:.8,[EntityType.RESOURCE]:.6});
const SOLID_CODES=new Set(Object.keys(RADII).map(type=>EntityTypeCode[type]));
export function createCollisionSystem(world){
 return{resolvePlayer(id,startX,startY,targetX,targetY,radius=.42){
  let x=targetX,y=targetY;
  for(let pass=0;pass<3;pass++){
   world.entities.query("Position").forEach(other=>{
    if(other===id||!SOLID_CODES.has(world.entities.type(other)))return;
    const p=world.entities.get(other,"Position"),code=world.entities.type(other);if(!p)return;
    const type=Object.keys(RADII).find(key=>EntityTypeCode[key]===code),r=radius+(RADII[type]??.6),dx=x-p[0],dy=y-p[1],d=Math.hypot(dx,dy);
    if(d<r){if(d<.0001){x=p[0]+r;y=p[1];}else{const push=(r-d)/d;x+=dx*push;y+=dy*push;}}
   });
  }
  const min=radius,maxX=world.map.width-radius,maxY=world.map.height-radius;
  x=Math.max(min,Math.min(maxX,x));y=Math.max(min,Math.min(maxY,y));
  return{x,y};
 }};
}
