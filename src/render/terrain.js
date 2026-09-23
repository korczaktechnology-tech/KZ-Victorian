const DEFAULT_SIZE=256,DEFAULT_SEGMENTS=256;

export function sampleTerrainHeight(worldX,worldZ,size=DEFAULT_SIZE){
  const localX=Math.max(0,Math.min(size,Number(worldX)+size/2));
  const localZ=Math.max(0,Math.min(size,Number(worldZ)+size/2));
  const nx=localX/size,ny=localZ/size;
  const broad=Math.sin(nx*Math.PI*2.1+.35)*2.6+Math.cos(ny*Math.PI*1.7-.8)*2.1;
  const medium=Math.sin((nx+ny)*Math.PI*5.2)*.85+Math.cos((nx-ny)*Math.PI*4.1)*.7;
  const fine=Math.sin(nx*Math.PI*11+Math.sin(ny*8))*.22+Math.cos(ny*Math.PI*13+Math.cos(nx*7))*.18;
  const valley=-1.7*Math.exp(-(((nx-.56)**2)/.035+((ny-.43)**2)/.055));
  const hill=1.5*Math.exp(-(((nx-.24)**2)/.025+((ny-.72)**2)/.035));
  return Math.max(-1.5,broad+medium+fine+valley+hill);
}

export function createTerrainMesh(gl,size=DEFAULT_SIZE,segments=DEFAULT_SEGMENTS){
  if(!gl)throw new TypeError("WebLords: contexto WebGL inválido para o terreno.");
  const cells=Math.max(1,segments|0),side=cells+1,count=side*side;
  const positions=new Float32Array(count*3),normals=new Float32Array(count*3);
  const step=size/cells;
  let i=0;
  for(let z=0;z<=cells;z++){
    const localZ=z*step;
    for(let x=0;x<=cells;x++){
      const localX=x*step;
      const h=sampleTerrainHeight(localX-size/2,localZ-size/2,size);
      const dx=(sampleTerrainHeight(localX-size/2+step,localZ-size/2,size)-sampleTerrainHeight(localX-size/2-step,localZ-size/2,size))/(2*step);
      const dz=(sampleTerrainHeight(localX-size/2,localZ-size/2+step,size)-sampleTerrainHeight(localX-size/2,localZ-size/2-step,size))/(2*step);
      const p=i*3,nx=-dx,ny=1,nz=-dz,l=Math.hypot(nx,ny,nz)||1;
      positions[p]=localX-size/2;
      positions[p+1]=h;
      positions[p+2]=localZ-size/2;
      normals[p]=nx/l;
      normals[p+1]=ny/l;
      normals[p+2]=nz/l;
      i++;
    }
  }
  const indices=new Uint32Array(cells*cells*6);
  let k=0;
  for(let z=0;z<cells;z++)for(let x=0;x<cells;x++){
    const a=z*side+x,b=a+1,c=a+side,d=c+1;
    indices[k++]=a;indices[k++]=c;indices[k++]=b;
    indices[k++]=b;indices[k++]=c;indices[k++]=d;
  }
  const positionBuffer=gl.createBuffer(),normalBuffer=gl.createBuffer(),indexBuffer=gl.createBuffer();
  if(!positionBuffer||!normalBuffer||!indexBuffer)throw new Error("WebLords: falha ao criar buffers do terreno.");
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,positions,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
  return Object.freeze({size,cells,vertexCount:count,indexCount:indices.length,positionBuffer,normalBuffer,indexBuffer});
}
