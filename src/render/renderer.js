import{createProgram}from"./shaders.js";import{createQuadMesh}from"./meshes.js";import{InstanceBuffer}from"./instances.js";import{Camera}from"./camera.js";import{cullInstances}from"./culling.js";import{createGPUProfiler}from"./gpu-profiler.js";import{createAssetProfiler}from"../core/asset-profiler.js";import{createTerrainMesh,sampleTerrainHeight}from"./terrain.js";import{TERRAIN_VERTEX_SHADER,TERRAIN_FRAGMENT_SHADER}from"./terrain-shaders.js";
const PLAYER_VERTEX=`#version 300 es
in vec3 a_position;uniform mat4 u_viewProjection;uniform vec3 u_translation;uniform vec3 u_scale;uniform float u_yaw;
void main(){float c=cos(u_yaw),s=sin(u_yaw);vec3 p=a_position*u_scale;float x=p.x;p.x=c*x-s*p.z;p.z=s*x+c*p.z;gl_Position=u_viewProjection*vec4(p+u_translation,1.0);}`;
const PLAYER_FRAGMENT=`#version 300 es
precision mediump float;uniform vec4 u_color;out vec4 outColor;void main(){outColor=u_color;}`;
function cube(gl){const v=new Float32Array([-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1]),i=new Uint16Array([0,1,2,0,2,3,1,5,6,1,6,2,5,4,7,5,7,6,4,0,3,4,3,7,3,2,6,3,6,7,4,5,1,4,1,0]);const vb=gl.createBuffer(),ib=gl.createBuffer();if(!vb||!ib)throw new Error("WebLords: falha ao criar malha do personagem.");gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,i,gl.STATIC_DRAW);return{vb,ib,count:i.length};}
function drawPart(gl,loc,mesh,x,y,z,sx,sy,sz,color,yaw){gl.uniform3f(loc.translation,x,y,z);gl.uniform3f(loc.scale,sx,sy,sz);gl.uniform1f(loc.yaw,yaw);gl.uniform4f(loc.color,color[0],color[1],color[2],1);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);}
export function createRenderer(canvas,o={}){
 const maxInstances=o.maxInstances??4096,profiler=o.assetProfiler??createAssetProfiler(),gl=canvas.getContext("webgl2",{antialias:true,alpha:false});if(!gl)throw new Error("WebLords: WebGL 2.0 não está disponível neste navegador.");profiler.attachWebGL2(gl);const gpu=createGPUProfiler(gl),camera=o.camera??new Camera(),terrain=createTerrainMesh(gl,256,256),terrainProgram=createProgram(gl,TERRAIN_VERTEX_SHADER,TERRAIN_FRAGMENT_SHADER),terrainVao=gl.createVertexArray();
 const tp=gl.getAttribLocation(terrainProgram,"a_position"),tn=gl.getAttribLocation(terrainProgram,"a_normal"),tmat=gl.getUniformLocation(terrainProgram,"u_viewProjection");gl.bindVertexArray(terrainVao);gl.bindBuffer(gl.ARRAY_BUFFER,terrain.positionBuffer);gl.enableVertexAttribArray(tp);gl.vertexAttribPointer(tp,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,terrain.normalBuffer);gl.enableVertexAttribArray(tn);gl.vertexAttribPointer(tn,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,terrain.indexBuffer);gl.bindVertexArray(null);
 const entityProgram=createProgram(gl),entityVao=gl.createVertexArray(),mesh=createQuadMesh(gl),instanceBuffer=new InstanceBuffer(gl,maxInstances,4),ep=gl.getAttribLocation(entityProgram,"a_position"),eip=gl.getAttribLocation(entityProgram,"a_instancePosition"),eis=gl.getAttribLocation(entityProgram,"a_instanceScale"),emat=gl.getUniformLocation(entityProgram,"u_viewProjection"),eright=gl.getUniformLocation(entityProgram,"u_cameraRight"),eup=gl.getUniformLocation(entityProgram,"u_cameraUp"),ecolor=gl.getUniformLocation(entityProgram,"u_color");
 gl.bindVertexArray(entityVao);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vertexBuffer);gl.enableVertexAttribArray(ep);gl.vertexAttribPointer(ep,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,instanceBuffer.buffer);gl.enableVertexAttribArray(eip);gl.vertexAttribPointer(eip,3,gl.FLOAT,false,16,0);gl.vertexAttribDivisor(eip,1);gl.enableVertexAttribArray(eis);gl.vertexAttribPointer(eis,1,gl.FLOAT,false,16,12);gl.vertexAttribDivisor(eis,1);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer);gl.bindVertexArray(null);
 const playerProgram=createProgram(gl,PLAYER_VERTEX,PLAYER_FRAGMENT),playerMesh=cube(gl),playerLoc={position:gl.getAttribLocation(playerProgram,"a_position"),viewProjection:gl.getUniformLocation(playerProgram,"u_viewProjection"),translation:gl.getUniformLocation(playerProgram,"u_translation"),scale:gl.getUniformLocation(playerProgram,"u_scale"),yaw:gl.getUniformLocation(playerProgram,"u_yaw"),color:gl.getUniformLocation(playerProgram,"u_color")},playerVao=gl.createVertexArray();
 gl.bindVertexArray(playerVao);gl.bindBuffer(gl.ARRAY_BUFFER,playerMesh.vb);gl.enableVertexAttribArray(playerLoc.position);gl.vertexAttribPointer(playerLoc.position,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,playerMesh.ib);gl.bindVertexArray(null);
 let drawCalls=0,visibleInstances=0,culledInstances=0,lastMetrics={drawCalls:0,visibleInstances:0,culledInstances:0,gpuMs:0,gpuTimerSupported:gpu.supported};
 function resize(){const d=Math.max(1,window.devicePixelRatio||1),w=Math.max(1,Math.floor(canvas.clientWidth*d)),h=Math.max(1,Math.floor(canvas.clientHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);}
 function render(time,snapshot={}){
  const frame=profiler.beginFrame(),gpuQuery=gpu.begin();resize();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(.035,.055,.025,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const vp=camera.getViewProjection(canvas.width/canvas.height);
  gl.useProgram(terrainProgram);gl.uniformMatrix4fv(tmat,false,vp);gl.bindVertexArray(terrainVao);gl.drawElements(gl.TRIANGLES,terrain.indexCount,gl.UNSIGNED_INT,0);gl.bindVertexArray(null);
  const pos=snapshot.positions??[],view=camera.getView(canvas.width/canvas.height),culled=cullInstances(pos,maxInstances,view),data=instanceBuffer.resize(culled.count);
  for(let i=0;i<culled.count;i++){const x=culled.data[i*3],z=culled.data[i*3+1],height=sampleTerrainHeight(x,z,terrain.size);data[i*4]=x;data[i*4+1]=height+1.1;data[i*4+2]=z;data[i*4+3]=1.15;}
  instanceBuffer.upload(culled.count);
  if(culled.count){const basis=camera.getBillboardBasis();gl.useProgram(entityProgram);gl.uniformMatrix4fv(emat,false,vp);gl.uniform3fv(eright,basis.right);gl.uniform3fv(eup,basis.up);gl.uniform4f(ecolor,.92,.95,.72,1);gl.bindVertexArray(entityVao);gl.drawElementsInstanced(gl.TRIANGLES,mesh.indexCount,gl.UNSIGNED_SHORT,0,culled.count);gl.bindVertexArray(null);}
  const player=snapshot.player;
  if(player?.position){
   const px=player.position[0],pz=player.position[1],py=sampleTerrainHeight(px,pz,terrain.size)+player.position[2],a=player.animation??"idle",moving=a==="walk"||a==="run",phase=time*(a==="run"?10:6),swing=moving?Math.sin(phase)*(.35*(a==="run"?1.5:1)):0,jump=a==="jump"?Math.sin(phase)*.08:0;
   gl.useProgram(playerProgram);gl.uniformMatrix4fv(playerLoc.viewProjection,false,vp);gl.bindVertexArray(playerVao);const bodyYaw=player.facing??0;
   drawPart(gl,playerLoc,playerMesh,px,py+1.55+jump,pz,.48,.78,.30,[.18,.48,.88],bodyYaw);
   drawPart(gl,playerLoc,playerMesh,px,py+2.65+jump,pz,.52,.52,.52,[.95,.72,.52],bodyYaw);
   const sideX=Math.cos(bodyYaw),sideZ=Math.sin(bodyYaw);
   drawPart(gl,playerLoc,playerMesh,px-.72*sideX,py+1.55+jump+.62*swing,pz-.72*sideZ,.20,.68,.20,[.18,.48,.88],bodyYaw);
   drawPart(gl,playerLoc,playerMesh,px+.72*sideX,py+1.55+jump-.62*swing,pz+.72*sideZ,.20,.68,.20,[.18,.48,.88],bodyYaw);
   drawPart(gl,playerLoc,playerMesh,px-.25*sideX,py+.65+jump-.45*swing,pz-.25*sideZ,.22,.65,.22,[.10,.16,.28],bodyYaw);
   drawPart(gl,playerLoc,playerMesh,px+.25*sideX,py+.65+jump+.45*swing,pz+.25*sideZ,.22,.65,.22,[.10,.16,.28],bodyYaw);
   gl.bindVertexArray(null);
  }
  visibleInstances=culled.count;culledInstances=culled.culled;drawCalls=1+(culled.count?1:0)+(player?.position?6:0);gpu.end(gpuQuery);const gpuMs=gpu.resolve();profiler.endFrame(frame);lastMetrics={drawCalls,visibleInstances,culledInstances,gpuMs,gpuTimerSupported:gpu.supported};
 }
 return{render,getContext:()=>gl,getCamera:()=>camera,getDrawCalls:()=>drawCalls,getMetrics:()=>({...lastMetrics}),isWebGL2:true,getProfiler:()=>profiler,getGPUProfiler:()=>gpu};
}
