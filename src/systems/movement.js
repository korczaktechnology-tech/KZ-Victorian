export function updateMovement(world,deltaSeconds=1/30){
 let moved=0;
 world.entities.query("Position","Velocity","Movement").forEach(id=>{
  if(id===world.playerId)return;
  const position=world.entities.get(id,"Position"),velocity=world.entities.get(id,"Velocity"),movement=world.entities.get(id,"Movement");
  const dx=movement[0]-position[0],dy=movement[1]-position[1],dz=movement[2]-position[2],speed=Math.max(0,movement[3]),distance=Math.hypot(dx,dy,dz);
  if(distance>.0001&&speed>0){velocity[0]=(dx/distance)*speed;velocity[1]=(dy/distance)*speed;velocity[2]=(dz/distance)*speed;position[0]+=velocity[0]*deltaSeconds;position[1]+=velocity[1]*deltaSeconds;position[2]+=velocity[2]*deltaSeconds;moved++;}
  else velocity.fill(0);
 });
 world.metrics.moving=moved;
 return moved;
}
