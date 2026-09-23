const V=`#version 300 es
in vec3 a_position;in vec3 a_normal;
uniform mat4 u_viewProjection;uniform mat4 u_model;
out vec3 v_normal;
void main(){v_normal=mat3(u_model)*a_normal;gl_Position=u_viewProjection*u_model*vec4(a_position,1.0);}`;
const F=`#version 300 es
precision highp float;in vec3 v_normal;uniform vec3 u_color;out vec4 outColor;
void main(){vec3 light=normalize(vec3(-.4,.9,.6));float value=.68+.34*max(dot(normalize(v_normal),light),0.0);outColor=vec4(u_color*value,1.0);}`;
function cube(size){const[sx,sy,sz]=size.map(v=>v/2);return{
 p:new Float32Array([-sx,-sy,-sz,sx,-sy,-sz,sx,sy,-sz,-sx,sy,-sz,-sx,-sy,sz,sx,-sy,sz,sx,sy,sz,-sx,sy,sz]),
 n:new Float32Array([0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1]),
 i:new Uint16Array([0,1,2,0,2,3,5,4,7,5,7,6,4,0,3,4,3,7,1,5,6,1,6,2,3,2,6,3,6,7,4,5,1,4,1,0])};}
function trs(x,y,z,rx,ry,rz,sx,sy,sz){const cx=Math.cos(rx),sxr=Math.sin(rx),cy=Math.cos(ry),syr=Math.sin(ry),cz=Math.cos(rz),szr=Math.sin(rz);return new Float32Array([
 cy*cz*sx,(sxr*syr*cz-cxr*szr)*sy,(cxr*syr*cz+sxr*szr)*sz,0,
 cy*szr*sx,(sxr*syr*szr+cxr*cz)*sy,(cxr*syr*szr-sxr*cz)*sz,0,
 -syr*sx,sxr*cy*sy,cxr*cy*sz,0,x,y,z,1]);}
export function createPlayerRenderer(gl,createProgram,terrainHeight){
 const program=createProgram(gl,V,F),vao=gl.createVertexArray();
 const parts=[
  {size:[1,.95,.55],at:[0,1.85,0],color:[.18,.42,.9],limb:null},
  {size:[.82,.82,.82],at:[0,2.82,0],color:[.95,.7,.46],limb:null},
  {size:[.34,1.15,.4],at:[-.67,1.78,0],color:[.95,.7,.46],limb:"leftArm"},
  {size:[.34,1.15,.4],at:[.67,1.78,0],color:[.95,.7,.46],limb:"rightArm"},
  {size:[.42,1.25,.48],at:[-.25,.65,0],color:[.12,.14,.18],limb:"leftLeg"},
  {size:[.42,1.25,.48],at:[.25,.65,0],color:[.12,.14,.18],limb:"rightLeg"}];
 const buffers=parts.map(part=>{const m=cube(part.size),vb=gl.createBuffer(),nb=gl.createBuffer(),ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,m.p,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,m.n,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.i,gl.STATIC_DRAW);return{...part,vb,nb,ib};});
 const aPos=gl.getAttribLocation(program,"a_position"),aNormal=gl.getAttribLocation(program,"a_normal"),uVP=gl.getUniformLocation(program,"u_viewProjection"),uModel=gl.getUniformLocation(program,"u_model"),uColor=gl.getUniformLocation(program,"u_color");
 if(!vao||aPos<0||aNormal<0||!uVP||!uModel||!uColor)throw new Error("WebLords: renderer 3D do jogador inválido.");
 return{draw(vp,player){
   if(!player)return;const p=player.position,t=performance.now()/1000,phase=player.animation==="run"?t*12:player.animation==="walk"?t*8:0;
   gl.useProgram(program);gl.uniformMatrix4fv(uVP,false,vp);
   for(const part of buffers){
     let swing=0;if(part.limb==="leftArm")swing=Math.sin(phase)*.65;if(part.limb==="rightArm")swing=-Math.sin(phase)*.65;if(part.limb==="leftLeg")swing=-Math.sin(phase)*.65;if(part.limb==="rightLeg")swing=Math.sin(phase)*.65;
     if(player.animation==="jump"&&part.limb?.includes("Arm"))swing=part.limb==="leftArm"?.45:-.45;
     const model=trs(p[0]+part.at[0],terrainHeight(p[0],p[1],256)+p[2]+part.at[1],p[1]+part.at[2],swing,player.facing,0,1,1,1);
     gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,part.vb);gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,part.nb);gl.enableVertexAttribArray(aNormal);gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,part.ib);gl.uniformMatrix4fv(uModel,false,model);gl.uniform3fv(uColor,part.color);gl.drawElements(gl.TRIANGLES,36,gl.UNSIGNED_SHORT,0);
   }
   gl.bindVertexArray(null);
 }};
}
