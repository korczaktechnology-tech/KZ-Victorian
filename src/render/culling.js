export function cullInstances(positions,maxInstances,view){
  const count=Math.min(maxInstances,Math.floor(positions.length/3));
  const visible=new Float32Array(count*3);
  let n=0;
  const distance=Math.max(8,(view.height/view.zoom)*Math.tan(view.fov/2));
  const halfY=distance*1.15,halfX=halfY*view.aspect;
  for(let i=0;i<count;i++){
    const x=positions[i*3],y=positions[i*3+1],z=positions[i*3+2];
    if(x<view.x-halfX||x>view.x+halfX||y<view.y-halfY||y>view.y+halfY)continue;
    visible[n*3]=x;visible[n*3+1]=y;visible[n*3+2]=z;n++;
  }
  return{data:visible.subarray(0,n*3),count:n,culled:count-n};
}
