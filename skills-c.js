/* Rutas 6, 7 y 8: Dónde y cuándo · Mi cuerpo y yo · Mi mundo. */
(function(root){
'use strict';
const C=root.Content||require('./content.js');
const {shuffle,pick,sample,em,wordArt,tx,objArt,Q,WORDS,byName}=C.h;
const PG=C.byId.pintar.gens;

C.module({id:'espacio',title:'Dónde y cuándo',icon:'🧭',bg:'#fbefc9',blurb:'Posiciones, izquierda–derecha y tiempo'});
C.module({id:'cuerpo',title:'Mi cuerpo y yo',icon:'🧍',bg:'#fbe3e8',blurb:'Cuerpo, sentidos, hábitos y emociones'});
C.module({id:'mundo',title:'Mi mundo',icon:'🌎',bg:'#dcefef',blurb:'Lugares, señales y naturaleza'});

/* ===================== DÓNDE Y CUÁNDO ===================== */
const OB=[['⚽','la pelota'],['🐱','el gato'],['🐶','el perro'],['🐰','el conejo'],['🐥','el pollito']];
const scene=(landmark,rel,o)=>({k:'scene',landmark,rel,e:o[0],label:o[1]+' '+C.SPACE[landmark][rel]});
const objOf=(o)=>({e:o[0],label:o[1]});
function placeGen(sets){return (ctx,rng)=>{const [lm,rel]=pick(sets,rng),o=pick(OB,rng),zones=Object.keys(C.SPACE[lm]);
 return Q.raw('place',{key:'pl:'+lm+rel+o[0],landmark:lm,rel,zones,obj:objOf(o),prompt:'Pon '+o[1]+' '+C.SPACE[lm][rel]+'.',explain:'Aquí: '+o[1]+' está '+C.SPACE[lm][rel]+'.'})}}
function sceneGen(sets){return (ctx,rng)=>{const [lm,rel]=pick(sets,rng),o=pick(OB,rng),rels=Object.keys(C.SPACE[lm]),opts=[rel,...sample(rels.filter(r=>r!==rel),Math.min(2,rels.length-1),rng)];
 return Q.choose(rng,{key:'sc:'+lm+rel+o[0],prompt:'Toca la imagen donde '+o[1]+' está '+C.SPACE[lm][rel]+'.',options:opts.map(r=>({id:r,art:scene(lm,r,o)})),answer:rel,explain:'En esta imagen '+o[1]+' está '+C.SPACE[lm][rel]+'.'})}}
const VERT=['🐦','🐟','🐱','🐶','🌳','⭐'];
const VN={'🐦':'el pájaro','🐟':'el pez','🐱':'el gato','🐶':'el perro','🌳':'el árbol','⭐':'la estrella'};
const vertGen=(ctx,rng)=>{const [a,b]=sample(VERT,2,rng),up=rng()<.5;
 return Q.choose(rng,{key:'vt:'+a+b+up,prompt:up?'¿Quién está arriba?':'¿Quién está abajo?',model:[{k:'scene',landmark:'vertical',top:a,bottom:b,label:VN[a]+' arriba y '+VN[b]+' abajo'}],options:[{id:a,art:em(a,VN[a])},{id:b,art:em(b,VN[b])}],answer:up?a:b,explain:up?VN[a]+' está arriba y '+VN[b]+' está abajo.':VN[b]+' está abajo y '+VN[a]+' está arriba.'})};
C.skill({id:'posiciones',mod:'espacio',icon:'📦',title:'Arriba, abajo, dentro y fuera',blurb:'Encima, debajo, dentro y fuera',
 learn:ctx=>({title:'¿Dónde está?',say:'Las cosas pueden estar encima, debajo, dentro o fuera. Mira cada imagen y toca para escucharla.',
  cards:[['mesa','encima'],['mesa','debajo'],['caja','dentro'],['caja','fuera']].map(([lm,rel])=>({arts:[scene(lm,rel,OB[0])],label:rel,say:'La pelota está '+C.SPACE[lm][rel]+'.'})),
  adult:'Jueguen con una caja y una pelota: «ponla dentro», «ponla fuera» (Cuadernillo MINED, pp. 8–9).'}),
 gens:{a:placeGen([['mesa','encima'],['mesa','debajo'],['caja','dentro'],['caja','fuera']]),b:sceneGen([['mesa','encima'],['mesa','debajo'],['caja','dentro'],['caja','fuera']]),c:vertGen},
 plan:{examples:['a','b'],practice:['a','b','c'],reinforce:['b','a'],check:['a','b','c']},
 home:'Pregunten durante el día: «¿dónde está tu zapato?» y que responda con encima, debajo, dentro o fuera.'});

const P2=[['mesa','al lado'],['arbol','delante'],['arbol','detrás'],['cajas','entre'],['casa','cerca'],['casa','lejos']];
const OC=[['box','caja',true],['box','caja',false],['door','puerta',true],['door','puerta',false]];
const QUEUE=['🐥','🐰','🐱','🐶','🐸','🐷'],QN={'🐥':'pollito','🐰':'conejo','🐱':'gato','🐶':'perro','🐸':'rana','🐷':'cerdito'};
C.skill({id:'posiciones2',mod:'espacio',icon:'↔️',title:'Al lado, delante, detrás y entre',blurb:'Cerca, lejos, abierto, cerrado y primero',
 learn:ctx=>({title:'Más lugares para describir',say:'Algo puede estar al lado, delante, detrás o entre dos cosas. También puede estar cerca o lejos.',
  cards:P2.map(([lm,rel])=>({arts:[scene(lm,rel,OB[1])],label:rel,say:'El gato está '+C.SPACE[lm][rel]+'.'})),
  adult:'En fila para lavarse las manos: «¿quién es el primero?, ¿quién está al final?» (Cuadernillo MINED, p. 8–9).'}),
 gens:{a:placeGen(P2),b:sceneGen(P2),
  c:(ctx,rng)=>{const [t,n,open]=pick(OC,rng);
   return Q.choose(rng,{key:'oc:'+t+open,prompt:'Toca la '+n+(open?' abierta.':' cerrada.'),options:[{id:'yes',art:objArt(t,n+(open?' abierta':' cerrada'),{open})},{id:'no',art:objArt(t,n+(open?' cerrada':' abierta'),{open:!open})}],answer:'yes',explain:'Esta '+n+' está '+(open?'abierta':'cerrada')+'.'})},
  d:(ctx,rng)=>{const q=sample(QUEUE,4,rng),first=rng()<.5;
   return Q.choose(rng,{key:'fl:'+q.join('')+first,prompt:first?'Los animalitos van hacia la escuela. ¿Quién va primero?':'Los animalitos van hacia la escuela. ¿Quién va último?',model:[{k:'scene',landmark:'fila',items:q,goal:'🏫',label:'fila hacia la escuela'}],options:q.map(e=>({id:e,art:em(e,QN[e])})),answer:first?q[3]:q[0],explain:first?'El primero es el que está más cerca de la escuela.':'El último es el que está más lejos de la escuela.'})}},
 plan:{examples:['a','c'],practice:['a','b','c'],reinforce:['d','b'],check:['a','c','d']},
 home:'Jueguen a esconder un juguete: «detrás de la silla», «entre los cojines», «cerca de la puerta».'});

const LR=['izquierda','derecha'];
C.skill({id:'izq-der',mod:'espacio',icon:'👈',title:'Izquierda y derecha',blurb:'Mi izquierda, mi derecha',
 learn:ctx=>({title:'Tengo una mano izquierda y una derecha',say:'Levanta tu mano derecha. Esa es tu derecha. Ahora levanta la izquierda. Aquí en la pantalla, izquierda es el lado de la mano izquierda.',
  cards:[{arts:[scene('lado','izquierda',OB[0])],label:'izquierda',say:'La pelota está a la izquierda de la caja.'},{arts:[scene('lado','derecha',OB[0])],label:'derecha',say:'La pelota está a la derecha de la caja.'}],
  adult:'Ponga una pulsera o cinta en su mano derecha unos días. A esta edad es normal que aún confunda izquierda y derecha (Cuadernillo MINED, p. 12).'}),
 gens:{
  a:(ctx,rng)=>{const es=sample(['🐱','🐶','🐰','🐥','⚽','🍎'],3,rng),side=pick(['izq','med','der'],rng),name={izq:'a la izquierda',med:'en el medio',der:'a la derecha'}[side],ix={izq:0,med:1,der:2}[side];
   return Q.raw('choose',{key:'lr:'+es.join('')+side,prompt:'Toca el que está '+name+'.',options:es.map((e,i)=>({id:String(i),art:em(e,'dibujo '+(i+1))})),answer:String(ix),row:true,explain:'Este es el que está '+name+'.'})},
  b:(ctx,rng)=>{const o=pick(OB,rng),rel=pick(LR,rng);return Q.raw('place',{key:'lp:'+o[0]+rel,landmark:'lado',rel,zones:LR,obj:objOf(o),prompt:'Pon '+o[1]+' '+C.SPACE.lado[rel]+'.',explain:'Aquí: '+o[1]+' está '+C.SPACE.lado[rel]+'.'})},
  c:sceneGen(LR.map(r=>['lado',r]))},
 plan:{examples:['a','b'],practice:['a','b','a'],reinforce:['c','a'],check:['a','b','c']},
 home:'«Dame la cuchara con la mano derecha». Marquen su derecha con una pulsera.'});

const DAY=[['☀️','el sol'],['🌈','el arcoíris'],['🏫','la escuela'],['🐓','el gallo'],['🚌','el bus'],['🦋','la mariposa']];
const NIGHT=[['🌙','la luna'],['⭐','las estrellas'],['🛏️','la cama'],['🦉','el búho'],['😴','dormir'],['🌌','el cielo de noche']];
C.skill({id:'dia-noche',mod:'espacio',icon:'🌗',title:'Día y noche',blurb:'Mañana, tarde y noche',
 learn:ctx=>({title:'Hay día y hay noche',say:'De día sale el sol y jugamos. De noche sale la luna y dormimos. El día tiene mañana, tarde y noche.',
  cards:[{arts:[em('☀️','día')],label:'día',say:'De día vemos el sol.'},{arts:[em('🌙','noche')],label:'noche',say:'De noche vemos la luna y las estrellas.'},{arts:[em('🌅','la mañana'),em('🌇','la tarde'),em('🌙','la noche')],label:'mañana, tarde, noche',say:'Primero la mañana, después la tarde y al final la noche.'}],
  adult:'Cada noche y cada mañana comenten: «ya es de noche, es hora de dormir» (Cuadernillo MINED, p. 9).'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const k=phase==='check'?3:2,items=[...sample(DAY,k,rng).map(o=>({id:o[1],art:em(o[0],o[1]),bin:'dia'})),...sample(NIGHT,k,rng).map(o=>({id:o[1],art:em(o[0],o[1]),bin:'noche'}))];
   return Q.sort(rng,{key:'dn:'+items.map(x=>x.id).join(),prompt:'Pon cada cosa donde corresponde: de día o de noche.',bins:[{id:'dia',art:em('☀️','día'),label:'de día'},{id:'noche',art:em('🌙','noche'),label:'de noche'}],items,explain:'Con el sol: '+items.filter(x=>x.bin==='dia').map(x=>x.id).join(', ')+'. Con la luna: '+items.filter(x=>x.bin==='noche').map(x=>x.id).join(', ')+'.'})},
  b:(ctx,rng)=>{const night=rng()<.5,w=pick(night?NIGHT:DAY,rng),ds=sample(night?DAY:NIGHT,2,rng);
   return Q.choose(rng,{key:'db:'+night+w[0],prompt:night?'¿Qué vemos o hacemos de noche?':'¿Qué vemos o hacemos de día?',options:[w,...ds].map(o=>({id:o[1],art:em(o[0],o[1])})),answer:w[1],listen:[w,...ds].map(o=>o[1]),explain:w[1]+(night?' es de noche.':' es de día.')})},
  c:(ctx,rng)=>{const it=[['🌅','la mañana'],['🌇','la tarde'],['🌙','la noche']];return Q.order({key:'dp:'+rng(),prompt:'Pon las partes del día en orden: primero la mañana.',items:it.map(([e,l])=>({id:l,art:em(e,l),say:l})),explain:'Primero la mañana, después la tarde y al final la noche.'})}},
 plan:{examples:['a','b'],practice:['a','b','c'],reinforce:['c','b'],check:['a','b','c']},
 home:'Hablen de la rutina por partes del día: «en la mañana desayunamos, en la tarde jugamos».'});

const SEQ=[[['🥚','el huevo'],['🐣','el huevo se rompe'],['🐥','sale el pollito']],[['🛏️','me levanto'],['🍽️','desayuno'],['🏫','voy a la escuela']],[['🏠','llego a casa'],['🧼','me lavo las manos'],['🍽️','como']],[['☁️','se nubla'],['🌧️','llueve'],['🌈','sale el arcoíris']],[['🎁','recibo un regalo'],['🎂','soplo las velas'],['🍰','como pastel']],[['🧦','me pongo los calcetines'],['👟','me pongo los zapatos'],['🏃','salgo a jugar']]];
const sa=s=>s.map(([e,l])=>({id:l,art:em(e,l),say:l}));
C.skill({id:'orden-eventos',mod:'espacio',icon:'⏭️',title:'Primero, después y al final',blurb:'El orden de las cosas que pasan',
 learn:ctx=>({title:'Las cosas pasan en orden',say:'Primero se rompe el huevo, después sale el pollito. Todo pasa en un orden: primero, después y al final.',
  cards:[{arts:SEQ[0].map(([e,l])=>em(e,l)),label:'primero, después, al final',say:'Primero el huevo, después se rompe, al final sale el pollito.'}],
  adult:'Cuenten el día en tres pasos: «primero… después… al final». Es la base para contar cuentos (Cuadernillo MINED, p. 9: antes, durante y después).'}),
 gens:{
  a:(ctx,rng)=>{const s=pick(SEQ,rng);return Q.order({key:'oe:'+s[0][1],prompt:'Pon las imágenes en orden: primero, después y al final.',items:sa(s),explain:s.map(x=>x[1]).join(', después ')+'.'})},
  b:(ctx,rng)=>{const s=pick(SEQ,rng),first=rng()<.5,x=first?s[0]:s[2],y=first?s[2]:s[0];return Q.choose(rng,{key:'ob:'+s[0][1]+first,prompt:first?'¿Qué pasa primero?':'¿Qué pasa al final?',options:[{id:'x',art:em(x[0],x[1])},{id:'y',art:em(y[0],y[1])}],answer:'x',listen:[x[1],y[1]],explain:first?'Primero: '+s[0][1]+'. Al final: '+s[2][1]+'.':'Al final: '+s[2][1]+'. Primero: '+s[0][1]+'.'})},
  c:(ctx,rng)=>{const s=pick(SEQ,rng),o=pick(SEQ.filter(x=>x!==s),rng);return Q.choose(rng,{key:'oa:'+s[0][1],prompt:'Primero: '+s[0][1]+'. ¿Qué pasa después?',model:[em(s[0][0],s[0][1])],options:[s[1],s[2],o[1]].map(x=>({id:x[1],art:em(x[0],x[1])})),answer:s[1][1],listen:[s[1][1],s[2][1],o[1][1]],explain:'Después de '+s[0][1]+' pasa: '+s[1][1]+'.'})}},
 plan:{examples:['a','c'],practice:['a','b','c'],reinforce:['c','a'],check:['a','b','c']},
 home:'Después de cada paseo: «¿qué hicimos primero, después y al final?».'});

const WEEK=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const dayArt=d=>tx(d,'w',d);
const todayName=ctx=>WEEK[(ctx.day+6)%7];
C.skill({id:'dias-semana',mod:'espacio',icon:'🐛',title:'Los días de la semana',blurb:'Ayer, hoy y mañana · con ayuda para leer',
 learn:ctx=>({title:'La semana tiene siete días',say:'Lunes, martes, miércoles, jueves, viernes, sábado y domingo. Hoy es '+todayName(ctx)+'.',
  cards:[...WEEK.map(d=>({arts:[dayArt(d)],label:d,say:d})),{arts:[dayArt(todayName(ctx))],label:'hoy',say:'Hoy es '+todayName(ctx)+'.'}],
  adult:'Esta habilidad usa palabras escritas: léanselas. Canten la secuencia y marquen cada día en un calendario (Cuadernillo MINED, p. 10: oruga de los días).'}),
 gens:{
  a:(ctx,rng)=>{const i=Math.floor(rng()*7),d=WEEK[i],nx=WEEK[(i+1)%7];return Q.choose(rng,{key:'wn:'+d,prompt:'¿Qué día viene después del '+d+'?',options:[nx,...sample(WEEK.filter(x=>x!==nx&&x!==d),2,rng)].map(x=>({id:x,art:dayArt(x)})),answer:nx,listen:[],explain:'Después del '+d+' viene el '+nx+'.'})},
  b:(ctx,rng)=>{const s=Math.floor(rng()*5),ds=WEEK.slice(s,s+3);return Q.order({key:'wo:'+ds.join(),prompt:'Pon los días en el orden de la semana.',items:ds.map(d=>({id:d,art:dayArt(d),say:d})),explain:ds.join(', ')+'.'})},
  c:(ctx,rng)=>{const t=todayName(ctx),i=WEEK.indexOf(t),tm=rng()<.5,ans=WEEK[(i+(tm?1:6))%7];return Q.choose(rng,{key:'wt:'+t+tm,prompt:'Hoy es '+t+'. '+(tm?'¿Qué día será mañana?':'¿Qué día fue ayer?'),options:[ans,...sample(WEEK.filter(x=>x!==ans&&x!==t),2,rng)].map(x=>({id:x,art:dayArt(x)})),answer:ans,explain:'Hoy es '+t+'. '+(tm?'Mañana será ':'Ayer fue ')+ans+'.'})}},
 plan:{examples:['a','c'],practice:['a','c','b'],reinforce:['b','a'],check:['c','a','b']},
 home:'Marquen cada mañana el día en un calendario y digan «ayer fue…, hoy es…, mañana será…».'});

/* ===================== MI CUERPO Y YO ===================== */
const TB=Object.keys(C.TAP.body),TF=Object.keys(C.TAP.face);
const tapGen=sc=>(ctx,rng)=>{const a=pick(Object.keys(C.TAP[sc]),rng);return Q.raw('tap',{key:'tp:'+sc+a,scene:sc,answer:a,prompt:'Toca '+C.TAP[sc][a]+'.',explain:'Esta es '+C.TAP[sc][a]+'.'})};
const USE=[['¿Con qué parte del cuerpo vemos?','ojos','👁️','Con los ojos vemos.'],['¿Con qué parte del cuerpo oímos?','orejas','👂','Con las orejas oímos.'],['¿Con qué parte del cuerpo olemos?','nariz','👃','Con la nariz olemos.'],['¿Con qué parte del cuerpo comemos y hablamos?','boca','👄','Con la boca comemos y hablamos.'],['¿Con qué parte del cuerpo agarramos las cosas?','manos','✋','Con las manos agarramos las cosas.'],['¿Con qué parte del cuerpo caminamos?','pies','🦶','Con los pies caminamos.']];
C.skill({id:'partes',mod:'cuerpo',icon:'🧍',title:'Partes de mi cuerpo',blurb:'Cabeza, brazos, cara y para qué sirven',
 learn:ctx=>({title:'Mi cuerpo tiene muchas partes',say:'Tengo cabeza, brazos, manos, piernas y pies. En la cara tengo ojos, nariz, boca y orejas. Cada parte sirve para algo.',
  cards:[['ojos','👁️','Estos son los ojos. Con ellos vemos.'],['orejas','👂','Estas son las orejas. Con ellas oímos.'],['nariz','👃','Esta es la nariz. Con ella olemos.'],['boca','👄','Esta es la boca. Con ella comemos y hablamos.'],['manos','✋','Estas son las manos. Con ellas agarramos.'],['pies','🦶','Estos son los pies. Con ellos caminamos.'],['corazón','❤️','El corazón late. Pon tu mano en el pecho y lo sientes.'],['cerebro','🧠','El cerebro está dentro de la cabeza y nos ayuda a pensar.']].map(([n,e,say])=>({arts:[em(e,n)],label:n,say})),
  adult:'Nombren partes del cuerpo mientras lo bañan o lo visten. Para «por dentro» (corazón, cerebro) basta con que sienta su latido (Cuadernillo MINED, pp. 6 y 16).'}),
 gens:{a:tapGen('body'),b:(ctx,rng)=>{const u=pick(USE,rng),ds=sample(USE.filter(x=>x!==u),2,rng);return Q.choose(rng,{key:'us:'+u[1],prompt:u[0],options:[u,...ds].map(x=>({id:x[1],art:em(x[2],x[1])})),answer:u[1],listen:[u,...ds].map(x=>x[1]),explain:u[3]})},c:PG.a,d:tapGen('face')},
 plan:{examples:['a','b'],practice:['a','d','b'],reinforce:['b','c'],check:['a','d','b']},
 home:'Canten «cabeza, hombros, rodillas y pies» tocando cada parte.'});

const SEN=[['ver','👁️','los ojos','🌈','el arcoíris','Con los ojos vemos el arcoíris.'],['oír','👂','las orejas','🎵','la música','Con las orejas oímos la música.'],['oler','👃','la nariz','🌸','una flor','Con la nariz olemos una flor.'],['probar','👅','la lengua','🍋','un limón','Con la lengua probamos un limón.'],['tocar','✋','las manos','🧸','un peluche','Con las manos tocamos un peluche.']];
const SOTHER={oír:[['🌸','la flor'],['🍋','el limón'],['🧸','el peluche']],oler:[['🎵','la música'],['🧸','el peluche']],probar:[['🎵','la música'],['🧸','el peluche']]};
const senseQ={oír:['Con las orejas escuchamos. ¿Qué podemos escuchar?','🎵','la música'],oler:['Con la nariz olemos. ¿Qué huele rico?','🌸','la flor'],probar:['Con la lengua probamos. ¿Qué podemos probar?','🍋','el limón']};
C.skill({id:'sentidos',mod:'cuerpo',icon:'👃',title:'Los cinco sentidos',blurb:'Ver, oír, oler, probar y tocar',
 learn:ctx=>({title:'Con mi cuerpo conozco el mundo',say:'Con los ojos vemos, con las orejas oímos, con la nariz olemos, con la lengua probamos y con las manos tocamos.',
  cards:SEN.map(s=>({arts:[em(s[1],s[2]),em(s[3],s[4])],label:s[0],say:s[5]})),
  adult:'Hagan una caminata de sentidos: ¿qué oímos?, ¿qué olemos?, ¿qué tocamos? (Cuadernillo MINED, p. 7).'}),
 gens:{
  a:(ctx,rng)=>{const ss=sample(SEN,3,rng);return Q.match(rng,{key:'sm:'+ss.map(s=>s[0]).join(),prompt:'Une cada parte del cuerpo con lo que sentimos con ella.',pairs:ss.map(s=>({id:s[0],l:em(s[1],s[2]),r:em(s[3],s[4]),say:s[5]})),explain:ss.map(s=>s[5]).join(' ')})},
  b:(ctx,rng)=>{const s=pick(SEN,rng),ds=sample(SEN.filter(x=>x!==s),2,rng);return Q.choose(rng,{key:'so:'+s[0],prompt:'¿Con qué parte del cuerpo '+({ver:'vemos el arcoíris',oír:'oímos la música',oler:'olemos una flor',probar:'probamos un limón',tocar:'tocamos un peluche'}[s[0]])+'?',model:[em(s[3],s[4])],options:[s,...ds].map(x=>({id:x[0],art:em(x[1],x[2])})),answer:s[0],listen:[s,...ds].map(x=>x[2]),explain:s[5]})},
  c:(ctx,rng)=>{const k=pick(Object.keys(senseQ),rng),[t,e,l]=senseQ[k],pool=SOTHER[k],dd=sample(pool,2,rng);return Q.choose(rng,{key:'sq:'+k+dd.map(x=>x[0]).join(),prompt:t,options:[[e,l],...dd.map(x=>[x[0],x[1]])].map(x=>({id:x[0],art:em(x[0],x[1])})),answer:e,listen:[l,...dd.map(x=>x[1])],explain:'Podemos '+({oír:'escuchar',oler:'oler',probar:'probar'}[k])+' '+l+'.'})}},
 plan:{examples:['a','b'],practice:['b','c','a'],reinforce:['a','c'],check:['b','c','a']},
 home:'Jueguen «adivina con los ojos cerrados»: oler especias, tocar telas, probar frutas.'});

const SANO=['zanahoria','manzana','plátano','leche','huevo','brócoli','pan','naranja','pera','tomate'],DULCE=['helado','pastel','caramelo','galleta','paleta','dona'];
C.skill({id:'alimentos',mod:'cuerpo',icon:'🥕',title:'Alimentos que me ayudan a crecer',blurb:'Todos los días y de vez en cuando',
 learn:ctx=>({title:'Comer bien ayuda a crecer fuerte',say:'Las frutas, las verduras, la leche y los huevos nos ayudan a crecer fuertes. Los dulces son ricos, pero mejor de vez en cuando.',
  cards:[{arts:['zanahoria','manzana','leche'].map(n=>wordArt(byName[n])),label:'todos los días',say:'La zanahoria, la manzana y la leche nos ayudan a crecer.'},{arts:['helado','caramelo','pastel'].map(n=>wordArt(byName[n])),label:'de vez en cuando',say:'El helado, el caramelo y el pastel son para de vez en cuando.'}],
  adult:'Sin culpas: los dulces no son «malos», solo son para pocas veces (Cuadernillo MINED, p. 10).'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const k=phase==='check'?3:2,items=[...sample(SANO,k,rng).map(n=>({id:n,art:wordArt(byName[n]),bin:'sano'})),...sample(DULCE,k,rng).map(n=>({id:n,art:wordArt(byName[n]),bin:'dulce'}))];
   return Q.sort(rng,{key:'al:'+items.map(x=>x.id).join(),prompt:'Pon cada alimento donde corresponde.',bins:[{id:'sano',art:em('🥗','todos los días'),label:'todos los días'},{id:'dulce',art:em('🍬','de vez en cuando'),label:'de vez en cuando'}],items,explain:'Todos los días: '+items.filter(x=>x.bin==='sano').map(x=>x.id).join(', ')+'. De vez en cuando: '+items.filter(x=>x.bin==='dulce').map(x=>x.id).join(', ')+'.'})},
  b:(ctx,rng)=>{const w=pick(SANO,rng),ds=sample(DULCE,2,rng);return Q.choose(rng,{key:'ab:'+w+ds.join(),prompt:'Toca lo que nos ayuda a crecer fuertes.',options:[w,...ds].map(n=>({id:n,art:wordArt(byName[n])})),answer:w,listen:[w,...ds],explain:byName[w].art[0].toUpperCase()+byName[w].art.slice(1)+' '+w+' nos ayuda a crecer fuertes.'})},
  c:(ctx,rng)=>{const gs=sample(SANO,3,rng),d=pick(DULCE,rng),ws=[...gs,d];return Q.choose(rng,{key:'ac:'+ws.join(),prompt:'Tres nos ayudan a crecer. ¿Cuál es para de vez en cuando?',options:ws.map(n=>({id:n,art:wordArt(byName[n])})),answer:d,listen:ws,explain:'El dulce es para de vez en cuando: '+d+'.'})}},
 plan:{examples:['a','b'],practice:['b','a','c'],reinforce:['c','a'],check:['b','c','a']},
 home:'Armen un plato con una fruta, una verdura y un lácteo.'});

const FACES=[['contento','😀'],['triste','😢'],['enojado','😠'],['asustado','😨'],['con sueño','😴'],['sorprendido','😲']];
const SIT=[['A Ana se le cayó su helado.','🍦','helado que se cae','triste'],['Hoy es mi cumpleaños y hay fiesta.','🎂','cumpleaños','contento'],['Hay una tormenta con truenos fuertes.','⛈️','tormenta','asustado'],['Es de noche y tengo muchas ganas de dormir.','🛏️','hora de dormir','con sueño'],['Me quitaron mi juguete y no me lo devuelven.','🧸','juguete quitado','enojado'],['Abro un regalo que no esperaba.','🎁','regalo sorpresa','sorprendido']];
const fa=n=>{const f=FACES.find(x=>x[0]===n);return em(f[1],n)};
C.skill({id:'emociones',mod:'cuerpo',icon:'😊',title:'Cómo me siento',blurb:'Caras y emociones',
 learn:ctx=>({title:'Las caras muestran lo que sentimos',say:'Podemos estar contentos, tristes, enojados, asustados o con sueño. Todas las emociones son normales.',
  cards:FACES.map(([n,e])=>({arts:[em(e,n)],label:n,say:'Esta cara está '+n+'.'})),
  adult:'Nombren las emociones cuando aparezcan: «veo que estás enojado». Ayuda a que aprenda a expresarlas (Cuadernillo MINED, p. 18: símbolos creados).'}),
 gens:{
  a:(ctx,rng)=>{const [n]=pick(FACES,rng),ds=sample(FACES.filter(f=>f[0]!==n),2,rng);return Q.choose(rng,{key:'ea:'+n,prompt:'Toca la cara de alguien que está '+n+'.',options:[n,...ds.map(x=>x[0])].map(x=>({id:x,art:fa(x)})),answer:n,listen:[n,...ds.map(x=>x[0])],explain:'Esta cara muestra que está '+n+'.'})},
  b:(ctx,rng)=>{const s=pick(SIT,rng),ds=sample(FACES.filter(f=>f[0]!==s[3]),2,rng);return Q.choose(rng,{key:'es:'+s[2],prompt:s[0]+' ¿Cómo se siente?',model:[em(s[1],s[2])],options:[s[3],...ds.map(x=>x[0])].map(x=>({id:x,art:fa(x)})),answer:s[3],explain:'En esta situación se siente '+s[3]+'.'})},
  c:(ctx,rng)=>{const ss=sample(SIT,3,rng);return Q.match(rng,{key:'em:'+ss.map(s=>s[2]).join(),prompt:'Une cada situación con la cara que muestra cómo se siente.',pairs:ss.map(s=>({id:s[2],l:em(s[1],s[2]),r:fa(s[3]),say:s[0]+' Se siente '+s[3]+'.'})),explain:ss.map(s=>s[0]+' '+s[3]+'.').join(' ')})}},
 plan:{examples:['a','b'],practice:['a','b','c'],reinforce:['b','c'],check:['a','b','c']},
 home:'Pregunten «¿cómo te sentiste hoy?» y que elija una cara.'});

const ADU=[['el enchufe','🔌'],['el fuego','🔥'],['un cuchillo','🔪'],['las medicinas','💊'],['cruzar la calle','🚸']],SOLO=[['leer un libro','📖'],['jugar con un peluche','🧸'],['dibujar','🖍️'],['armar un rompecabezas','🧩'],['comer una fruta','🍎']];
const LIGHT={rojo:['✋','me detengo'],amarillo:['👀','miro y me preparo'],verde:['🚶','camino con un adulto']};
C.skill({id:'seguridad',mod:'cuerpo',icon:'🚦',title:'Me cuido y me cuidan',blurb:'Semáforo y cosas para hacer con un adulto',
 learn:ctx=>({title:'Hay cosas que hago con un adulto',say:'Hay cosas que puedo hacer solo, como dibujar. Y hay cosas que hago con un adulto, como cruzar la calle. En el semáforo, rojo es parar.',
  cards:[{arts:[objArt('trafficlight','semáforo en rojo',{on:'rojo'}),em('✋','me detengo')],label:'rojo: me detengo',say:'Rojo: me detengo.'},{arts:[objArt('trafficlight','semáforo en verde',{on:'verde'}),em('🚶','camino con un adulto')],label:'verde: camino con un adulto',say:'Verde: camino con un adulto.'},{arts:[em('🔌','el enchufe'),em('🧑','un adulto')],label:'con un adulto',say:'El enchufe y el fuego se tocan solo con un adulto.'}],
  adult:'Hablen con calma de los peligros y de a quién pedir ayuda (Cuadernillo MINED, pp. 20 y 23: autocuidado y seguridad vial).'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const k=phase==='check'?3:2,items=[...sample(ADU,k,rng).map(o=>({id:o[0],art:em(o[1],o[0]),bin:'adulto'})),...sample(SOLO,k,rng).map(o=>({id:o[0],art:em(o[1],o[0]),bin:'solo'}))];
   return Q.sort(rng,{key:'sg:'+items.map(x=>x.id).join(),prompt:'Pon cada cosa donde corresponde: con un adulto o yo solo.',bins:[{id:'adulto',art:em('🧑','con un adulto'),label:'con un adulto'},{id:'solo',art:em('🙋','yo solo'),label:'yo solo'}],items,explain:'Con un adulto: '+items.filter(x=>x.bin==='adulto').map(x=>x.id).join(', ')+'. Yo solo: '+items.filter(x=>x.bin==='solo').map(x=>x.id).join(', ')+'.'})},
  b:(ctx,rng)=>{const c=pick(Object.keys(LIGHT),rng);return Q.choose(rng,{key:'sl:'+c,prompt:'El semáforo está en '+c+'. ¿Qué hago?',model:[objArt('trafficlight','semáforo en '+c,{on:c})],options:Object.entries(LIGHT).map(([k,v])=>({id:k,art:em(v[0],v[1])})),answer:c,listen:Object.values(LIGHT).map(v=>v[1]),explain:'En '+c+': '+LIGHT[c][1]+'.'})},
  c:(ctx,rng)=>{const a=pick(ADU,rng),ds=sample(SOLO,2,rng);return Q.choose(rng,{key:'sa:'+a[0]+ds.map(x=>x[0]).join(),prompt:'Toca lo que no debo hacer o tocar sin un adulto.',options:[a,...ds].map(o=>({id:o[0],art:em(o[1],o[0])})),answer:a[0],listen:[a,...ds].map(o=>o[0]),explain:a[0]+': eso lo hago con un adulto.'})}},
 plan:{examples:['a','b'],practice:['b','c','a'],reinforce:['a','c'],check:['b','c','a']},
 home:'Practiquen el semáforo en la calle: «rojo: nos detenemos». Y elijan a quién pedir ayuda.'});

/* ===================== MI MUNDO ===================== */
const PLACES=[['la escuela','🏫','aprendemos','📖','¿Dónde aprendemos con la maestra?','Aprendemos en la escuela.'],['el hospital','🏥','nos cuidan si estamos enfermos','🩺','¿A dónde vamos si estamos enfermos?','Si estamos enfermos vamos al hospital.'],['la panadería','🥖','compramos pan','🍞','¿Dónde compramos pan?','El pan se compra en la panadería.'],['el parque','🏞️','jugamos','⚽','¿Dónde jugamos al aire libre?','Jugamos en el parque.'],['la tienda','🛒','compramos comida','🍎','¿Dónde compramos fruta y comida?','En la tienda compramos comida.'],['la casa','🏠','dormimos','🛏️','¿Dónde dormimos?','Dormimos en la casa.'],['la parada de bus','🚏','esperamos el bus','🚌','¿Dónde esperamos el bus?','Esperamos el bus en la parada.']];
const pl=p=>em(p[1],p[0].replace(/^(la|el) /,''));
const act=p=>em(p[3],p[2]);
C.skill({id:'lugares',mod:'mundo',icon:'🏘️',title:'Lugares de mi comunidad',blurb:'Escuela, parque, hospital y más',
 learn:ctx=>({title:'En mi comunidad hay muchos lugares',say:'Cada lugar sirve para algo. En la escuela aprendemos, en el parque jugamos y en el hospital nos cuidan.',
  cards:PLACES.slice(0,4).map(p=>({arts:[pl(p),act(p)],label:p[0].replace(/^(la|el) /,''),say:p[5]})),
  adult:'Al pasar por cada lugar, nómbrenlo y digan para qué sirve (Cuadernillo MINED, p. 26: la comunidad).'}),
 gens:{
  a:(ctx,rng)=>{const p=pick(PLACES,rng),ds=sample(PLACES.filter(x=>x!==p),2,rng);return Q.choose(rng,{key:'lg:'+p[1],prompt:p[4],options:[p,...ds].map(x=>({id:x[1],art:pl(x)})),answer:p[1],listen:[p,...ds].map(x=>x[0]),explain:p[5]})},
  b:(ctx,rng)=>{const ps=sample(PLACES,3,rng);return Q.match(rng,{key:'lm:'+ps.map(p=>p[1]).join(),prompt:'Une cada lugar con lo que hacemos allí.',pairs:ps.map(p=>({id:p[1],l:pl(p),r:act(p),say:p[5]})),explain:ps.map(p=>p[5]).join(' ')})},
  c:(ctx,rng)=>{const p=pick(PLACES,rng),ds=sample(PLACES.filter(x=>x!==p),2,rng);return Q.choose(rng,{key:'lc:'+p[1],prompt:'¿Qué hacemos en '+p[0]+'?',model:[pl(p)],options:[p,...ds].map(x=>({id:x[1],art:act(x)})),answer:p[1],listen:[p,...ds].map(x=>x[2]),explain:p[5]})}},
 plan:{examples:['a','b'],practice:['a','c','b'],reinforce:['b','a'],check:['a','c','b']},
 home:'Hagan un recorrido por el barrio nombrando cada lugar y para qué sirve.'});

const SIGNS=[['alto','🛑','Esta señal dice alto: debo detenerme.','✋','me detengo'],['cuidado, niños','🚸','Esta señal avisa que cruzan niños: voy despacio.','🐢','voy despacio'],['prohibido pasar','⛔','Esta señal dice que no se puede pasar.','❌','no paso'],['semáforo','🚦','El semáforo me dice cuándo parar y cuándo caminar.','🚶','espero la luz verde']];
const sg=s=>em(s[1],'señal de '+s[0]),ac=s=>em(s[3],s[4]);
C.skill({id:'senales',mod:'mundo',icon:'🛑',title:'Señales que nos cuidan',blurb:'Alto, semáforo y cuidado',
 learn:ctx=>({title:'Las señales nos dicen qué hacer',say:'Algunas señales dibujan lo que debemos hacer. Esta dice alto. Esta avisa que cruzan niños.',
  cards:SIGNS.map(s=>({arts:[sg(s),ac(s)],label:s[0],say:s[2]})),
  adult:'Busquen señales en la calle y pregunten qué dicen (Cuadernillo MINED, p. 18: símbolos convencionales).'}),
 gens:{
  a:(ctx,rng)=>{const s=pick(SIGNS,rng),ds=sample(SIGNS.filter(x=>x!==s),2,rng);return Q.choose(rng,{key:'sn:'+s[1],prompt:'¿Qué nos dice esta señal?',model:[sg(s)],options:[s,...ds].map(x=>({id:x[1],art:ac(x)})),answer:s[1],listen:[s,...ds].map(x=>x[4]),explain:s[2]})},
  b:(ctx,rng)=>{const ss=sample(SIGNS,3,rng);return Q.match(rng,{key:'sm:'+ss.map(s=>s[1]).join(),prompt:'Une cada señal con lo que debo hacer.',pairs:ss.map(s=>({id:s[1],l:sg(s),r:ac(s),say:s[2]})),explain:ss.map(s=>s[2]).join(' ')})}},
 plan:{examples:['a','b'],practice:['a','b','a'],reinforce:['b','a'],check:['a','a','b']},
 home:'En la calle: «¿qué dice esa señal?».'});

const GROW=[['🌱','brota la semilla'],['🌿','la planta crece'],['🌻','florece']];
const NEED=[['💧','el agua'],['☀️','el sol']],NONE=[['🧸','el peluche'],['🍭','la paleta'],['📱','el teléfono'],['🎈','el globo']];
C.skill({id:'planta',mod:'mundo',icon:'🌱',title:'Cómo crece una planta',blurb:'Orden del crecimiento y qué necesita',
 learn:ctx=>({title:'Las plantas nacen y crecen',say:'Una planta empieza como una semillita. Con agua y sol crece y después da flores.',
  cards:[{arts:GROW.map(([e,l])=>em(e,l)),label:'cómo crece',say:'Primero brota la semilla, después la planta crece y al final florece.'},{arts:NEED.map(([e,l])=>em(e,l)),label:'necesita agua y sol',say:'Una planta necesita agua y sol.'}],
  adult:'Siembren frijoles en algodón húmedo y miren cómo brotan cada día (Cuadernillo MINED, p. 30: huerto escolar).'}),
 gens:{
  a:(ctx,rng)=>Q.order({key:'gr:'+rng(),prompt:'Pon las imágenes en el orden en que crece la planta.',items:sa(GROW),explain:'Primero la semilla brota, después la planta crece y al final florece.'}),
  b:(ctx,rng)=>{const its=[...NEED,...sample(NONE,4,rng)].map(([e,l])=>({id:l,art:em(e,l)}));return Q.multi(rng,{key:'gm:'+its.map(x=>x.id).join(),prompt:'Toca todo lo que necesita una planta para crecer.',items:its,targets:NEED.map(x=>x[1]),explain:'Una planta necesita agua y sol.'})},
  c:(ctx,rng)=>{const n=pick(NEED,rng),ds=sample(NONE,2,rng);return Q.choose(rng,{key:'gc:'+n[1]+ds.map(x=>x[1]).join(),prompt:'¿Qué necesita una planta para vivir?',options:[n,...ds].map(([e,l])=>({id:l,art:em(e,l)})),answer:n[1],listen:[n,...ds].map(x=>x[1]),explain:'Una planta necesita '+n[1]+'.'})}},
 plan:{examples:['a','b'],practice:['c','a','b'],reinforce:['b','a'],check:['c','a','b']},
 home:'Siembren una semilla en casa y riéguenla juntos cada día.'});
})(typeof globalThis!=='undefined'?globalThis:this);
