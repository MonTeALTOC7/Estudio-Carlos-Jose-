/* Auditoría de la Galaxy Tab A9 (SM-X115) por EMULACIÓN: viewports representativos vertical y horizontal con eventos táctiles reales.
   No sustituye la prueba en la tablet física. Pantalla física: 800 × 1340 px; los píxeles CSS dependen de la densidad que informe Android
   (1,0 → 800×1340 · 1,33 → ~600×1005 · 1,5 → ~533×893) y de las barras del sistema, por eso se prueban varias combinaciones.
   Uso: node qa/tablet-smoke.cjs [--only=0,1] [--report] */
const {chromium}=require('playwright');const serve=require('./serve.cjs');const {solve,sleep,driveClass}=require('./solver.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const only=arg('only','').split(',').filter(Boolean).map(Number);const REPORT=process.argv.includes('--report');
const VP=[
 {n:'Tab A9 vertical · densidad 1,0',w:800,h:1260,dpr:1},{n:'Tab A9 horizontal · densidad 1,0',w:1340,h:700,dpr:1},
 {n:'Tab A9 vertical · densidad 1,33',w:600,h:950,dpr:1.333},{n:'Tab A9 horizontal · densidad 1,33',w:1005,h:540,dpr:1.333},
 {n:'Tab A9 vertical · densidad 1,5',w:533,h:830,dpr:1.5},{n:'Tab A9 horizontal · densidad 1,5',w:893,h:470,dpr:1.5}];
let fail=0,pass=0;const ok=(n,c,x)=>{console.log((c?'OK    ':'FALLA ')+n+(x&&!c?' · '+x:''));c?pass++:fail++};
const AUDIT=()=>{const W=innerWidth,H=innerHeight,vis=e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&cs.display!=='none'&&(e.offsetParent!==null||cs.position==='fixed')};
 const sel='button,input:not([type=hidden]):not([type=checkbox]),label:has(>input[type=checkbox]),select,summary,.gopt,.gitem,.gm,.gbin,.choice,.pal,.pad,.zone,.pitem,.count-object,.memorycard,.dot,[data-tab]',small=[],off=[];
 for(const e of document.querySelectorAll(sel)){if(!vis(e)||e.closest('.chips,.advrow,.lesson-list.strip,[hidden],#confetti,.dgbox'))continue;const r=e.getBoundingClientRect(),m=Math.min(r.width,r.height),name=(e.id?'#'+e.id:'')+(typeof e.className==='string'?'.'+e.className.split(' ')[0]:'');
  if(m<44&&!(e.classList.contains('linkb')))small.push(name+' '+Math.round(r.width)+'×'+Math.round(r.height));if(r.right>W+1||r.left<-1)off.push(name+' ('+Math.round(r.left)+'→'+Math.round(r.right)+')')}
 const h=document.querySelector('header.topbar,.topbar'),tb=document.querySelector('.tabbar'),mb=document.querySelector('.modulebar'),h1=h&&vis(h)?h.getBoundingClientRect().height:0,tbh=tb&&vis(tb)&&getComputedStyle(tb).position==='fixed'&&tb.getBoundingClientRect().width>W*0.5?tb.getBoundingClientRect().height:0,mbh=mb&&vis(mb)?mb.getBoundingClientRect().height:0;
 return{ov:document.documentElement.scrollWidth-W,small:[...new Set(small)].slice(0,6),off:off.slice(0,4),bars:Math.round(h1+tbh+mbh),H,W}};

/* ---- toque real (CDP): arrastre y trazado con eventos táctiles ---- */
async function touchPath(p,pts,delay){const c=await p.context().newCDPSession(p),tp=(x,y)=>[{x,y,id:1}];await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp(pts[0].x,pts[0].y)});
 for(let i=1;i<pts.length;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:tp(pts[i].x,pts[i].y)});await sleep(delay||12)}await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach()}
