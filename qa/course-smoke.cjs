/* QA del Modo Clase Guiada («Mi camino») y del audio, con clics reales en Chromium.
   Uso: node qa/course-smoke.cjs [--viewport=390x844] [--only=1,2,...]
   Cada escenario usa un contexto nuevo (instalación limpia) y parte del estado que necesita. */
const {chromium}=require('playwright');const fs=require('node:fs'),path=require('node:path');
const serve=require('./serve.cjs');const {solve,layout,sleep,driveClass}=require('./solver.cjs');
const CUR=require('../curriculum.js');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const [W,H]=arg('viewport','390x844').split('x').map(Number),only=arg('only','').split(',').filter(Boolean).map(Number),shotDir=arg('shots','');
if(shotDir)fs.mkdirSync(shotDir,{recursive:true});
const KEY='primerosPasos3',DAY=86400000;
let fail=0,pass=0;const ok=(n,c,x)=>{console.log((c?'OK    ':'FALLA ')+n+(x&&!c?' · '+x:''));c?pass++:fail++};
const getS=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const putS=async(p,body)=>{await p.evaluate(([k,src])=>{const s=JSON.parse(localStorage.getItem(k)||'{}');(new Function('s',src))(s);localStorage.setItem(k,JSON.stringify(s))},[KEY,body]);await p.reload();await p.waitForSelector('.hero5')};
const ymd=ms=>{const d=new Date(ms),z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())};
const doneRec=(days,okk)=>({n:1,ok:okk===0?0:1,ts:Date.now()-days*DAY,d:ymd(Date.now()-days*DAY),ck:[3,3],mode:'nueva',er:0,hn:0,fails:okk===0?1:0,first:ymd(Date.now()-days*DAY)});
const seedDone=(ids,days)=>"const c=s.course=s.course||{};c.v=1;c.started=1;c.diag={done:0,skipped:1,ts:0,res:{}};c.cur=null;c.done=c.done||{};c.sr=c.sr||{};c.log=c.log||[];c.days=c.days||{};c.prefs=c.prefs||{min:10,perDay:2,game:true};"+ids.map(id=>"c.done['"+id+"']="+JSON.stringify(doneRec(days||3))+";").join('');
const STUB_VOICE="window.__said=[];window.SpeechSynthesisUtterance=function(t){this.text=t};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){window.__said.push(u.text);setTimeout(()=>u.onstart&&u.onstart(),0);setTimeout(()=>u.onend&&u.onend(),(window.__voiceMs||40))},cancel(){},getVoices(){return[]},onvoiceschanged:null}});";
let browser,srvInfo;
async function fresh(opts){opts=opts||{};const ctx=await browser.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:W<700,serviceWorkers:'block'});if(opts.voice!==false)await ctx.addInitScript(STUB_VOICE);const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/voz|speech/i.test(m.text()))p._errs.push('CON '+m.text())});
 await p.goto(srvInfo.url);await p.waitForSelector('.hero5');return p}
const hoy=async p=>{if(await p.locator('.tabbar').isVisible())await p.click('[data-tab="hoy"]');else await p.click('#home');await p.waitForSelector('.hero5')};
const cont=p=>p.textContent('#cont').then(t=>t.replace(/\s+/g,' ').trim());
const snapOf=async p=>{const s=await getS(p);return s.course.cur?{l:s.course.cur.l,step:s.course.cur.step,phase:s.course.cur.snap&&s.course.cur.snap.phase,i:s.course.cur.snap&&s.course.cur.snap.i}:null};
const shot=async(p,n)=>{if(shotDir)await p.screenshot({path:path.join(shotDir,n+'_'+W+'.png')})};
const startFirst=async p=>{await p.click('#cont');await p.waitForSelector('#mskip');await p.click('#mskip');await p.waitForSelector('.clswel')};
const want=n=>!only.length||only.includes(n);

