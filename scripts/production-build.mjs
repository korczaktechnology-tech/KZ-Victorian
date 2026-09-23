import {cp,mkdir,rm,readdir} from "node:fs/promises";
import {join,extname} from "node:path";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
const exec=promisify(execFile);
const out="_dist";
await rm(out,{recursive:true,force:true});
await mkdir(join(out,"src"),{recursive:true});
await mkdir(join(out,"assets"),{recursive:true});
await cp("index.html",join(out,"index.html"));
await cp("style.css",join(out,"style.css"));
await cp("assets",join(out,"assets"),{recursive:true});
async function files(dir){
 const result=[];
 for(const entry of await readdir(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())result.push(...await files(p));else result.push(p);}
 return result;
}
const sources=(await files("src")).filter(p=>extname(p)===".js");
for(const source of sources){
 const target=join(out,source);
 await mkdir(join(target,".."),{recursive:true});
 await exec("npx",["--yes","terser",source,"--compress","--mangle","--ecma","2022","--output",target],{maxBuffer:10*1024*1024});
}
const css=await import("node:fs/promises");
const raw=await css.readFile("style.css","utf8");
const minCss=raw.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s+/g," ").replace(/\s*([{}:;,>])\s*/g,"$1").trim();
await css.writeFile(join(out,"style.css"),minCss);
console.log(`WebLords production build: OK — ${sources.length} módulos JS minificados e CSS otimizado em _dist/.`);
