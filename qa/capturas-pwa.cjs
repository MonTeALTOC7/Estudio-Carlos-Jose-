/* Capturas comparativas de la ventana modal de instalación (Android/Chrome e iOS) y de actualización en teléfono, tablet y escritorio,
   más el encabezado sin «Instalar». Salida: docs/capturas/pwa_*.png y las hojas comparativas pwa_comparativa_*.png.
   Chromium emulado: no son capturas de dispositivos físicos. Uso: node qa/capturas-pwa.cjs [--out=docs/capturas] */
const {chromium}=require('playwright');const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const serve=require('./serve.cjs');const {sleep}=require('./solver.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const OUT=path.resolve(arg('out',path.join(__dirname,'..','docs','capturas')));fs.mkdirSync(OUT,{recursive:true});
const DEV=[['telefono',390,844,true,'Teléfono 390×844'],['tablet',800,1260,true,'Tablet 800×1260'],['escritorio',1440,900,false,'Escritorio 1440×900']];
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const copyDir=(a,b)=>{fs.mkdirSync(b,{recursive:true});for(const e of fs.readdirSync(a,{withFileTypes:true})){const s=path.join(a,e.name),d=path.join(b,e.name);e.isDirectory()?copyDir(s,d):fs.copyFileSync(s,d)}};
const FAKE="(()=>{window.__prompts=0;const ev=new Event('beforeinstallprompt',{cancelable:true});ev.prompt=()=>{window.__prompts++;return Promise.resolve()};ev.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(ev)})()";
(async()=>{const b=await chromium.launch(),sv=await serve(),made={instalar:[],ios:[],actualizacion:[]};
 const dir=path.join(os.tmpdir(),'cj-cappwa-'+Date.now());copyDir(path.join(__dirname,'..','dist'),dir);const sv2=await serve(0,{'/':dir});
 for(const [id,w,h,mobile,label] of DEV){
  /* instalación (Android/Chrome) */
  {const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'}),p=await ctx.newPage();await p.goto(sv.url);await p.waitForSelector('.hero5');
   if(id==='telefono')await p.screenshot({path:path.join(OUT,'pwa_encabezado_sin_instalar.png'),clip:{x:0,y:0,width:w,height:170}});
   await p.evaluate(FAKE);await p.waitForSelector('#pwaModal[open]');await sleep(500);const f=path.join(OUT,'pwa_instalar_'+id+'.png');await p.screenshot({path:f});made.instalar.push([label,f]);await ctx.close()}
  /* instalación (iPhone/iPad Safari) */
  {const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:mobile,isMobile:mobile,userAgent:IOS,serviceWorkers:'block'}),p=await ctx.newPage();await p.goto(sv.url);await p.waitForSelector('#pwaModal[open]');await sleep(500);const f=path.join(OUT,'pwa_ios_'+id+'.png');await p.screenshot({path:f});made.ios.push([label,f]);await ctx.close()}
  /* actualización (service worker real) */
  {const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:mobile,isMobile:mobile,serviceWorkers:'allow'}),p=await ctx.newPage();await p.goto(sv2.url);await p.waitForFunction(()=>window.appOfflineReady===true);await p.reload();await p.waitForSelector('.hero5');await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
   const cur=await p.evaluate(()=>window.APP.build),ix=path.join(dir,'index.html'),sw=path.join(dir,'sw.js');
   const prevI=fs.readFileSync(ix,'utf8'),prevS=fs.readFileSync(sw,'utf8'),nb='nuevo'+id.slice(0,3);
   fs.writeFileSync(ix,prevI.replace('"build":"'+cur+'"','"build":"'+nb+'"'));fs.writeFileSync(sw,prevS.replace("const BUILD='"+cur+"';","const BUILD='"+nb+"';"));
   await p.evaluate(()=>window.appReg.update());await p.waitForSelector('#pwaModal[open] #updgo',{timeout:15000});await sleep(500);const f=path.join(OUT,'pwa_actualizacion_'+id+'.png');await p.screenshot({path:f});made.actualizacion.push([label,f]);
   fs.writeFileSync(ix,prevI);fs.writeFileSync(sw,prevS);await ctx.close()}}
 /* hojas comparativas: tres dispositivos lado a lado */
 const pg=await b.newPage({viewport:{width:1700,height:1000}});
 for(const [k,list] of Object.entries(made)){const title={instalar:'Instalación (Android / Chrome)',ios:'Instalación (iPhone / iPad · Safari)',actualizacion:'Actualización'}[k];
  const h='<body style="margin:0;background:#e9e6dc;font:600 16px system-ui"><h2 style="margin:12px 18px">'+title+' · Chromium emulado</h2><div style="display:flex;gap:18px;align-items:flex-start;padding:0 18px 18px">'+list.map(([l,f])=>'<figure style="margin:0;text-align:center"><img style="height:820px;max-width:520px;object-fit:contain;border:1px solid #999;background:#fff" src="data:image/png;base64,'+fs.readFileSync(f).toString('base64')+'"><figcaption>'+l+'</figcaption></figure>').join('')+'</div></body>';
  await pg.setContent(h);await pg.screenshot({path:path.join(OUT,'pwa_comparativa_'+k+'.png'),fullPage:true})}
 await b.close();sv.srv.close();sv2.srv.close();console.log('listo')})().catch(e=>{console.error(e);process.exit(1)});
