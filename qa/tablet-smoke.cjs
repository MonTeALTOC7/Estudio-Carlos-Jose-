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
  await p.click('#closeDialog');
  ok('[Sin errores de consola]',errs.length===0,errs[0]);await ctx.close()}
 await b.close();srv.close();console.log('\nComprobaciones aprobadas: '+pass+' · fallas: '+fail);process.exit(fail?1:0)})().catch(e=>{console.log('ERROR',e.message.split('\n').slice(0,3).join(' | '));process.exit(2)});
