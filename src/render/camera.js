export class Camera{
 constructor(){this.x=0;this.y=0;this.zoom=1;this.height=155;this.pitch=.86;this.yaw=0;this.fov=.82;}
 setPosition(x,y){this.x=Number(x)||0;this.y=Number(y)||0;return this;}
 move(dx,dy){this.x+=Number(dx)||0;this.y+=Number(dy)||0;return this;}
 moveLocal(forward=0,right=0){const f=Number(forward)||0,r=Number(right)||0,sin=Math.sin(this.yaw),cos=Math.cos(this.yaw);this.x+=sin*f+cos*r;this.y+=-cos*f+sin*r;return this;}
 setZoom(z){this.zoom=Math.max(.25,Math.min(4.5,Number(z)||1));return this;}
 zoomBy(factor){return this.setZoom(this.zoom*(Number(factor)||1));}
 setAngle(pitch=this.pitch,yaw=this.yaw){this.pitch=Math.max(.35,Math.min(1.35,Number(pitch)||this.pitch));this.yaw=Number.isFinite(Number(yaw))?Number(yaw):this.yaw;return this;}
 orbit(deltaPitch=0,deltaYaw=0){return this.setAngle(this.pitch+(Number(deltaPitch)||0),this.yaw+(Number(deltaYaw)||0));}
 follow(x,y){this.x=Number(x)||0;this.y=Number(y)||0;return this;}
 getView(aspect=1){return Object.freeze({x:this.x,y:this.y,zoom:this.zoom,aspect:Math.max(.0001,aspect),pitch:this.pitch,yaw:this.yaw,height:this.height,fov:this.fov});}
 getBillboardBasis(){return Object.freeze({right:new Float32Array([Math.cos(this.yaw),0,Math.sin(this.yaw)]),up:new Float32Array([0,1,0])});}
 getViewProjection(aspect=1){
  const a=Math.max(.0001,aspect),distance=this.height/this.zoom,cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),cy=Math.cos(this.yaw),sy=Math.sin(this.yaw);
  const eye=[this.x+sy*distance*cp,distance*sp+8,this.y-cy*distance*cp],target=[this.x,0,this.y],f=[target[0]-eye[0],target[1]-eye[1],target[2]-eye[2]],fl=Math.hypot(...f);f[0]/=fl;f[1]/=fl;f[2]/=fl;
  const s=[-f[2],0,f[0]],sl=Math.hypot(...s)||1;s[0]/=sl;s[2]/=sl;const u=[s[1]*f[2]-s[2]*f[1],s[2]*f[0]-s[0]*f[2],s[0]*f[1]-s[1]*f[0]];
  const near=.1,far=900,ff=1/Math.tan(this.fov/2),nf=1/(near-far),p=[ff/a,0,0,0,0,ff,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0],v=[s[0],u[0],-f[0],0,s[1],u[1],-f[1],0,s[2],u[2],-f[2],0,-(s[0]*eye[0]+s[1]*eye[1]+s[2]*eye[2]),-(u[0]*eye[0]+u[1]*eye[1]+u[2]*eye[2]),f[0]*eye[0]+f[1]*eye[1]+f[2]*eye[2],1],out=new Float32Array(16);
  for(let col=0;col<4;col++)for(let row=0;row<4;row++)out[col*4+row]=p[row]*v[col*4]+p[4+row]*v[col*4+1]+p[8+row]*v[col*4+2]+p[12+row]*v[col*4+3];return out;
 }
}
