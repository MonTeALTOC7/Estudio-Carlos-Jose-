// Servidor estático mínimo para probar la aplicación en un navegador (solo desarrollo y CI).
// serve()                         → sirve dist/ en la raíz
// serve(0,{'/prod/':dir1,'/prueba/':dir2}) → varias carpetas bajo un mismo origen (como GitHub Pages)
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
/* Lee un archivo _headers (formato de Cloudflare Pages/Netlify): línea sin sangría = ruta; líneas con sangría = «Nombre: valor». */
const readHeaders=root=>{const f=path.join(root,'_headers');if(!fs.existsSync(f))return[];const rules=[];let cur=null;
 for(const line of fs.readFileSync(f,'utf8').split(/\r?\n/)){if(!line.trim())continue;if(/^\S/.test(line)){cur={pat:line.trim(),h:{}};rules.push(cur)}else if(cur){const i=line.indexOf(':');cur.h[line.slice(0,i).trim()]=line.slice(i+1).trim()}}return rules};
const headersFor=(rules,urlPath)=>{const out={};for(const r of rules){const m=r.pat.endsWith('*')?urlPath.startsWith(r.pat.slice(0,-1)):r.pat===urlPath;if(m)Object.assign(out,r.h)}return out};
module.exports=function serve(port=0,mounts){
 mounts=mounts||{'/':path.join(__dirname,'..','dist')};const keys=Object.keys(mounts).sort((a,b)=>b.length-a.length);
 const srv=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);const m=keys.find(k=>p.startsWith(k));if(!m){res.writeHead(404);res.end('no');return}
  let rel=p.slice(m.length);if(rel===''||rel.endsWith('/'))rel+='index.html';const root=path.resolve(mounts[m]),f=path.join(root,rel);
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return}
  const rules=readHeaders(root),custom=Object.assign(headersFor(rules,'/'+rel),rel.endsWith('index.html')?headersFor(rules,'/'+rel.slice(0,-10)):{});res.writeHead(200,Object.assign({'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'no-cache'},custom));fs.createReadStream(f).pipe(res)});
 return new Promise(r=>srv.listen(port,'127.0.0.1',()=>r({srv,url:'http://127.0.0.1:'+srv.address().port+'/'})))};
