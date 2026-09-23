export const EntityType = Object.freeze({ HABITANT:"habitant", TREE:"tree", HOUSE:"house", WAREHOUSE:"warehouse", SAWMILL:"sawmill", ROAD:"road", RESOURCE:"resource", ANIMAL:"animal" });
export const EntityTypeCode = Object.freeze(Object.fromEntries(Object.values(EntityType).map((type,index)=>[type,index+1])));
export function createEntity(world,type,components=[]){const code=EntityTypeCode[type];if(!code)throw new Error(`WebLords: tipo de entidade desconhecido: ${type}.`);const id=world.entities.create(code);for(const component of components)world.entities.add(id,component.name,component.values);return id;}
export function spawnInitialEntity(world,type,x=0,y=0,z=0){
 const components=[{name:"Position",values:[x,y,z]}];
 if(type===EntityType.HABITANT) components.push({name:"Velocity",values:[0,0,0]},{name:"Job",values:[0,0,0]},{name:"Inventory",values:[0,0,0,0]},{name:"Needs",values:[100,100,100,100]},{name:"Movement",values:[x,y,z,1]},{name:"Health",values:[100,100]});
 else if([EntityType.HOUSE,EntityType.WAREHOUSE,EntityType.SAWMILL,EntityType.ROAD].includes(type)){components.push({name:"Building",values:[EntityTypeCode[type],0,0,100]});if(type===EntityType.WAREHOUSE)components.push({name:"Inventory",values:[0,0,0,0]});if(type===EntityType.SAWMILL)components.push({name:"Inventory",values:[0,0,0,0]},{name:"Production",values:[0,1,1,1]});}
 return createEntity(world,type,components);
}