import {EntityType,EntityTypeCode,createEntity} from "../core/entities.js";
import {RESOURCE} from "./economy.js";
const NAVIGATION_BUILDINGS=new Set([EntityTypeCode[EntityType.HOUSE],EntityTypeCode[EntityType.WAREHOUSE],EntityTypeCode[EntityType.SAWMILL],EntityTypeCode[EntityType.ROAD]]);
export const BUILDING_COSTS=Object.freeze({[EntityType.HOUSE]:Object.freeze({wood:5,stone:2}),[EntityType.WAREHOUSE]:Object.freeze({wood:8,stone:4}),[EntityType.SAWMILL]:Object.freeze({wood:10,stone:3}),[EntityType.ROAD]:Object.freeze({wood:1,stone:0})});
export function validateConstruction(world,type,x,y){if(!Object.values(EntityType).includes(type)||!BUILDING_COSTS[type])return{ok:false,reason:"invalid-building"};if(!world.map.inBounds(x,y)||world.map.isBlocked(x,y))return{ok:false,reason:"cell-not-buildable"};return{ok:true,cost:BUILDING_COSTS[type]};}
export function requestConstruction(world,type,x,y,z=0){
 const validation=validateConstruction(world,type,x,y);if(!validation.ok)return validation;
 const warehouseIds=[];world.entities.query("Inventory").forEach(id=>{if(world.entities.type(id)===EntityTypeCode[EntityType.WAREHOUSE])warehouseIds.push(id);});
 const warehouse=warehouseIds[0];const stock=warehouse?world.entities.get(warehouse,"Inventory"):null;
 const required={ [RESOURCE.WOOD]:validation.cost.wood ?? 0, [RESOURCE.STONE]:validation.cost.stone ?? 0 };
 if(!stock||stock[RESOURCE.WOOD]<required[RESOURCE.WOOD]||stock[RESOURCE.STONE]<required[RESOURCE.STONE])return{ok:false,reason:"insufficient-construction-stock",required,warehouseId:warehouse??null};
 stock[RESOURCE.WOOD]-=required[RESOURCE.WOOD];stock[RESOURCE.STONE]-=required[RESOURCE.STONE];
 world.emit("inventoryChanged",{entityId:warehouse,resource:RESOURCE.WOOD,quantity:-required[RESOURCE.WOOD]});
 world.emit("inventoryChanged",{entityId:warehouse,resource:RESOURCE.STONE,quantity:-required[RESOURCE.STONE]});
 const id=createEntity(world,type,[{name:"Position",values:[x,y,z]},{name:"Building",values:[EntityTypeCode[type],1,0,100]}]);world.map.setBuildingObstacle(x,y,true);if(world.navigation.activeField!==null)world.rebuildNavigation();world.emit("constructionStarted",{entityId:id,type,x,y,warehouseId:warehouse});return{ok:true,entityId:id,cost:validation.cost,warehouseId:warehouse};}
export function updateConstruction(world){let completed=0,navigationChanged=false;world.entities.query("Building","Position").forEach(id=>{const b=world.entities.get(id,"Building"),p=world.entities.get(id,"Position");if(b[1]===1&&b[2]<b[3]){b[2]+=1;if(b[2]>=b[3]){b[2]=b[3];b[1]=2;completed+=1;world.emit("constructionCompleted",{entityId:id});}if(NAVIGATION_BUILDINGS.has(world.entities.type(id)))navigationChanged=world.map.setBuildingObstacle(Math.floor(p[0]),Math.floor(p[1]),true)||navigationChanged;}});if(navigationChanged&&world.navigation.activeField!==null)world.rebuildNavigation();world.metrics.completedConstruction=completed;return completed;}