/* Utilidades de QA compartidas: resuelve una pregunta con clics reales y revisa que nada se salga de la pantalla. */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function layout(p,tag){
 const bad=await p.evaluate(()=>{const W=document.documentElement.clientWidth,out=[];if(document.documentElement.scrollWidth-W>0)out.push('scroll horizontal '+(document.documentElement.scrollWidth-W)+'px');
  document.querySelectorAll('main button,main svg,main .gart,main .grp,main input,.phases,.topline').forEach(e=>{if(e.closest('.chips,.advrow,.lesson-list.strip'))return;const r=e.getBoundingClientRect();if(r.width===0)return;if(r.right>W+1||r.left<-1)out.push((e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||e.tagName)+' fuera de pantalla ('+Math.round(r.left)+'→'+Math.round(r.right)+' de '+W+')')});return out.slice(0,3)});
 if(bad.length)throw new Error(tag+': '+bad.join('; '))}

async function solve(p,q,wrongFirst){
 const clickRegion=async sel=>{await p.locator(sel).first().evaluate(e=>e.scrollIntoView({block:'center'}));const b=await p.locator(sel+' > *').first().boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2)};
 const t=q.type;
 if(t==='choose'||t==='recall'){
  if(t==='recall'){await p.click('#gseen');if(q.mode==='order'){for(const it of q.items)await p.click('.gitem:not(.used)[data-id="'+it.id.replace(/"/g,'\\"')+'"]');return}}
  if(wrongFirst){const bad=await p.$$eval('.gopt',(bs,a)=>bs.map(b=>b.dataset.id).filter(x=>x!==a),q.answer);if(bad.length)await p.click('.gopt[data-id="'+bad[0].replace(/"/g,'\\"')+'"]')}
  await p.click('.gopt[data-id="'+q.answer.replace(/"/g,'\\"')+'"]')}
 else if(t==='multi'){for(const id of q.targets)await p.click('.gopt[data-id="'+id+'"]')}
 else if(t==='sort'){for(const it of q.items){await p.click('.gitem[data-id="'+it.id.replace(/"/g,'\\"')+'"]');await p.click('.gbin[data-bin="'+it.bin+'"]')}}
 else if(t==='match'){for(const pr of q.pairs){await p.click('.gm[data-side="l"][data-id="'+pr.id.replace(/"/g,'\\"')+'"]');await p.click('.gm[data-side="r"][data-id="'+pr.id.replace(/"/g,'\\"')+'"]')}}
 else if(t==='order'){for(const it of q.items){await p.click('.gitem:not(.used)[data-id="'+it.id.replace(/"/g,'\\"')+'"]')}}
 else if(t==='put'){const n=q.target;for(let i=0;i<n;i++)await p.click('.gtray .pitem >> nth=0');await p.click('#gready')}
 else if(t==='place'){if(wrongFirst){const o=q.zones.find(z=>z!==q.rel);await p.locator('.zone[data-z="'+o+'"]').dispatchEvent('click')}await p.locator('.zone[data-z="'+q.rel+'"]').dispatchEvent('click')}
 else if(t==='follow'){for(const id of q.targets)await p.click('.gopt[data-id="'+id.replace(/"/g,'\\"')+'"]')}
 else if(t==='fill'){for(const id of q.blanks)await p.click('.gopt[data-id="'+id.replace(/"/g,'\\"')+'"]')}
 else if(t==='dots'){for(let i=0;i<q.n;i++)await p.locator('.dot[data-i="'+i+'"]').dispatchEvent('click')}
 else if(t==='paint'){for(const s of q.steps){await p.click('.pal[data-c="'+s.color+'"]');await clickRegion('.rg[data-r="'+s.region+'"]')}}
 else if(t==='tap'){if(wrongFirst){const bad=await p.$$eval('.rg[data-r]',(els,a)=>[...new Set(els.map(e=>e.dataset.r))].filter(r=>r!==a),q.answer);if(bad.length)await clickRegion('.rg[data-r="'+bad[0]+'"]')}await clickRegion('.rg[data-r="'+q.answer+'"]')}
 else if(t==='clap'){if(wrongFirst){await p.click('#gclap');await p.click('#gdone')}for(let i=0;i<q.word.syl;i++)await p.click('#gclap');await p.click('#gdone')}
 else if(t==='simon'){await p.waitForFunction(()=>/Ahora tú/.test(document.querySelector('#gfb').textContent),null,{timeout:15000});for(const i of q.seq){await p.click('.pad[data-i="'+i+'"]');await sleep(330)}}
 else throw new Error('tipo sin solucionador '+t)}


async function advSolve(p,ch){
 const clickRegion=async sel=>{await p.locator(sel).first().evaluate(e=>e.scrollIntoView({block:'center'}));const b=await p.locator(sel+' > *').first().boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2)};
 if(ch.mech==='q'){await solve(p,ch.q,false);return}
 if(ch.mech==='heal'){for(const r of ch.parts){await p.click('#bandage');await clickRegion('.teddy .rg[data-r="'+r+'"]')}}
 else if(ch.mech==='bag'){for(const x of ch.list)for(let i=0;i<x.n;i++)await p.click('.prod[data-e="'+x.e+'"]');await p.click('#bagok')}
 else if(ch.mech==='find'){for(let i=0;i<ch.items.length;i++)if(ch.items[i].target)await p.locator('.fitem[data-i="'+i+'"]').dispatchEvent('click')}
 else if(ch.mech==='memory'){const n=await p.locator('.memorycard').count();for(let i=0;i<n;i++){const ci=p.locator('.memorycard').nth(i);if(await ci.evaluate(e=>e.classList.contains('done')))continue;for(let j=i+1;j<n;j++){const cj=p.locator('.memorycard').nth(j);if(await cj.evaluate(e=>e.classList.contains('done')))continue;await ci.click();await cj.click();await sleep(1300);if(await ci.evaluate(e=>e.classList.contains('done')))break}}}
 else if(ch.mech==='mix'){const R={naranja:['rojo','amarillo'],verde:['azul','amarillo'],morado:['rojo','azul']};for(const t of ch.targets){for(const c of R[t])await p.click('.pot[data-c="'+c+'"]');await p.click('#mmix')}}
 else if(ch.mech==='puzzle'){let guard=0;while(await p.locator('.piece').count()&&guard++<30){const pc=p.locator('.piece').first();await pc.click();const slots=p.locator('.pslot'),k=await slots.count();const before=await p.locator('.piece').count();for(let j=0;j<k;j++){await slots.nth(j).dispatchEvent('click');if(await p.locator('.piece').count()<before)break;await pc.click()}}}
 else if(ch.mech==='walk'){const D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},obs=new Set(ch.obs),seen=new Set([ch.start.join(',')]),Q=[[...ch.start,[]]];let path=[];while(Q.length){const [x,y,pp]=Q.shift();if(x===ch.goal[0]&&y===ch.goal[1]){path=pp;break}for(const k in D){const nx=x+D[k][0],ny=y+D[k][1],kk=nx+','+ny;if(nx<0||ny<0||nx>=ch.W||ny>=ch.H||obs.has(kk)||seen.has(kk))continue;seen.add(kk);Q.push([nx,ny,pp.concat(k)])}}for(const d of path)await p.click('.arr[data-d="'+d+'"]')}
 else if(ch.mech==='cross'){for(let i=0;i<ch.times;i++){await p.waitForFunction(()=>/Verde/.test(document.querySelector('#cstat').textContent),null,{timeout:20000});await p.click('#cgo');await sleep(1900)}}
 else throw new Error('mecánica sin solucionador '+ch.mech)}

/* Recorre una clase guiada pantalla por pantalla. o.stop(kind,info) devuelve true para detenerse; o.wrong(kind,n) decide si se responde mal primero. */
async function driveClass(p,o){o=o||{};let n=0,qn=0,log=[];
 for(let step=0;step<600;step++){
  const kind=await p.evaluate(()=>{const g=s=>!!document.querySelector(s);return g('.clsclose')?'close':g('#mgo')?'mochilaIntro':g('.clsbridge')?'bridge':g('.clswel')?'welcome':g('#gprompt')?'q':g('.gexplain')&&g('#gnext')?'ex':g('.gcards')?'learn':g('.advframe')&&g('#gbox')?'adv':g('.choice[data-answer]')?'sym':g('#try')?'teach':g('.advintro')?'advintro':'?'});
  log.push(kind);if(o.stop&&await o.stop(kind,{step,qn,log}))return{kind,step,qn,log};
  if(kind==='close')return{kind,step,qn,log};
  if(kind==='welcome')await p.click('#cwgo');
  else if(kind==='bridge')await p.click('#cbgo');
  else if(kind==='mochilaIntro')await p.click('#mgo');
  else if(kind==='learn'||kind==='ex')await p.click('#gnext');
  else if(kind==='teach')await p.click('#try');
  else if(kind==='q'){const q=await p.evaluate(()=>window.__gq);await solve(p,q,!!(o.wrong&&o.wrong(kind,qn,q)));qn++;await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext')}
  else if(kind==='adv'){const ch=await p.evaluate(()=>window.__gch);await advSolve(p,ch);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext')}
  else if(kind==='sym'){const x=await p.evaluate(()=>window.__asked);const wrong=o.wrong&&o.wrong('sym',qn);if(wrong){const bad=await p.$$eval('.choice[data-answer]',(bs,a)=>bs.map(b=>b.dataset.answer).filter(v=>v!==a),String(x));await p.click('.choice[data-answer="'+bad[0]+'"]')}
   await p.click('.choice[data-answer="'+x+'"]:not([disabled])');qn++;await p.waitForSelector('#next:not([hidden])');await p.click('#next')}
  else{await sleep(150)}
  await sleep(40)}
 throw new Error('driveClass: demasiados pasos '+log.slice(-8).join(','))}

module.exports={layout,solve,sleep,advSolve,driveClass};
