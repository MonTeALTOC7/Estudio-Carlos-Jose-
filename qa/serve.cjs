// Servidor estático mínimo para probar dist/ en un navegador (solo desarrollo).
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
module.exports=function serve(port=0){const root=path.join(__dirname,'..','dist');
 const srv=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)){res.writeHead(404);res.end('no');return}res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)});
 return new Promise(r=>srv.listen(port,'127.0.0.1',()=>r({srv,url:'http://127.0.0.1:'+srv.address().port+'/'})))};
