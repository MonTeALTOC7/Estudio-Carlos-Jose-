/* Compila la aplicación en una carpeta (por defecto dist/).
   PREVIEW=1 genera el canal «prueba»: almacenamiento, caché e instalación separados de producción.
   OUT=carpeta cambia el destino. BUILD_ID=texto fija el identificador (si no, se calcula del contenido). */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,preview=process.env.PREVIEW==='1',out=path.resolve(root,process.env.OUT||(preview?'dist-preview':'dist'));
fs.mkdirSync(out,{recursive:true});
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const SRC=[['CSS',['style.css']],['ENGINE',['engine.js']],['ACTIVITIES',['activities.js']],['CONTENT',['content.js','skills-a.js','skills-b.js','skills-c.js']],['PROGRESS',['progress.js','coach.js','curriculum.js']],['AUDIO',['audio.js']],['GAMES',['games.js']],['ADV',['adventures.js']],['COURSE',['course.js']],['SHELL',['shell.js']],['APP',['app.js']]];
const allSrc=['page.html','sw.js','manifest.webmanifest',...SRC.flatMap(x=>x[1])];
const IMGS=['hero.webp','avatar.webp'];/* Carlos José (ilustración y foto de avatar): recursos predeterminados, presentes en toda instalación limpia */
const imgHash=IMGS.map(f=>crypto.createHash('sha1').update(fs.readFileSync(path.join(root,'assets',f))).digest('hex')).join('');
const build=process.env.BUILD_ID||crypto.createHash('sha1').update(allSrc.map(read).join('\u0000')+imgHash+(preview?'P':'')).digest('hex').slice(0,8);
const info={channel:preview?'prueba':'producción',key:preview?'primerosPasos3-prueba':'primerosPasos3',version:'5.1.0',build,commit:(process.env.GITHUB_SHA||'').slice(0,7)};
if(preview)info.built=new Date().toISOString();
let html=read('page.html');
html=html.replace('/*APPINFO*/',()=>'window.APP='+JSON.stringify(info)+";window.CJ_ASSETS=window.CJ_ASSETS||{hero:'assets/hero.webp',face:'assets/avatar.webp'};");
for(const [tag,files] of SRC)html=html.replace('/*'+tag+'*/',()=>files.map(read).join('\n'));
if(preview)html=html.replace('<title>Centro de Estudios Carlos José</title>','<title>Carlos José · PRUEBA</title>').replace('content="#1f2a55"','content="#8a1c16"');
fs.writeFileSync(path.join(out,'index.html'),html);
fs.writeFileSync(path.join(out,'sw.js'),read('sw.js').replace("const BUILD='dev';","const BUILD='"+build+"';").replace("const PREFIX='mis-pasos-';",preview?"const PREFIX='cj-prueba-';":"const PREFIX='mis-pasos-';"));
let man=JSON.parse(read('manifest.webmanifest'));
if(preview){man.name='Centro Carlos José · PRUEBA';man.short_name='Carlos PRUEBA';man.theme_color='#8a1c16';man.description='Versión de prueba. No es la aplicación definitiva.'}
fs.writeFileSync(path.join(out,'manifest.webmanifest'),JSON.stringify(man));
for(const f of ['icon.svg','icon-192.png','icon-512.png'])fs.copyFileSync(path.join(root,preview&&f.endsWith('.png')?f.replace('icon-','icon-prueba-'):f),path.join(out,f));
/* Cloudflare Pages (y Netlify) leen _headers: el canal de prueba no se indexa y el service worker, el manifiesto y la página
   nunca se sirven desde una caché intermedia vieja. GitHub Pages ignora este archivo. Solo se escribe en el canal de prueba. */
if(preview)fs.writeFileSync(path.join(out,'_headers'),['/*','  X-Robots-Tag: noindex, nofollow','  Referrer-Policy: no-referrer','  X-Content-Type-Options: nosniff','/','  Cache-Control: no-cache','/index.html','  Cache-Control: no-cache','/sw.js','  Cache-Control: no-cache','/manifest.webmanifest','  Cache-Control: no-cache',''].join('\n'));
fs.mkdirSync(path.join(out,'assets'),{recursive:true});for(const f of IMGS)fs.copyFileSync(path.join(root,'assets',f),path.join(out,'assets',f));
console.log('App preparada en '+path.relative(root,out)+'/ ('+info.channel+', build '+build+')');
