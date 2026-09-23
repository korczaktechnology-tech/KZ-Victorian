import {cp,mkdir,rm} from "node:fs/promises";import {join} from "node:path";
const out="_dist";await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const path of ["index.html","style.css","src","assets"])await cp(path,join(out,path),{recursive:true});
console.log("WebLords production build: OK — site estático preparado em _dist/.");