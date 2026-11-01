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
 else if(t==='tap'){await clickRegion('.rg[data-r="'+q.answer+'"]')}
 else if(t==='clap'){if(wrongFirst){await p.click('#gclap');await p.click('#gdone')}for(let i=0;i<q.word.syl;i++)await p.click('#gclap');await p.click('#gdone')}
 else if(t==='simon'){await p.waitForFunction(()=>/Ahora tú/.test(document.querySelector('#gfb').textContent),null,{timeout:15000});for(const i of q.seq){await p.click('.pad[data-i="'+i+'"]');await sleep(330)}}
 else throw new Error('tipo sin solucionador '+t)}


module.exports={layout,solve,sleep};
