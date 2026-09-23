import {createServer} from "node:http";
import {createReadStream,statSync} from "node:fs";
import {extname,join,normalize} from "node:path";
const root=normalize(process.argv[2]??"_dist");
const port=Number(process.env.PORT??4173);
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".glb":"model/gltf-binary",".ktx2":"image/ktx2",".ogg":"audio/ogg",".woff2":"font/woff2",".woff":"font/woff"};
const server=createServer((req,res)=>{
 const url=new URL(req.url??"/","http://localhost");
 let path=normalize(join(root,url.pathname==="/" ? "/index.html" : url.pathname));
 if(!path.startsWith(root)){res.writeHead(403);return res.end();}
 try{if(!statSync(path).isFile())path=join(root,"index.html");}catch{path=join(root,"index.html");}
 res.setHeader("Content-Type",types[extname(path).toLowerCase()]??"application/octet-stream");
 res.setHeader("Cache-Control","no-cache");
 createReadStream(path).pipe(res);
});
server.listen(port,"127.0.0.1",()=>console.log(`WebLords production server: http://127.0.0.1:${port}`));
