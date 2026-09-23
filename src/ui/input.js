export function createInputController(canvas,{camera,sendCommand}){
 if(!canvas||!camera||typeof sendCommand!=="function")throw new TypeError("WebLords: controlador de entrada inválido.");
 const keys=new Set();let dragging=false,pointerButton=-1,lastX=0,lastY=0,downX=0,downY=0,lastTime=performance.now(),lastCommand=0;
 const movementKeys=new Set(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"," "]);
 const sendInput=()=>sendCommand("player.input",{forward:(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0),right:(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0),sprint:keys.has("shift"),jump:keys.has(" "),yaw:camera.yaw});
 const onPointerDown=e=>{
  if(e.button!==0&&e.button!==1&&e.button!==2)return;
  pointerButton=e.button;dragging=false;downX=lastX=e.clientX;downY=lastY=e.clientY;
  canvas.setPointerCapture?.(e.pointerId);
  if(e.button!==0)e.preventDefault();
 };
 const onPointerMove=e=>{
  if(pointerButton<0)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;
  if(!dragging&&Math.hypot(e.clientX-downX,e.clientY-downY)>4)dragging=true;
  if(dragging){
   // Arrastar para a direita gira a câmera para a direita; arrastar para cima olha para cima.
   camera.orbit(-dy*.006,-dx*.006);
   e.preventDefault();
  }
  lastX=e.clientX;lastY=e.clientY;
 };
 const onPointerUp=e=>{
  if(pointerButton===0&&!dragging)sendCommand("selection.request",{x:camera.x,y:camera.y,radius:2.5});
  dragging=false;pointerButton=-1;canvas.releasePointerCapture?.(e.pointerId);
 };
 const onWheel=e=>{camera.zoomBy(Math.exp(-e.deltaY*.0015));e.preventDefault();};
 const onKeyDown=e=>{const k=e.key.toLowerCase();if(movementKeys.has(k)){keys.add(k);e.preventDefault();}};
 const onKeyUp=e=>keys.delete(e.key.toLowerCase());
 const onContextMenu=e=>e.preventDefault();
 canvas.addEventListener("pointerdown",onPointerDown);canvas.addEventListener("pointermove",onPointerMove);canvas.addEventListener("pointerup",onPointerUp);canvas.addEventListener("pointercancel",onPointerUp);canvas.addEventListener("wheel",onWheel,{passive:false});canvas.addEventListener("contextmenu",onContextMenu);
 window.addEventListener("keydown",onKeyDown);window.addEventListener("keyup",onKeyUp);
 function update(){
  const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-lastTime)/1000));lastTime=now;
  if(now-lastCommand>=33){sendInput();lastCommand=now;}
  requestAnimationFrame(update);
 }
 sendInput();requestAnimationFrame(update);
 return{destroy(){canvas.removeEventListener("pointerdown",onPointerDown);canvas.removeEventListener("pointermove",onPointerMove);canvas.removeEventListener("pointerup",onPointerUp);canvas.removeEventListener("pointercancel",onPointerUp);canvas.removeEventListener("wheel",onWheel);canvas.removeEventListener("contextmenu",onContextMenu);window.removeEventListener("keydown",onKeyDown);window.removeEventListener("keyup",onKeyUp);}};
}
