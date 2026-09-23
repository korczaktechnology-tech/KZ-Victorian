import{createProgram}from"./shaders.js";
import{createQuadMesh}from"./meshes.js";
import{InstanceBuffer}from"./instances.js";
import{Camera}from"./camera.js";
import{cullInstances}from"./culling.js";
import{createGPUProfiler}from"./gpu-profiler.js";
import{createAssetProfiler}from"../core/asset-profiler.js";
import{createTerrainMesh,sampleTerrainHeight}from"./terrain.js";
import{TERRAIN_VERTEX_SHADER,TERRAIN_FRAGMENT_SHADER}from"./terrain-shaders.js";

export function createRenderer(canvas,o={}){
  const maxInstances=o.maxInstances??4096,profiler=o.assetProfiler??createAssetProfiler();
  const gl=canvas.getContext("webgl2",{antialias:true,alpha:false});
  if(!gl)throw new Error("WebLords: WebGL 2.0 não está disponível neste navegador.");
  profiler.attachWebGL2(gl);
  const gpu=createGPUProfiler(gl),camera=o.camera??new Camera();

  const terrain=createTerrainMesh(gl,256,256);
  const terrainProgram=createProgram(gl,TERRAIN_VERTEX_SHADER,TERRAIN_FRAGMENT_SHADER);
  const terrainVao=gl.createVertexArray();
  if(!terrainVao)throw new Error("WebLords: falha ao criar VAO do terreno.");
  const tp=gl.getAttribLocation(terrainProgram,"a_position"),tn=gl.getAttribLocation(terrainProgram,"a_normal"),tmat=gl.getUniformLocation(terrainProgram,"u_viewProjection");
  if(tp<0||tn<0||!tmat)throw new Error("WebLords: atributos/uniforme do terreno não encontrados.");
  gl.bindVertexArray(terrainVao);
  gl.bindBuffer(gl.ARRAY_BUFFER,terrain.positionBuffer);gl.enableVertexAttribArray(tp);gl.vertexAttribPointer(tp,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,terrain.normalBuffer);gl.enableVertexAttribArray(tn);gl.vertexAttribPointer(tn,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,terrain.indexBuffer);gl.bindVertexArray(null);

  const entityProgram=createProgram(gl);
  const entityVao=gl.createVertexArray();
  if(!entityVao)throw new Error("WebLords: falha ao criar VAO das entidades.");
  const mesh=createQuadMesh(gl);
  const instanceBuffer=new InstanceBuffer(gl,maxInstances,4);
  const ep=gl.getAttribLocation(entityProgram,"a_position"),eip=gl.getAttribLocation(entityProgram,"a_instancePosition"),eis=gl.getAttribLocation(entityProgram,"a_instanceScale");
  const emat=gl.getUniformLocation(entityProgram,"u_viewProjection"),eright=gl.getUniformLocation(entityProgram,"u_cameraRight"),eup=gl.getUniformLocation(entityProgram,"u_cameraUp"),ecolor=gl.getUniformLocation(entityProgram,"u_color");
  if(ep<0||eip<0||eis<0||!emat||!eright||!eup||!ecolor)throw new Error("WebLords: atributos/uniformes das entidades não encontrados.");
  gl.bindVertexArray(entityVao);
  gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vertexBuffer);gl.enableVertexAttribArray(ep);gl.vertexAttribPointer(ep,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,instanceBuffer.buffer);gl.enableVertexAttribArray(eip);gl.vertexAttribPointer(eip,3,gl.FLOAT,false,16,0);gl.vertexAttribDivisor(eip,1);
  gl.enableVertexAttribArray(eis);gl.vertexAttribPointer(eis,1,gl.FLOAT,false,16,12);gl.vertexAttribDivisor(eis,1);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer);gl.bindVertexArray(null);

  let drawCalls=0,visibleInstances=0,culledInstances=0,lastMetrics={drawCalls:0,visibleInstances:0,culledInstances:0,gpuMs:0,gpuTimerSupported:gpu.supported};
  function resize(){const d=Math.max(1,window.devicePixelRatio||1),w=Math.max(1,Math.floor(canvas.clientWidth*d)),h=Math.max(1,Math.floor(canvas.clientHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);}
  function render(time,snapshot={}){
    const frame=profiler.beginFrame(),gpuQuery=gpu.begin();resize();
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
    gl.clearColor(.035,.055,.025,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const vp=camera.getViewProjection(canvas.width/canvas.height);
    gl.useProgram(terrainProgram);gl.uniformMatrix4fv(tmat,false,vp);gl.bindVertexArray(terrainVao);gl.drawElements(gl.TRIANGLES,terrain.indexCount,gl.UNSIGNED_INT,0);gl.bindVertexArray(null);
    const pos=snapshot.positions??[],view=camera.getView(canvas.width/canvas.height),culled=cullInstances(pos,maxInstances,view);
    const data=instanceBuffer.resize(culled.count);
    for(let i=0;i<culled.count;i++){
      const x=culled.data[i*3],z=culled.data[i*3+1],height=sampleTerrainHeight(x,z,terrain.size);
      data[i*4]=x;data[i*4+1]=height+1.1;data[i*4+2]=z;data[i*4+3]=1.15;
    }
    instanceBuffer.upload(culled.count);
    if(culled.count){
      const basis=camera.getBillboardBasis();
      gl.useProgram(entityProgram);gl.uniformMatrix4fv(emat,false,vp);gl.uniform3fv(eright,basis.right);gl.uniform3fv(eup,basis.up);gl.uniform4f(ecolor,.92,.95,.72,1);
      gl.bindVertexArray(entityVao);gl.drawElementsInstanced(gl.TRIANGLES,mesh.indexCount,gl.UNSIGNED_SHORT,0,culled.count);gl.bindVertexArray(null);
    }
    visibleInstances=culled.count;culledInstances=culled.culled;drawCalls=1+(culled.count?1:0);
    gpu.end(gpuQuery);const gpuMs=gpu.resolve();profiler.endFrame(frame);
    lastMetrics={drawCalls,visibleInstances,culledInstances,gpuMs,gpuTimerSupported:gpu.supported};
  }
  return{render,getContext:()=>gl,getCamera:()=>camera,getDrawCalls:()=>drawCalls,getMetrics:()=>({...lastMetrics}),isWebGL2:true,getProfiler:()=>profiler,getGPUProfiler:()=>gpu};
}
