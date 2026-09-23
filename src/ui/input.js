export function createInputController(canvas,{camera,sendCommand,selectRadius=1.5}){
  if(!canvas||!camera||typeof sendCommand!=="function")throw new TypeError("WebLords: controlador de entrada inválido.");
  const onPointer=(event)=>{const rect=canvas.getBoundingClientRect();const sx=(event.clientX-rect.left)*(canvas.width/rect.width),sy=(event.clientY-rect.top)*(canvas.height/rect.height);const aspect=canvas.width/Math.max(1,canvas.height),zoom=camera.zoom??1;const x=(((sx/canvas.width)*2-1)/(zoom/Math.max(aspect,.0001)))+(camera.x??0),y=(((1-sy/canvas.height)*2-1)/zoom)+(camera.y??0);sendCommand("selection.request",{x,y,radius:selectRadius});};
  canvas.addEventListener("pointerdown",onPointer);return{destroy(){canvas.removeEventListener("pointerdown",onPointer);}};
}
