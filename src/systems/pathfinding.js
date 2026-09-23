export function updatePathfinding(world){
 const fieldId=world.navigation.activeField,field=fieldId===null?null:world.flowFields.get(fieldId);
 if(!field){world.metrics.navigationDirected=0;return 0;}
 let directed=0;
 world.entities.query("Position","Movement").forEach(id=>{
  if(id===world.playerId)return;
  const position=world.entities.get(id,"Position"),movement=world.entities.get(id,"Movement"),cellX=Math.floor(position[0]),cellY=Math.floor(position[1]),direction=world.flowFields.directionAt(fieldId,cellX,cellY);
  if(!direction||direction.cost<0)return;
  const speed=Math.max(0,movement[3]);if(speed<=0||(direction.x===0&&direction.y===0))return;
  movement[0]=cellX+direction.x;movement[1]=cellY+direction.y;movement[2]=position[2];directed++;
 });
 world.metrics.navigationDirected=directed;return directed;
}
