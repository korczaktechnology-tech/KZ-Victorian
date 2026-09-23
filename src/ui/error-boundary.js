export function createErrorReporter(root){
  const report=(kind,error)=>{
    const message=error instanceof Error?error.message:String(error);
    if(root){
      let panel=root.querySelector("[data-ui=error]");
      if(!panel){panel=document.createElement("div");panel.dataset.ui="error";panel.className="ui-error";panel.setAttribute("role","alert");root.appendChild(panel);}
      panel.textContent="WebLords — "+kind+": "+message;
    }
    console.error("WebLords — "+kind+":",error);
  };
  return{report};
}
