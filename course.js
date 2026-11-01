/* Orquestador de clases guiadas («Mi camino de aprendizaje»).
   NO es otro motor educativo: ordena y encadena lo que ya existe (openSkill con sus cinco fases, rondas de símbolos del módulo original,
   retos de aventura) según el currículo de curriculum.js. Todo el estado propio vive en state.course; el juego libre nunca lo modifica. */
(function(root){
'use strict';
root.CourseUI=function(K,G,Adv,Sh){
const CUR=root.Curriculum,C=root.Content,P=root.Progress,esc=K.escape;
const qa=(sel,r)=>Array.from((r||document).querySelectorAll(sel)),q1=(sel,r)=>(r||document).querySelector(sel);
const S=()=>K.state(),course=()=>CUR.ensure(S()),nm=()=>Sh.nm(),now=()=>Date.now(),save=()=>K.save();
let act=false,news=null;
const speak=(t,tap)=>tap&&K.speakTap?K.speakTap(t):K.speak(t);
function env(){const sn=Sh.snapshot();return{states:sn.states,sym:K.symCounts(),sn}}
const unitOf=l=>CUR.units[CUR.unitIndex(l.unit)];
const titleOf=id=>C.byId[id]?C.byId[id].title:id;
const PHASE_L={learn:'Aprendo',examples:'Ejemplos',practice:'Practico',reinforce:'Refuerzo',check:'Compruebo'};

/* ---------- estado visible desde la portada ---------- */
function stepLabel(cur){if(!cur)return'';if(cur.step==='welcome')return'Al empezar';if(cur.step==='game')return'Jugamos';if(cur.step==='recall')return'Recordamos';
 if(cur.snap&&cur.snap.phase)return PHASE_L[cur.snap.phase]||'En marcha';if(cur.items&&cur.items.length)return'Repaso '+(cur.items.length+1);return'En marcha'}
function homeInfo(){const c=course(),e=env(),n=CUR.next(c,e,now()),u=CUR.currentUnit(c),up=CUR.unitProgress(c,u.id),ls=CUR.unitLessons(u.id);
 let label,sub;
 if(n.kind==='continuar'){label='Continuar mi clase';sub=n.lesson.kid+' · '+stepLabel(c.cur)}
 else if(n.kind==='primera'){label='Empezar mi primera clase';sub=n.lesson.kid}
 else if(n.kind==='siguiente'){label='Mi siguiente clase';sub=n.lesson.kid+(n.mode==='refuerzo'?' · otra mirada con calma':n.mode==='confirmar'?' · solo lo comprobamos':'')}
 else{label='Repasar mi camino';sub='¡Recorriste todo el camino!'}
 return{label,sub,kind:n.kind,lesson:n.lesson,mode:n.mode,reason:n.reason,cur:!!c.cur,
  unit:{n:CUR.unitIndex(u.id)+1,total:CUR.units.length,title:u.title,icon:u.icon,done:up.done,total2:up.total,pips:ls.map(l=>c.cur&&c.cur.l===l.id?'c':CUR.isDone(c,l.id)?'d':CUR.status(c,l.id)==='refuerzo'?'r':'')}}}

/* ---------- pantallas puente ---------- */
function bridge(o){K.page('<div class="clsbridge"><div class="cb-i" aria-hidden="true">'+o.icon+'</div><span class="eyebrow">'+esc(o.eyebrow||'Mi clase')+'</span><h1>'+esc(o.title)+'</h1><p class="lead">'+esc(o.text)+'</p><div class="row center"><button class="soft" id="cbhear">♫ Escuchar</button><button class="primary xl" id="cbgo">'+esc(o.btn||'▶ Seguir')+'</button></div><div class="row center"><button class="linkb" id="cblater">Ahora no, guardar mi lugar</button></div></div>','cls:bridge');
 q1('#cbgo').onclick=o.go;q1('#cblater').onclick=pause;q1('#cbhear').onclick=()=>speak(o.say||o.text,1);speak(o.say||o.text)}

/* ---------- comenzar, pausar, reanudar ---------- */
function begin(){const c=course();if(c.cur){resume();return}const n=CUR.next(c,env(),now());if(!n.lesson){camino();return}
 if(!c.started&&!c.diag.done&&!c.diag.skipped&&!Object.keys(c.done).length){mochilaIntro();return}
 start(n.lesson,n.mode)}
function start(l,mode){const c=course();c.cur={l:l.id,mode:mode||'nueva',step:'welcome',recall:null,items:[],rs:null,game:0,struggle:0,cd:null,snap:null,t0:now(),symBefore:(K.symCounts()[l.area]||0)};save();act=true;welcome(l)}
function pause(){const c=course();act=false;if(c.cur){save();K.notice('Tu clase quedó guardada. ¡Aquí te esperamos!')}Sh.hoy()}
function abandon(){const c=course();c.cur=null;save();act=false}
function resume(){const c=course(),cur=c.cur,l=cur&&CUR.byId[cur.l];if(!l){c.cur=null;save();Sh.hoy();return}act=true;
 if(cur.step==='welcome'){welcome(l);return}
 if(cur.cd&&cur.snap){if(cur.step==='game'){G.rebuildRun(cur.snap,cur.cd,true);gameBridge(l);return}G.rebuildRun(cur.snap,cur.cd);return}
 if(cur.step==='recall'){recallStep(l);return}
 mainStep(l)}

/* ---------- bienvenida ---------- */
function planSteps(l,cur){const c=course(),steps=[],long=c.prefs.min>8;
 if(cur.mode==='confirmar'){steps.push(['⭐','Comprobamos lo que ya sabes'])}
 else if(l.kind==='skill'){if(long&&CUR.pickRecall(c,l,now()))steps.push(['🧠','Recordamos algo que ya aprendimos']);steps.push(['💡','Aprendemos y vemos ejemplos']);steps.push(['✋','Practicamos con ayudas']);if(l.game&&c.prefs.game&&long)steps.push(['🎮','Jugamos']);steps.push(['⭐','Comprobamos'])}
 else if(l.kind==='symbols'){if(long&&CUR.pickRecall(c,l,now()))steps.push(['🧠','Recordamos algo que ya aprendimos']);steps.push(['👀','Miramos y escuchamos']);steps.push(['✋','Practicamos'])}
 else steps.push(['🧠','Recordamos tres cosas']);
 steps.push(['🎉','Celebramos y vemos qué sigue']);return steps}
function welcome(l){const c=course(),cur=c.cur,u=unitOf(l),say='¡Hola, '+nm()+'! Hoy vamos a '+l.hook+'.'+(cur.mode==='confirmar'?' Ya sabes algo de esto, así que solo lo comprobamos.':cur.mode==='refuerzo'?' Lo miramos otra vez, con calma.':'');
 K.page('<div class="clswel"><span class="chip">'+u.icon+' Unidad '+(CUR.unitIndex(u.id)+1)+' · '+esc(u.title)+'</span><div class="cw-char" aria-hidden="true">'+Sh.avatar('face','cwface')+'</div><span class="eyebrow">Mi clase</span><h1>'+esc(l.kid)+'</h1><p class="lead">'+esc(say)+'</p><ol class="cw-steps">'+planSteps(l,cur).map(([e,t])=>'<li><i aria-hidden="true">'+e+'</i><span>'+esc(t)+'</span></li>').join('')+'</ol><p class="small">Unos '+c.prefs.min+' minutos, sin prisa. Puedes parar cuando quieras: tu lugar queda guardado.</p><div class="row center"><button class="soft" id="cwhear">♫ Escuchar</button><button class="primary xl" id="cwgo">▶ ¡Vamos!</button></div><div class="row center"><button class="linkb" id="cwlater">Ahora no, guardar mi lugar</button></div></div>','cls:welcome');
 q1('#cwhear').onclick=()=>speak(say,1);q1('#cwlater').onclick=pause;q1('#cwgo').onclick=()=>{if(cur.mode!=='confirmar'&&c.prefs.min>8&&CUR.pickRecall(c,l,now()))recallStep(l);else mainStep(l)};speak(say)}

/* ---------- 2 · recordamos ---------- */
function recallStep(l){const c=course(),cur=c.cur,r=CUR.pickRecall(c,l,now());if(!r){mainStep(l);return}
 cur.step='recall';cur.recall={skill:r.skill,why:r.why,done:0};cur.cd={role:'recall',l:l.id,skill:r.skill};cur.snap=null;save();
 const t=titleOf(r.skill),say='Antes de aprender algo nuevo, recordamos: '+t+'. Son solo dos preguntas.';
 bridge({icon:C.byId[r.skill].icon,eyebrow:'Recordamos',title:t,text:say,btn:'▶ Recordar',go:()=>G.openSkill(r.skill,'review',{limit:2,course:cur.cd})})}

/* ---------- 3-5 · aprendemos, ejemplos, practicamos, jugamos, comprobamos ---------- */
function mainStep(l){const c=course(),cur=c.cur;cur.step='main';cur.snap=null;
 if(l.kind==='skill'){const sk0=C.byId[l.skill];if(sk0.available&&!sk0.available(C.ctxFrom(K.E,S(),new Date()))){bridge({icon:'✏️',eyebrow:'Mi clase',title:'Falta mi nombre',text:'Para esta clase un adulto debe escribir el nombre en Ajustes. Tu lugar queda guardado.',btn:'Entendido',go:pause});return}
  const mode=({nueva:'full',refuerzo:'extra',confirmar:'review',repaso:'full'})[cur.mode]||'full';cur.cd={role:'main',l:l.id,mode:cur.mode};save();G.openSkill(l.skill,mode,{course:cur.cd})}
 else if(l.kind==='symbols'){cur.cd=null;cur.symBefore=K.symCounts()[l.area]||0;save();K.startRound(l.area,null,{l:l.id,role:'main'})}
 else reviewNext(l)}
function reviewNext(l){const c=course(),cur=c.cur;if(!cur.rs)cur.rs=CUR.reviewSkills(c,l,now());
 if(!cur.rs.length){finishLesson(l,{ok:true,ck:[0,0],mode:'repaso',items:[]});return}
 if(cur.items.length>=cur.rs.length){const g=cur.items.filter(i=>i.good).length;finishLesson(l,{ok:g>=Math.min(2,cur.items.length),ck:[g,cur.items.length],mode:'repaso',items:cur.items.map(i=>({skill:i.skill,good:i.good}))});return}
 const i=cur.items.length,sk=cur.rs[i];cur.cd={role:'review',l:l.id,skill:sk,idx:i};cur.snap=null;save();
 const say='Recordamos: '+titleOf(sk)+'. Son dos preguntas.';
 bridge({icon:C.byId[sk].icon,eyebrow:'Repaso '+(i+1)+' de '+cur.rs.length,title:titleOf(sk),text:say,btn:'▶ Recordar',go:()=>G.openSkill(sk,'review',{limit:2,course:cur.cd})})}

/* Se llama justo antes de la comprobación: si hay un juego relacionado, se juega ahora (decisión pedagógica: practicar jugando antes de comprobar). */
function beforeCheck(run){const c=course(),cur=c.cur,cd=run.course;if(!cur||!cd||cd.role!=='main'||cur.l!==cd.l)return false;const l=CUR.byId[cur.l];
 const fails=[...run.res.practice,...run.res.reinforce].filter(r=>!r.ok).length;if(fails>=3)cur.struggle=1;
 const want=l.game&&c.prefs.game&&c.prefs.min>8&&cur.mode!=='confirmar'&&cur.mode!=='repaso'&&!cur.struggle&&!cur.game;
 if(!want){save();return false}
 cur.step='game';G.snapNow();save();gameBridge(l);return true}
function gameBridge(l){const cur=course().cur;
 bridge({icon:'🎮',eyebrow:'Jugamos',title:'¡Ahora jugamos!',text:'Un juego para practicar lo que aprendimos. Después comprobamos.',btn:'▶ ¡A jugar!',
  go:()=>Adv.playChallenge(l.game.adv,l.game.ch,{onDone:()=>{cur.game=1;cur.step='main';save();G.continueRun()},onLeave:pause})})}

/* ---------- resultados que llegan de games.js y app.js ---------- */
function skillFinished(run,res,n){const c=course(),cd=run.course,cur=c.cur;news=n||null;const good=P.good({ok:res.ok,of:res.of});
 if(cd.role==='probe'){probeDone(cd,good);return}
 const l=CUR.byId[cd.l];if(!cur||!l||cur.l!==cd.l){Sh.hoy();return}
 cur.snap=null;
 if(cd.role==='recall'){cur.recall.ok=res.ok;cur.recall.of=res.of;cur.recall.good=good?1:0;cur.recall.done=1;cur.cd=null;save();K.notice(good?'¡Te acordaste! Muy bien.':'Lo vamos a repasar otra vez más adelante.');mainStep(l);return}
 if(cd.role==='review'){cur.items.push({skill:cd.skill,ok:res.ok,of:res.of,good:good?1:0});cur.cd=null;save();reviewNext(l);return}
 if(cur.mode==='confirmar'&&!good){cur.mode='nueva';cur.fell=[res.ok,res.of];cur.cd=null;save();
  bridge({icon:'🌱',eyebrow:'Mi clase',title:'Vamos a verlo juntos',text:'Esto todavía se está aprendiendo, y está bien. Lo practicamos paso a paso.',btn:'▶ Empezar',go:()=>mainStep(l)});return}
 finishLesson(l,{ok:good,ck:[res.ok,res.of],er:res.er,hn:res.hn,mode:cur.mode,bad:res.bad})}
function symbolsDone(cd,r){const c=course(),cur=c.cur,l=CUR.byId[cd.l];if(!cur||!l||cur.l!==cd.l){Sh.hoy();return}
 const after=K.symCounts()[l.area]||0,ok=cur.symBefore>=l.reach?r.ind>=3:after>=l.reach;
 finishLesson(l,{ok,ck:[r.ind,5],er:r.supported,hn:0,mode:cur.mode,reach:[cur.symBefore,after,l.reach]})}
function finishLesson(l,res){if(K.pwa)setTimeout(()=>K.pwa.noteClassEnd(),0);const c=course(),cur=c.cur;res.recall=cur&&cur.recall&&cur.recall.done?{skill:cur.recall.skill,good:cur.recall.good}:null;res.fell=cur&&cur.fell||null;
 const rec=CUR.recordLesson(c,l,res,now());save();act=false;closeScreen(l,rec,res)}

/* ---------- 8 · celebramos y mostramos qué sigue ---------- */
function closeScreen(l,rec,res){const c=course(),e=env(),n=CUR.next(c,e,now()),today=CUR.classesToday(c,now()),over=today>=c.prefs.perDay,ok=!!res.ok;
 const retrySym=l.kind==='symbols'&&!ok&&rec.n<CUR.MAX_ATTEMPTS;
 const head=ok?'¡Terminaste tu clase, '+nm()+'!':'¡Hiciste un buen esfuerzo, '+nm()+'!',
  body=ok?(l.kind==='review'?'Hoy recordaste cosas que ya sabías.':'Hoy aprendiste: '+l.kid+'.'):(retrySym?'Una ronda más y aparecen cosas nuevas.':'Esto se aprende poco a poco. Lo veremos otra vez con calma.');
 const ck=res.ck&&res.ck[1]?(l.kind==='review'?'Recordaste '+res.ck[0]+' de '+res.ck[1]+' sin ayuda.':'En la comprobación: '+res.ck[0]+' de '+res.ck[1]+' sin ayuda.'):'';
 const rc=res.recall?(res.recall.good?'Te acordaste de «'+titleOf(res.recall.skill)+'».':'Repasaremos «'+titleOf(res.recall.skill)+'» otro día.'):'';
 const nextTxt=n.lesson?'<div class="cc-next"><span class="eyebrow">Lo que sigue</span><b>'+esc(n.lesson.kid)+'</b><small>'+esc(unitOf(n.lesson).title)+'</small></div>':'<div class="cc-next"><b>¡Recorriste todo el camino!</b><small>Puedes repasar o jugar libremente.</small></div>';
 const say=head+' '+body+(n.lesson&&!over?' Mañana o ahora, sigue: '+n.lesson.kid+'.':'');
 K.page('<div class="clsclose"><div class="result-icon" aria-hidden="true">'+(ok?'🌟':'🌱')+'</div><span class="eyebrow">Clase terminada</span><h1>'+esc(head)+'</h1><p class="lead">'+esc(body)+'</p><div class="cc-detail">'+(ck?'<p>'+esc(ck)+'</p>':'')+(rc?'<p>'+esc(rc)+'</p>':'')+'<p class="small">No es una nota: es una muestra de hoy.</p></div>'+nextTxt+
  (over&&!retrySym?'<p class="small">Hoy ya hiciste '+today+' clase'+(today===1?'':'s')+'. ¡Descansar y jugar también enseña!</p>':'')+
  '<div class="row center">'+(retrySym?'<button class="primary xl" id="ccagain">▶ Otra ronda</button>':n.lesson&&!over?'<button class="primary xl" id="ccnext">▶ Mi siguiente clase</button>':'<button class="primary xl" id="ccplay">🎮 Jugar libremente</button>')+
  '<button class="soft" id="ccrest">'+(over||retrySym?(n.lesson&&!retrySym?'▶ Otra clase más':'Descansar'):'Descansar')+'</button></div></div>','cls:close');
 const nx=q1('#ccnext'),ag=q1('#ccagain'),pl=q1('#ccplay'),rs=q1('#ccrest');
 if(nx)nx.onclick=()=>start(n.lesson,n.mode);if(ag)ag.onclick=()=>start(l,'refuerzo');if(pl)pl.onclick=()=>Sh.jugar();
 rs.onclick=()=>{if(over&&n.lesson&&!retrySym)start(n.lesson,n.mode);else Sh.hoy()};
 speak(say);if(news&&K.shell)setTimeout(()=>K.shell.showNew(news),600);news=null}

/* ---------- exploración inicial: «La mochila misteriosa» ---------- */
function mochilaIntro(){const c=course(),tmp=c.diag.tmp,say='Vamos a jugar con la mochila misteriosa. Sacamos cosas y tú respondes lo que sepas. Si no sabes, tocas «Todavía no lo sé». No hay notas.';
 K.page('<div class="clsbridge mochila"><div class="cb-i" aria-hidden="true">🎒</div><span class="eyebrow">Antes de empezar</span><h1>La mochila misteriosa</h1><p class="lead">Sacamos cosas de la mochila y respondes lo que sepas. Así sabemos por dónde empezar. <b>No hay notas ni errores.</b></p><p class="small">Son '+CUR.PROBES.length+' preguntas cortas, unos 4 minutos.'+(tmp&&tmp.idx?' Ya llevabas '+tmp.idx+'.':'')+'</p><div class="row center"><button class="soft" id="mhear">♫ Escuchar</button><button class="primary xl" id="mgo">🎒 '+(tmp&&tmp.idx?'Seguir con la mochila':'Abrir la mochila')+'</button></div><div class="row center"><button class="soft" id="mskip">Empezar desde cero</button><button class="linkb" id="mlater">Ahora no</button></div></div>','cls:mochila');
 q1('#mhear').onclick=()=>speak(say,1);q1('#mgo').onclick=()=>{act=true;c.diag.tmp=c.diag.tmp||{idx:0,res:{}};save();probe(c.diag.tmp.idx)};
 q1('#mskip').onclick=()=>{CUR.applyDiag(c,{},now(),true);delete c.diag.tmp;save();const n=CUR.next(c,env(),now());start(n.lesson,n.mode)};q1('#mlater').onclick=()=>Sh.hoy();speak(say)}
function probe(i){const c=course();if(i>=CUR.PROBES.length){mochilaEnd();return}c.diag.tmp=c.diag.tmp||{idx:0,res:{}};c.diag.tmp.idx=i;save();
 const skill=CUR.PROBES[i];G.openSkill(skill,'review',{limit:1,course:{role:'probe',l:'diag',idx:i,n:CUR.PROBES.length,skill}})}
function probeDone(cd,good){const c=course();c.diag.tmp=c.diag.tmp||{idx:0,res:{}};c.diag.tmp.res[cd.skill]=good?1:0;c.diag.tmp.idx=cd.idx+1;save();probe(cd.idx+1)}
function mochilaEnd(){const c=course(),res=c.diag.tmp?c.diag.tmp.res:{};CUR.applyDiag(c,res,now(),false);delete c.diag.tmp;save();act=false;
 const sm=CUR.diagSummary(c),n=CUR.next(c,env(),now()),say='¡Terminamos la mochila, '+nm()+'! Ya sé por dónde empezamos.';
 K.page('<div class="clsclose"><div class="result-icon" aria-hidden="true">🎒</div><span class="eyebrow">¡Terminamos!</span><h1>'+esc(say)+'</h1><div class="cc-detail">'+(sm.known.length?'<p><b>Ya conoces algo de:</b> '+sm.known.map(k=>esc(C.byId[k].icon+' '+C.byId[k].title)).join(' · ')+'. Esas clases serán más cortas: solo las comprobamos.</p>':'<p>Empezamos con lo más sencillo, paso a paso.</p>')+(sm.later.length?'<p><b>Lo vamos a aprender juntos:</b> '+sm.later.map(k=>esc(C.byId[k].icon+' '+C.byId[k].title)).join(' · ')+'.</p>':'')+'<p class="small">Esto no es una nota. Se ajusta solo mientras avanzamos.</p></div>'+(n.lesson?'<div class="cc-next"><span class="eyebrow">Empezamos por</span><b>'+esc(n.lesson.kid)+'</b></div>':'')+'<div class="row center"><button class="primary xl" id="mstart">▶ Empezar mi primera clase</button><button class="soft" id="mrest">Después</button></div></div>','cls:mochila');
 q1('#mstart').onclick=()=>n.lesson?start(n.lesson,n.mode):camino();q1('#mrest').onclick=()=>Sh.hoy();speak(say)}

/* ---------- el mapa: Mi camino ---------- */
const ST_ICON={hecha:'✅',apoyo:'🌱',refuerzo:'🔁',nueva:'▶'};
function camino(){const c=course(),e=env(),n=CUR.next(c,e,now()),tot=CUR.totals(c),hi=homeInfo(),curU=CUR.currentUnit(c);act=false;
 const rows=u=>CUR.unitLessons(u.id).map(l=>{const st=CUR.status(c,l.id),av=CUR.available(c,l),isCur=c.cur&&c.cur.l===l.id,isNext=n.lesson&&n.lesson.id===l.id&&!c.cur,locked=!av.ok||(c.cur&&!isCur);
  const ic=isCur?'▶':isNext?'⭐':locked?'🔒':ST_ICON[st],lab=isCur?'En curso':isNext?'Siguiente':st==='hecha'?'Hecha':st==='apoyo'?'Seguimos con apoyo':st==='refuerzo'?'Otra mirada':!av.ok?'Más adelante':c.cur?'Termina tu clase primero':'Disponible';
  return '<li><button class="lrow'+(isNext||isCur?' cur':'')+(st==='hecha'?' ok':'')+'" data-lesson="'+l.id+'"'+(locked?' disabled aria-disabled="true"':'')+'><span class="lr-i" aria-hidden="true">'+ic+'</span><span class="lr-t"><strong>'+esc(l.kid)+'</strong><small>'+(l.kind==='review'?'Repaso de la unidad':l.kind==='symbols'?'Símbolos':C.byId[l.skill]?esc(C.byId[l.skill].blurb):'')+' · '+lab+'</small></span></button></li>'}).join('');
 K.page('<section class="camino"><h1 class="pagetitle">Mi camino</h1><p class="lead">Clase a clase, empezando por lo básico. Llevas <b>'+tot.done+'</b> de '+tot.total+' clases.</p>'+
  '<div class="pathcta"><button class="primary xl" id="pcgo"><span>▶ '+esc(hi.label)+'</span><small>'+esc(hi.sub)+'</small></button>'+(c.cur?'<button class="linkb" id="pcdrop">Dejar esta clase y elegir otra</button>':'')+(!c.diag.done&&!c.diag.skipped&&!Object.keys(c.done).length?'<button class="soft" id="pcbag">🎒 Jugar la mochila misteriosa</button>':'')+'</div>'+
  CUR.units.map(u=>{const p=CUR.unitProgress(c,u.id),open=u.id===curU.id,lk=!CUR.unitOpen(c,u.id);return '<details class="unit'+(lk?' lk':'')+'"'+(open?' open':'')+'><summary><span class="u-i" aria-hidden="true">'+u.icon+'</span><span class="u-t"><strong>Unidad '+(CUR.unitIndex(u.id)+1)+' · '+esc(u.title)+'</strong><small>'+esc(u.kid)+'</small></span><span class="u-c">'+(lk?'🔒':p.done+' de '+p.total)+'</span></summary><ul class="lessons">'+rows(u)+'</ul></details>'}).join('')+
  '<p class="small">Las clases se hacen en orden razonable, pero tú puedes jugar o explorar lo que quieras en <b>Aprender</b> y <b>Jugar</b>: eso no cambia tu lugar en el camino.</p></section>','camino');
 q1('#pcgo').onclick=begin;const d=q1('#pcdrop');if(d)d.onclick=()=>{if(confirm('¿Dejar la clase a medias? Se pierde solo la posición dentro de esa clase; lo aprendido se conserva.')){abandon();camino()}};
 const b=q1('#pcbag');if(b)b.onclick=mochilaIntro;
 qa('[data-lesson]').forEach(x=>x.onclick=()=>{const l=CUR.byId[x.dataset.lesson];if(c.cur)return;start(l,CUR.modeFor(c,l,e))})}

/* ---------- panel adulto: seguimiento del curso ---------- */
const fmt=d=>{const [y,m,x]=String(d).split('-');return x+'/'+m};
const MODO={nueva:'clase nueva',refuerzo:'refuerzo',confirmar:'comprobación',repaso:'repaso'};
function upcoming(c,e,max){const out=[];for(const l of CUR.lessons){if(CUR.isDone(c,l.id))continue;if(!CUR.available(c,l).ok)continue;out.push(l);if(out.length>=max)break}return out}
function adultHTML(){const c=course(),e=env(),n=CUR.next(c,e,now()),tot=CUR.totals(c),u=CUR.currentUnit(c),sn=e.sn,df=CUR.difficulties(c),up=upcoming(c,e,3),due=CUR.dueReviews(c,now()),sm=CUR.diagSummary(c);
 const clsLog=c.log.filter(x=>x.k==='clase'||x.k==='repaso').slice(-8).reverse(),days=[];for(let i=6;i>=0;i--)days.push(CUR.addDays(CUR.day(now()),-i));
 const libre={},clase={};for(const k of C.skills)for(const h of P.hist(sn.recs[k.id])){if(h.src==='clase')clase[h.d]=(clase[h.d]||0)+1;else libre[h.d]=(libre[h.d]||0)+1}
 const intro=tot.done,okc=CUR.lessons.filter(l=>c.done[l.id]&&c.done[l.id].ok).length,dom=C.skills.filter(k=>{const s=sn.states[k.id].state;return s==='comprobada'||s==='consolidacion'}).length;
 const lessonLine=l=>'<b>'+esc(l.kid)+'</b> <small>('+esc(unitOf(l).title)+')</small>';
 return '<h3>Mi camino · clases guiadas</h3><p class="small">Aquí se ve el <b>recorrido de clases</b>. No es lo mismo que el <b>dominio de cada habilidad</b> (pestaña Progreso) ni que el <b>nivel de aventura</b> (insignias): una clase terminada significa que se hizo y su comprobación salió bien, no que el aprendizaje esté asegurado.</p>'+
 '<div class="recbox"><b>Dónde va</b><p>Unidad '+(CUR.unitIndex(u.id)+1)+' de '+CUR.units.length+': «'+esc(u.title)+'». '+(c.cur?'Clase en curso: <b>'+esc(CUR.byId[c.cur.l].kid)+'</b> ('+esc(stepLabel(c.cur))+').':'No hay una clase a medias.')+'</p><p>'+(n.lesson?'Siguiente recomendada: '+lessonLine(n.lesson)+'. <small>'+esc(n.reason)+'</small>':'Recorrió todo el camino.')+'</p><p>Clases terminadas: <b>'+tot.done+'</b> de '+tot.total+'.</p></div>'+
 '<h4>Unidades</h4><ul class="aul">'+CUR.units.map(x=>{const p=CUR.unitProgress(c,x.id);return '<li>'+x.icon+' '+esc(x.title)+': <b>'+p.done+'</b> de '+p.total+(CUR.unitOpen(c,x.id)?'':' <small>(todavía cerrada)</small>')+'</li>'}).join('')+'</ul>'+
 '<h4>Clases finalizadas recientes</h4>'+(clsLog.length?'<ul class="aul">'+clsLog.map(x=>{const l=CUR.byId[x.l];return '<li>'+fmt(x.d)+' · '+esc(l?l.kid:x.l)+' · '+(MODO[x.m]||'clase')+(x.ck&&x.ck[1]?' · '+x.ck[0]+' de '+x.ck[1]+' sin ayuda':'')+(x.ok?'':' <small>(se repite con calma)</small>')+'</li>'}).join('')+'</ul>':'<p class="small">Todavía no hay clases terminadas.</p>')+
 '<h4>Habilidades (tres cosas distintas)</h4><ul class="aul"><li>Introducidas en clase: <b>'+intro+'</b> lecciones (incluyen repasos de unidad y símbolos).</li><li>Con comprobación buena en clase: <b>'+okc+'</b>.</li><li>Con dominio demostrado (varios días y formas de jugar, de cualquier origen): <b>'+dom+'</b> de '+C.skills.length+'.</li></ul>'+
 '<h4>Dificultades encontradas</h4>'+((df.lecciones.length||df.repasos.length)?'<ul class="aul">'+df.lecciones.map(x=>'<li>'+esc(x.l.kid)+': '+x.tipo+' ('+x.n+' intento'+(x.n===1?'':'s')+')</li>').join('')+df.repasos.map(x=>'<li>Repaso de «'+esc(titleOf(x.skill))+'»: salió flojo; vuelve a aparecer el '+fmt(x.due)+'.</li>').join('')+'</ul>':'<p class="small">Sin dificultades registradas.</p>')+
 '<h4>Próximos contenidos</h4><ul class="aul">'+(up.length?up.map(l=>'<li>'+lessonLine(l)+'</li>').join(''):'<li>Nada pendiente.</li>')+'</ul>'+
 '<h4>Repasos pendientes</h4>'+(due.length?'<ul class="aul">'+due.slice(0,8).map(x=>'<li>'+esc(titleOf(x.skill))+' <small>(tocaba el '+fmt(x.due)+')</small></li>').join('')+'</ul><p class="small">Aparecen solos en «Recordamos» al inicio de las próximas clases.</p>':'<p class="small">No hay repasos pendientes hoy.</p>')+
 '<h4>Clases y juego libre (últimos 7 días)</h4><table class="atable"><tr><th>Día</th><th>Clases</th><th>Juego libre</th></tr>'+days.map(d=>'<tr><td>'+fmt(d)+'</td><td>'+(clase[d]||0)+'</td><td>'+(libre[d]||0)+'</td></tr>').join('')+'</table><p class="small">Cuenta sesiones de habilidades guardadas. El juego libre aporta evidencias al dominio, pero <b>no mueve el camino</b>.</p>'+
 '<h4>En casa esta semana</h4><ul class="aul">'+(up.slice(0,2).filter(l=>l.skill).map(l=>'<li>'+esc(C.byId[l.skill].home)+'</li>').join('')||'<li>Cuenten cosas, nombren colores y hablen del día.</li>')+'</ul>'+
 '<h4>Exploración inicial</h4><p class="small">'+(c.diag.done?'Hecha el '+fmt(CUR.day(c.diag.ts))+': ya reconocía '+(sm.known.length?sm.known.map(k=>esc(titleOf(k))).join(', '):'nada todavía')+'; lo demás se aprende en clase. Sin nota.':c.diag.skipped?'Se empezó desde cero.':'Aún no se hizo.')+'</p><div class="row"><button class="soft" id="cuMochila">🎒 '+(c.diag.done?'Repetir la mochila':'Jugar la mochila')+'</button></div>'+
 '<h4>Preferencias de las clases</h4><label for="cuMin">Duración orientativa (sin cronómetro)</label><select id="cuMin">'+[8,10,12].map(m=>'<option value="'+m+'"'+(c.prefs.min===m?' selected':'')+'>'+m+' minutos'+(m===8?' (sin juego ni recuerdo)':m===12?' (con juego y recuerdo)':'')+'</option>').join('')+'</select><label for="cuPer">Clases por día recomendadas</label><select id="cuPer">'+[1,2,3,4].map(m=>'<option value="'+m+'"'+(c.prefs.perDay===m?' selected':'')+'>'+m+'</option>').join('')+'</select><label class="chk"><input type="checkbox" id="cuGame"'+(c.prefs.game?' checked':'')+'> Incluir un juego relacionado en las clases</label><p class="small">Al pasar de las clases recomendadas el niño solo ve una sugerencia de descansar; nunca se bloquea ni se castiga.</p>'+
 '<div class="row"><button class="soft" id="cuReset">Reiniciar el camino…</button></div><p class="small">Reiniciar borra solo el recorrido de clases; no toca el dominio, las insignias, el nivel ni el juego libre.</p>'}
function bindAdult(refresh){const c=course();
 const mm=q1('#cuMin');if(mm)mm.onchange=()=>{c.prefs.min=+mm.value;save()};const pp=q1('#cuPer');if(pp)pp.onchange=()=>{c.prefs.perDay=+pp.value;save()};const gg=q1('#cuGame');if(gg)gg.onchange=()=>{c.prefs.game=gg.checked;save()};
 const mo=q1('#cuMochila');if(mo)mo.onclick=()=>{const d=q1('#dialog');if(d&&d.open)d.close();if(c.cur&&!confirm('Hay una clase a medias. ¿Dejarla para jugar la mochila?'))return;if(c.cur)abandon();c.diag.tmp=null;mochilaIntro()};
 const rs=q1('#cuReset');if(rs)rs.onclick=()=>{if(!confirm('¿Reiniciar el recorrido de clases desde la primera? No se borra el dominio, las insignias ni el juego libre.'))return;const pf=c.prefs;S().course=CUR.fresh();S().course.prefs=pf;save();refresh()}}

return{active:()=>act,pause,begin,resume,start,camino,homeInfo,skillFinished,symbolsDone,beforeCheck,adultHTML,bindAdult,abandon,mochilaIntro,state:course,env}
};
})(typeof globalThis!=='undefined'?globalThis:this);
