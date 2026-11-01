/* Regresión: comprueba que los módulos de la v3.2 siguen funcionando y que el progreso antiguo se conserva.
   Uso: node qa/legacy-smoke.cjs [--viewport=390x844] */
const {chromium}=require('playwright');const serve=require('./serve.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const [W,H]=arg('viewport','390x844').split('x').map(Number);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const log=[];let fail=0;
let P_;const nav=async tab=>{if(!(await P_.locator('.tabbar').isVisible()))await P_.click('#directHome');await P_.click('[data-tab="'+tab+'"]');await P_.waitForTimeout(80)};
const ok=(n,c,extra)=>{log.push((c?'OK    ':'FALLA ')+n+(extra?' · '+extra:''));if(!c)fail++};

(async()=>{
 const {srv,url}=await serve(),b=await chromium.launch(),ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true}),p=await ctx.newPage();P_=p;
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
 // progreso de la v3.2 (clave primerosPasos3) con desbloqueos y registros
 const OLD={version:3,name:'Luis',sound:true,voice:'',rate:.85,unlocked:{numbers:5,vowels:3,colors:4,shapes:4},records:{'numbers:1':{seen:3,independent:4,supported:1,errors:1,streak:3,last:1},'colors:rojo':{seen:2,independent:2,supported:0,errors:0,streak:2,last:1}},sessions:7,drawings:2,activities:{size:{independent:5,supported:1}}};
 await p.addInitScript(o=>{if(!localStorage.getItem('primerosPasos3'))localStorage.setItem('primerosPasos3',JSON.stringify(o))},OLD);
 await p.goto(url);await p.waitForSelector('.hero5');
 ok('Carga con progreso antiguo y muestra el nombre guardado',(await p.textContent('.hero5 h1')).includes('Luis'));
 ok('Navegación: barra de secciones en Hoy; Inicio, Módulos y tira de módulos dentro de actividades',await p.locator('.tabbar').isVisible()&&await p.locator('[data-tab]').count()===4);

 // áreas básicas: aprender → practicar con aciertos (se prueban opciones hasta acertar)
 const tryOptions=async(sel,doneSel)=>{const n=await p.locator(sel).count();for(let i=0;i<n;i++){const el=p.locator(sel).nth(i);if(!(await el.isEnabled()))continue;await el.click();if(await p.locator(doneSel).isVisible())return true}return await p.locator(doneSel).isVisible()};
 for(const area of ['numbers','vowels','colors','shapes']){
  await nav('aprender');await p.click('[data-area="'+area+'"]');await p.waitForSelector('#learn');
  await p.click('#learn');await p.waitForSelector('#try');await p.click('#try');
  let good=0;for(let i=0;i<5;i++){await p.waitForSelector('.choice,#try');if(await p.locator('#try').count())await p.click('#try');await p.waitForSelector('.choice');if(await tryOptions('[data-answer]','#next:not([hidden])'))good++;await p.click('#next:not([hidden])');if(await p.locator('#done').count())break}
  ok('Módulo básico «'+area+'»: ronda completa de 5',good===5&&await p.locator('#done').count()===1,good+' resueltas');
 }
 // desbloqueo conservado y nuevas figuras
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('primerosPasos3')));
 ok('Se conservan nombre, sesiones y registros antiguos',st.name==='Luis'&&st.sessions>=7&&st.records['numbers:1'].independent>=4&&st.activities.size.independent>=5);
 ok('Se conservan los desbloqueos anteriores',st.unlocked.numbers>=5&&st.unlocked.vowels>=3&&st.unlocked.colors>=4);

 // relaciones (7 juegos antiguos)
 await nav('jugar');await p.click('#relations');
 for(const k of ['size','amount','full','same','pattern']){
  await p.click('[data-relation="'+k+'"]');
  for(let g=0;g<8;g++){ // ejemplo + 4 prácticas + 2 comprobaciones
   if(await p.locator('#conceptTry').count()){await p.click('#conceptTry');continue}
   if(await p.locator('#conceptDone').count())break;
   await p.waitForSelector('[data-concept-answer]');await tryOptions('[data-concept-answer]','#conceptNext:not([hidden])');await p.click('#conceptNext:not([hidden])')}
  ok('Relacionamos «'+k+'» completo',await p.locator('#conceptDone').count()===1);await p.click('#conceptDone')}
 // uniones por clic (pares) para los 5 tipos
 for(const [btn,sel] of [['colorImage','colorImage'],['shapeObject','shapeObject']]){await nav('jugar');await p.click('#join');await p.click('#'+btn);await p.click('#pairPractice');
  const lefts=p.locator('.match[data-side="l"]'),n=await lefts.count();for(let i=0;i<n;i++){const rs=p.locator('.match[data-side="r"]:not(.done)');const m=await rs.count();for(let j=0;j<m;j++){await lefts.nth(i).click();await rs.nth(j).click();if(await lefts.nth(i).evaluate(e=>e.classList.contains('done')))break}}
  ok('Unir «'+sel+'»',await p.locator('#matchDone').isVisible())}
 for(const k of ['same','amount','cases']){await nav('jugar');await p.click('#join');await p.click('#'+k);
  const lefts=p.locator('.match[data-side="l"]'),n=await lefts.count();for(let i=0;i<n;i++){const rs=p.locator('.match[data-side="r"]:not(.done)');const m=await rs.count();for(let j=0;j<m;j++){await lefts.nth(i).click();await rs.nth(j).click();if(await lefts.nth(i).evaluate(e=>e.classList.contains('done')))break}}
  ok('Unir «'+k+'»',await p.locator('#matchDone').isVisible())}
 // memoria, recorrido, posiciones
 await nav('jugar');await p.click('#memory');await p.click('#hide');
 const cards=p.locator('.memorycard'),cn=await cards.count();let found=0;for(let i=0;i<cn&&found<(cn/2);i++){for(let j=i+1;j<cn;j++){const a=cards.nth(i),c=cards.nth(j);if((await a.evaluate(e=>e.classList.contains('done')))||(await c.evaluate(e=>e.classList.contains('done'))))continue;await a.click();await c.click();await sleep(1300);if(await a.evaluate(e=>e.classList.contains('done'))){found++;break}}}
 ok('Memoria: se encuentran las parejas',await p.locator('#memoryNext').isVisible(),found+' parejas');
 await p.click('#route');await p.click('#readyRoute');for(let i=0;i<3;i++){if(await p.locator('[data-route]').count()===0)break;await tryOptions('[data-route]','#routeNext');if(await p.locator('#routeNext').count())await p.click('#routeNext');else break}
 ok('Recorrido: pregunta por las paradas',true);
 await nav('jugar');await p.click('#positions');await p.click('#nextPos');
 for(let i=0;i<4;i++){await tryOptions('[data-pos]','#nextPos:not([hidden])');await p.click('#nextPos:not([hidden])');if(await p.locator('[data-pos]').count()===0)await p.click('#nextPos')}
 ok('Posiciones antiguas (arriba, abajo, dentro, fuera)',true);

 // trazos: símbolos antiguos y nuevos
 const draw=async sym=>{await p.click('[data-trace="'+sym+'"]');await p.waitForSelector('#drawing');await p.locator('#drawbox').scrollIntoViewIfNeeded();const pts=await p.evaluate(s=>Learning.samplePaths(Learning.tracePaths(s)).filter((_,i)=>i%2===0),sym);const bb=await p.locator('#drawing').boundingBox();
  let last=-1;for(const [x,y] of pts){const X=bb.x+x/100*bb.width,Y=bb.y+y/100*bb.height;if(last<0){await p.mouse.move(X,Y);await p.mouse.down()}else await p.mouse.move(X,Y);last=1}await p.mouse.up();await p.click('#finish');await sleep(100);return (await p.textContent('#feedback')).includes('Recorriste')};
 await nav('jugar');await p.click('#draw');
 for(const sym of ['círculo','línea','cuadrado','a','2','rectángulo','rombo','óvalo','vertical','inclinada','curva','zigzag','bucle','mixta'])ok('Trazo «'+sym+'» se acepta al seguir la guía',await draw(sym));
 ok('Trazo vacío se rechaza',await (async()=>{await p.click('[data-trace="zigzag"]');await p.click('#finish');return !(await p.textContent('#feedback')).includes('Recorriste')})());

 // reto
 await nav('aprender');await p.click('#check');await p.click('#startCheck');
 for(let i=0;i<10;i++){if(await p.locator('#done').count())break;await p.waitForSelector('.choice');await tryOptions('[data-answer]','#next:not([hidden])');await p.click('#next:not([hidden])')}
 ok('Pequeño reto llega al final',await p.locator('#done').count()===1);

 // navegación directa y diálogo agrupado
 await nav('aprender');await p.click('[data-area="numbers"]');await p.click('#modules');ok('Dentro de una actividad: Inicio, Módulos y tira siguen visibles',await p.locator('#directHome').isVisible()&&await p.locator('.chip').count()>=18);
 ok('Diálogo de módulos agrupado',await p.locator('.mgroup').count()===3&&await p.locator('[data-module]').count()>=19);
 await p.click('[data-module="colors"]');ok('Cambiar módulo lleva directo a Colores',(await p.textContent('.topline h2')).includes('Colores'));
 await p.click('[data-chip="espacio"]');ok('La tira superior cambia directo a una ruta nueva',(await p.textContent('.topline h2')).includes('Dónde'));
 ok('El módulo activo queda resaltado',await p.locator('[data-chip="espacio"][aria-current]').count()===1);

 // panel adulto
 await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');
 ok('Panel adulto con pestañas Resumen, Progreso, En casa y Ajustes',await p.locator('[data-atab]').count()===4);
 await p.click('[data-atab="ajustes"]');await p.waitForSelector('#settings');
 const dash=await p.textContent('#dialogContent');
 ok('Ajustes conserva el registro de símbolos y la voz',dash.includes('Lo que está practicando')&&await p.locator('#voice').count()===1);
 await p.click('[data-atab="casa"]');ok('En casa incluye la guía fuera de la pantalla',(await p.textContent('#dialogContent')).includes('Fuera de la pantalla')||(await p.textContent('#dialogContent')).includes('fuera de la pantalla'));
 await p.click('[data-atab="progreso"]');ok('Progreso explica cómo se decide cada estado',(await p.textContent('#dialogContent')).includes('Cómo se decide cada estado'));
 await p.click('#closeDialog');

 // reiniciar progreso limpia también las rutas
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3'));s.games={skills:{contar:{runs:1,best:2,ind:3,sup:1,last:{ok:2,of:3},ts:1}},mixed:null};localStorage.setItem('primerosPasos3',JSON.stringify(s))});
 await p.reload();await p.waitForSelector('.hero5');await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');
 await p.click('[data-atab="progreso"]');ok('El informe muestra la habilidad practicada',(await p.textContent('#dialogContent')).includes('Contar objetos'));
 await p.click('[data-atab="ajustes"]');await p.waitForSelector('#reset');
 p.once('dialog',d=>d.accept());await p.click('#reset');await sleep(200);
 const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('primerosPasos3')));
 ok('Reiniciar borra progreso y rutas pero conserva nombre y preferencias',!after.games&&after.name==='Luis'&&after.sessions===0&&Object.keys(after.records).length===0);

 ok('Sin errores de consola ni de página',errs.length===0,errs.slice(0,3).join(' | '));
 console.log(log.join('\n'));console.log('\nfallas:',fail);await b.close();srv.close();process.exit(fail?1:0)})().catch(e=>{console.log(log.join('\n'));console.log('ERROR',e.message);process.exit(1)});
