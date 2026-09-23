const PLAYER_SPEED=7.5,SPRINT_SPEED=12,PLAYER_RADIUS=.42,GRAVITY=22,JUMP_SPEED=8.5;
export function createPlayerController(world){
 let input={forward:0,right:0,sprint:false,jump:false},verticalVelocity=0,grounded=true;
 return{
  setInput(next={}){input={forward:Number(next.forward)||0,right:Number(next.right)||0,sprint:Boolean(next.sprint),jump:Boolean(next.jump),yaw:Number.isFinite(Number(next.yaw))?Number(next.yaw):world.playerFacing};},
  update(dt=1/30){
   const id=world.playerId;if(!id||!world.entities.has(id))return{animation:"idle",facing:world.playerFacing,grounded};
   const p=world.entities.get(id,"Position"),v=world.entities.get(id,"Velocity"),m=world.entities.get(id,"Movement");
   if(input.jump&&grounded){verticalVelocity=JUMP_SPEED;grounded=false;input.jump=false;}
   verticalVelocity-=GRAVITY*dt;p[2]+=verticalVelocity*dt;if(p[2]<=0){p[2]=0;verticalVelocity=0;grounded=true;}
   const len=Math.hypot(input.forward,input.right),speed=input.sprint?SPRINT_SPEED:PLAYER_SPEED;
   if(len<.0001){v[0]=0;v[1]=0;v[2]=verticalVelocity;m[0]=p[0];m[1]=p[1];m[2]=p[2];m[3]=speed;return{animation:grounded?"idle":"jump",facing:world.playerFacing,grounded};}
   const nx=input.right/len,ny=input.forward/len,yaw=input.yaw,s=Math.sin(yaw),c=Math.cos(yaw);
   const dx=(c*nx-s*ny)*speed*dt,dy=(s*nx+c*ny)*speed*dt,res=world.resolvePlayerCollision(id,p[0],p[1],p[0]+dx,p[1]+dy,PLAYER_RADIUS);
   const ax=res.x-p[0],ay=res.y-p[1];p[0]=res.x;p[1]=res.y;v[0]=ax/Math.max(dt,.0001);v[1]=ay/Math.max(dt,.0001);v[2]=verticalVelocity;m[0]=p[0];m[1]=p[1];m[2]=p[2];m[3]=speed;
   if(Math.hypot(ax,ay)>.0001)world.playerFacing=Math.atan2(ax,ay);
   return{animation:grounded?(input.sprint?"run":"walk"):"jump",facing:world.playerFacing,grounded};
  }
 };
}
