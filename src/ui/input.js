export function createInputController(canvas,{camera,sendCommand,selectRadius=1.5}){
  if(!canvas||!camera||typeof sendCommand!=="function")throw new TypeError("WebLords: controlador de entrada inválido.");

  const keys=new Set();
  let rotating=false;
  let lastX=0;
  let lastY=0;
  let lastTime=performance.now();

  const onPointerDown=(event)=>{
    if(event.button===1||event.button===2){
      rotating=true;
      lastX=event.clientX;
      lastY=event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      return;
    }
    if(event.button!==0)return;

    const rect=canvas.getBoundingClientRect();
    const sx=(event.clientX-rect.left)*(canvas.width/Math.max(1,rect.width));
    const sy=(event.clientY-rect.top)*(canvas.height/Math.max(1,rect.height));
    const aspect=canvas.width/Math.max(1,canvas.height);
    const zoom=camera.zoom??1;
    const x=(((sx/canvas.width)*2-1)/(zoom/Math.max(aspect,.0001)))+(camera.x??0);
    const y=(((1-sy/canvas.height)*2-1)/zoom)+(camera.y??0);
    sendCommand("selection.request",{x,y,radius:selectRadius});
  };

  const onPointerMove=(event)=>{
    if(!rotating)return;
    const dx=event.clientX-lastX;
    const dy=event.clientY-lastY;
    lastX=event.clientX;
    lastY=event.clientY;
    camera.orbit(-dy*.006,-dx*.006);
    event.preventDefault();
  };

  const stopRotate=(event)=>{
    rotating=false;
    if(event?.pointerId!==undefined)canvas.releasePointerCapture?.(event.pointerId);
  };

  const onWheel=(event)=>{
    const factor=Math.exp(-event.deltaY*.0015);
    camera.zoomBy(factor);
    event.preventDefault();
  };

  const onKeyDown=(event)=>{
    const key=event.key.toLowerCase();
    if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","q","e"].includes(key)){
      keys.add(key);
      event.preventDefault();
    }
  };

  const onKeyUp=(event)=>keys.delete(event.key.toLowerCase());
  const onContextMenu=(event)=>event.preventDefault();

  canvas.addEventListener("pointerdown",onPointerDown);
  canvas.addEventListener("pointermove",onPointerMove);
  canvas.addEventListener("pointerup",stopRotate);
  canvas.addEventListener("pointercancel",stopRotate);
  canvas.addEventListener("wheel",onWheel,{passive:false});
  canvas.addEventListener("contextmenu",onContextMenu);
  window.addEventListener("keydown",onKeyDown);
  window.addEventListener("keyup",onKeyUp);

  function update(){
    const now=performance.now();
    const dt=Math.min(.05,Math.max(0,(now-lastTime)/1000));
    lastTime=now;
    let forward=0,right=0;
    if(keys.has("w")||keys.has("arrowup"))forward+=1;
    if(keys.has("s")||keys.has("arrowdown"))forward-=1;
    if(keys.has("d")||keys.has("arrowright"))right+=1;
    if(keys.has("a")||keys.has("arrowleft"))right-=1;
    const speed=(keys.has("shift")?28:12)*dt;
    if(forward||right){
      const length=Math.hypot(forward,right)||1;
      camera.moveLocal(forward/length*speed,right/length*speed);
    }
    if(keys.has("q"))camera.orbit(0,-1.8*dt);
    if(keys.has("e"))camera.orbit(0,1.8*dt);
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  return{
    destroy(){
      canvas.removeEventListener("pointerdown",onPointerDown);
      canvas.removeEventListener("pointermove",onPointerMove);
      canvas.removeEventListener("pointerup",stopRotate);
      canvas.removeEventListener("pointercancel",stopRotate);
      canvas.removeEventListener("wheel",onWheel);
      canvas.removeEventListener("contextmenu",onContextMenu);
      window.removeEventListener("keydown",onKeyDown);
      window.removeEventListener("keyup",onKeyUp);
    }
  };
}