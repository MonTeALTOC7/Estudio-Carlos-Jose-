/* Prueba de humo en navegador: recorre cada habilidad de las rutas con clics reales.
   Uso:  node qa/ui-smoke.cjs [--viewport=390x844] [--only=id1,id2] [--shots=carpeta]
   Requiere Playwright (no es dependencia del proyecto; solo para QA local). */
const {chromium}=require('playwright');
const serve=require('./serve.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const [W,H]=arg('viewport','390x844').split('x').map(Number),only=arg('only','').split(',').filter(Boolean),shots=arg('shots',''),bytype=arg('bytype',''),seen=new Set();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function layout(p,tag){
 const bad=await p.evaluate(()=>{const W=document.documentElement.clientWidth,out=[];if(document.documentElement.scrollWidth-W>0)out.push('scroll horizontal '+(document.documentElement.scrollWidth-W)+'px');
  document.querySelectorAll('main button,main svg,main .gart,main .grp,main input,.phases,.topline').forEach(e=>{if(e.closest('.chips'))return;const r=e.getBoundingClientRect();if(r.width===0)return;if(r.right>W+1||r.left<-1)out.push((e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||e.tagName)+' fuera de pantalla ('+Math.round(r.left)+'→'+Math.round(r.right)+' de '+W+')')});return out.slice(0,3)});
 if(bad.length)throw new Error(tag+': '+bad.join('; '))}

async function solve(p,q,wrongFirst){
 const clickRegion=async sel=>{await p.locator(sel).first().scrollIntoViewIfNeeded();const b=await p.locator(sel+' > *').first().boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2)};
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
 else if(t==='tap'){await clickRegion('.rg[data-r="'+q.answer+'"]')}
 else if(t==='clap'){if(wrongFirst){await p.click('#gclap');await p.click('#gdone')}for(let i=0;i<q.word.syl;i++)await p.click('#gclap');await p.click('#gdone')}
 else if(t==='simon'){await p.waitForFunction(()=>/Ahora tú/.test(document.querySelector('#gfb').textContent),null,{timeout:15000});for(const i of q.seq){await p.click('.pad[data-i="'+i+'"]');await sleep(330)}}
 else throw new Error('tipo sin solucionador '+t)}

(async()=>{
 const {srv,url}=await serve(),b=await chromium.launch(),ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1}),p=await ctx.newPage();
 const errs=[],log=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
 await p.goto(url);await p.waitForSelector('.hero');
 const ids=await p.evaluate(()=>Content.skills.map(s=>s.id+'|'+s.mod+'|'+!!s.available));
 let n=0,fail=0;
 for(const row of ids){const [id,mod,needsName]=row.split('|');if(only.length&&!only.includes(id))continue;
  try{
   await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3')||'null');if(s){s.name='Carlos';localStorage.setItem('primerosPasos3',JSON.stringify(s))}});
   await p.reload();await p.waitForSelector('.hero');
   await p.click('[data-mod="'+mod+'"]');await p.waitForSelector('.gskill');
   await p.click('[data-skill="'+id+'"]');
   if(await p.locator('#gname').count()){await p.fill('#gname','Carlos');await p.click('#gnsave')}
   await p.waitForSelector('.gcards');await layout(p,'aprender');
   if(shots)await p.screenshot({path:shots+'/'+id+'_1learn.png',fullPage:true});
   await p.click('#gnext');                              // ver ejemplos
   let steps=0;
   for(;;){ // ejemplos
    await p.waitForSelector('.gexplain');await layout(p,'ejemplo');if(shots&&steps===0)await p.screenshot({path:shots+'/'+id+'_2example.png',fullPage:true});
    const last=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');steps++;if(last)break}
   let qn=0;
   for(;;){
    await p.waitForSelector('#gprompt',{timeout:8000});
    const q=await p.evaluate(()=>window.__gq),phase=await p.evaluate(()=>document.querySelector('.phases li.on span').textContent);
    if(shots&&qn===0)await p.screenshot({path:shots+'/'+id+'_3practice.png',fullPage:true});
    await sleep(150);await layout(p,'pregunta '+q.type);
    if(bytype&&!seen.has(q.type+(q.mode||''))){seen.add(q.type+(q.mode||''));await p.screenshot({path:bytype+'/'+q.type+(q.mode?'-'+q.mode:'')+'.png',fullPage:true})}
    if(qn===0&&!/Compruebo/.test(phase)){await p.click('#ghint');await sleep(250);const shown=(await p.locator('.ghint').count())+((await p.textContent('#gfb')).trim().length>0?1:0);if(!shown)throw new Error('la pista no muestra nada ('+q.type+')')}
    await solve(p,q,qn%3===1&&!/Compruebo/.test(phase));
    await p.waitForSelector('#gnext:not([hidden])',{timeout:8000});await layout(p,'resuelta '+q.type);
    if(shots&&qn===0)await p.screenshot({path:shots+'/'+id+'_4done.png',fullPage:true});
    await p.click('#gnext');qn++;
    if(await p.locator('#gagain').count())break;
    if(qn>20)throw new Error('demasiadas preguntas')}
   const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   const res=await p.evaluate(i=>JSON.parse(localStorage.getItem('primerosPasos3')).games.skills[i],id);
   if(ov>0)throw new Error('desbordamiento horizontal '+ov+'px');
   if(!res||res.runs!==1)throw new Error('progreso no guardado');
   if(shots)await p.screenshot({path:shots+'/'+id+'_5result.png',fullPage:true});
   n++;log.push('OK '+id+' · preguntas '+qn+' · comprobación '+res.last.ok+'/'+res.last.of)
  }catch(e){fail++;log.push('FALLA '+id+': '+e.message.split('\n')[0]);await p.screenshot({path:(shots||'/tmp')+'/fail_'+id+'.png'}).catch(()=>{})}}
 console.log(log.join('\n'));console.log('\nhabilidades OK:',n,'· fallas:',fail,'· errores de consola:',errs.length);if(errs.length)console.log(errs.slice(0,10).join('\n'));
 await b.close();srv.close();process.exit(fail||errs.length?1:0)})();
