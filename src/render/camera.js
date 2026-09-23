export class Camera{
  constructor(){
    this.x=0;
    this.y=0;
    this.zoom=1;
    this.height=245;
    this.pitch=.82;
    this.yaw=0;
  }

  setPosition(x,y){
    this.x=Number(x)||0;
    this.y=Number(y)||0;
    return this;
  }

  move(dx,dy){
    this.x+=Number(dx)||0;
    this.y+=Number(dy)||0;
    return this;
  }

  moveLocal(forward=0,right=0){
    const f=Number(forward)||0;
    const r=Number(right)||0;
    const sin=Math.sin(this.yaw);
    const cos=Math.cos(this.yaw);
    this.x+=sin*f+cos*r;
    this.y+=-cos*f+sin*r;
    return this;
  }

  setZoom(z){
    this.zoom=Math.max(.25,Math.min(4.5,Number(z)||1));
    return this;
  }

  zoomBy(factor){
    return this.setZoom(this.zoom*(Number(factor)||1));
  }

  setAngle(pitch=this.pitch,yaw=this.yaw){
    this.pitch=Math.max(.35,Math.min(1.35,Number(pitch)||this.pitch));
    this.yaw=Number.isFinite(Number(yaw))?Number(yaw):this.yaw;
    return this;
  }

  orbit(deltaPitch=0,deltaYaw=0){
    return this.setAngle(this.pitch+(Number(deltaPitch)||0),this.yaw+(Number(deltaYaw)||0));
  }

  getMatrix(aspect=1){
    const sx=this.zoom/Math.max(aspect,.0001),sy=this.zoom;
    return new Float32Array([sx,0,0,0,sy,0,-this.x*sx,-this.y*sy,0,0,1,0]);
  }

  getView(aspect=1){
    return Object.freeze({x:this.x,y:this.y,zoom:this.zoom,aspect:Math.max(.0001,aspect),pitch:this.pitch,yaw:this.yaw});
  }

  getViewProjection(aspect=1){
    const a=Math.max(.0001,aspect);
    const distance=this.height/this.zoom;
    const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
    const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw);

    // World coordinates are X/Z on the ground and Y is height.
    const eye=[
      this.x+sy*distance*cp,
      distance*sp+8,
      this.y-cy*distance*cp
    ];
    const target=[this.x,0,this.y];
    const f=[target[0]-eye[0],target[1]-eye[1],target[2]-eye[2]];
    const fl=Math.hypot(f[0],f[1],f[2]);
    f[0]/=fl;f[1]/=fl;f[2]/=fl;

    const up=[0,1,0];
    const s=[
      f[1]*up[2]-f[2]*up[1],
      f[2]*up[0]-f[0]*up[2],
      f[0]*up[1]-f[1]*up[0]
    ];
    const sl=Math.hypot(s[0],s[1],s[2])||1;
    s[0]/=sl;s[1]/=sl;s[2]/=sl;

    const u=[
      s[1]*f[2]-s[2]*f[1],
      s[2]*f[0]-s[0]*f[2],
      s[0]*f[1]-s[1]*f[0]
    ];

    const near=.1,far=900,fov=.82,ff=1/Math.tan(fov/2),nf=1/(near-far);
    const p=[
      ff/a,0,0,0,
      0,ff,0,0,
      0,0,(far+near)*nf,-1,
      0,0,2*far*near*nf,0
    ];
    const v=[
      s[0],u[0],-f[0],0,
      s[1],u[1],-f[1],0,
      s[2],u[2],-f[2],0,
      -(s[0]*eye[0]+s[1]*eye[1]+s[2]*eye[2]),
      -(u[0]*eye[0]+u[1]*eye[1]+u[2]*eye[2]),
      f[0]*eye[0]+f[1]*eye[1]+f[2]*eye[2],
      1
    ];

    const out=new Float32Array(16);
    for(let col=0;col<4;col++){
      for(let row=0;row<4;row++){
        out[col*4+row]=
          p[row]*v[col*4]+
          p[4+row]*v[col*4+1]+
          p[8+row]*v[col*4+2]+
          p[12+row]*v[col*4+3];
      }
    }
    return out;
  }
}
