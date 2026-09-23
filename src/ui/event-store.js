export const UI_EVENT_TYPES=Object.freeze(["resourceChanged","populationChanged","constructionCompleted","constructionStarted","taskCreated","taskCompleted","selectionChanged","worldStateChanged","productionCompleted","commandAccepted","commandRejected","taskFailed","navigationUpdated"]);
const RESOURCE_NAMES=Object.freeze(["wood","planks","food","stone"]);
export function createUIEventStore(){
  const listeners=new Set();
  const state={population:0,resources:new Map(RESOURCE_NAMES.map(name=>[name,0])),selection:null,messages:[],worldState:{tick:0,metrics:{}} ,lastEvent:null};
  const emit=event=>{state.lastEvent=event;for(const listener of listeners){try{listener(event,state);}catch(error){console.error("WebLords: erro em listener da UI.",error);}}};
  return{
    state,
    subscribe(listener){if(typeof listener!=="function")throw new TypeError("listener precisa ser uma função.");listeners.add(listener);return()=>listeners.delete(listener);},
    apply(event){
      if(!event||typeof event.type!=="string")return false;
      const p=event.payload??{};
      if(event.type==="populationChanged")state.population=Number(p.population??state.population);
      if(event.type==="resourceChanged"){const key=p.resourceName??RESOURCE_NAMES[p.resource]??String(p.resource??"unknown");state.resources.set(key,(state.resources.get(key)??0)+Number(p.quantity??0));}
      if(event.type==="selectionChanged")state.selection=p;
      if(event.type==="worldStateChanged"){
        state.worldState={...state.worldState,...p};
        const totals=p.metrics?.resources;
        if(totals){for(const name of RESOURCE_NAMES)state.resources.set(name,Number(totals[name]??0));}
      }
      if(["constructionCompleted","constructionStarted","taskCreated","taskCompleted","productionCompleted","commandRejected","taskFailed"].includes(event.type)){state.messages.push({type:event.type,payload:p,timestamp:Date.now()});if(state.messages.length>20)state.messages.shift();}
      emit(event);return true;
    },
    clearMessages(){state.messages.length=0;}
  };
}
