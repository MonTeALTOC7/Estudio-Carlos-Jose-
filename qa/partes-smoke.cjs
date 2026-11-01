/* Partes de mi cuerpo con personas reales e ilustradas: zonas táctiles, respuestas y comprobación sin pistas.
   Uso: node qa/partes-smoke.cjs [--viewport=390x844] */
const {chromium}=require('playwright');const fs=require('node:fs');const serve=require('./serve.cjs');const {solve,sleep,driveClass}=require('./solver.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const [W,H]=arg('viewport','390x844').split('x').map(Number);let pass=0,fail=0;const ok=(n,c,x)=>{console.log((c?'OK    ':'FALLA ')+n+(x&&!c?' · '+x:''));c?pass++:fail++};
(async()=>{const b=await chromium.launch();const {srv,url}=await serve();
 const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:W<700,serviceWorkers:'block'}),p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/voz|speech/i.test(m.text()))errs.push(m.text())});
 await p.addInitScript("Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){window.__said=(window.__said||[]);window.__said.push(u.text);setTimeout(()=>u.onend&&u.onend(),20)},cancel(){},getVoices(){return[]}}});window.SpeechSynthesisUtterance=function(t){this.text=t};");
 await p.goto(url);await p.waitForSelector('.hero5');
 /* 1 · cada parte de cada figura tiene zona táctil propia y realmente accesible con el dedo */
 const rep=await p.evaluate(async()=>{const P=window.People,out=[];const host=document.createElement('div');host.id='__t';host.style.cssText='position:fixed;left:0;top:0;width:360px;background:#fff;z-index:99999';document.body.appendChild(host);
  for(const id of Object.keys(P.FIGS)){const f=P.FIGS[id];host.innerHTML='<div class="gpaint solo">'+P.svg(id)+'</div>';await Promise.all([...host.querySelectorAll('image')].map(i=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=i.getAttribute('href')})));
   const svg=host.querySelector('svg'),sr=svg.getBoundingClientRect();
   for(const part of P.parts(id)){const g=[...host.querySelectorAll('.rg')].find(x=>x.dataset.r===part);if(!g){out.push({id,part,err:'sin región'});continue}
    let hit=0,tot=0,minx=1e9,miny=1e9,maxx=-1,maxy=-1,cx=0,cy=0;
    for(let y=sr.top+1;y<sr.bottom;y+=3)for(let x=sr.left+1;x<sr.right;x+=3){tot++;const e=document.elementFromPoint(x,y),h=e&&e.closest&&e.closest('.rg');if(h&&h.dataset.r===part&&host.contains(h)){hit++;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);cx+=x;cy+=y}}
    out.push({id,part,hit:hit*9,w:maxx-minx,h:maxy-miny,fx:hit?(cx/hit-sr.left)/sr.width:0,fy:hit?(cy/hit-sr.top)/sr.height:0,scene:f.scene,art:f.art})}}
  host.remove();return out});
 const bad=rep.filter(r=>r.err||r.hit<400);ok('1.1 Todas las partes de las 12 figuras tienen una zona táctil real (sin partes cubiertas ni vacías)',bad.length===0,JSON.stringify(bad.slice(0,4)));
 /* 2 · coherencia anatómica: orden vertical/horizontal de los centros de las zonas */
 const byFig={};for(const r of rep)(byFig[r.id]=byFig[r.id]||{})[r.part]=r;const anat=[];
 for(const [id,m] of Object.entries(byFig)){const f=m[Object.keys(m)[0]];const lt=(a,b)=>m[a]&&m[b]&&m[a].fy<m[b].fy;
  if(f.scene==='body'){for(const [a,b] of [['cabeza','barriga'],['barriga','pierna'],['pierna','pie'],['cabeza','pierna'],['cabeza','pie']])if(!lt(a,b))anat.push(id+': '+a+' debería estar más arriba que '+b)}
  else{for(const [a,b] of [['cabello','ojos'],['ojos','nariz'],['nariz','boca']])if(!lt(a,b))anat.push(id+': '+a+' debería estar más arriba que '+b);if(m.orejas&&(m.orejas.fy<m.nariz.fy-0.15||m.orejas.fy>m.boca.fy+0.2))anat.push(id+': orejas fuera de la altura de la cara')}}
 ok('1.3 Las zonas respetan el orden anatómico (cabeza→barriga→piernas→pies; cabello→ojos→nariz→boca)',anat.length===0,anat.join(' | '));
 /* 3 · una lección real de «Partes de mi cuerpo» */
 await p.click('[data-tab="aprender"]');await p.click('[data-mod="cuerpo"]');await p.click('[data-skill="partes"]');await p.waitForSelector('.gcards');
 ok('3.1 «Aprendo» muestra fotos auténticas de Carlos José y permite tocar cada parte para oír su nombre',(await p.locator('.lfig image').count())===2&&(await p.locator('.lfig .rg').count())>=10);
 await p.evaluate(()=>{window.__said=[]});const tapOne=await p.locator('.lfig').first().locator('.rg[data-r="cabeza"]');const bb=await p.evaluate(()=>{const g=document.querySelector('.lfig .rg[data-r="cabeza"]');g.scrollIntoView({block:'center'});const r=g.firstElementChild.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});await p.mouse.click(bb.x,bb.y);await sleep(150);
 ok('3.2 Al tocar una parte se resalta, se escribe y se dice («Esta es la cabeza de Carlos José»)',(await p.evaluate(()=>window.__said)).some(t=>/Esta es la cabeza de Carlos José/.test(t))&&/cabeza/.test(await p.textContent('.lfig figcaption')));
 /* recorrer la sesión registrando figuras por fase */
 const seen={examples:[],practice:[],check:[],reinforce:[]},tapSizes=[];let anyHl=false,checkHint=false;
 await p.click('#gnext');
 for(let i=0;i<24;i++){await p.waitForSelector('.gexplain,#gprompt');
  if(await p.locator('.gexplain').count()&&!(await p.locator('#gprompt').count())){const q=await p.evaluate(()=>window.__gq||null);const hl=await p.locator('.gexplain').count();await p.click('#gnext');continue}
  const q=await p.evaluate(()=>window.__gq);if(q.type==='tap'){seen[q.phase].push(q.fig);const sz=await p.evaluate(a=>{const g=[...document.querySelectorAll('#gbox .rg')].find(x=>x.dataset.r===a);if(!g)return null;g.scrollIntoView({block:'center'});const sv=g.ownerSVGElement.getBoundingClientRect(),pts=new Set(),ST=3;
   for(let y=sv.top;y<sv.bottom;y+=ST)for(let x=sv.left;x<sv.right;x+=ST){const e=document.elementFromPoint(x,y);if(e&&e.closest&&e.closest('.rg')===g)pts.add(Math.round((x-sv.left)/ST)+','+Math.round((y-sv.top)/ST))}
   /* componentes conexos de la zona (p. ej. cada mano, cada pie): se mide el lado menor de cada uno; lo diminuto (decoración) se ignora */
   const seen=new Set(),comps=[];for(const k of pts){if(seen.has(k))continue;const st=[k];seen.add(k);let n=0,x0=1e9,x1=-1,y0=1e9,y1=-1;while(st.length){const c=st.pop(),[cx,cy]=c.split(',').map(Number);n++;x0=Math.min(x0,cx);x1=Math.max(x1,cx);y0=Math.min(y0,cy);y1=Math.max(y1,cy);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nk=(cx+dx)+','+(cy+dy);if(pts.has(nk)&&!seen.has(nk)){seen.add(nk);st.push(nk)}}}comps.push({n,m:Math.min(x1-x0+1,y1-y0+1)*ST})}
   const mx=Math.max(0,...comps.map(c=>c.n));let best=1e9;for(const c of comps)if(c.n>=0.25*mx)best=Math.min(best,c.m);return best>1e8?0:best},q.answer);tapSizes.push([q.fig+':'+q.answer,sz]);const hl=await p.locator('.rg.hl,.rg.ghint').count();if(q.phase==='check'){if(hl)anyHl=true;if(await p.locator('#ghint').count())checkHint=true}}
  await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext');if(await p.locator('#gagain').count())break}
 const tiny=tapSizes.filter(x=>x[1]!==null&&x[1]<30);ok('3.2b Cada zona que hay que tocar mide al menos 30 px de lado menor en esta pantalla ('+tapSizes.length+' preguntas)',tapSizes.length>=3&&tiny.length===0,JSON.stringify(tiny)+' '+JSON.stringify(tapSizes.slice(0,5)));
 ok('3.3 En «Compruebo» no hay ninguna parte resaltada de antemano ni botón de pista',!anyHl&&!checkHint);
 ok('3.4 «Practico» usa la ilustración o fotos de Carlos José',seen.practice.every(f=>/^carlos-/.test(f))&&seen.practice.length>=1,JSON.stringify(seen));
 ok('3.5 «Compruebo» incluye otras personas (no solo un dibujo memorizado)',seen.check.some(f=>!/^carlos-/.test(f)),JSON.stringify(seen.check));
 /* 4 · corrección de respuestas: acierto y error con el dedo */
 await p.goto(url);await p.waitForSelector('.hero5');await p.click('[data-tab="aprender"]');await p.click('[data-mod="cuerpo"]');await p.click('[data-skill="partes"]');await p.waitForSelector('.gcards');await p.click('#gnext');
 let found=null;for(let i=0;i<24&&!found;i++){await p.waitForSelector('.gexplain,#gprompt');if(await p.locator('.gexplain').count()&&!(await p.locator('#gprompt').count())){await p.click('#gnext');continue}
  const q=await p.evaluate(()=>window.__gq);if(q.type==='tap'){found=q;break}await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext')}
 ok('4.0 Se llegó a una pregunta de tocar una parte',!!found);
 if(found){const wrong=await p.evaluate(a=>{const rs=[...document.querySelectorAll('.rg')].map(g=>g.dataset.r).filter(r=>r!==a);return rs[0]},found.answer);
  const hitFor=async part=>p.evaluate(part=>{const g=[...document.querySelectorAll('.rg')].find(x=>x.dataset.r===part);g.scrollIntoView({block:'center'});const rs=[...g.children].map(c=>c.getBoundingClientRect()).filter(r=>r.width>0);for(const r of rs)for(let y=r.top+1;y<r.bottom-1;y+=3)for(let x=r.left+1;x<r.right-1;x+=3){const e=document.elementFromPoint(x,y),h=e&&e.closest&&e.closest('.rg');if(h&&h.dataset.r===part)return{x,y}}return null},part);
  const wp=await hitFor(wrong);await p.mouse.click(wp.x,wp.y);await sleep(200);
  ok('4.1 Tocar otra parte da una pista amable («Esa es…, busca…») y no cuenta como acierto',/Esa es/.test(await p.textContent('#gfb'))&&(await p.locator('#gnext:not([hidden])').count())===0,await p.textContent('#gfb'));
  const ap=await hitFor(found.answer);await p.mouse.click(ap.x,ap.y);await sleep(200);
  ok('4.2 Tocar la parte correcta avanza',/¡Sí!|Esta es/.test(await p.textContent('#gfb'))&&(await p.locator('#gnext:not([hidden])').count())===1)}
 ok('Sin errores de consola',errs.length===0,errs[0]);await b.close();srv.close();console.log('\nComprobaciones aprobadas: '+pass+' · fallas: '+fail);process.exit(fail?1:0)})().catch(e=>{console.log('ERROR',e.stack.split('\n').slice(0,3).join(' | '));process.exit(2)});
