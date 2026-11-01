/* QA de la v5: portada, recomendaciones, celebraciones, reanudar, modos de repaso, aventuras y panel adulto.
   Uso: node qa/v5-smoke.cjs [--viewport=390x844] */
const {chromium}=require('playwright');const serve=require('./serve.cjs');const {solve,layout,sleep}=require('./solver.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const [W,H]=arg('viewport','390x844').split('x').map(Number),shots=arg('shots',''),seenM=new Set();
const log=[];let fail=0;const ok=(n,c,x)=>{log.push((c?'OK    ':'FALLA ')+n+(x?' · '+x:''));if(!c)fail++};
const DAY=86400000;
const goHoy=async p=>{if(await p.locator('.tabbar').isVisible())await p.click('[data-tab="hoy"]');else await p.click('#directHome');await p.waitForSelector('.hero5')};
async function runSkillFull(p,wrong){ // recorre ejemplos + preguntas hasta el resultado
 await p.waitForSelector('.gcards');await p.click('#gnext');
 for(;;){await p.waitForSelector('.gexplain');const last=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(last)break}
 let n=0;for(;;){await p.waitForSelector('#gprompt');const q=await p.evaluate(()=>window.__gq);await solve(p,q,wrong&&n===1);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext');n++;if(await p.locator('#gagain').count())break;if(n>20)throw new Error('demasiadas')}return n}
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

(async()=>{
 const {srv,url}=await serve(),b=await chromium.launch(),ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<700,isMobile:W<700}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
 const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('primerosPasos3')||'null'));
 const setState=f=>p.evaluate(s=>{localStorage.setItem('primerosPasos3',JSON.stringify(s))},f);
 await p.goto(url);await p.waitForSelector('.hero5');
 // 1 portada
 ok('Portada personalizada con saludo, nivel y botón principal',(await p.textContent('.hero5 h1')).includes('Carlos José')&&await p.locator('.lvl').count()===1&&await p.locator('#cont').isVisible());
 ok('Hoy ofrece 3 sugerencias y 5 aventuras',await p.locator('.tcard').count()===3&&await p.locator('.advrow .advcard').count()===5);
 ok('Barra de secciones visible en Hoy (sin tapar contenido)',await p.locator('.tabbar').isVisible()&&await layout(p,'hoy').then(()=>true));
 const names=await p.locator('.tcard strong').allTextContents();
 // 2 primera sesión completa con racha, insignia y nivel
 await p.click('.tcard >> nth=0');ok('Una sugerencia abre su habilidad',await p.locator('.gcards').count()===1);
 ok('En actividad se oculta la barra inferior y aparece el selector de módulos',!(await p.locator('.tabbar').isVisible())&&await p.locator('#modules').isVisible());
 const n=await runSkillFull(p,false);
 await p.waitForSelector('#celebrate.on',{timeout:5000});ok('Celebración por la primera insignia',(await p.textContent('#celebrate')).includes('Primer paso'));
 await p.click('#celok');await sleep(400);
 let s=await state();ok('Se guarda historial por sesión, insignia y estado',s.games.skills[Object.keys(s.games.skills)[0]].hist.length===1&&!!s.badges['primer-paso']);
 ok('Se conserva la clave y compatibilidad de guardado',s.version===3&&s.name==='Carlos José');
 // 3 reanudar
 await goHoy(p);
 const first=await p.locator('.tcard strong >> nth=0').textContent();await p.click('.tcard >> nth=0');await p.waitForSelector('.gcards');await p.click('#gnext');await p.waitForSelector('.gexplain');
 await goHoy(p);
 ok('El botón principal es el camino guiado (no la última actividad libre)',/Empezar mi primera clase/.test(await p.textContent('#cont')));ok('La actividad libre interrumpida se recupera con una opción secundaria',(await p.locator('#freeres').count())===1&&/Partes de mi cuerpo|Cuerpo|Contar|[A-Z]/.test(await p.textContent('.freeres')));
 await p.click('#freeres');await p.waitForSelector('.gexplain');ok('Retomar vuelve al mismo paso (Ejemplos)',/Ejemplo/.test(await p.textContent('.label')));
 // 4 modos adaptativos con historial sembrado
 const day=n=>{const d=new Date(Date.now()-n*DAY);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},ent=(n,ok,ty=['choose','sort'],er=0)=>({d:day(n),ts:Date.now()-n*DAY,ok,of:3,pi:2,ps:1,er,hn:0,ty,bad:ok<2?['a']:[]});
 s=await state();delete s.resume;s.games.skills={contar:{runs:3,best:3,ind:9,sup:3,last:{ok:0,of:3},ts:Date.now(),hist:[ent(6,3),ent(5,3),ent(0,0,['choose'],4)]},'clasif-color':{runs:2,best:3,ind:5,sup:1,last:{ok:3,of:3},ts:Date.now()-2*DAY,hist:[ent(4,3)]},figuras:{runs:1,best:1,ind:1,sup:2,last:{ok:1,of:3},ts:Date.now()-DAY,hist:[ent(1,1)]}};await setState(s);
 await p.reload();await p.waitForSelector('.hero5');
 const kinds=await p.locator('.tcard em').allTextContents(),titles=await p.locator('.tcard strong').allTextContents();
 ok('Recomienda repasar lo comprobado que falló y mantiene variedad',kinds.some(k=>/Repasar/.test(k))&&titles[0].includes('Contar'),kinds.join(' | '));
 await p.click('.tcard >> nth=0');await p.waitForSelector('.gcards');await p.click('#gnext');let ex=0;for(;;){await p.waitForSelector('.gexplain');ex++;const last=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(last)break}
 ok('El repaso muestra ejemplos adicionales (modo «extra»)',ex>=3,ex+' ejemplos');
 s=await state();s.games.skills={'clasif-color':{runs:2,best:3,ind:5,sup:1,last:{ok:3,of:3},ts:Date.now()-4*DAY,hist:[ent(4,3)]}};delete s.resume;await setState(s);await p.reload();await p.waitForSelector('.hero5');
 const confirmIdx=(await p.locator('.tcard em').allTextContents()).findIndex(k=>/Comprobar|Recordar/.test(k));
 if(confirmIdx>=0){await p.click('.tcard >> nth='+confirmIdx);await p.waitForSelector('#gprompt');ok('Confirmar/recordar va directo a «Compruebo», sin pistas',/Compruebo/.test(await p.textContent('.phases li.on span'))&&await p.locator('#ghint').count()===0)}else ok('Confirmar/recordar aparece en las sugerencias',false);
 // 4b REGRESIÓN: habilidad consolidada con el historial lleno y una sesión real fallida no pierde su estado
 {s=await state();const e=(n,ok,er)=>({d:day(n),ts:Date.now()-n*DAY,ok,of:3,pi:0,ps:3,er,hn:0,ty:ok>=2?['choose','put']:['choose'],bad:['a']});
  s.games.skills={contar:{runs:30,best:3,ind:20,sup:40,last:{ok:0,of:3},ts:Date.now()-DAY,hist:Array.from({length:14},(_,i)=>e(14-i,0,4)),proof:{days:[day(40),day(30),day(20)],types:['choose','put'],active:[day(40),day(30),day(20)],persever:true}}};delete s.resume;await setState(s);
  await p.reload();await p.waitForSelector('.hero5');await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');await p.waitForSelector('.gskill');
  ok('La ruta muestra la habilidad consolidada aunque el historial sea de sesiones fallidas',/consolid/i.test(await p.textContent('[data-skill="contar"]')));
  await p.click('[data-skill="contar"]');await p.waitForSelector('.gcards');await p.click('#gnext');for(;;){await p.waitForSelector('.gexplain');const last=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(last)break}
  let nq=0;for(;;){await p.waitForSelector('#gprompt');const q=await p.evaluate(()=>window.__gq);await solve(p,q,true);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext');nq++;if(await p.locator('#gagain').count())break;if(nq>20)throw new Error('demasiadas')}
  await sleep(300);if(await p.locator('#celebrate.on').count())await p.click('#celok');
  const r=(await state()).games.skills.contar;ok('La sesión fallida se guarda pero el historial sigue acotado y las pruebas permanecen',r.hist.length===14&&r.proof.days.length===3&&r.runs===31&&r.last.ok<2,'ok '+r.last.ok+' de '+r.last.of);
  await p.click('#directHome');await p.click('[data-tab="logros"]');await p.waitForSelector('.routelist');await p.click('.rt >> nth=0');
  ok('Logros sigue mostrando «En consolidación» y sugiere repaso',(await p.textContent('.rt >> nth=0')).includes('En consolidación')&&(await p.textContent('.rt >> nth=0')).includes('repasar'))}
 // 5 aventuras
 await goHoy(p);await p.click('[data-tab="jugar"]');await p.waitForSelector('.advgrid');
 const ids=await p.$$eval('[data-adv]',els=>[...new Set(els.map(e=>e.dataset.adv))]);
 for(const id of ids){
  try{if(!(await p.locator('.tabbar').isVisible()))await p.click('#directHome');await p.click('[data-tab="jugar"]');await p.waitForSelector('.advgrid');await p.click('.advgrid [data-adv="'+id+'"]');await p.waitForSelector('#astart');await layout(p,'intro '+id);if(shots)await p.screenshot({path:shots+'/adv_intro_'+id+'.png',fullPage:true});await p.click('#astart');
   let k=0;for(;;){await p.waitForSelector('#gbox');await sleep(120);const ch=await p.evaluate(()=>window.__gch);await layout(p,'reto '+ch.mech);if(shots&&!seenM.has(ch.mech)){seenM.add(ch.mech);await p.screenshot({path:shots+'/adv_'+ch.mech+'.png',fullPage:true})}await advSolve(p,ch);await p.waitForSelector('#gnext:not([hidden])',{timeout:15000});await layout(p,'resuelto '+ch.mech);await p.click('#gnext');k++;if(await p.locator('.advend').count())break;if(k>8)throw new Error('demasiados retos')}
   const st=await state();ok('Aventura «'+id+'» completa ('+k+' retos)',st.adv[id]&&st.adv[id].runs===1&&st.adv[id].stars>=1,'estrellas '+st.adv[id].stars);
   await sleep(900);if(await p.locator('#celebrate.on').count())await p.click('#celok')}catch(e){ok('Aventura «'+id+'»',false,e.message.split('\n')[0]);await p.screenshot({path:'/tmp/fail_adv_'+id+'.png'}).catch(()=>{})}}
 // 6 panel adulto: resumen, respaldo y fotos locales
 {const fs=require('fs');if(!(await p.locator('.tabbar').isVisible()))await p.click('#directHome');
  await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');
  const rs=await p.textContent('#dialogContent');ok('Resumen: nivel, sugerencias con motivo y actividad reciente',rs.includes('Sugerido para jugar hoy')&&rs.includes('Actividad reciente')&&/Nivel \d/.test(rs)&&await p.locator('.adulttbl tbody tr').count()>0);
  ok('Resumen aclara que no es nota ni diagnóstico',rs.includes('no son una nota'));
  await p.click('[data-atab="ajustes"]');await p.waitForSelector('#bkExp');
  const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bkExp')]);const data=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
  ok('Respaldo descargable con el estado completo y sin fotos',data.app==='centro-carlos-jose'&&data.estado.version===3&&!!data.estado.games&&!data.estado.profile);
  const before=(await state()).badges;const w=await state();w.games={skills:{},mixed:null};w.badges={};await setState(w);
  p.once('dialog',d=>d.accept());await p.setInputFiles('#bkImp',{name:'respaldo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await sleep(500);
  const back=await state();ok('Restaurar recupera historial e insignias',Object.keys(back.badges).length===Object.keys(before).length&&Object.keys(back.games.skills).length>0);
  await p.setInputFiles('#bkImp',{name:'malo.json',mimeType:'application/json',buffer:Buffer.from('{"hola":1}')});await sleep(300);
  ok('Un archivo que no es respaldo se rechaza sin romper nada',(await p.textContent('#bkMsg')).includes('No se pudo leer'));
  const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
  await p.setInputFiles('#fFace',{name:'f.png',mimeType:'image/png',buffer:PNG});await sleep(600);
  ok('La foto se guarda solo en el dispositivo (perfil local)',(await state()).profile&&/^data:image\/jpeg/.test((await state()).profile.face||''));
  await p.click('#closeDialog');await goHoy(p);ok('La portada usa la foto cargada',await p.locator('.hero5 img.avimg, .hero5 .avsvg').count()>=1);
  await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#fClear');await p.click('#fClear');await sleep(200);
  ok('«Usar las predeterminadas» elimina lo cargado en el dispositivo',!(await state()).profile.face);await p.click('#closeDialog')}
 // 6 logros y reducción de animaciones
 if(await p.locator('.tabbar').isVisible()===false)await p.click('#directHome');await p.click('[data-tab="logros"]');await p.waitForSelector('.badges');
 ok('Logros muestra insignias ganadas y nivel',await p.locator('.badge.on').count()>=2&&await p.locator('.lvcard').count()===1);
 s=await state();s.settings={anim:'off'};await setState(s);await p.reload();await p.waitForSelector('.hero5');
 ok('Reducir animaciones desactiva el movimiento',await p.evaluate(()=>document.body.classList.contains('reduce-motion')));
 ok('Sin errores de consola ni de página',errs.length===0,errs.slice(0,3).join(' | '));
 console.log(log.join('\n'));console.log('\nfallas:',fail);await b.close();srv.close();process.exit(fail?1:0)})().catch(e=>{console.log(log.join('\n'));console.log('ERROR',e.message);process.exit(1)});
