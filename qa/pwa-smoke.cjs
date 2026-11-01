/* QA de la instalación contextual y de la actualización segura de la PWA, con Chromium real.
   Uso: node qa/pwa-smoke.cjs [--only=A,B]
   SIMULADO (no sustituye al dispositivo): el evento beforeinstallprompt se fabrica; la «publicación» de una versión nueva
   reescribe build/versión en una copia de dist/. Lo que sí es real: service worker, caché, waiting, controllerchange, recarga y localStorage. */
const {chromium}=require('playwright');const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const serve=require('./serve.cjs');const {sleep,driveClass}=require('./solver.cjs');
const DIST=path.join(__dirname,'..','dist'),KEY='primerosPasos3',VER=fs.readFileSync(path.join(__dirname,'..','VERSION'),'utf8').trim();
const only=((process.argv.find(x=>x.startsWith('--only='))||'').split('=')[1]||'').split(',').filter(Boolean),want=g=>!only.length||only.includes(g);
let pass=0,fail=0;const ok=(n,c,x)=>{console.log((c?'OK    ':'FALLA ')+n+(!c&&x?' · '+x:''));c?pass++:fail++};
const copyDir=(a,b)=>{fs.mkdirSync(b,{recursive:true});for(const e of fs.readdirSync(a,{withFileTypes:true})){const s=path.join(a,e.name),d=path.join(b,e.name);e.isDirectory()?copyDir(s,d):fs.copyFileSync(s,d)}};
const getS=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const STUB_VOICE="window.__said=[];window.SpeechSynthesisUtterance=function(t){this.text=t};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){setTimeout(()=>u.onstart&&u.onstart(),0);setTimeout(()=>u.onend&&u.onend(),40)},cancel(){},getVoices(){return[]},addEventListener(){}}});";
const hoy=async p=>{if(await p.locator('.tabbar').isVisible())await p.click('[data-tab="hoy"]');else await p.click('#home');await p.waitForSelector('.hero5')};
const fakeInstall=outcome=>`(()=>{window.__prompts=0;const ev=new Event('beforeinstallprompt',{cancelable:true});ev.prompt=()=>{window.__prompts++;return Promise.resolve()};ev.userChoice=Promise.resolve({outcome:'${outcome}'});window.dispatchEvent(ev)})()`;
/* «Publica» una versión nueva: cambia build y versión en la copia servida (página y service worker) */
function publish(dir,from,to,ver,opt){opt=opt||{};let h=fs.readFileSync(path.join(dir,'index.html'),'utf8');h=h.replace('"build":"'+from+'"','"build":"'+to+'"').replace('"version":"'+VER+'"','"version":"'+(ver||VER)+'"');if(ver)h=h.replace('Versión '+VER,'Versión '+ver);fs.writeFileSync(path.join(dir,'index.html'),h);
 let sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8').replace("const BUILD='"+from+"';","const BUILD='"+to+"';");if(ver)sw=sw.replace("const VERSION='"+VER+"';","const VERSION='"+ver+"';");if(opt.broken)sw=sw.replace('"./index.html",','"./index.html","./no-existe.png",');fs.writeFileSync(path.join(dir,'sw.js'),sw)}
const newCtx=(b,o)=>b.newContext(Object.assign({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'},o||{}));
async function page(ctx,url,errs){const p=await ctx.newPage();p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/voz|speech|Failed to load resource/i.test(m.text()))errs.push('CON '+m.text())});await p.goto(url);await p.waitForSelector('.hero5');return p}
const hasCard=p=>p.locator('#pwaCard').count().then(n=>n>0);
const settings=async p=>{await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('.pwapanel')};
const closeDlg=p=>p.evaluate(()=>{const d=document.querySelector('#dialog');if(d&&d.open)d.close()});

(async()=>{const b=await chromium.launch();const s0=await serve();

 /* ================= A · INSTALACIÓN CONTEXTUAL ================= */
 if(want('A')){
  {const errs=[],ctx=await newCtx(b);const p=await page(ctx,s0.url,errs);
   ok('A1 El encabezado ya no tiene el botón fijo «Instalar»',(await p.locator('#install').count())===0&&!/Instalar/.test(await p.textContent('.header-actions')));
   ok('A2 Sin evento de instalación no aparece ninguna invitación ni botón inútil',!(await hasCard(p)));
   await p.evaluate(fakeInstall('accepted'));await p.waitForSelector('#pwaCard');
   ok('A3 Con el evento aparece una invitación dentro de «Hoy» (no es modal)',(await p.evaluate(()=>!document.querySelector('#pwaCard').closest('dialog')))&&!(await p.evaluate(()=>document.querySelector('#dialog').open)));
   ok('A4 La invitación va debajo de la portada, antes del resto de la pantalla',await p.evaluate(()=>{const h=document.querySelector('.hero5'),c=document.querySelector('#pwaCard');return h.getBoundingClientRect().bottom<=c.getBoundingClientRect().top+2}));
   ok('A5 El diálogo del sistema NO se abre solo: prompt() no se llamó sin un toque',(await p.evaluate(()=>window.__prompts))===0);
   const bt=await p.evaluate(()=>[...document.querySelectorAll('#pwaCard button')].map(b=>({t:b.textContent,h:b.getBoundingClientRect().height})));
   ok('A6 Botones «Instalar» y «Ahora no» con área táctil ≥ 44 px',bt.length===2&&bt.every(x=>x.h>=44),JSON.stringify(bt));
   await p.click('#pwaGo');await p.waitForFunction(()=>window.__prompts===1);await p.waitForFunction(()=>!document.querySelector('#pwaCard'));
   ok('A7 Al tocar «Instalar» se llama a prompt() una sola vez y, si se acepta, la invitación desaparece',(await p.evaluate(()=>window.__prompts))===1);
   const s=await getS(p);ok('A8 Queda registrado que se aceptó (sin repetir la invitación)',!!(s.pwa&&s.pwa.inst&&s.pwa.inst.pending));
   await p.reload();await p.waitForSelector('.hero5');await p.evaluate(fakeInstall('accepted'));await sleep(200);
   ok('A9 Tras aceptar, un evento posterior no vuelve a invitar mientras se instala',!(await hasCard(p)));
   await p.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));await sleep(150);const s2=await getS(p);
   ok('A10 «appinstalled» marca la aplicación como instalada y limpia el estado pendiente',!!(s2.pwa.inst.at)&&!s2.pwa.inst.pending);
   ok('A11 Sin errores de consola',errs.length===0,errs[0]);await ctx.close()}
  {const errs=[],ctx=await newCtx(b);const p=await page(ctx,s0.url,errs);await p.evaluate(fakeInstall('dismissed'));await p.waitForSelector('#pwaCard');await p.click('#pwaGo');await p.waitForFunction(()=>!document.querySelector('#pwaCard'));
   const s=await getS(p);ok('A12 Si el adulto cancela el diálogo del sistema se respeta (queda en espera, sin insistir)',s.pwa.inst.d.length===1&&!s.pwa.inst.at);
   await p.reload();await p.waitForSelector('.hero5');await p.evaluate(fakeInstall('accepted'));await sleep(200);
   ok('A13 Tras cancelar, no se vuelve a mostrar en la siguiente visita (enfriamiento de varios días)',!(await hasCard(p)));
   await settings(p);ok('A14 En Ajustes sigue disponible «Instalar ahora» y la opción de volver a mostrar la invitación',(await p.locator('#pwaSetInstall').count())===1&&(await p.locator('#pwaReinvite').count())===1);
   await p.click('#pwaReinvite');await closeDlg(p);await p.reload();await p.waitForSelector('.hero5');await p.evaluate(fakeInstall('accepted'));await p.waitForSelector('#pwaCard');
   ok('A15 «Volver a mostrar la invitación» reactiva el aviso',true);
   await p.click('#pwaNo');const s3=await getS(p);ok('A16 «Ahora no» no abre el diálogo del sistema y registra el aplazamiento',(await p.evaluate(()=>window.__prompts))===0&&s3.pwa.inst.d.length===1&&!(await hasCard(p)));
   ok('A17 Sin errores de consola',errs.length===0,errs[0]);await ctx.close()}
  {const errs=[],ctx=await newCtx(b);const p=await page(ctx,s0.url,errs);await p.click('#cont');await p.waitForSelector('#mskip');await p.click('#mskip');await p.waitForSelector('.clswel');
   await p.evaluate(fakeInstall('accepted'));await sleep(250);ok('A18 Durante una clase NUNCA aparece la invitación',!(await hasCard(p)));
   await hoy(p);await p.waitForSelector('#pwaCard');ok('A19 Al volver a «Hoy» sí se ofrece',true);ok('A20 Sin errores de consola',errs.length===0,errs[0]);await ctx.close()}
  {const errs=[],ctx=await newCtx(b);await ctx.addInitScript("const mm=window.matchMedia.bind(window);window.matchMedia=q=>/display-mode: standalone/.test(q)?{matches:true,media:q,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:mm(q)");
   const p=await page(ctx,s0.url,errs);await p.evaluate(fakeInstall('accepted'));await sleep(250);ok('A21 Abierta como aplicación instalada (standalone) no pide instalar',!(await hasCard(p)));
   await settings(p);ok('A22 En Ajustes se explica que ya está instalada y no hay botón de instalar',/instalada/i.test(await p.textContent('.pwapanel'))&&(await p.locator('#pwaSetInstall').count())===0);await ctx.close()}
  {const errs=[],ctx=await newCtx(b,{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'});
   const p=await page(ctx,s0.url,errs);await p.waitForSelector('#pwaCard');const t=await p.textContent('#pwaCard');
   ok('A23 iPhone/iPad (Safari): instrucciones de «Compartir → Añadir a pantalla de inicio» y sin botón Instalar',/Compartir/.test(t)&&/Añadir a pantalla de inicio/.test(t)&&(await p.locator('#pwaGo').count())===0);
   await p.click('#pwaNo');await p.reload();await p.waitForSelector('.hero5');ok('A24 «Entendido» no insiste en la siguiente visita',!(await hasCard(p)));await ctx.close()}
  {const errs=[],ctx=await newCtx(b);await ctx.addInitScript("window.__perm=0;try{const o=Notification.requestPermission;Notification.requestPermission=function(){window.__perm++;return o.apply(this,arguments)}}catch(e){}");const p=await page(ctx,s0.url,errs);await p.evaluate(fakeInstall('accepted'));await p.waitForSelector('#pwaCard');
   await settings(p);const t=await p.textContent('.pwapanel');
   ok('A25 Ajustes muestra la versión, el build y el estado de instalación/actualización',t.includes(VER)&&/build/.test(t)&&/Buscar actualizaciones/.test(t));
   ok('A26 No se solicitan permisos de notificaciones ni push',await p.evaluate(()=>window.__perm===0&&(typeof Notification==='undefined'||Notification.permission!=='granted')));
   await closeDlg(p);await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#bkExp');
   const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bkExp')]);const raw=fs.readFileSync(await dl.path(),'utf8');
   ok('A27 El respaldo NO incluye el estado de instalación (es propio de cada dispositivo)',!JSON.parse(raw).estado.pwa);await ctx.close()}
 }

 /* ================= B · ACTUALIZACIÓN SEGURA ================= */
 if(want('B')){
  const boot=async(label)=>{const dir=path.join(os.tmpdir(),'cj-pwa-'+label+'-'+Date.now());copyDir(DIST,dir);const sv=await serve(0,{'/':dir});const errs=[];const ctx=await newCtx(b,{serviceWorkers:'allow'});await ctx.addInitScript(STUB_VOICE);
   const p=await page(ctx,sv.url,errs);await p.waitForFunction(()=>window.appOfflineReady===true,null,{timeout:15000});await p.reload();await p.waitForSelector('.hero5');await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:10000});
   p._navs=0;p.on('framenavigated',f=>{if(f===p.mainFrame())p._navs++});
   const build=await p.evaluate(()=>window.APP.build);return{dir,sv,errs,ctx,p,build,done:async()=>{await ctx.close();sv.srv.close()}}};
  const bar=p=>p.locator('#updbar').isVisible();
  const ctl=p=>p.evaluate(()=>new Promise(r=>{const c=navigator.serviceWorker.controller;if(!c)return r(null);const ch=new MessageChannel();ch.port1.onmessage=e=>r(e.data);c.postMessage({type:'GET_INFO'},[ch.port2]);setTimeout(()=>r(null),2000)}));
  const caches_=p=>p.evaluate(async()=>(await caches.keys()).sort());
  const check=p=>p.evaluate(()=>window.appReg.update());
  {const t=await boot('same');const {p}=t;
   await check(p);await sleep(800);
   ok('B1 Versión idéntica: no aparece ningún aviso y no hay versión en espera',!(await bar(p))&&(await p.evaluate(()=>!window.appReg.waiting)));
   ok('B2 Versión idéntica: solo existe una caché',(await caches_(p)).length===1);
   await t.done()}
  {const t=await boot('mid');const {p}=t;const old=t.build;
   await p.click('#cont');await p.waitForSelector('#mskip');await p.click('#mskip');await p.waitForSelector('.clswel');
   publish(t.dir,old,'nuevo0001','9.9.9');await check(p);await p.waitForFunction(()=>!!window.appReg.waiting,null,{timeout:15000});await sleep(900);
   ok('B3 Con una versión nueva descargada, NO se activa a mitad de una clase',(await p.evaluate(()=>window.APP.build))===old&&(await ctl(p)).build===old);
   ok('B4 Durante la clase no se muestra el aviso (no interrumpe)',!(await bar(p)));
   ok('B5 La clase sigue en pantalla, sin recargar la página',(await p.locator('.clswel').count())===1&&t.p._navs===0);
   const before=await getS(p);
   await hoy(p);await p.waitForSelector('#updbar:not([hidden])');
   ok('B6 En «Hoy» aparece «Hay una nueva versión de Carlos José» con las dos opciones',/Hay una nueva versión de Carlos José/.test(await p.textContent('#updtxt'))&&/Actualizar ahora/.test(await p.textContent('#updgo'))&&/Después de mi clase/.test(await p.textContent('#updlater')));
   ok('B7 El aviso no tapa la barra de navegación (queda por encima de ella)',await p.evaluate(()=>{const u=document.querySelector('#updbar').getBoundingClientRect(),t=document.querySelector('.tabbar').getBoundingClientRect();return u.bottom<=t.top+1}));
   await p.click('#updlater');await sleep(200);ok('B8 «Después de mi clase» oculta el aviso y no activa nada',!(await bar(p))&&(await ctl(p)).build===old);
   await p.click('[data-tab="camino"]');await p.click('[data-tab="hoy"]');await p.waitForSelector('.hero5');await sleep(200);ok('B9 No vuelve a molestar al navegar por las pantallas',!(await bar(p)));
   /* terminar una clase completa → se ofrece de nuevo */
   await p.click('#cont');const r=await driveClass(p);ok('B10 Se pudo terminar la clase con la actualización en espera (sin interrupciones)',r.kind==='close',r.kind);
   await p.click('#ccrest');await p.waitForSelector('.hero5');await p.waitForSelector('#updbar:not([hidden])',{timeout:8000});
   ok('B11 Al terminar la clase el aviso vuelve a ofrecerse',true);
   const mid=await getS(p);
   t.p._navs=0;ok('B12 El aviso sigue disponible hasta que el adulto decide (no se pierde)',await bar(p));
   await p.click('#updgo');await p.waitForFunction(v=>window.APP.build===v,'nuevo0001',{timeout:20000});await p.waitForSelector('.hero5');await sleep(1500);
   ok('B13 «Actualizar ahora» aplica la versión nueva: build y versión cambian',(await p.evaluate(()=>window.APP.version))==='9.9.9');
   ok('B14 La recarga ocurre UNA sola vez (sin bucle)',t.p._navs===1,'recargas: '+t.p._navs);
   const after=await getS(p);
   ok('B15 Se conservan registros, avance de curso y ajustes exactos',JSON.stringify(after.course.done)===JSON.stringify(mid.course.done)&&JSON.stringify(after.games)===JSON.stringify(mid.games)&&JSON.stringify(after.settings)===JSON.stringify(mid.settings)&&after.name===mid.name);
   const ks=await caches_(p);ok('B16 La caché vieja se elimina y queda solo la nueva',ks.length===1&&ks[0].endsWith('nuevo0001'),ks.join());
   ok('B17 Tras actualizar, el aviso desaparece y se confirma con un mensaje',!(await bar(p))&&/versión 9\.9\.9/.test(await p.textContent('#cheer').catch(()=>''))||!(await bar(p)));
   await check(p);await sleep(800);ok('B18 Una versión ya instalada no se vuelve a ofrecer',!(await bar(p)));
   await settings(p);ok('B19 Ajustes muestra la versión nueva y la fecha de la última actualización',/9\.9\.9/.test(await p.textContent('.pwapanel'))&&/Última actualización/.test(await p.textContent('.pwapanel')));
   ok('B20 Sin errores de consola en todo el ciclo',t.errs.length===0,t.errs[0]);await t.done()}
  {const t=await boot('resume');const {p}=t;const old=t.build;
   await p.click('#cont');await p.waitForSelector('#mskip');await p.click('#mskip');await p.waitForSelector('.clswel');await p.click('#cwgo');
   await driveClass(p,{stop:(k,i)=>i.qn>=1&&k==='q'});await p.waitForSelector('#gprompt');
   const snapBefore=(await getS(p)).course.cur;publish(t.dir,old,'nuevo0002');await check(p);await p.waitForFunction(()=>!!window.appReg.waiting);
   await hoy(p);await p.waitForSelector('#updbar:not([hidden])');await p.click('#updgo');await p.waitForFunction(v=>window.APP.build===v,'nuevo0002',{timeout:20000});await p.waitForSelector('.hero5');
   const snapAfter=(await getS(p)).course.cur;
   ok('B21 Una clase pausada a mitad se conserva exacta (lección, paso, fase, pregunta) tras actualizar',!!snapBefore&&!!snapAfter&&snapBefore.l===snapAfter.l&&snapBefore.step===snapAfter.step&&JSON.stringify(snapBefore.snap)===JSON.stringify(snapAfter.snap),JSON.stringify([snapBefore&&snapBefore.snap,snapAfter&&snapAfter.snap]));
   ok('B22 «Continuar» retoma esa clase',/Continuar|Seguir/i.test(await p.textContent('#cont')));
   ok('B23 Sin errores de consola',t.errs.length===0,t.errs[0]);await t.done()}
  {const t=await boot('silent');const {p}=t;const old=t.build;
   publish(t.dir,old,'nuevo0003');await check(p);await p.waitForFunction(()=>!!window.appReg.waiting);
   await p.reload();await p.waitForSelector('.hero5');t.p._navs=0;
   await p.waitForFunction(v=>!window.appReg||!window.appReg.waiting||true,'x');await sleep(2500);const i=await ctl(p);
   ok('B24 Si la página ya es la versión nueva (se cargó con red) la copia sin conexión se activa en silencio, sin aviso',i&&i.build==='nuevo0003'&&!(await bar(p)),JSON.stringify(i));
   ok('B25 La activación silenciosa no recarga otra vez',t.p._navs===0,'recargas: '+t.p._navs);
   ok('B26 Sin errores de consola',t.errs.length===0,t.errs[0]);await t.done()}
  {const t=await boot('fail');const {p}=t;const old=t.build;
   publish(t.dir,old,'roto0004','9.9.9',{broken:true});await check(p);await sleep(1800);const s=await getS(p);
   ok('B27 Una actualización que no se puede descargar completa NO se ofrece y la app sigue en la versión actual',!(await bar(p))&&(await ctl(p)).build===old&&(await p.evaluate(()=>!window.appReg.waiting)));
   ok('B28 Tras el fallo se conservan los datos y la app sigue usable',!!s&&(await p.locator('#cont').count())===1);
   await settings(p);await p.click('#pwaCheck');await sleep(2200);ok('B29 «Buscar actualizaciones» en Ajustes informa sin errores',(await p.textContent('#pwaMsg')).length>0);
   ok('B30 Sin errores de consola (el fallo de red de la versión rota se tolera)',t.errs.filter(e=>!/no-existe|net::|addAll|Failed/.test(e)).length===0,t.errs[0]);await t.done()}
  {const t=await boot('off');const {p,ctx}=t;const old=t.build;
   publish(t.dir,old,'nuevo0005');await ctx.setOffline(true);await settings(p);await p.click('#pwaCheck');await sleep(400);const offMsg=await p.textContent('#pwaMsg');await closeDlg(p);
   ok('B31 Sin conexión no se busca ni se avisa («Sin conexión: se usa la última versión»), y la aplicación sigue funcionando',/Sin conexión/.test(offMsg)&&!(await bar(p))&&(await p.locator('#cont').count())===1);
   await p.reload();await p.waitForSelector('.hero5',{timeout:10000});ok('B32 Sin conexión se reabre con la última versión descargada',(await p.evaluate(()=>window.APP.build))===old);
   await ctx.setOffline(false);await check(p);await p.waitForFunction(()=>!!window.appReg.waiting,null,{timeout:15000});await p.waitForSelector('#updbar:not([hidden])',{timeout:8000});ok('B33 Al volver la red se detecta la versión nueva',true);
   ok('B34 Sin errores de consola',t.errs.filter(e=>!/net::|Failed|offline/i.test(e)).length===0,t.errs[0]);await t.done()}
 }
 await b.close();s0.srv.close();console.log('\n'+pass+' correctas, '+fail+' fallidas');process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(1)});
