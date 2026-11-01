// Servidor estático mínimo para probar la aplicación en un navegador (solo desarrollo y CI).
// serve()                         → sirve dist/ en la raíz
// serve(0,{'/prod/':dir1,'/prueba/':dir2}) → varias carpetas bajo un mismo origen (como GitHub Pages)
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
module.exports=function serve(port=0,mounts){
 mounts=mounts||{'/':path.join(__dirname,'..','dist')};const keys=Object.keys(mounts).sort((a,b)=>b.length-a.length);
 const srv=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);const m=keys.find(k=>p.startsWith(k));if(!m){res.writeHead(404);res.end('no');return}
  let rel=p.slice(m.length);if(rel===''||rel.endsWith('/'))rel+='index.html';const root=path.resolve(mounts[m]),f=path.join(root,rel);
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return}
  res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'no-cache'});fs.createReadStream(f).pipe(res)});
 return new Promise(r=>srv.listen(port,'127.0.0.1',()=>r({srv,url:'http://127.0.0.1:'+srv.address().port+'/'})))};
