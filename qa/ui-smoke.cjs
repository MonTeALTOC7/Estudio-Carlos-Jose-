/* Prueba de humo en navegador: recorre cada habilidad de las rutas con clics reales.
   Uso:  node qa/ui-smoke.cjs [--viewport=390x844] [--only=id1,id2] [--shots=carpeta]
   Requiere Playwright (no es dependencia del proyecto; solo para QA local). */
const {chromium}=require('playwright');
const serve=require('./serve.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const [W,H]=arg('viewport','390x844').split('x').map(Number),only=arg('only','').split(',').filter(Boolean),shots=arg('shots',''),bytype=arg('bytype',''),seen=new Set();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const {layout,solve}=require('./solver.cjs');

(async()=>{
 const {srv,url}=await serve(),b=await chromium.launch(),ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1}),p=await ctx.newPage();
 const errs=[],log=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
 await p.goto(url);await p.waitForSelector('.hero5');
 const ids=await p.evaluate(()=>Content.skills.map(s=>s.id+'|'+s.mod+'|'+!!s.available));
 let n=0,fail=0;
 for(const row of ids){const [id,mod,needsName]=row.split('|');if(only.length&&!only.includes(id))continue;
  try{
   await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3')||'null');if(s){s.name='Carlos';localStorage.setItem('primerosPasos3',JSON.stringify(s))}});
   await p.reload();await p.waitForSelector('.hero5');
   await p.click('[data-tab="aprender"]');await p.click('[data-mod="'+mod+'"]');await p.waitForSelector('.gskill');
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
