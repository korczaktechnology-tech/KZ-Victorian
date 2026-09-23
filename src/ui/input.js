export function createInputController(canvas,{camera,sendCommand}){
 if(!canvas||!camera||typeof sendCommand!=="function")throw new TypeError("WebLords: controlador de entrada inválido.");
 const keys=new Set();let rotating=false,pointerButton=-1,dragging=false,lastX=0,lastY=0,lastTime=performance.now();
 const onPointerDown=e=>{if(e.button!==0&&e.button!==1&&e.button!==2)return;pointerButton=e.button;rotating=e.button===1||e.button===2;dragging=false;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);if(rotating)e.preventDefault();};
 const onPointerMove=e=>{if(pointerButton<0)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.hypot(dx,dy)>2)dragging=true;if(rotating){camera.orbit(-dy*.006,-dx*.006);e.preventDefault();}lastX=e.clientX;lastY=e.clientY;};
 const onPointerUp=e=>{dragging=false;rotating=false;pointerButton=-1;canvas.releasePointerCapture?.(e.pointerId);};
 const onWheel=e=>{camera.zoomBy(Math.exp(-e.deltaY*.0015));e.preventDefault();};
 const onKeyDown=e=>{const k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"," "].includes(k)){keys.add(k);e.preventDefault();}};
 const onKeyUp=e=>keys.delete(e.key.toLowerCase());
 const onContextMenu=e=>e.preventDefault();
 canvas.addEventListener("pointerdown",onPointerDown);canvas.addEventListener("pointermove",onPointerMove);canvas.addEventListener("pointerup",onPointerUp);canvas.addEventListener("pointercancel",onPointerUp);canvas.addEventListener("wheel",onWheel,{passive:false});canvas.addEventListener("contextmenu",onContextMenu);window.addEventListener("keydown",onKeyDown);window.addEventListener("keyup",onKeyUp);
 function update(){const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-lastTime)/1000));lastTime=now;let forward=0,right=0;if(keys.has("w")||keys.has("arrowup"))forward+=1;if(keys.has("s")||keys.has("arrowdown"))forward-=1;if(keys.has("d")||keys.has("arrowright"))right+=1;if(keys.has("a")||keys.has("arrowleft"))right-=1;const len=Math.hypot(forward,right)||1;if(forward||right){forward/=len;right/=len;}sendCommand("player.input",{forward,right,sprint:keys.has("shift"),jump:keys.has(" "),yaw:camera.yaw});if(keys.has(" "))keys.delete(" ");requestAnimationFrame(update);}
 requestAnimationFrame(update);
 return{destroy(){canvas.removeEventListener("pointerdown",onPointerDown);canvas.removeEventListener("pointermove",onPointerMove);canvas.removeEventListener("pointerup",onPointerUp);canvas.removeEventListener("pointercancel",onPointerUp);canvas.removeEventListener("wheel",onWheel);canvas.removeEventListener("contextmenu",onContextMenu);window.removeEventListener("keydown",onKeyDown);window.removeEventListener("keyup",onKeyUp);}};
}