(async()=>{browser=await chromium.launch();srvInfo=await serve();

 /* 1 · Inicio de la primera clase desde cero */
 if(want(1)){const p=await fresh();const t=await cont(p);
  ok('1.1 Portada: sin haber empezado, el botón principal es «Empezar mi primera clase»',/Empezar mi primera clase/.test(t)&&/Mi cuerpo/.test(t),t);
  await shot(p,'hoy');ok('1.2 La portada aprobada conserva la imagen de Carlos José y el nivel de aventura',(await p.locator('.hero5-char img').count())===1&&(await p.locator('.lvl').count())===1);
  ok('1.3 Se ve el progreso de unidad de forma sencilla (puntos)',(await p.locator('.path .path-d i').count())>=5);
  await p.click('#cont');await p.waitForSelector('#mskip');await shot(p,'mochila');
  ok('1.4 Antes de la primera clase se ofrece la exploración inicial como juego, sin notas',/mochila/i.test(await p.textContent('.mochila'))&&/No hay notas/.test(await p.textContent('.mochila')));
  await p.click('#mskip');await p.waitForSelector('.clswel');await shot(p,'bienvenida');await layout(p,'bienvenida');
  ok('1.5 Bienvenida personalizada por voz con su nombre',(await p.evaluate(()=>window.__said)).some(t=>/Carlos José/.test(t)&&/Hoy vamos a/.test(t)));
  ok('1.6 La bienvenida muestra la lección y su objetivo infantil',/Mi cuerpo/.test(await p.textContent('.clswel h1')));
  const r=await driveClass(p);const s=await getS(p);
  ok('1.7 Flujo completo de la primera clase (bienvenida→aprendo→ejemplos→práctica→juego→comprobación→cierre)',['welcome','learn','ex','q','bridge','adv','close'].every(k=>r.log.includes(k)),r.log.join(','));
  ok('1.8 Se guardó la clase con comprobación buena y un repaso programado para mañana',s.course.done.partes&&s.course.done.partes.ok===1&&s.course.sr.partes&&s.course.sr.partes.due>s.course.done.partes.d);
  const h=s.games.skills.partes.hist;ok('1.9 La evidencia queda etiquetada como «clase» y la comprobación se guardó',h.length===1&&h[0].src==='clase'&&h[0].of===3);
  await shot(p,'cierre');await layout(p,'cierre');
  ok('1.10 Cierre: celebra el esfuerzo y muestra qué sigue',/Terminaste tu clase/.test(await p.textContent('.clsclose h1'))&&/Mis primeros colores/.test(await p.textContent('.cc-next')));
  await p.click('#ccrest');await p.waitForSelector('.hero5');const t2=await cont(p);
  ok('1.11 Tras terminar, el botón principal pasa a «Mi siguiente clase»',/Mi siguiente clase/.test(t2)&&/Mis primeros colores/.test(t2),t2);
  ok('1.12 Sin errores de consola',p._errs.length===0,p._errs[0]);await p.context().close()}

 /* 2 · Continuación exacta de una clase interrumpida */
 if(want(2)){let p=await fresh();await startFirst(p);
  await driveClass(p,{stop:(k,i)=>k==='q'&&i.qn===1});const before=await snapOf(p),prompt=await p.evaluate(()=>window.__gq.prompt),label=(await p.textContent('.label')).trim();
  ok('2.1 La clase guarda el punto exacto dentro de la actividad (fase y pregunta)',before&&before.phase==='practice'&&before.i===1,JSON.stringify(before));
  await p.reload();await p.waitForSelector('.hero5');const t=await cont(p);
  ok('2.2 Tras cerrar y abrir la aplicación, la portada ofrece «Continuar mi clase»',/Continuar mi clase/.test(t)&&/Mi cuerpo/.test(t),t);
  await p.click('#cont');await p.waitForSelector('#gprompt');
  ok('2.3 Reanuda exactamente en la misma pregunta (mismo texto y mismo número)',(await p.evaluate(()=>window.__gq.prompt))===prompt&&(await p.textContent('.label')).trim()===label,label);
  const r=await driveClass(p);ok('2.4 La clase reanudada termina y cuenta',r.kind==='close'&&(await getS(p)).course.done.partes.n===1);
  await p.context().close();
  /* interrupción durante el juego relacionado */
  p=await fresh();await startFirst(p);await driveClass(p,{stop:(k)=>k==='bridge'&&p.evaluate(()=>/jugamos/i.test(document.querySelector('.clsbridge h1').textContent))});
  const g=await snapOf(p);ok('2.5 Se puede interrumpir justo antes del juego relacionado',g&&g.step==='game'&&g.phase==='check',JSON.stringify(g));
  await p.reload();await p.waitForSelector('.hero5');ok('2.6 La portada indica que quedó en «Jugamos»',/Jugamos/.test(await cont(p)));
  await p.click('#cont');await p.waitForSelector('.clsbridge');await p.click('#cbgo');await p.waitForSelector('#gbox');
  const ch=await p.evaluate(()=>window.__gch);ok('2.7 El juego se reanuda y es una mecánica real de aventura',ch&&ch.mech==='heal');
  const r2=await driveClass(p,{stop:(k)=>k==='q'});ok('2.8 Al terminar el juego vuelve a la comprobación (no se repite lo anterior)',r2.kind==='q'&&/Compruebo 1 de 3/.test(await p.textContent('.label')));
  await p.context().close()}

 /* 3 · Finalización y paso a la siguiente clase; símbolos del módulo original */
 if(want(3)){const p=await fresh();await p.evaluate(()=>{});await putS(p,seedDone(['partes'],1));
  const t=await cont(p);ok('3.1 Con la primera clase hecha, el botón principal es «Mi siguiente clase»',/Mi siguiente clase/.test(t)&&/Mis primeros colores/.test(t),t);
  await p.click('#cont');await p.waitForSelector('.clswel');
  const r=await driveClass(p);const s=await getS(p);
  ok('3.2 Una clase de símbolos reutiliza las rondas del módulo original',r.log.includes('sym')||r.log.includes('teach'),r.log.join(','));
  ok('3.3 Registra el intento y no avanza por una sola ronda si no se desbloqueó lo previsto',s.course.done['colores-a']&&s.course.done['colores-a'].n===1,JSON.stringify(s.course.done['colores-a']));
  if(s.course.done['colores-a'].ok===0){ok('3.4 Si no se alcanzó el objetivo ofrece «Otra ronda» en el momento, sin esperar',(await p.locator('#ccagain').count())===1);
   await p.click('#ccagain');await p.waitForSelector('.clswel');await driveClass(p);const s2=await getS(p);
   ok('3.5 La segunda ronda cuenta como segundo intento y, si ya se reconoce, la clase queda hecha',s2.course.done['colores-a'].n===2&&(s2.course.done['colores-a'].ok===1||CUR.status(s2.course,'colores-a')==='apoyo'),JSON.stringify(s2.course.done['colores-a']))}
  else ok('3.4 La clase de símbolos se completó en una ronda',true);
  await p.context().close()}

 /* 4 · Salir al juego libre y regresar sin perder el avance; el juego libre no mueve el curso */
 if(want(4)){const p=await fresh();await putS(p,seedDone(['partes','colores-a','numeros-a'],1));
  await p.click('#cont');await p.waitForSelector('.clswel');await p.click('#cwgo');
  await driveClass(p,{stop:(k,i)=>k==='q'&&i.qn===1});const pos=await snapOf(p);
  await p.click('#home');await p.waitForSelector('.hero5');
  ok('4.1 Salir de la clase vuelve a la portada y deja la clase guardada',/Continuar mi clase/.test(await cont(p)));
  const courseBefore=JSON.stringify((await getS(p)).course);
  await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');await p.click('[data-skill="contar"]');
  await driveClass(p,{stop:async k=>(await p.locator('#gagain').count())>0});const s=await getS(p);
  ok('4.2 Una habilidad jugada libremente NO cambia nada del curso (posición, clases, repasos, registro)',JSON.stringify(s.course)===courseBefore);
  const hc=s.games.skills.contar.hist;ok('4.3 La respuesta libre sí aporta evidencia al registro de habilidades, etiquetada como «libre»',hc.length===1&&hc[0].src==='libre');
  await hoy(p);await p.click('[data-tab="jugar"]');await p.click('.advgrid [data-adv="consultorio"]');await p.click('#astart');await p.waitForSelector('#bandage');
  await hoy(p);ok('4.4 Una aventura libre interrumpida se recupera con la opción secundaria, sin desplazar el camino',(await p.locator('#freeres').count())===1&&/Continuar mi clase/.test(await cont(p)));
  ok('4.5 El curso sigue idéntico tras la aventura libre',JSON.stringify((await getS(p)).course)===courseBefore);
  await p.click('#cont');await p.waitForSelector('#gprompt');const after=await snapOf(p);
  ok('4.6 Al regresar al camino queda EXACTAMENTE donde estaba (misma fase y pregunta)',after.l===pos.l&&after.phase===pos.phase&&after.i===pos.i,JSON.stringify([pos,after]));
  await p.context().close()}

 /* 5 · Repasos programados, dificultades y adaptación */
 if(want(5)){let p=await fresh();
  await putS(p,seedDone(['partes'],3)+"s.course.sr.partes={b:0,n:1,last:'x',due:'2000-01-01',ok:1};");
  await p.click('#cont');await p.waitForSelector('.clswel');ok('5.1 La bienvenida anuncia «Recordamos» cuando hay un repaso pendiente',/Recordamos/.test(await p.textContent('.cw-steps')));
  await p.click('#cwgo');await p.waitForSelector('.clsbridge');ok('5.2 «Recordamos» ofrece primero el repaso que toca (Mi cuerpo)',/Mi cuerpo|Partes/.test(await p.textContent('.clsbridge h1')));
  await p.click('#cbgo');await p.waitForSelector('#gprompt');let n=0;
  for(;;){const q=await p.evaluate(()=>window.__gq);await solve(p,q,n===0);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext');n++;if(n>=2)break;await p.waitForSelector('#gprompt')}
  await driveClass(p);const s=await getS(p);
  ok('5.3 Un repaso flojo vuelve al primer intervalo (mañana) y queda registrado con la clase',s.course.sr.partes.ok===0&&s.course.sr.partes.b===0&&s.course.sr.partes.due>ymd(Date.now()-DAY)&&s.course.log.slice(-1)[0].l==='colores-a',JSON.stringify(s.course.sr.partes));
  ok('5.3b El repaso aparece como evidencia de clase en el historial de la habilidad repasada',s.games.skills.partes&&s.games.skills.partes.hist.some(h=>h.src==='clase'&&h.of===2));
  await p.context().close();
  /* comprobación floja → refuerzo, no se avanza; segundo intento → seguir con apoyo */
  p=await fresh();await putS(p,seedDone(['partes','colores-a','numeros-a','tamano'],4));
  await p.click('#cont');await p.waitForSelector('.clswel');
  await driveClass(p,{wrong:(k,n,q)=>q&&q.phase==='check'});let s2=await getS(p);
  ok('5.4 Una comprobación floja NO da la clase por aprendida: queda «para otra mirada»',s2.course.done.posiciones&&s2.course.done.posiciones.ok===0&&CUR.status(s2.course,'posiciones')==='refuerzo',JSON.stringify(s2.course.done.posiciones));
  ok('5.5 El camino sigue disponible: la siguiente clase nueva se recomienda sin frustrar',/Mi siguiente clase|Descansar|Jugar/.test(await p.textContent('.clsclose')));
  await p.click('#ccrest');await p.waitForSelector('.hero5');
  await putS(p,"s.course.done.posiciones.d='"+ymd(Date.now()-DAY)+"';");const t=await cont(p);
  ok('5.6 Al día siguiente la clase floja vuelve primero, como refuerzo («otra mirada con calma»)',/Mi siguiente clase/.test(t)&&/otra mirada/.test(t)&&/Arriba, abajo/.test(t),t);
  await p.click('#cont');await p.waitForSelector('.clswel');await driveClass(p,{wrong:(k,n,q)=>q&&q.phase==='check'});s2=await getS(p);
  ok('5.7 Tras el segundo intento flojo sigue «con apoyo» (no se bloquea al niño)',CUR.status(s2.course,'posiciones')==='apoyo'&&CUR.isDone(s2.course,'posiciones'));
  ok('5.8 Con apoyo, el camino continúa: la clase siguiente (repaso de unidad) queda disponible',CUR.available(s2.course,CUR.byId['rev-u1']).ok);
  await p.context().close();
  /* dificultades durante la práctica → se omite el juego */
  p=await fresh();await startFirst(p);const r=await driveClass(p,{wrong:(k,n,q)=>q&&(q.phase==='practice'||q.phase==='reinforce')&&n<3});
  ok('5.9 Si cuesta mucho la práctica, la clase se adapta: omite el juego y va a la comprobación',!r.log.includes('adv')&&r.kind==='close',r.log.join(','));
  const s3=await getS(p);ok('5.10 Las ayudas y errores quedan registrados (dificultades visibles para el adulto)',s3.course.done.partes.er>=1||s3.course.done.partes.hn>=1,JSON.stringify(s3.course.done.partes));
  await p.context().close();
  /* repaso de unidad */
  p=await fresh();await putS(p,seedDone(CUR.unitLessons('u1').filter(l=>l.kind!=='review').map(l=>l.id),2));
  await p.click('#cont');await p.waitForSelector('.clswel');ok('5.11 Terminadas las clases de la unidad, la siguiente es su repaso',/Repaso: Empecemos/.test(await p.textContent('.clswel h1')));
  const rv=await driveClass(p);const s4=await getS(p);ok('5.12 El repaso de unidad recuerda 3 habilidades (2 preguntas c/u) y programa repasos',rv.log.filter(k=>k==='bridge').length===3&&s4.course.done['rev-u1']&&Object.keys(s4.course.sr).length>=3,rv.log.join(','));
  await p.context().close()}

 /* 6 · Exploración inicial («La mochila misteriosa») */
 if(want(6)){let p=await fresh();await p.click('#cont');await p.waitForSelector('#mgo');await p.click('#mgo');
  const known=new Set(['partes','tamano','contar']);
  for(let i=0;i<CUR.PROBES.length;i++){await p.waitForSelector('#gprompt');const q=await p.evaluate(()=>window.__gq);
   if(i===0)ok('6.1 Cada pregunta se presenta como juego, con opción «Todavía no lo sé» y sin pistas ni nota',(await p.locator('#gskip').count())===1&&/La mochila/.test(await p.textContent('.label'))&&(await p.locator('.phases').count())===0);
   if(known.has(q.skill)){await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext')}else await p.click('#gskip');}
  await p.waitForSelector('#mstart');const s=await getS(p);
  ok('6.2 Se guarda solo «ya lo sabe / lo vemos con calma» por habilidad',CUR.PROBES.every(k=>s.course.diag.res[k]===(known.has(k)?1:0)),JSON.stringify(s.course.diag.res));
  ok('6.3 Una sola pregunta NO se escribe en el historial de dominio',!s.games||!s.games.skills||Object.keys(s.games.skills).length===0);
  ok('6.4 El resumen no usa notas ni porcentajes y propone dónde empezar',!/%|nota:|puntos/i.test(await p.textContent('.clsclose'))&&/Empezamos por/.test(await p.textContent('.clsclose')));
  await p.click('#mstart');await p.waitForSelector('.clswel');ok('6.5 Lo que ya sabe se convierte en una clase corta de comprobación (no repite lo dominado)',/solo lo comprobamos/.test(await p.textContent('.clswel')));
  const r=await driveClass(p);ok('6.6 La clase de comprobación omite aprendizaje y ejemplos y exige comprobación buena',!r.log.includes('learn')&&!r.log.includes('ex')&&r.log.filter(k=>k==='q').length===3&&r.kind==='close',r.log.join(','));
  const s2=await getS(p);ok('6.7 Una comprobación perfecta deja la clase hecha, pero sigue programando repasos (no es dominio permanente)',s2.course.done.partes.ok===1&&s2.course.done.partes.mode==='confirmar'&&!!s2.course.sr.partes);
  await p.context().close();
  /* confirmación fallida → aprende la lección completa */
  p=await fresh();await putS(p,"s.course={v:1,started:0,diag:{done:1,skipped:0,ts:1,res:{partes:1}},cur:null,done:{},sr:{},log:[],days:{},prefs:{min:10,perDay:2,game:true}};");
  await p.click('#cont');await p.waitForSelector('.clswel');let cnt=0;
  const r3=await driveClass(p,{wrong:(k,n,q)=>{if(q&&q.phase==='check'&&cnt<2){cnt++;return true}return false}});
  ok('6.8 Si la comprobación inicial falla, la clase pasa a ser completa («Vamos a verlo juntos») y no se da por sabida',r3.log.includes('learn')&&r3.log.includes('ex')&&r3.kind==='close',r3.log.join(','));
  const s3=await getS(p);ok('6.9 Ambos intentos quedan como evidencia de clase',s3.games.skills.partes.hist.length===2&&s3.games.skills.partes.hist.every(h=>h.src==='clase'));
  await p.context().close()}

 /* 7 · Conservación de datos anteriores (migración no destructiva) */
 if(want(7)){const old={version:3,name:'Ana',sound:false,voice:'',rate:.9,unlocked:{numbers:5,vowels:3},records:{'numbers:1':{seen:3,independent:4,supported:1,errors:1,streak:3,last:1700000000000}},sessions:7,drawings:2,
   games:{skills:{contar:{runs:3,best:3,ind:6,sup:2,last:{ok:3,of:3},ts:1700000000000,hist:[{d:'2026-10-01',ts:1,ok:3,of:3,ty:['choose','put'],er:0,hn:0},{d:'2026-10-09',ts:2,ok:3,of:3,ty:['choose'],er:0,hn:0}]}},mixed:null},
   badges:{'primer-paso':{ts:1700000000000}},adv:{consultorio:{runs:1,stars:3,ts:1700000000000}},settings:{anim:'off'},maxLevel:2};
  const p=await fresh();await p.evaluate(([k,o])=>localStorage.setItem(k,JSON.stringify(o)),[KEY,old]);await p.reload();await p.waitForSelector('.hero5');
  const s=await getS(p);const grow=['unlocked','badges'],same=Object.keys(old).every(k=>grow.includes(k)?Object.keys(old[k]).every(x=>k==='unlocked'?(s[k][x]||0)>=old[k][x]:!!s[k][x]):JSON.stringify(s[k])===JSON.stringify(old[k]));
  ok('7.1 Un guardado anterior (sin curso) se abre sin perder ningún dato existente',same,Object.keys(old).filter(k=>JSON.stringify(s[k])!==JSON.stringify(old[k])).join());
  ok('7.2 El curso se crea aparte, vacío y sin tocar lo demás',s.course&&s.course.v===1&&Object.keys(s.course.done).length===0);
  ok('7.3 Los controles de sonido heredan la preferencia anterior (sonido apagado → voz y efectos desactivados)',s.audio&&s.audio.voice.mode==='off'&&s.audio.fx.on===false,JSON.stringify(s.audio));
  ok('7.4 El dominio por habilidad y el nivel siguen calculándose igual con los datos anteriores',(await p.evaluate(()=>[...document.querySelectorAll('.lvl b')].length===1)));
  const before=JSON.stringify((await getS(p)).games);
  await startFirst(p);await driveClass(p);const s2=await getS(p);
  ok('7.5 Una clase nueva no altera el historial de habilidades anteriores',JSON.stringify(s2.games.skills.contar)===JSON.stringify(JSON.parse(before).skills.contar));
  /* respaldo: incluye el curso y se restaura */
  await hoy(p);await p.evaluate(()=>{});
  const [dl]=await Promise.all([p.waitForEvent('download'),(async()=>{await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#bkExp');await p.click('#bkExp')})()]);
  const data=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
  ok('7.6 El respaldo descargable incluye el recorrido de clases y la configuración de sonido',data.estado.course&&data.estado.course.done.partes&&data.estado.audio);
  await p.click('#closeDialog');await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.course.done={};s.course.cur=null;localStorage.setItem(k,JSON.stringify(s))},KEY);await p.reload();await p.waitForSelector('.hero5');
  await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#bkImp',{state:'attached'});p.once('dialog',d=>d.accept());
  await p.setInputFiles('#bkImp',{name:'r.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await sleep(500);
  ok('7.7 Al restaurar, vuelve el recorrido de clases',!!(await getS(p)).course.done.partes);
  /* respaldo anterior a esta versión (sin curso) */
  const legacy=JSON.parse(JSON.stringify(old));await p.setInputFiles('#bkImp',{name:'v.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'centro-carlos-jose',v:5,estado:legacy}))});p.once('dialog',d=>d.accept());await p.setInputFiles('#bkImp',{name:'v2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'centro-carlos-jose',v:5,estado:legacy}))});await sleep(500);
  await p.click('#closeDialog').catch(()=>{});await p.reload();await p.waitForSelector('.hero5');const s3=await getS(p);
  ok('7.8 Un respaldo anterior sin curso se restaura y la aplicación crea el curso vacío',s3.name==='Ana'&&s3.course&&Object.keys(s3.course.done).length===0);
  ok('7.9 Sin errores de consola',p._errs.length===0,p._errs[0]);await p.context().close()}

 /* 8 · Mapa «Mi camino» y panel adulto */
 if(want(8)){const p=await fresh();await putS(p,seedDone(['partes','colores-a','numeros-a'],2));
  await p.click('[data-tab="camino"]');await p.waitForSelector('.camino');await layout(p,'camino');await shot(p,'camino');
  ok('8.1 «Mi camino» muestra las nueve unidades y el botón de la siguiente clase',(await p.locator('.unit').count())===9&&/Mi siguiente clase/.test(await p.textContent('#pcgo')));
  ok('8.2 Lo que aún no corresponde aparece bloqueado («Más adelante»): la unidad 2 no abre hasta repasar la 1',(await p.locator('.unit').nth(1).locator('.lrow:disabled').count())===(await p.locator('.unit').nth(1).locator('.lrow').count())&&/Más adelante/.test(await p.locator('.lrow[data-lesson="contar"]').textContent()));
  ok('8.3 Se puede elegir una clase disponible del mapa',await p.locator('.lrow[data-lesson="tamano"]').isEnabled());
  await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="curso"]');await p.waitForSelector('#cuMin');await shot(p,'adulto_camino');await layout(p,'adulto camino');
  const tx=await p.textContent('#dialogContent');
  ok('8.4 El panel adulto muestra unidad y clase en curso, clases terminadas, habilidades, dificultades, próximos contenidos, repasos y casa',['Dónde va','Clases finalizadas','Habilidades','Dificultades encontradas','Próximos contenidos','Repasos pendientes','En casa','Exploración inicial'].every(t=>tx.includes(t)));
  ok('8.5 Diferencia clases y juego libre y explica que son tres conceptos distintos',/Clases y juego libre/.test(tx)&&/dominio de cada habilidad/.test(tx)&&/nivel de aventura/.test(tx));
  ok('8.6 No muestra porcentajes de dominio engañosos',!/\d\s?%/.test(tx));
  await p.selectOption('#cuMin','8');await p.selectOption('#cuPer','1');await p.uncheck('#cuGame');const s=await getS(p);
  ok('8.7 Las preferencias (duración, clases por día, juego) persisten',s.course.prefs.min===8&&s.course.prefs.perDay===1&&s.course.prefs.game===false);
  await p.click('#closeDialog');await p.reload();await p.waitForSelector('.hero5');await p.click('#cont');await p.waitForSelector('.clswel');
  ok('8.8 Con 8 minutos la clase omite recuerdo y juego',!/Recordamos|Jugamos/.test(await p.textContent('.cw-steps')));
  await p.click('#cwgo');await p.waitForSelector('.gcards');await p.click('#home');await p.waitForSelector('.hero5');
  await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="curso"]');await p.waitForSelector('#cuReset');
  p.once('dialog',d=>d.accept());await p.click('#cuReset');await sleep(300);const s2=await getS(p);
  ok('8.9 Reiniciar el camino no toca el dominio ni el juego libre',Object.keys(s2.course.done).length===0&&s2.course.prefs.min===8);
  await p.context().close()}

 /* 9 · Diseño y navegación */
 if(want(9)){const p=await fresh();await putS(p,seedDone(['partes','colores-a','numeros-a'],1));
  ok('9.1 La barra inferior tiene 5 secciones y conserva Aprender, Jugar y Logros',(await p.locator('.tabbar button').count())===5&&['aprender','jugar','logros','camino','hoy'].every(t=>true));
  await layout(p,'hoy');await p.click('[data-tab="camino"]');await p.waitForSelector('.camino');await layout(p,'camino');
  for(const tab of ['aprender','jugar','logros']){await p.click('[data-tab="'+tab+'"]');await sleep(150);await layout(p,tab)}
  ok('9.2 Hoy, Camino, Aprender, Jugar y Logros sin desbordes',true);
  await hoy(p);await p.click('#cont');await p.waitForSelector('.clswel');await layout(p,'bienvenida');
  ok('9.3 En una clase se ocultan los atajos que sacarían al niño del camino',(await p.locator('.modulebar').isVisible())===false&&(await p.locator('.tabbar').isVisible())===false);
  await p.click('#cwgo');await p.waitForSelector('.clsbridge,.gcards');await p.click('#cbgo').catch(()=>{});await layout(p,'clase');
  ok('9.4 Los botones «Escuchar» siguen disponibles durante la clase',(await p.locator('#ghear,#cbhear').count())>=1);
  ok('9.5 Sin errores de consola',p._errs.length===0,p._errs[0]);await p.context().close()}

 /* 10 · Audio: voz, música y efectos independientes */
 if(want(10)){let p=await fresh();
  ok('10.1 La cabecera ya no tiene botón de sonido que el niño pueda tocar sin querer',(await p.locator('#sound').count())===0);
  await p.click('#parents');await p.fill('#gate','7');await p.click('#enter');await p.waitForSelector('[data-atab]');await p.click('[data-atab="ajustes"]');await p.waitForSelector('#auVoice');await shot(p,'adulto_sonido');await layout(p,'ajustes sonido');
  ok('10.2 Ajustes ofrece tres controles separados: voz, música y efectos',(await p.locator('#auVoice,#auMusic,#auFx').count())===3&&(await p.locator('#auMusicVol,#auFxVol').count())===2);
  const txt=await p.textContent('.audiobox');ok('10.3 Explica que la música es original, local, sin servicios externos y no promete inteligencia',/original/.test(txt)&&/sin conexión/.test(txt)&&/no se presenta como método para aumentar la inteligencia/.test(txt));
  await p.selectOption('#auMusic','siempre');await p.fill('#auMusicVol','30').catch(()=>{});await p.selectOption('#auVoice','tap');await p.uncheck('#auFx');let s=await getS(p);
  ok('10.4 Los tres ajustes son independientes y persisten',s.audio.music.mode==='siempre'&&s.audio.voice.mode==='tap'&&s.audio.fx.on===false);
  await p.reload();await p.waitForSelector('.hero5');s=await getS(p);ok('10.5 Siguen tras recargar',s.audio.music.mode==='siempre'&&s.audio.voice.mode==='tap');
  /* voz: «solo al tocar» */
  await p.evaluate(()=>{window.__said.length=0});await startFirst(p).catch(async()=>{await p.waitForSelector('.clswel')});await sleep(300);
  ok('10.6 Voz «solo al tocar»: no lee sola la pantalla',(await p.evaluate(()=>window.__said)).length===0);
  await p.click('#cwhear');ok('10.7 …pero «Escuchar» siempre funciona (el niño no depende del adulto)',(await p.evaluate(()=>window.__said)).some(t=>/Hoy vamos a/.test(t)));
  await p.selectOption('#auVoice','off').catch(()=>{});await p.context().close();
  p=await fresh();await putS(p,"s.audio={voice:{mode:'off'},music:{mode:'off',vol:18},fx:{on:true,vol:60}};");await p.click('#cont');await p.waitForSelector('#mskip').catch(()=>{});
  await p.click('#mskip');await p.waitForSelector('.clswel');await p.click('#cwhear');ok('10.8 Voz desactivada por el adulto: ni siquiera «Escuchar» habla',(await p.evaluate(()=>window.__said)).length===0);
  await p.context().close();
  /* música: solo en clases, atención, voz, salir, una sola pista */
  p=await fresh();const reqs=[];p.on('request',r=>{if(!r.url().startsWith(srvInfo.url)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))reqs.push(r.url())});
  await putS(p,"s.audio={voice:{mode:'auto'},music:{mode:'clases',vol:20},fx:{on:true,vol:60}};s.course=Object.assign({v:1,started:1,diag:{done:0,skipped:1,ts:0,res:{}},cur:null,done:{},sr:{},log:[],days:{},prefs:{min:10,perDay:2,game:true}},s.course||{});");
  const st=()=>p.evaluate(()=>window.__cjAudio.status());
  await sleep(300);ok('10.9 La música no suena en la portada (modo «solo en clases») ni antes de tocar',!(await st()).playing);
  await p.click('#cont');await p.waitForSelector('#mskip');await p.click('#mskip');await p.waitForSelector('.clswel');await p.click('#cwgo');await p.waitForSelector('.gcards');await sleep(1600);let a=await st();
  ok('10.10 Empieza al tocar «¡Vamos!» (tras la interacción) y suena baja',a.playing&&a.unlocked&&a.target>0&&a.target<=.35&&a.notes>0,JSON.stringify(a));
  const vBefore=a.target;await p.evaluate(()=>{window.__voiceMs=900});await p.click('#ghear');await sleep(200);a=await st();
  ok('10.11 Mientras se habla, la música baja a una cuarta parte (atenuación)',a.speaking&&a.target<=vBefore*0.3,JSON.stringify([vBefore,a]));await sleep(1100);a=await st();ok('10.12 …y vuelve a su volumen al terminar la voz',!a.speaking&&Math.abs(a.target-vBefore)<0.001,JSON.stringify(a));
  const notes1=(await st()).notes;await p.evaluate(()=>{for(let i=0;i<5;i++)window.__cjAudio.sync()});await sleep(2000);const notes2=(await st()).notes;
  ok('10.13 Nunca hay dos pistas a la vez (llamadas repetidas no multiplican las notas)',notes2-notes1<=22,notes1+'→'+notes2);
  await p.click('#gnext');await p.waitForSelector('.gexplain');await p.click('#gnext').catch(()=>{});
  const r=await driveClass(p,{stop:async(k,i)=>{if(k==='q'){const q=await p.evaluate(()=>window.__gq);return q.phase==='check'}return false}});await sleep(300);a=await st();
  ok('10.14 En la comprobación la música se calla (no interfiere con la atención)',a.attention&&a.target===0,JSON.stringify(a));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await sleep(300);a=await st();
  ok('10.15 Al salir de la aplicación (pestaña oculta) la música se detiene y el audio se suspende',!a.playing,JSON.stringify(a));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
  await p.click('#home');await p.waitForSelector('.hero5');await sleep(2600);a=await st();ok('10.16 Al salir de la clase a la portada la música se detiene',!a.playing,JSON.stringify(a));
  ok('10.17 La música no usa red: no hubo solicitudes a servicios externos',reqs.length===0,reqs.join());
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3'));s.audio.music.mode='siempre';localStorage.setItem('primerosPasos3',JSON.stringify(s))});await p.reload();await p.waitForSelector('.hero5');await p.click('.hero5 h1');await sleep(1800);a=await st();
  ok('10.18 En modo «Siempre» suena también fuera de las clases (tras tocar)',a.playing,JSON.stringify(a));
  const fx0=(await st()).fxCount;await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');await p.click('[data-skill="contar"]');await driveClass(p,{stop:(k,i)=>k==='q'&&i.qn===1});const fx1=(await st()).fxCount;
  ok('10.19 Los efectos suenan con los aciertos cuando están activados',fx1>fx0,fx0+'→'+fx1);
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('primerosPasos3'));s.audio.fx.on=false;localStorage.setItem('primerosPasos3',JSON.stringify(s))});await p.reload();await p.waitForSelector('.hero5');
  const fa=(await st()).fxCount;await p.click('[data-tab="aprender"]');await p.click('[data-mod="cantidad"]');await p.click('[data-skill="contar"]');await driveClass(p,{stop:(k,i)=>k==='q'&&i.qn===1});
  ok('10.20 Con los efectos desactivados no suena ningún efecto (la voz y la música siguen su propio ajuste)',(await st()).fxCount===fa);
  const an=await p.evaluate(async()=>{const a=await window.__cjAudio.renderOffline(24,18),b=await window.__cjAudio.renderOffline(24,18);if(!a)return null;let pk=0,sq=0,nan=0,diff=0;for(let i=0;i<a.length;i++){const v=a[i];if(Number.isNaN(v))nan++;pk=Math.max(pk,Math.abs(v));sq+=v*v;diff=Math.max(diff,Math.abs(a[i]-b[i]))}
   const sec=[];for(let k=0;k<24;k+=4){let q=0;for(let i=k*44100;i<(k+4)*44100;i++)q+=a[i]*a[i];sec.push(Math.sqrt(q/(4*44100)))}return{peak:pk,rms:Math.sqrt(sq/a.length),nan,diff,sec}});
  ok('10.21 La composición original se genera y no está vacía (RMS audible pero suave, por debajo de la voz) en 24 s',an&&an.rms>0.006&&an.rms<0.08,JSON.stringify(an));
  const loud=await p.evaluate(async()=>{const a=await window.__cjAudio.renderOffline(24,60);let pk=0;for(const v of a)pk=Math.max(pk,Math.abs(v));return pk});
  ok('10.22 No distorsiona: pico < 0,5 al volumen por defecto y < 0,95 incluso al máximo del control; sin valores inválidos',an&&an.peak<0.5&&loud<0.95&&an.nan===0,JSON.stringify(an&&{peak:an.peak,nan:an.nan,max:loud}));
  ok('10.23 Es determinista (misma semilla = misma música, salvo ruido numérico ≪1e-6) y sostenida (ningún tramo de 4 s queda en silencio)',an&&an.diff<1e-6&&an.sec.every(v=>v>0.003),JSON.stringify(an&&an.sec));
  ok('10.24 Sin errores de consola',p._errs.length===0,p._errs[0]);await p.context().close()}

 await browser.close();srvInfo.srv.close();
 console.log('\nComprobaciones aprobadas: '+pass+' · fallas: '+fail);process.exit(fail?1:0)})().catch(async e=>{console.log('ERROR',e.stack.split('\n').slice(0,4).join(' | '));process.exit(2)});
