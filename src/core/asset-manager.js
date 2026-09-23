const SUPPORTED=Object.freeze({model:[".glb"],texture:[".ktx2"],audio:[".ogg"],font:[".woff2",".woff"]});
function extension(path){const clean=path.split("?")[0].toLowerCase();const i=clean.lastIndexOf(".");return i<0?"":clean.slice(i);}
function kind(path){const ext=extension(path);for(const [type,extensions] of Object.entries(SUPPORTED))if(extensions.includes(ext))return type;return null;}
export function validateAssetPath(path){if(typeof path!=="string"||!path.startsWith("assets/"))throw new Error("WebLords: asset deve estar dentro de assets/.");const type=kind(path);if(!type)throw new Error("WebLords: formato de asset não suportado: "+path);return{path,type,extension:extension(path)};}
export function createAssetManager({basePath="",fetchImpl=globalThis.fetch}={}){
  const cache=new Map();let bytes=0;
  async function load(path,options={}){
    const info=validateAssetPath(path);if(cache.has(path)){const item=cache.get(path);item.refs++;return item.value;}
    if(typeof fetchImpl!=="function")throw new Error("WebLords: fetch não está disponível para carregar assets.");
    const response=await fetchImpl(basePath+path,options);if(!response.ok)throw new Error("WebLords: falha ao carregar asset "+path+" ("+response.status+").");
    const data=await response.arrayBuffer();const value={path:info.path,type:info.type,bytes:data.byteLength,data};cache.set(path,{value,refs:1});bytes+=data.byteLength;return value;
  }
  function release(path){const item=cache.get(path);if(!item)return false;item.refs=Math.max(0,item.refs-1);return true;}
  function unload(path){const item=cache.get(path);if(!item||item.refs>0)return false;bytes-=item.value.bytes;cache.delete(path);return true;}
  function clearUnused(){for(const [path,item] of cache)if(item.refs===0)unload(path);}
  function getStats(){return{count:cache.size,bytes,megabytes:bytes/1024/1024,entries:[...cache].map(([path,item])=>({path,type:item.value.type,bytes:item.value.bytes,refs:item.refs}))};}
  return Object.freeze({load,release,unload,clearUnused,getStats,supported:SUPPORTED});
}