const lerp=(a,b,n)=>Array.from({length:n+1},(_,i)=>({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n}));
async function bothPts(p,selA,selB){const get=async()=>({a:await p.locator(selA).first().boundingBox(),b:await p.locator(selB).first().boundingBox()});let {a,b}=await get();const Hh=p.viewportSize().height,mid=(a.y+a.height/2+b.y+b.height/2)/2;
 /* la actividad puede estar en un contenedor desplazable: se centra el origen y se mide después */
 await p.locator(selA).first().evaluate(e=>e.scrollIntoView({block:'center'}));await sleep(120);({a,b}=await get());
 if(b.y<0||b.y+b.height>Hh){await p.evaluate(d=>window.scrollBy(0,d),Math.round((b.y+b.height/2)-Hh/2));await sleep(120);({a,b}=await get())}
 if(a.y<0||a.y+a.height>Hh||b.y<0||b.y+b.height>Hh)throw new Error('origen y destino no caben juntos en pantalla ('+Math.round(a.y)+','+Math.round(b.y)+' de '+Hh+')');
 return{a:{x:a.x+a.width/2,y:a.y+a.height/2},b:{x:b.x+b.width/2,y:b.y+b.height/2}}}
const open=async(p,mod,id)=>{await p.click('[data-tab="aprender"]');await p.click('[data-mod="'+mod+'"]');await p.click('[data-skill="'+id+'"]');await p.waitForSelector('.gcards');await p.click('#gnext')};
async function until(p,type){for(let i=0;i<14;i++){await p.waitForSelector('.gexplain,#gprompt');if(await p.locator('.gexplain').count()&&!(await p.locator('#gprompt').count())){await p.click('#gnext');continue}const q=await p.evaluate(()=>window.__gq);if(q.type===type)return q;await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext')}throw new Error('no apareció '+type)}
const home=async p=>{if(await p.locator('.tabbar').isVisible())await p.click('[data-tab="hoy"]');else if(await p.locator('#directHome').isVisible())await p.click('#directHome');else await p.click('#home');await p.waitForSelector('.hero5')};
(async()=>{const b=await chromium.launch();const {srv,url}=await serve();
 for(let vi=0;vi<VP.length;vi++){if(only.length&&!only.includes(vi))continue;const v=VP[vi];console.log('\n── '+v.n+' ('+v.w+'×'+v.h+' CSS, DPR '+v.dpr+') ──');
  const ctx=await b.newContext({viewport:{width:v.w,height:v.h},deviceScaleFactor:v.dpr,hasTouch:true,isMobile:true,serviceWorkers:'block'}),p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/voz|speech/i.test(m.text()))errs.push(m.text())});
  await p.addInitScript("Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){setTimeout(()=>u.onend&&u.onend(),30)},cancel(){},getVoices(){return[]}}});window.SpeechSynthesisUtterance=function(t){this.text=t};");
  await p.goto(url);await p.waitForSelector('.hero5');await p.waitForFunction(()=>[...document.images].every(i=>i.complete));
  const shots=[];const chk=async(tag,limitBars)=>{const a=await p.evaluate(AUDIT);const bad=[];if(a.ov>0)bad.push('desbordamiento horizontal '+a.ov+'px');if(a.off.length)bad.push('controles fuera de pantalla: '+a.off.join(', '));if(a.small.length)bad.push('objetivos táctiles <44 px: '+a.small.join(', '));
   const frac=a.bars/a.H;if(limitBars&&frac>limitBars)bad.push('las barras ocupan '+Math.round(frac*100)+' % del alto (máx. '+Math.round(limitBars*100)+' %)');ok('['+tag+'] '+(bad.length?'':'sin desbordes, objetivos ≥44 px y barras '+Math.round(frac*100)+' %'),bad.length===0,bad.join(' | '));if(REPORT)shots.push(tag)};
  await chk('Hoy',0.30);
  for(const [t,sel,tag] of [['camino','.camino','Camino'],['aprender','h1.pagetitle','Aprender'],['jugar','h1.pagetitle','Jugar'],['logros','h1.pagetitle','Logros']]){await p.click('[data-tab="'+t+'"]');await p.waitForSelector(sel);await sleep(150);await chk(tag,0.30)}
  await p.click('[data-tab="hoy"]');await p.waitForSelector('.hero5');await p.click('#cont');await p.waitForSelector('#mskip');await chk('Mochila',0.35);await p.click('#mskip');await p.waitForSelector('.clswel');await chk('Clase · bienvenida',0.35);
  await p.click('#cwgo');await p.waitForSelector('.gcards');await chk('Clase · Aprendo',0.35);await p.click('#gnext');await p.waitForSelector('.gexplain');await chk('Clase · Ejemplo',0.35);
  await p.click('#gnext');for(let i=0;i<5;i++){await p.waitForSelector('.gexplain,#gprompt');if(await p.locator('#gprompt').count())break;await p.click('#gnext')}
  await p.waitForSelector('#gprompt');await chk('Clase · Practico',0.35);
  await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await chk('Panel adulto · Resumen',null);
  for(const t of ['curso','ajustes']){await p.click('[data-atab="'+t+'"]');await sleep(250);await chk('Panel adulto · '+t,null)}
  /* ---- dedos reales: arrastrar, unir, trazar y tocar partes del cuerpo ---- */
  await p.click('#closeDialog');await home(p);
  try{await open(p,'clasificar','clasif-color');const q=await until(p,'sort');for(const it of q.items){const {a,b:bb}=await bothPts(p,'.gitem[data-id="'+it.id.replace(/"/g,'\\"')+'"]','.gbin[data-bin="'+it.bin+'"]');await touchPath(p,lerp(a,bb,10));await sleep(120)}await p.waitForSelector('#gnext:not([hidden])',{timeout:6000});ok('[Arrastre con el dedo: clasificar]',true)}catch(e){ok('[Arrastre con el dedo: clasificar]',false,e.message.split('\n')[0])}
  try{await home(p);await open(p,'cuerpo','sentidos');const q=await until(p,'match');for(const pr of q.pairs){const sid=pr.id.replace(/"/g,'\\"');const {a,b:bb}=await bothPts(p,'.gm[data-side="l"][data-id="'+sid+'"]','.gm[data-side="r"][data-id="'+sid+'"]');await touchPath(p,lerp(a,bb,10));await sleep(150)}await p.waitForSelector('#gnext:not([hidden])',{timeout:6000});ok('[Arrastre con el dedo: unir parejas]',true)}catch(e){ok('[Arrastre con el dedo: unir parejas]',false,e.message.split('\n')[0])}
  try{await home(p);await p.click('[data-tab="jugar"]');await p.waitForSelector('#draw');await p.click('#draw');await p.waitForSelector('#drawing');await p.locator('#drawing').evaluate(e=>e.scrollIntoView({block:'center'}));await sleep(150);const r=await p.locator('#drawing').boundingBox();
   const pts=Array.from({length:81},(_,i)=>{const t=-Math.PI/2-i*Math.PI*2/80;return{x:r.x+(50+29*Math.cos(t))/100*r.width,y:r.y+(50+32*Math.sin(t))/100*r.height}});await touchPath(p,pts,10);await p.locator('#finish').evaluate(e=>e.scrollIntoView({block:'center'}));await p.click('#finish');await sleep(200);
   ok('[Trazado con el dedo: círculo guiado]',/Recorriste/.test(await p.textContent('#feedback')),await p.textContent('#feedback'))}catch(e){ok('[Trazado con el dedo: círculo guiado]',false,e.message.split('\n')[0])}
  try{await home(p);await open(p,'cuerpo','partes');let q=null;for(let i=0;i<20;i++){await p.waitForSelector('.gexplain,#gprompt');if(await p.locator('.gexplain').count()&&!(await p.locator('#gprompt').count())){await p.click('#gnext');continue}q=await p.evaluate(()=>window.__gq);if(q.type==='tap')break;await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext')}
   const pt=await p.evaluate(a=>{const g=[...document.querySelectorAll('#gbox .rg')].find(x=>x.dataset.r===a);g.scrollIntoView({block:'center'});for(const c of g.children){const r=c.getBoundingClientRect();for(let y=r.top;y<r.bottom;y+=3)for(let x=r.left;x<r.right;x+=3){const e=document.elementFromPoint(x,y);if(e&&e.closest&&e.closest('.rg')===g)return{x,y}}}return null},q.answer);await sleep(100);await p.touchscreen.tap(pt.x,pt.y);await p.waitForSelector('#gnext:not([hidden])',{timeout:4000});ok('[Toque con el dedo: partes del cuerpo]',true)}catch(e){ok('[Toque con el dedo: partes del cuerpo]',false,e.message.split('\n')[0])}
  ok('[Sin errores de consola]',errs.length===0,errs[0]);await ctx.close()}
 await b.close();srv.close();console.log('\nComprobaciones aprobadas: '+pass+' · fallas: '+fail);process.exit(fail?1:0)})().catch(e=>{console.log('ERROR',e.message.split('\n').slice(0,3).join(' | '));process.exit(2)});
