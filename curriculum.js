/* Mi camino de aprendizaje: currículo en espiral y planificador de clases.
   Datos y reglas PUROS (sin pantalla): no duplican el motor de contenido; solo ordenan lo que ya existe
   (40 habilidades, rondas de símbolos, retos de aventura) en unidades y lecciones.
   Qué viene del Cuadernillo MINED y qué es decisión propia: ver docs/CURSO_GUIADO.md.
   Tres conceptos que NO se mezclan:
     · progreso curricular  → state.course  (este archivo: unidad, lección, hecha/refuerzo, repasos programados)
     · dominio por habilidad → progress.js  (estados descubrir…consolidación; evidencias de clase y de juego libre)
     · nivel de aventura     → insignias y niveles de shell.js */
(function(root){
'use strict';
const CUR={VERSION:1};
const pad=n=>String(n).padStart(2,'0');
const day=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const dnum=d=>{const [y,m,x]=d.split('-').map(Number);return Math.round(Date.UTC(y,m-1,x)/86400000)};
const addDays=(d,n)=>{const [y,m,x]=d.split('-').map(Number),t=new Date(Date.UTC(y,m-1,x+n));return t.getUTCFullYear()+'-'+pad(t.getUTCMonth()+1)+'-'+pad(t.getUTCDate())};
CUR.day=day;CUR.addDays=addDays;

/* Repaso espaciado: intervalos que se alargan (días) cuando el recuerdo sale bien; si sale mal se vuelve al primero. Decisión propia. */
CUR.INTERVALS=[1,3,7,14,30];
CUR.MAX_ATTEMPTS=2;       // intentos de una lección con comprobación floja antes de seguir «con apoyo» (sin frustrar)
CUR.DEFAULT_PREFS={min:10,perDay:2,game:true};

/* ---------------- unidades (progresión en espiral: cada unidad mezcla varias rutas) ---------------- */
CUR.units=[
 {id:'u1',icon:'🌅',title:'¡Empecemos!',kid:'Me conozco, miro colores y cuento un poco.'},
 {id:'u2',icon:'🍎',title:'Cuento y comparo',kid:'Cuento cosas, comparo y descubro vocales.'},
 {id:'u3',icon:'🔷',title:'Formas y patrones',kid:'Figuras, patrones y cómo me siento.'},
 {id:'u4',icon:'🔤',title:'Palabras y sonidos',kid:'Escucho los sonidos de las palabras.'},
 {id:'u5',icon:'🌞',title:'Mi día y mi cuidado',kid:'Mi día, lo que como y cómo me cuido.'},
 {id:'u6',icon:'🧩',title:'Pienso, busco y recuerdo',kid:'Miro con atención y sigo instrucciones.'},
 {id:'u7',icon:'📚',title:'Más palabras, más días',kid:'Mi nombre, secuencias y los días.'},
 {id:'u8',icon:'🌎',title:'Mi comunidad y mi mundo',kid:'Lugares, señales, animales y plantas.'},
 {id:'u9',icon:'🔭',title:'Descubro más',kid:'Más figuras, más números y un gran repaso.'}];

/* ---------------- lecciones ----------------
   kind 'skill'   : una habilidad con sus cinco fases (Aprendo, Ejemplos, Practico, Refuerzo, Compruebo)
   kind 'symbols' : ronda de símbolos del módulo original (desbloquea números, vocales, colores y figuras)
   kind 'review'  : repaso de unidad: 2 preguntas de cada una de 3 habilidades ya vistas
   needs: lecciones que deben estar hechas (prerrequisitos razonables); game: reto de aventura relacionado (adv + posición)  */
const S=(id,unit,kid,hook,goal,needs,game)=>({id,unit,kind:'skill',skill:id,kid,hook,goal,needs:needs||[],game:game||null,min:game?11:9});
const Y=(id,unit,area,reach,kid,hook,goal,needs)=>({id,unit,kind:'symbols',area,reach,kid,hook,goal,needs:needs||[],game:null,min:5});
const R=(id,unit,skills,kid,goal,pool)=>({id,unit,kind:'review',skills,pool:pool||null,kid,hook:'recordar y jugar con lo que ya aprendimos',goal,needs:[],game:null,min:6});
CUR.lessons=[
 /* U1 */
 S('partes','u1','Mi cuerpo','conocer las partes de mi cuerpo','Nombrar y señalar cabeza, brazos, manos, piernas y pies, y decir para qué sirven.',[],{adv:'consultorio',ch:0}),
 Y('colores-a','u1','colors',4,'Mis primeros colores','reconocer los primeros colores','Reconocer y nombrar los primeros cuatro colores: rojo, azul, amarillo y verde.'),
 Y('numeros-a','u1','numbers',4,'Los números del 1 al 4','conocer los primeros números','Reconocer los números 1, 2, 3 y 4 y relacionarlos con cantidades pequeñas.'),
 S('tamano','u1','Grande y pequeño','comparar tamaños','Comparar objetos: grande/pequeño, largo/corto, alto/bajo.'),
 S('posiciones','u1','Arriba, abajo, dentro y fuera','ubicar cosas en el espacio','Ubicar un objeto con encima, debajo, dentro y fuera.'),
 R('rev-u1','u1',['partes','tamano','posiciones'],'Repaso: Empecemos','Recordar sin pistas lo visto en la unidad 1.'),
 /* U2 */
 S('contar','u2','Contar objetos','contar objetos','Contar con un número por cada cosa; el último número dice cuántos hay.',['numeros-a'],{adv:'mercado',ch:0}),
 S('igual-diferente','u2','Igual y diferente','mirar con mucha atención','Encontrar qué es igual y qué es diferente fijándose en detalles.',[],{adv:'safari',ch:0}),
 Y('vocales-a','u2','vowels',3,'Mis primeras vocales','conocer las primeras vocales','Reconocer las primeras vocales (a, e, i) por su forma y su sonido.'),
 S('clasif-color','u2','Agrupar por color','poner juntas las cosas del mismo color','Clasificar objetos por un criterio: el color.',['colores-a']),
 S('sentidos','u2','Mis cinco sentidos','descubrir cómo conozco el mundo','Relacionar cada sentido (ver, oír, oler, probar, tocar) con su parte del cuerpo.'),
 R('rev-u2','u2',['contar','igual-diferente','clasif-color'],'Repaso: Cuento y comparo','Recordar sin pistas contar, comparar y clasificar por color.'),
 /* U3 */
 Y('figuras-a','u3','shapes',4,'Mis primeras figuras','reconocer círculo, X, cuadrado y triángulo','Reconocer el círculo, la X, el cuadrado y el triángulo entre otras figuras.'),
 S('figuras','u3','Figuras geométricas','encontrar figuras por todas partes','Nombrar y reconocer figuras en dibujos y objetos.',['figuras-a'],{adv:'laboratorio',ch:1}),
 S('series','u3','Series y patrones','descubrir qué sigue','Continuar una serie sencilla de objetos o colores que se repite.'),
 S('cuantos','u3','Mucho, poco y ninguno','comparar cantidades','Decir dónde hay más, menos o ninguno sin necesidad de contar todo.',['numeros-a']),
 S('emociones','u3','Cómo me siento','hablar de lo que siento','Reconocer caras y emociones básicas y decir cuándo las sentimos.'),
 R('rev-u3','u3',['figuras','series','cuantos'],'Repaso: Formas y patrones','Recordar sin pistas figuras, patrones y comparar cantidades.'),
 /* U4 */
 S('vocal-inicial','u4','El primer sonido','escuchar con qué vocal empieza una palabra','Identificar con qué vocal empieza una palabra conocida.',['vocales-a']),
 S('silabas','u4','Palmadas de las palabras','partir las palabras en golpecitos','Separar palabras en sílabas con palmadas.'),
 S('rimas','u4','Palabras que suenan igual','encontrar palabras que riman','Reconocer palabras con finales que suenan parecido.'),
 S('categorias','u4','Grupos y categorías','poner cada cosa en su grupo','Agrupar objetos en categorías: animales, frutas, ropa y más.'),
 S('orden-eventos','u4','Primero, después y al final','ordenar lo que pasa','Ordenar 3 sucesos cotidianos con primero, después y al final.'),
 Y('numeros-b','u4','numbers',6,'Más números','conocer más números','Reconocer hasta el número 6 y relacionarlo con su cantidad.',['numeros-a']),
 R('rev-u4','u4',['vocal-inicial','rimas','categorias'],'Repaso: Palabras y sonidos','Recordar sin pistas sonidos iniciales, rimas y categorías.'),
 /* U5 */
 S('alimentos','u5','Alimentos que me ayudan a crecer','elegir alimentos para crecer fuerte','Distinguir alimentos de todos los días y de vez en cuando.'),
 S('dia-noche','u5','Mañana, tarde y noche','conocer las partes del día','Relacionar actividades con la mañana, la tarde y la noche.'),
 S('seguridad','u5','Me cuido y me cuidan','cuidarme con los adultos','Reconocer el semáforo y qué hacer con un adulto para cuidarse.'),
 S('antes-despues','u5','Antes y después','saber qué número va antes y después','Decir qué número va antes y cuál después.',['contar','numeros-b']),
 S('izq-der','u5','Izquierda y derecha','conocer mi izquierda y mi derecha','Distinguir mi lado izquierdo y mi lado derecho.',['posiciones'],{adv:'colegio',ch:0}),
 R('rev-u5','u5',['alimentos','dia-noche','izq-der'],'Repaso: Mi día y mi cuidado','Recordar sin pistas alimentos, partes del día y lados.'),
 /* U6 */
 S('que-falta','u6','¿Qué falta?','mirar y recordar','Recordar lo que se vio y notar qué cambió o qué falta.',[],{adv:'safari',ch:1}),
 S('clasif-forma','u6','Agrupar por forma','poner juntas las figuras iguales','Clasificar por forma, un criterio nuevo tras el color.',['figuras-a']),
 S('juntar','u6','Juntar y quitar','juntar y quitar cosas','Resolver situaciones sencillas: llegan más y se van algunas.',['contar']),
 S('instrucciones','u6','Escucha y haz','escuchar y hacer lo que se pide','Seguir instrucciones de uno y de dos pasos.'),
 S('colores-uso','u6','Usar los colores','usar los colores para buscar y responder','Buscar y responder por color en situaciones nuevas.',['colores-a'],{adv:'laboratorio',ch:0}),
 Y('colores-b','u6','colors',8,'Todos los colores','conocer todos los colores','Reconocer los ocho colores del cuadernillo.',['colores-a']),
 R('rev-u6','u6',['que-falta','clasif-forma','juntar'],'Repaso: Pienso y recuerdo','Recordar sin pistas memoria visual, forma y cantidades.'),
 /* U7 */
 S('vocal-final','u7','El último sonido','escuchar con qué vocal termina una palabra','Identificar con qué vocal termina una palabra.',['vocal-inicial']),
 Y('vocales-b','u7','vowels',5,'Todas las vocales','conocer las cinco vocales','Reconocer las cinco vocales.',['vocales-a']),
 S('mi-nombre','u7','Mi nombre','reconocer y armar mi nombre','Reconocer y armar su propio nombre con letras.',['vocales-a']),
 S('simon','u7','Repite los colores','recordar una secuencia','Repetir una secuencia corta de colores y sonidos.'),
 S('parejas-func','u7','Cosas que van juntas','encontrar parejas que van juntas','Relacionar animal y comida, objeto y uso, animal y hogar.'),
 S('dias-semana','u7','Ayer, hoy y mañana','hablar de ayer, hoy y mañana','Usar ayer, hoy y mañana; los días se leen con ayuda.',['orden-eventos']),
 Y('numeros-c','u7','numbers',8,'Números más grandes','conocer números más grandes','Reconocer hasta el 8 y relacionarlos con cantidades.',['numeros-b']),
 R('rev-u7','u7',['vocal-final','simon','parejas-func'],'Repaso: Más palabras','Recordar sin pistas sonidos finales, secuencias y parejas.'),
 /* U8 */
 S('lugares','u8','Lugares de mi comunidad','conocer lugares de mi comunidad','Reconocer lugares (escuela, parque, hospital…) y para qué sirven.'),
 S('senales','u8','Señales que nos cuidan','entender las señales','Reconocer alto, semáforo y cuidado, y qué hacer.',['seguridad'],{adv:'colegio',ch:1}),
 S('transporte','u8','Medios de transporte','conocer cómo viajamos','Clasificar transportes por aire, agua y tierra.'),
 S('donde-viven','u8','Cómo se mueven los animales','saber cómo se mueven los animales','Clasificar animales: caminan, nadan o vuelan.'),
 S('planta','u8','Cómo crece una planta','ver cómo crece una planta','Ordenar el crecimiento de una planta y saber qué necesita.'),
 S('adivinanzas','u8','Adivinanzas y sonidos','escuchar y adivinar','Escuchar pistas y adivinar de quién o de qué se trata.'),
 R('rev-u8','u8',['lugares','senales','donde-viven'],'Repaso: Mi mundo','Recordar sin pistas lugares, señales y animales.'),
 /* U9 */
 S('posiciones2','u9','Cerca, lejos, al lado','ubicar mejor las cosas','Usar cerca/lejos, al lado, delante, detrás y entre.',['posiciones']),
 S('une-puntos','u9','Une los puntos','seguir los números con el dedo','Seguir el orden de los números y descubrir el dibujo.',['numeros-b']),
 S('pintar','u9','Pinta como se indica','pintar siguiendo una instrucción','Colorear partes de un dibujo según lo que se pide.',['colores-uso']),
 Y('figuras-b','u9','shapes',7,'Todas las figuras','conocer todas las figuras','Reconocer rectángulo, óvalo y rombo además de las anteriores.',['figuras-a']),
 Y('numeros-d','u9','numbers',10,'Hasta el diez','llegar hasta el diez','Reconocer hasta el 10 y relacionarlos con cantidades.',['numeros-c']),
 R('rev-u9','u9',[],'Gran repaso','Recordar sin pistas habilidades de todo el camino, elegidas entre las que más conviene repasar.','all')];

CUR.byId={};CUR.lessons.forEach((l,i)=>{l.n=i;CUR.byId[l.id]=l});
CUR.unitLessons=u=>CUR.lessons.filter(l=>l.unit===u);
CUR.unitIndex=u=>CUR.units.findIndex(x=>x.id===u);
CUR.reviewOf=u=>CUR.lessons.find(l=>l.unit===u&&l.kind==='review');
/* Dentro de una unidad la repaso exige todas sus otras lecciones. */
CUR.lessons.forEach(l=>{if(l.kind==='review')l.needs=CUR.lessons.filter(x=>x.unit===l.unit&&x.kind!=='review').map(x=>x.id)});

/* ---------------- diagnóstico informal: «La mochila misteriosa» ----------------
   Una pregunta por habilidad básica, sin nota. Solo guarda «ya lo sabe» / «lo vemos con calma».
   No se escribe en el historial de las habilidades (una sola pregunta no es evidencia de dominio). */
CUR.PROBES=['partes','tamano','posiciones','contar','igual-diferente','clasif-color','sentidos','figuras','series','cuantos','emociones','vocal-inicial'];

/* ---------------- estado del curso (migración no destructiva) ---------------- */
CUR.fresh=()=>({v:CUR.VERSION,started:0,diag:{done:0,skipped:0,ts:0,res:{}},cur:null,done:{},sr:{},log:[],days:{},prefs:Object.assign({},CUR.DEFAULT_PREFS)});
CUR.ensure=s=>{const c=s.course&&typeof s.course==='object'?s.course:(s.course=CUR.fresh()),f=CUR.fresh();
 for(const k of Object.keys(f))if(c[k]===undefined)c[k]=f[k];
 c.diag=Object.assign({},f.diag,c.diag||{});c.prefs=Object.assign({},CUR.DEFAULT_PREFS,c.prefs||{});return c};

/* ---------------- estado de una lección ---------------- */
CUR.rec=(c,id)=>c.done[id]||null;
CUR.status=(c,id)=>{const d=c.done[id];if(!d)return'nueva';if(d.ok)return'hecha';return d.n>=CUR.MAX_ATTEMPTS?'apoyo':'refuerzo'};
CUR.isDone=(c,id)=>{const s=CUR.status(c,id);return s==='hecha'||s==='apoyo'};
CUR.unitOpen=(c,unitId)=>{const i=CUR.unitIndex(unitId);if(i<=0)return true;const prev=CUR.reviewOf(CUR.units[i-1].id);return !prev||CUR.isDone(c,prev.id)};
CUR.available=(c,l)=>{if(!CUR.unitOpen(c,l.unit))return{ok:false,why:'unidad'};const miss=l.needs.filter(n=>!CUR.isDone(c,n));return miss.length?{ok:false,why:'antes',miss}:{ok:true}};
CUR.unitProgress=(c,unitId)=>{const ls=CUR.unitLessons(unitId);return{done:ls.filter(l=>CUR.isDone(c,l.id)).length,total:ls.length}};
CUR.currentUnit=c=>{for(const u of CUR.units){const p=CUR.unitProgress(c,u.id);if(p.done<p.total)return u}return CUR.units[CUR.units.length-1]};
CUR.totals=c=>({done:CUR.lessons.filter(l=>CUR.isDone(c,l.id)).length,total:CUR.lessons.length});
CUR.classesToday=(c,now)=>c.days[day(now)]||0;

/* Modo de una lección: «refuerzo» tras una comprobación floja; «confirmar» si ya lo sabe (juego de exploración inicial o práctica libre) y solo se comprueba. */
CUR.modeFor=(c,l,env)=>{const st=CUR.status(c,l.id);if(st==='refuerzo')return'refuerzo';if(st!=='nueva')return'repaso';
 if(l.kind==='skill'){if(c.diag.res[l.skill]===1)return'confirmar';const g=env&&env.states&&env.states[l.skill];if(g&&(g.state==='comprobada'||g.state==='consolidacion'))return'confirmar'}
 return'nueva'};

/* Siguiente clase recomendada: 1) la que quedó a medias; 2) un refuerzo de un día anterior; 3) la primera nueva que esté disponible (orden del camino);
   4) un refuerzo del mismo día; 5) nada: curso completo. Siempre con el motivo, para el adulto. */
CUR.next=(c,env,now)=>{now=now||Date.now();const today=day(now);
 if(c.cur&&CUR.byId[c.cur.l])return{lesson:CUR.byId[c.cur.l],kind:'continuar',mode:c.cur.mode,reason:'Quedó a medias; se reanuda exactamente donde estaba.'};
 const avail=CUR.lessons.filter(l=>CUR.available(c,l).ok);
 const ref=avail.filter(l=>CUR.status(c,l.id)==='refuerzo'),old=ref.filter(l=>(c.done[l.id].d||'')<today)[0];
 if(old)return{lesson:old,kind:'siguiente',mode:'refuerzo',reason:'Ayer costó un poco; hoy se vuelve a mirar con calma antes de avanzar.'};
 const nu=avail.filter(l=>CUR.status(c,l.id)==='nueva')[0];
 if(nu){const m=CUR.modeFor(c,nu,env);return{lesson:nu,kind:c.started?'siguiente':'primera',mode:m,reason:m==='confirmar'?'Parece que ya lo conoce; hoy solo se comprueba.':'Es la siguiente del camino y sus requisitos están hechos.'}}
 if(ref[0])return{lesson:ref[0],kind:'siguiente',mode:'refuerzo',reason:'Falta afianzar esta clase antes de seguir.'};
 return{lesson:null,kind:'completo',mode:null,reason:'Recorrió todo el camino. Puede repasar o jugar libremente.'}};

/* ---------------- repasos espaciados ---------------- */
CUR.schedule=(c,skill,good,now)=>{const today=day(now),o=c.sr[skill]||{b:-1,n:0};
 if(good){o.b=Math.min(CUR.INTERVALS.length-1,o.b+1)}else{o.b=0}
 o.n=(o.n||0)+1;o.last=today;o.due=addDays(today,CUR.INTERVALS[Math.max(0,o.b)]);o.ok=good?1:0;c.sr[skill]=o;return o};
CUR.dueReviews=(c,now,exclude)=>{const today=day(now);return Object.entries(c.sr).filter(([k,o])=>o.due<=today&&!(exclude||[]).includes(k)).sort((a,b)=>a[1].due<b[1].due?-1:a[1].due>b[1].due?1:0).map(([k,o])=>({skill:k,due:o.due,box:o.b}))};
/* Calentamiento «Recordamos»: primero lo que toca repasar; si no hay, lo último que se terminó. */
CUR.pickRecall=(c,l,now)=>{const ex=l.kind==='skill'?[l.skill]:[];const due=CUR.dueReviews(c,now,ex)[0];if(due)return{skill:due.skill,why:'repaso'};
 const last=c.log.filter(e=>e.k==='clase'&&e.sk&&e.sk!==l.skill).slice(-1)[0];if(last)return{skill:last.sk,why:'reciente'};return null};
/* Repaso de unidad: tres habilidades; el «gran repaso» elige entre todas las vistas las que más conviene repasar. */
CUR.reviewSkills=(c,l,now)=>{if(l.pool!=='all')return l.skills.slice();
 const seen=Object.keys(c.sr);const ranked=seen.map(k=>({k,s:c.sr[k]})).sort((a,b)=>(a.s.ok-b.s.ok)||(a.s.b-b.s.b)||(a.s.due<b.s.due?-1:1)).map(x=>x.k);return ranked.slice(0,3)};

/* ---------------- registro de una clase terminada ---------------- */
CUR.recordLesson=(c,l,res,now)=>{const today=day(now),prev=c.done[l.id]||{n:0,ok:0,fails:0},good=!!res.ok;
 const d={n:prev.n+1,ok:good||prev.ok?1:0,ts:now,d:today,ck:res.ck||null,mode:res.mode||'nueva',er:res.er||0,hn:res.hn||0,fails:prev.fails+(good?0:1),first:prev.first||today};
 c.done[l.id]=d;c.started=c.started||now;c.days[today]=(c.days[today]||0)+1;
 if(l.kind==='skill')CUR.schedule(c,l.skill,good,now);
 if(l.kind==='review')for(const r of res.items||[])CUR.schedule(c,r.skill,!!r.good,now);
 if(res.recall&&res.recall.skill)CUR.schedule(c,res.recall.skill,!!res.recall.good,now);
 c.log.push({d:today,ts:now,k:l.kind==='review'?'repaso':'clase',l:l.id,sk:l.kind==='skill'?l.skill:null,ok:good?1:0,ck:res.ck||null,m:d.mode,er:d.er,hn:d.hn});
 if(c.log.length>300)c.log.splice(0,c.log.length-300);
 c.cur=null;return d};

/* Resultado del juego de exploración inicial. */
CUR.applyDiag=(c,results,now,skipped)=>{c.diag={done:skipped?0:1,skipped:skipped?1:0,ts:now,res:Object.assign({},results)};c.log.push({d:day(now),ts:now,k:'diag',ok:Object.values(results).filter(v=>v===1).length,ck:[Object.values(results).filter(v=>v===1).length,Object.keys(results).length]});return c.diag};
CUR.diagSummary=c=>{const r=c.diag.res||{},keys=Object.keys(r);return{known:keys.filter(k=>r[k]===1),later:keys.filter(k=>r[k]===0),total:keys.length}};

/* Dificultades: lecciones con comprobación floja y repasos que salieron mal. */
CUR.difficulties=c=>{const a=CUR.lessons.filter(l=>{const d=c.done[l.id];return d&&!d.ok}).map(l=>({l,tipo:CUR.status(c,l.id)==='apoyo'?'sigue con apoyo':'pendiente de refuerzo',n:c.done[l.id].n}));
 const b=Object.entries(c.sr).filter(([k,o])=>o.ok===0).map(([k,o])=>({skill:k,tipo:'el repaso salió flojo',due:o.due}));return{lecciones:a,repasos:b}};

/* ---------------- validación del currículo (usada por las pruebas) ---------------- */
CUR.validate=(C,advIds)=>{const errs=[],ids=new Set();
 for(const l of CUR.lessons){if(ids.has(l.id))errs.push('lección repetida '+l.id);ids.add(l.id);
  if(!CUR.units.some(u=>u.id===l.unit))errs.push(l.id+': unidad inexistente');
  if(!l.kid||!l.hook||!l.goal)errs.push(l.id+': faltan textos');
  if(l.kind==='skill'&&!C.byId[l.skill])errs.push(l.id+': habilidad inexistente');
  if(l.kind==='symbols'&&!['numbers','vowels','colors','shapes'].includes(l.area))errs.push(l.id+': área inexistente');
  if(l.kind==='review'&&l.pool!=='all')for(const s of l.skills)if(!C.byId[s])errs.push(l.id+': habilidad inexistente '+s);
  if(l.game&&advIds&&!advIds.includes(l.game.adv))errs.push(l.id+': aventura inexistente');
  for(const n of l.needs){const t=CUR.byId[n];if(!t)errs.push(l.id+': requisito inexistente '+n);else if(t.n>=l.n)errs.push(l.id+': el requisito '+n+' no está antes')}}
 const covered=new Set(CUR.lessons.filter(l=>l.kind==='skill').map(l=>l.skill));for(const s of C.skills)if(!covered.has(s.id))errs.push('habilidad sin lección: '+s.id);
 for(const u of CUR.units){const ls=CUR.unitLessons(u.id),routes=new Set(ls.filter(l=>l.kind==='skill').map(l=>C.byId[l.skill]&&C.byId[l.skill].mod));
  if(ls.length<5||ls.length>8)errs.push(u.id+': tamaño de unidad inesperado '+ls.length);if(routes.size<3)errs.push(u.id+': la unidad (espiral) debe combinar al menos 3 rutas, tiene '+routes.size);
  if(!CUR.reviewOf(u.id))errs.push(u.id+': sin repaso de unidad')}
 /* un repaso solo puede repasar habilidades vistas en su unidad o antes */
 for(const l of CUR.lessons.filter(x=>x.kind==='review'&&x.pool!=='all'))for(const s of l.skills){const t=CUR.lessons.find(x=>x.skill===s);if(t&&t.n>l.n)errs.push(l.id+': repasa algo que aún no se enseñó '+s)}
 for(const p of CUR.PROBES)if(!C.byId[p])errs.push('sondeo inexistente '+p);
 return errs};

if(typeof module!=='undefined'&&module.exports)module.exports=CUR;root.Curriculum=CUR;
})(typeof globalThis!=='undefined'?globalThis:this);
