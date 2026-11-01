/* Comprueba que la configuración de Cloudflare Pages propuesta funciona con el código vigente, SIMULÁNDOLA en local:
   1) copia los archivos versionados a una carpeta limpia (como el clon de Cloudflare) y ejecuta EXACTAMENTE el comando de compilación
      `PREVIEW=1 OUT=dist node build.cjs`; 2) sirve `dist` en la RAÍZ de un dominio (https://proyecto.pages.dev/, no en /repo/) con las
      cabeceras de `_headers`; 3) verifica carga, canal de prueba, manifiesto, instalabilidad, service worker, persistencia, sin conexión y actualización.
   No sustituye la prueba real en la URL desplegada (HTTPS verdadero, Cloudflare delante, teléfono físico): ver docs/PREVIEW_HTTPS.md.
   Uso: node qa/cloudflare-check.cjs   (requiere playwright de qa/) */
const {chromium}=require('playwright');const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),os=require('node:os');
const serve=require('./serve.cjs');const {solve}=require('./solver.cjs');
const ROOT=path.join(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cf-')),clone=path.join(tmp,'repo');
let failures=0;const rec=(n,ok,d)=>{if(!ok)failures++;console.log((ok?'OK    ':'FALLA ')+n+(d?' · '+d:''))};
async function g(n,fn){try{const r=await fn();rec(n,r===true,r===true?'':String(r))}catch(e){rec(n,false,e.message.split('\n')[0])}}
(async()=>{
 /* 1 ─ clon limpio: solo archivos versionados (+ cambios locales ya añadidos al índice o modificados) */
 const files=cp.execSync('git ls-files -z',{cwd:ROOT}).toString().split('\0').filter(Boolean);
 for(const f of files){const src=path.join(ROOT,f);if(!fs.existsSync(src))continue;fs.mkdirSync(path.dirname(path.join(clone,f)),{recursive:true});fs.copyFileSync(src,path.join(clone,f))}
 const env=Object.assign({},process.env,{PREVIEW:'1',OUT:'dist'});delete env.GITHUB_SHA;delete env.BUILD_ID;
 let log='';await g('Compila con «PREVIEW=1 OUT=dist node build.cjs» en un clon limpio',async()=>{log=cp.execSync('node build.cjs',{cwd:clone,env}).toString();return /prueba/.test(log)||log});
 const dist=path.join(clone,'dist');
 await g('dist contiene index.html, sw.js, manifest, iconos y _headers',async()=>{const need=['index.html','sw.js','manifest.webmanifest','icon-192.png','icon-512.png','icon.svg','_headers'];const miss=need.filter(f=>!fs.existsSync(path.join(dist,f)));return miss.length===0||'faltan '+miss.join()});
 await g('No hay referencias absolutas que fallen en la raíz ni en subrutas (rutas relativas)',async()=>{const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');const sw=fs.readFileSync(path.join(dist,'sw.js'),'utf8');const man=JSON.parse(fs.readFileSync(path.join(dist,'manifest.webmanifest'),'utf8'));
  if(man.start_url!=='./'||man.scope!=='./')return 'start_url/scope no relativos';if(/\.register\('\//.test(html))return 'sw con ruta absoluta';if(/'\/(index|sw|manifest|icon)/.test(sw))return 'sw con rutas absolutas';return true});
 const {srv,url}=await serve(0,{'/':dist});const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'allow'}),p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await g('Cabeceras de Cloudflare (_headers): noindex y sin caché en página, sw y manifiesto',async()=>{const out=[];for(const u of ['','sw.js','manifest.webmanifest']){const r=await fetch(url+u);const h=r.headers;if(!/noindex/.test(h.get('x-robots-tag')||''))out.push(u+': sin noindex');if(!/no-cache/.test(h.get('cache-control')||''))out.push(u+': caché')}return out.length===0||out.join('; ')});
 await p.goto(url);await p.waitForSelector('.hero5');
 await g('Carga en la raíz del dominio y se identifica como PRUEBA',async()=>{const i=await p.evaluate(()=>({t:document.title,c:window.APP.channel,k:window.APP.key,r:!!document.querySelector('#ribbon')}));return i.c==='prueba'&&i.k==='primerosPasos3-prueba'&&i.r&&/PRUEBA/.test(i.t)||JSON.stringify(i)});
 await g('Manifiesto de prueba (nombre propio, iconos de prueba, start_url relativo)',async()=>{const m=await p.evaluate(async()=>(await fetch('manifest.webmanifest')).json());return /PRUEBA/.test(m.name)&&m.display==='standalone'&&m.icons.length>=2||JSON.stringify(m)});
 await g('Service worker registrado en / y toma el control',async()=>{await p.waitForFunction(()=>window.appOfflineReady===true,null,{timeout:15000});await p.reload();await p.waitForSelector('.hero5');await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:10000});const sc=await p.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).map(r=>new URL(r.scope).pathname));return sc.length===1&&sc[0]==='/'||'alcances '+sc.join()});
 await g('Chromium considera la PWA de prueba instalable',async()=>{const c=await ctx.newCDPSession(p);const r=await c.send('Page.getInstallabilityErrors');await c.detach();return r.installabilityErrors.length===0||'errores: '+r.installabilityErrors.map(e=>e.errorId).join()});
 await g('Solo existen cachés y claves del canal de prueba',async()=>{const k=await p.evaluate(async()=>({c:await caches.keys(),ls:Object.keys(localStorage)}));return k.c.length===1&&k.c[0].startsWith('cj-prueba-')&&!k.ls.includes('primerosPasos3')||JSON.stringify(k)});
 await g('Persistencia: el avance sobrevive a recargar y a cerrar/abrir la pestaña',async()=>{await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3-prueba'));s.name='Verifica';localStorage.setItem('primerosPasos3-prueba',JSON.stringify(s))});await p.reload();await p.waitForSelector('.hero5');
  const p2=await ctx.newPage();await p2.goto(url);await p2.waitForSelector('.hero5');const n=await p2.evaluate(()=>JSON.parse(localStorage.getItem('primerosPasos3-prueba')).name);await p2.close();return n==='Verifica'||'nombre '+n});
 await g('Sin conexión: abre, se navega y se juega con la copia local',async()=>{await ctx.setOffline(true);await p.reload();await p.waitForSelector('.hero5',{timeout:10000});
  await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');await p.click('[data-skill="contar"]');await p.waitForSelector('.gcards');await p.click('#gnext');for(;;){await p.waitForSelector('.gexplain');const l=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(l)break}
  await p.waitForSelector('#gprompt');await solve(p,await p.evaluate(()=>window.__gq),false);await p.waitForSelector('#gnext:not([hidden])');const off=await p.evaluate(()=>navigator.onLine);await ctx.setOffline(false);return off===false||'no estaba sin conexión'});
 await g('Actualización: una versión nueva muestra el aviso y reemplaza solo la caché de prueba',async()=>{const before=await p.evaluate(()=>window.APP.build);
  let h=fs.readFileSync(path.join(dist,'index.html'),'utf8').replace('"build":"'+before+'"','"build":"cf000001"');fs.writeFileSync(path.join(dist,'index.html'),h);
  fs.writeFileSync(path.join(dist,'sw.js'),fs.readFileSync(path.join(dist,'sw.js'),'utf8').replace("const BUILD='"+before+"';","const BUILD='cf000001';"));
  await p.reload();await p.waitForSelector('.hero5');await p.evaluate(()=>window.appReg.update());await p.waitForSelector('#updbar:not([hidden])',{timeout:15000});await p.click('#updgo');await p.waitForSelector('.hero5');
  const r=await p.evaluate(async()=>({b:window.APP.build,k:await caches.keys(),n:JSON.parse(localStorage.getItem('primerosPasos3-prueba')).name}));return r.b==='cf000001'&&r.k.length===1&&r.k[0].endsWith('cf000001')&&r.n==='Verifica'||JSON.stringify(r)});
 rec('Sin errores de consola ni de página',errs.length===0,errs[0]||'');
 await b.close();srv.close();console.log('\nFallas: '+failures);process.exit(failures?1:0)})().catch(e=>{console.log('ERROR',e.message);process.exit(2)});
