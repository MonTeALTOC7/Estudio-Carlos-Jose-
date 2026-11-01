/* Validación automatizada de las funciones visuales críticas (Playwright + Chromium).
   Uso (después de `node build.cjs`):  node qa/ci-visual.cjs [--out=qa-out]
   Qué cubre: diseño sin desbordes en 4 anchos, barras fijas que no tapan contenido, arrastre con eventos TÁCTILES reales (CDP),
   persistencia, respaldo y restauración, manifiesto e iconos, service worker, uso sin conexión, actualización,
   instalabilidad según Chromium, independencia entre el canal de prueba y producción (mismo origen), movimiento reducido.
   Qué NO cubre (requiere un teléfono físico): ver docs/VALIDACION.md. */
const {chromium}=require('playwright');const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),os=require('node:os');
const serve=require('./serve.cjs');const {layout,solve,sleep}=require('./solver.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const OUT=path.resolve(arg('out','qa-out'));fs.mkdirSync(OUT,{recursive:true});
const ROOT=path.join(__dirname,'..'),DIST=path.join(ROOT,'dist');
const results=[];let failures=0;
const rec=(grupo,nombre,okk,detalle)=>{results.push({grupo,nombre,ok:!!okk,detalle:detalle||''});if(!okk)failures++;console.log((okk?'OK    ':'FALLA ')+'['+grupo+'] '+nombre+(detalle?' · '+detalle:''))};
async function guard(grupo,nombre,fn){try{const r=await fn();if(r!==undefined)rec(grupo,nombre,r===true,r===true?'':String(r))}catch(e){rec(grupo,nombre,false,e.message.split('\n')[0])}}
const copyDir=(a,b)=>fs.cpSync(a,b,{recursive:true});
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cj-'));

/* ---- toque real: CDP genera eventos táctiles que Chromium convierte en pointer events con pointerType=touch ---- */
async function touchDrag(p,a,b,steps){steps=steps||10;const c=await p.context().newCDPSession(p),tp=(x,y)=>[{x,y,id:1}];
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp(a.x,a.y)});
 for(let i=1;i<=steps;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:tp(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps)});await sleep(14)}
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach()}
/* Centros de dos elementos con la página ya desplazada de modo que ambos estén a la vista (un arrastre real no puede salir de la pantalla). */
async function both(p,selA,selB,innerB){const get=async()=>{const ba=await p.locator(selA).first().boundingBox(),bb=await (innerB?p.locator(selB+' > *').first():p.locator(selB).first()).boundingBox();return{ba,bb}};
 let {ba,bb}=await get();const H=p.viewportSize().height,mid=(ba.y+ba.height/2+bb.y+bb.height/2)/2;await p.evaluate(d=>window.scrollBy(0,d),Math.round(mid-H/2));await p.waitForTimeout(120);({ba,bb}=await get());
 if(ba.y<0||bb.y<0||ba.y+ba.height>H||bb.y+bb.height>H)throw new Error('origen y destino no caben juntos en pantalla');
 return{a:{x:ba.x+ba.width/2,y:ba.y+ba.height/2},b:{x:bb.x+bb.width/2,y:bb.y+bb.height/2}}}
const center=async(p,sel,inner)=>{const l=p.locator(sel).first();await l.evaluate(e=>e.scrollIntoView({block:'center'}));const b=await (inner?p.locator(sel+' > *').first():l).boundingBox();return{x:b.x+b.width/2,y:b.y+b.height/2}};
const newPage=async(b,w,h,extra)=>{const ctx=await b.newContext(Object.assign({viewport:{width:w,height:h},hasTouch:true,isMobile:w<700,deviceScaleFactor:1},extra||{}));const p=await ctx.newPage();p.setDefaultTimeout(10000);p._errs=[];p.on('pageerror',e=>p._errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')p._errs.push('CONSOLE '+m.text())});return p};
const state=(p,key)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key||'primerosPasos3');
const setState=(p,o,key)=>p.evaluate(([k,s])=>localStorage.setItem(k,JSON.stringify(s)),[key||'primerosPasos3',o]);
async function openSkill(p,mod,id){await p.click('[data-tab="aprender"]');await p.click('[data-mod="'+mod+'"]');await p.click('[data-skill="'+id+'"]');await p.waitForSelector('.gcards');await p.click('#gnext');for(;;){await p.waitForSelector('.gexplain');const last=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(last)break}}
async function advanceUntil(p,type){for(let i=0;i<12;i++){await p.waitForSelector('#gprompt');const q=await p.evaluate(()=>window.__gq);if(q.type===type)return q;await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext')}throw new Error('no apareció una pregunta '+type)}

(async()=>{
 const b=await chromium.launch();
 const {srv,url}=await serve();

 /* 1 ─ DISEÑO en 4 anchos */
 for(const [w,h] of [[320,640],[390,844],[768,1024],[1440,900]]){
  await guard('diseño','Pantallas principales y panel adulto a '+w+' px',async()=>{
   const p=await newPage(b,w,h);await p.goto(url);await p.waitForSelector('.hero5');const shot=n=>p.screenshot({path:path.join(OUT,'diseno-'+w+'-'+n+'.png'),fullPage:false});
   await layout(p,'hoy');await shot('hoy');
   if(w<900){await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));const gap=await p.evaluate(()=>{const f=document.querySelector('footer').getBoundingClientRect(),t=document.querySelector('.tabbar').getBoundingClientRect();return Math.round(t.top-f.bottom)});if(gap<-1)throw new Error('la barra inferior tapa el pie ('+gap+'px)');await p.evaluate(()=>window.scrollTo(0,0))}
   for(const tab of ['aprender','jugar','logros']){await p.click('[data-tab="'+tab+'"]');await p.waitForTimeout(150);await layout(p,tab);await shot(tab)}
   await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');await p.waitForSelector('.gskill');await layout(p,'ruta');await shot('ruta');
   await p.click('[data-skill="contar"]');await p.waitForSelector('.gcards');await layout(p,'aprendo');
   const nav=await p.evaluate(()=>{const n=document.querySelector('.modulebar').getBoundingClientRect(),t=document.querySelector('.topline').getBoundingClientRect();return{navVisible:getComputedStyle(document.querySelector('.modulebar')).display!=='none',nav:n.bottom,topline:t.top,tab:getComputedStyle(document.querySelector('.tabbar')).display}});
   if(!nav.navVisible||nav.tab!=='none')throw new Error('en actividad debe verse la barra de módulos y ocultarse la inferior');
   if(nav.topline<nav.nav-1)throw new Error('la barra superior tapa el título de la actividad');
   await p.click('#directHome');await p.waitForSelector('.hero5');
   await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');
   for(const t of ['resumen','progreso','casa','ajustes']){await p.click('[data-atab="'+t+'"]');await p.waitForTimeout(120);const ov=await p.evaluate(()=>{const d=document.querySelector('#dialog');return d.scrollWidth-d.clientWidth});if(ov>1)throw new Error('desborde horizontal en el panel ('+t+') '+ov+'px')}
   await shot('adulto-ajustes');
   const small=await p.evaluate(()=>[...document.querySelectorAll('.tabbar button,.primary,.tcard,.gopt,.tile')].filter(e=>e.offsetParent&&(e.getBoundingClientRect().height<44||e.getBoundingClientRect().width<44)).length);
   if(p._errs.length)throw new Error(p._errs[0]);return small===0?true:'hay '+small+' botones de menos de 44 px';});
 }

 /* 2 ─ ARRASTRE CON EVENTOS TÁCTILES REALES */
 {const p=await newPage(b,390,844);await p.goto(url);await p.waitForSelector('.hero5');
  await guard('táctil','Clasificar arrastrando con el dedo (sort)',async()=>{await openSkill(p,'clasificar','clasif-color');const q=await advanceUntil(p,'sort');
   for(const it of q.items){const {a,b:bb}=await both(p,'.gitem[data-id="'+it.id+'"]','.gbin[data-bin="'+it.bin+'"]');await touchDrag(p,a,bb);await sleep(120)}
   await p.waitForSelector('#gnext:not([hidden])',{timeout:4000});return true});
  await p.click('#directHome');
  await guard('táctil','Unir parejas arrastrando con el dedo (match)',async()=>{await openSkill(p,'lenguaje','rimas');const q=await advanceUntil(p,'match');
   for(const pr of q.pairs){const {a,b:bb}=await both(p,'.gm[data-side="l"][data-id="'+pr.id+'"]','.gm[data-side="r"][data-id="'+pr.id+'"]');await touchDrag(p,a,bb);await sleep(120)}
   await p.waitForSelector('#gnext:not([hidden])',{timeout:4000});return true});
  await p.click('#directHome');
  await guard('táctil','Aventura: arrastrar la curita a la parte del cuerpo',async()=>{await p.click('[data-tab="jugar"]');await p.click('.advgrid [data-adv="consultorio"]');await p.click('#astart');await p.waitForSelector('#bandage');const ch=await p.evaluate(()=>window.__gch);
   for(const r of ch.parts){const {a,b:bb}=await both(p,'#bandage','.teddy .rg[data-r="'+r+'"]',true);await touchDrag(p,a,bb);await sleep(150)}
   await p.waitForSelector('#gnext:not([hidden])',{timeout:4000});return true});
  await p.click('#directHome');
  for(const [fg,rv] of [['casa',0.01],['cohete',0.45],['robot',0.9]]){
  await guard('táctil','Aventura: arrastrar las piezas del rompecabezas ('+fg+')',async()=>{await p.click('[data-tab="jugar"]');await p.click('.advgrid [data-adv="laboratorio"]');await p.evaluate(v=>{window.__rnd=Math.random;Math.random=()=>v},rv);await p.click('#astart');await p.waitForSelector('.pot');await p.evaluate(()=>{Math.random=window.__rnd});
   const R={naranja:['rojo','amarillo'],verde:['azul','amarillo'],morado:['rojo','azul']},ch=await p.evaluate(()=>window.__gch);for(const t of ch.targets){for(const c of R[t])await p.click('.pot[data-c="'+c+'"]');await p.click('#mmix')}
   await p.click('#gnext');await p.waitForSelector('.piece');let guardN=0;
   while(await p.locator('.piece').count()&&guardN++<20){const before=await p.locator('.piece').count(),idx=await p.$$eval('.pslot',els=>els.map(e=>e.dataset.i));
    for(const j of idx){const {a,b:b0}=await both(p,'.piece','.pslot[data-i="'+j+'"]',true);
     /* En figuras con huecos que se solapan (p. ej. la puerta dentro de la casa) el centro geométrico puede caer sobre otro hueco: se busca un punto que de verdad pertenezca a este hueco, como haría un niño al soltar sobre su parte visible. */
     const bb=await p.evaluate(([j,c])=>{const g=document.querySelector('.pslot[data-i="'+j+'"]'),r=g.getBoundingClientRect();let best=null,bd=1e9;for(let y=r.top+2;y<r.bottom-2;y+=2)for(let x=r.left+2;x<r.right-2;x+=2){const e=document.elementFromPoint(x,y),h=e&&e.closest&&e.closest('.pslot');if(h&&h.dataset.i===j){const d=(x-c.x)**2+(y-c.y)**2;if(d<bd){bd=d;best={x,y}}}}return best},[j,b0]);
     if(!bb)continue;await touchDrag(p,a,bb);await sleep(120);if(await p.locator('.piece').count()<before)break}}
   await p.waitForSelector('#gnext:not([hidden])',{timeout:4000});return true});
  await p.click('#directHome');}
  await guard('táctil','Diagnóstico: la prueba de arrastre registra un dedo',async()=>{await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#dgball');
   await p.waitForFunction(()=>[...document.images].every(i=>i.complete)&&!/Comprobando/.test((document.querySelector('#dgtable')||{}).textContent||'Comprobando'));await p.locator('#dgball').evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(150);const mb=async sel=>{const r=await p.locator(sel).boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2}};const a=await mb('#dgball'),bb=await mb('#dgbox');await touchDrag(p,a,bb);await p.waitForFunction(()=>/dedo|ratón|Suelta/.test((document.querySelector('#dgres')||{}).textContent||''),null,{timeout:3000}).catch(()=>{});const t=await p.textContent('#dgres');return /dedo/.test(t)?true:t});
  rec('táctil','Sin errores de consola durante los arrastres',p._errs.length===0,p._errs[0]||'');await p.context().close()}

 /* 3 ─ PERSISTENCIA, REANUDAR, RESPALDO */
 {const p=await newPage(b,390,844);await p.goto(url);await p.waitForSelector('.hero5');
  await guard('persistencia','El avance y la actividad interrumpida sobreviven a cerrar y abrir',async()=>{await openSkill(p,'cantidad','contar');await p.waitForSelector('#gprompt');await p.click('#directHome');
   await p.reload();await p.waitForSelector('.hero5');if(!(await p.locator('#freeres').count()))throw new Error('no ofrece retomar el juego libre');await p.click('#freeres');await p.waitForSelector('#gprompt');return /Practico/.test(await p.textContent('.phases li.on span'))||'no volvió a Practico'});
  await guard('persistencia','Una sesión completada queda guardada con historial y pruebas',async()=>{await p.click('#directHome');
   for(let i=0;i<8;i++){await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');break}
   await p.click('[data-skill="contar"]');await p.waitForSelector('.gcards');await p.click('#gnext');for(;;){await p.waitForSelector('.gexplain');const l=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(l)break}
   for(let n=0;n<20;n++){await p.waitForSelector('#gprompt');const q=await p.evaluate(()=>window.__gq);await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext');if(await p.locator('#gagain').count())break}
   await sleep(300);if(await p.locator('#celebrate.on').count())await p.click('#celok');await p.reload();await p.waitForSelector('.hero5');
   const s=await state(p);const r=s&&s.games&&s.games.skills&&s.games.skills.contar;return !!(r&&r.hist&&r.hist.length===1&&r.proof&&r.proof.days.length===1&&s.badges&&s.badges['primer-paso'])||'registro incompleto'});
  await guard('persistencia','Respaldo descargable y restauración',async()=>{await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#bkExp');
   const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bkExp')]);const data=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));if(data.estado.version!==3||!data.estado.games)throw new Error('respaldo incompleto');
   const s=await state(p);s.games={skills:{},mixed:null};s.badges={};await setState(p,s);p.once('dialog',d=>d.accept());await p.setInputFiles('#bkImp',{name:'r.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await sleep(500);
   const back=await state(p);return (back.games.skills.contar&&back.games.skills.contar.proof&&!!back.badges['primer-paso'])||'la restauración no recuperó el avance'});
  rec('persistencia','Sin errores de consola',p._errs.length===0,p._errs[0]||'');await p.context().close()}

 /* 4 ─ MOVIMIENTO REDUCIDO */
 {const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true,isMobile:true}),p=await ctx.newPage();await p.goto(url);await p.waitForSelector('.hero5');
  rec('accesibilidad','«Reducir movimiento» del sistema desactiva animaciones y confeti',await p.evaluate(()=>document.body.classList.contains('reduce-motion')));
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3'));s.settings={anim:'on'};localStorage.setItem('primerosPasos3',JSON.stringify(s))});await p.reload();await p.waitForSelector('.hero5');
  rec('accesibilidad','El adulto puede forzar las animaciones («Siempre»)',!(await p.evaluate(()=>document.body.classList.contains('reduce-motion'))));
  rec('accesibilidad','Los botones principales tienen nombre accesible',await p.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.offsetParent&&!(e.textContent.trim()||e.getAttribute('aria-label'))).length)===0);
  await ctx.close()}

 /* 5 ─ PWA: manifiesto, iconos, service worker, sin conexión, actualización, instalabilidad */
 await guard('PWA','Manifiesto e iconos válidos',async()=>{const m=JSON.parse(fs.readFileSync(path.join(DIST,'manifest.webmanifest'),'utf8'));
  for(const k of ['name','short_name','start_url','scope','display','icons','theme_color','background_color'])if(!m[k])throw new Error('falta '+k);if(m.display!=='standalone')throw new Error('display');
  for(const sz of [192,512]){const ic=m.icons.find(i=>i.sizes===sz+'x'+sz&&i.type==='image/png');if(!ic)throw new Error('falta icono '+sz);const buf=fs.readFileSync(path.join(DIST,ic.src));if(buf.readUInt32BE(16)!==sz||buf.readUInt32BE(20)!==sz)throw new Error('dimensiones del icono '+sz);if(!m.icons.some(i=>i.sizes===sz+'x'+sz&&i.purpose==='maskable'))throw new Error('falta icono maskable '+sz)}return true});
 {const dirA=path.join(tmp,'A');copyDir(DIST,dirA);const s2=await serve(0,{'/':dirA});
  const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'allow'}),p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto(s2.url);await p.waitForSelector('.hero5');
  await guard('PWA','El service worker se registra y toma el control',async()=>{await p.waitForFunction(()=>window.appOfflineReady===true,null,{timeout:15000});await p.reload();await p.waitForSelector('.hero5');await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:10000});return true});
  await guard('PWA','Chromium considera la aplicación instalable',async()=>{const c=await ctx.newCDPSession(p);const r=await c.send('Page.getInstallabilityErrors');await c.detach();return r.installabilityErrors.length===0?true:'errores: '+r.installabilityErrors.map(e=>e.errorId).join(', ')});
  await guard('PWA','Copia sin conexión guardada en caché',async()=>{const k=await p.evaluate(async()=>{const ks=(await caches.keys()).filter(k=>k.startsWith('mis-pasos-'));const c=await caches.open(ks[0]);return{ks,idx:!!(await c.match('./index.html')),man:!!(await c.match('./manifest.webmanifest'))}});if(!(k.ks.length===1&&k.idx&&k.man))return JSON.stringify(k);const miss=await p.evaluate(async()=>{const m=await (await fetch('manifest.webmanifest')).json(),ks=(await caches.keys()).filter(k=>k.startsWith('mis-pasos-')),c=await caches.open(ks[0]),out=[];for(const f of [...m.icons.map(i=>i.src),'apple-touch-icon.png','favicon-48.png','logo-128.png','assets/hero.webp','assets/avatar.webp'])if(!(await c.match('./'+f)))out.push(f);return out});return miss.length===0||'sin conexión faltan: '+miss.join()});
  await guard('PWA','Funciona SIN CONEXIÓN: abre, navega y se puede jugar',async()=>{await ctx.setOffline(true);await p.reload();await p.waitForSelector('.hero5',{timeout:10000});
   await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');await p.click('[data-skill="contar"]');await p.waitForSelector('.gcards');await p.click('#gnext');for(;;){await p.waitForSelector('.gexplain');const l=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(l)break}
   await p.waitForSelector('#gprompt');const q=await p.evaluate(()=>window.__gq);await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');const off=await p.evaluate(()=>navigator.onLine);await ctx.setOffline(false);return off===false?true:'el navegador no estaba sin conexión'});
  await guard('PWA','El progreso guardado sin conexión sigue al volver a la red',async()=>{await p.reload();await p.waitForSelector('.hero5');const s=await state(p);return !!(s&&s.resume)||'se perdió la actividad en curso'});
  await guard('PWA','ACTUALIZACIÓN: al publicar una versión nueva aparece el aviso y se actualiza',async()=>{
   const before=await p.evaluate(()=>window.APP.build);
   let html=fs.readFileSync(path.join(dirA,'index.html'),'utf8').replace('"build":"'+before+'"','"build":"zzzz9999"');fs.writeFileSync(path.join(dirA,'index.html'),html);
   let sw=fs.readFileSync(path.join(dirA,'sw.js'),'utf8').replace("const BUILD='"+before+"';","const BUILD='zzzz9999';");fs.writeFileSync(path.join(dirA,'sw.js'),sw);
   await p.evaluate(()=>window.appReg.update());await p.waitForSelector('#updbar:not([hidden])',{timeout:15000});await p.click('#updgo');await p.waitForSelector('.hero5');
   const after=await p.evaluate(()=>window.APP.build),ks=await p.evaluate(async()=>(await caches.keys()));return after==='zzzz9999'&&ks.length===1&&ks[0].endsWith('zzzz9999')?true:'build '+after+' cachés '+ks.join()});
  rec('PWA','Sin errores de consola en el ciclo de PWA',errs.length===0,errs[0]||'');await ctx.close();s2.srv.close()}

 /* 6 ─ CANAL DE PRUEBA independiente de producción (mismo origen, distinta ruta, como GitHub Pages) */
 {const dProd=path.join(tmp,'prod'),dPrev=path.join(tmp,'prev');copyDir(DIST,dProd);cp.execSync('node build.cjs',{cwd:ROOT,env:Object.assign({},process.env,{PREVIEW:'1',OUT:dPrev}),stdio:'pipe'});
  const s3=await serve(0,{'/Estudio-Carlos-Jose-/':dProd,'/Estudio-Carlos-Jose-preview/':dPrev});const base=s3.url,ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'allow'}),p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await guard('independencia','Producción y prueba conviven en el mismo origen sin mezclar nada',async()=>{
   await p.goto(base+'Estudio-Carlos-Jose-/');await p.waitForSelector('.hero5');await p.waitForFunction(()=>window.appOfflineReady===true,null,{timeout:15000});
   await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3'));s.name='Producción-intacta';s.sessions=77;localStorage.setItem('primerosPasos3',JSON.stringify(s))});
   await p.goto(base+'Estudio-Carlos-Jose-preview/');await p.waitForSelector('.hero5');await p.waitForFunction(()=>window.appOfflineReady===true,null,{timeout:15000});
   const ch=await p.evaluate(()=>({channel:window.APP.channel,key:window.APP.key,ribbon:!!document.querySelector('#ribbon'),name:JSON.parse(localStorage.getItem('primerosPasos3-prueba')||'null')&&JSON.parse(localStorage.getItem('primerosPasos3-prueba')).name}));
   if(ch.channel!=='prueba'||ch.key!=='primerosPasos3-prueba'||!ch.ribbon)throw new Error('canal de prueba mal identificado '+JSON.stringify(ch));
   if(ch.name!=='Carlos José')throw new Error('la prueba heredó datos de producción: '+ch.name);
   const man=await p.evaluate(async()=>(await (await fetch('manifest.webmanifest')).json()).name);if(!/PRUEBA/.test(man))throw new Error('manifiesto de prueba sin identificar: '+man);
   await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3-prueba'));s.name='Solo-prueba';localStorage.setItem('primerosPasos3-prueba',JSON.stringify(s))});
   const caches1=await p.evaluate(async()=>(await caches.keys()));if(!caches1.some(k=>k.startsWith('cj-prueba-'))||!caches1.some(k=>k.startsWith('mis-pasos-')))throw new Error('cachés: '+caches1.join());
   await p.goto(base+'Estudio-Carlos-Jose-/');await p.waitForSelector('.hero5');
   const prod=await p.evaluate(()=>({n:JSON.parse(localStorage.getItem('primerosPasos3')).name,s:JSON.parse(localStorage.getItem('primerosPasos3')).sessions,ch:window.APP.channel,ribbon:!!document.querySelector('#ribbon')}));
   if(prod.n!=='Producción-intacta'||prod.s!==77||prod.ch!=='producción'||prod.ribbon)throw new Error('producción alterada: '+JSON.stringify(prod));
   const caches2=await p.evaluate(async()=>(await caches.keys()));if(!caches2.some(k=>k.startsWith('mis-pasos-')))throw new Error('el service worker de prueba borró la caché de producción');
   const scopes=await p.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).map(r=>new URL(r.scope).pathname).sort());if(scopes.length!==2||scopes[0]===scopes[1])throw new Error('alcances: '+scopes.join());return true});
  rec('independencia','Sin errores de página',errs.length===0,errs[0]||'');await ctx.close();s3.srv.close()}

 /* 7 ─ CARLOS JOSÉ PREDETERMINADO: instalación limpia, sin cargar nada desde Ajustes, y también sin conexión */
 {const dirI=path.join(tmp,'I');copyDir(DIST,dirI);const s7=await serve(0,{'/':dirI});
  const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'allow'}),p=await ctx.newPage();await p.goto(s7.url);await p.waitForSelector('.hero5');
  const imgs=()=>p.evaluate(()=>[...document.images].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0,w:i.naturalWidth,vis:i.offsetParent!==null&&i.getBoundingClientRect().width>20})));
  await guard('Carlos José','Instalación limpia: la portada muestra a Carlos José (ilustración) sin cargar nada',async()=>{await p.waitForFunction(()=>[...document.images].every(i=>i.complete));const im=await imgs();const hero=im.find(i=>/assets\/hero\.webp$/.test(i.src));return !!(hero&&hero.ok&&hero.vis&&hero.w>500)||JSON.stringify(im)});
  await guard('Carlos José','No aparece el personaje genérico dibujado en la portada',async()=>await p.locator('.hero5 .avsvg').count()===0||'sigue el dibujo genérico');
  await guard('Carlos José','Ajustes: la foto de avatar de Carlos José aparece por defecto',async()=>{await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#fClear');await p.waitForFunction(()=>[...document.images].every(i=>i.complete));const im=await imgs();const f=im.find(i=>/assets\/avatar\.webp$/.test(i.src));return !!(f&&f.ok&&f.vis)||JSON.stringify(im)});
  await p.click('#closeDialog');
  await guard('Carlos José','Las imágenes están en la caché sin conexión',async()=>{await p.waitForFunction(()=>window.appOfflineReady===true,null,{timeout:15000});const k=await p.evaluate(async()=>{const ks=await caches.keys(),c=await caches.open(ks[0]);return{h:!!(await c.match('./assets/hero.webp')),a:!!(await c.match('./assets/avatar.webp'))}});return (k.h&&k.a)||JSON.stringify(k)});
  await guard('Carlos José','SIN CONEXIÓN la portada sigue mostrando a Carlos José',async()=>{await p.reload();await p.waitForSelector('.hero5');await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await ctx.setOffline(true);await p.reload();await p.waitForSelector('.hero5',{timeout:10000});await p.waitForFunction(()=>[...document.images].every(i=>i.complete));const im=await imgs();await ctx.setOffline(false);const hero=im.find(i=>/hero\.webp$/.test(i.src));return !!(hero&&hero.ok&&hero.vis)||JSON.stringify(im)});
  await p.screenshot({path:path.join(OUT,'carlos-jose-390.png')});await ctx.close();
  const ctx2=await b.newContext({viewport:{width:1440,height:900}}),p2=await ctx2.newPage();await p2.goto(s7.url);await p2.waitForSelector('.hero5');await p2.waitForFunction(()=>[...document.images].every(i=>i.complete));
  await guard('Carlos José','En escritorio (1440 px) también aparece por defecto',async()=>await p2.evaluate(()=>{const i=document.querySelector('.hero5-char img');return !!i&&i.naturalWidth>500&&i.getBoundingClientRect().height>150})||'no aparece');
  await p2.screenshot({path:path.join(OUT,'carlos-jose-1440.png')});await ctx2.close();s7.srv.close()}

 srv.close();await b.close();
 const ok=results.filter(r=>r.ok).length;
 fs.writeFileSync(path.join(OUT,'resultados.json'),JSON.stringify(results,null,1));
 fs.writeFileSync(path.join(OUT,'resumen.md'),'# Validación visual automatizada\n\n'+ok+' de '+results.length+' comprobaciones aprobadas.\n\n| Grupo | Comprobación | Resultado |\n|---|---|---|\n'+results.map(r=>'| '+r.grupo+' | '+r.nombre+' | '+(r.ok?'✅ aprobada':'❌ '+r.detalle)+' |').join('\n')+'\n');
 console.log('\nComprobaciones: '+ok+' aprobadas de '+results.length+' · fallas: '+failures);process.exit(failures?1:0)})().catch(e=>{console.log('ERROR',e.message);process.exit(2)});
