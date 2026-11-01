/* Rutas 3, 4 y 5: Clasificar y comparar · Formas y colores · Pienso y descubro. */
(function(root){
'use strict';
const C=root.Content||require('./content.js');
const {shuffle,pick,sample,NW,numArt,swArt,shapeArt,colorObj,objArt,em,wordArt,tx,group,Q,WORDS,byName,W,COLORS,adj,SHAPES,OBJ}=C.h;
const OT=Object.keys(OBJ);
const BASIC=['rojo','azul','amarillo','verde'];
const VIS=['rojo','azul','amarillo','verde','naranja','morado'];
const nameOf=o=>(o.fem?'la ':'el ')+o.name;

C.module({id:'clasificar',title:'Clasificar y comparar',icon:'🧺',bg:'#dfeddf',blurb:'Agrupar por color, forma, tamaño y categoría'});
C.module({id:'formas',title:'Formas y colores',icon:'🔷',bg:'#f6e0d5',blurb:'Figuras, colores y pintar con instrucciones'});
C.module({id:'razonar',title:'Pienso y descubro',icon:'🧩',bg:'#e3ecf7',blurb:'Series, memoria, instrucciones y relaciones'});

/* ===================== CLASIFICAR Y COMPARAR ===================== */
const cItem=(t,c,x)=>({id:t+'-'+c+(x&&x.scale?'-'+x.scale:''),art:colorObj(t,c,x)});
C.skill({id:'clasif-color',mod:'clasificar',icon:'🧺',title:'Agrupar por color',blurb:'Poner con los del mismo color',
 learn:ctx=>({title:'Agrupar es poner juntas las cosas parecidas',say:'Podemos poner juntas las cosas del mismo color. Las rojas con las rojas y las azules con las azules.',
  cards:ctx.colors.slice(0,3).map(c=>({arts:[colorObj('apple',c),colorObj('ball',c)],label:c,say:'Estas cosas son de color '+c+'.'})),
  adult:'En casa: separen medias, tapas o bloques por color en dos cajas.'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const k=phase==='check'&&ctx.colors.length>=3?3:2,cs=sample(ctx.colors,k,rng),items=cs.flatMap(c=>sample(OT,2,rng).map(t=>Object.assign(cItem(t,c),{bin:c})));
   return Q.sort(rng,{key:'cs:'+items.map(x=>x.id).join(),prompt:'Pon cada cosa con las de su mismo color.',bins:cs.map(c=>({id:c,art:swArt(c),label:c})),items,explain:items.map(x=>x.art.label).join(', ')+': cada una va con las de su color.'})},
  b:(ctx,rng)=>{const cs=sample(ctx.colors,3,rng),c=cs[0],n=pick([2,3],rng),t=sample(OT,6,rng),items=[];
   t.forEach((ty,i)=>{const col=i<n?c:cs[1+(i%2)];items.push(cItem(ty,col))});
   return Q.multi(rng,{key:'cm:'+c+items.map(x=>x.id).join(),prompt:'Toca todo lo que es '+c+'.',items,targets:items.filter(x=>x.art.color===c).map(x=>x.id),explain:'Todo lo que es '+c+' está resaltado: '+n+' cosas.'})},
  c:(ctx,rng)=>{const cs=sample(ctx.colors,2,rng),t=sample(OT,4,rng),items=t.map((ty,i)=>cItem(ty,i===0?cs[1]:cs[0]));
   return Q.choose(rng,{key:'co:'+items.map(x=>x.id).join(),prompt:'Tres son del mismo color. ¿Cuál es de otro color?',options:items,answer:items[0].id,explain:'Tres son de color '+cs[0]+' y este es de color '+cs[1]+'.'})}},
 plan:{examples:['a','c'],practice:['a','b','a'],reinforce:['c','b'],check:['a','b','c']},
 home:'Clasifiquen juguetes, ropa o frutas por color. Pregunten: «¿por qué van juntas?».'});

const FORMCOL=['rojo','azul','amarillo','verde','naranja','morado'];
C.skill({id:'clasif-forma',mod:'clasificar',icon:'🔺',title:'Agrupar por forma',blurb:'Las que tienen la misma forma',
 learn:ctx=>({title:'Las figuras se agrupan por su forma',say:'Un círculo puede ser rojo o azul, pero sigue siendo un círculo. Agrupamos por la forma.',
  cards:ctx.shapes.slice(0,3).map(s=>({arts:[shapeArt(s,'rojo'),shapeArt(s,'azul')],label:s,say:'Estos dos son '+s+'. Tienen distinto color, pero la misma forma.'})),
  adult:'Busquen formas en casa: la tapa es un círculo, la ventana es un rectángulo.'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const k=phase==='check'&&ctx.shapes.length>=3?3:2,ss=sample(ctx.shapes,k,rng),items=ss.flatMap(s=>sample(FORMCOL,2,rng).map(c=>({id:s+'-'+c,art:shapeArt(s,c),bin:s})));
   return Q.sort(rng,{key:'fs:'+items.map(x=>x.id).join(),prompt:'Pon cada figura con las que tienen su misma forma.',bins:ss.map(s=>({id:s,art:shapeArt(s,'verde',{outline:true}),label:s})),items,explain:items.map(x=>x.art.label).join(', ')+': van juntas las que tienen la misma forma.'})},
  b:(ctx,rng)=>{const s=pick(ctx.shapes,rng),os=ctx.shapes.filter(x=>x!==s),n=pick([3,4],rng),items=Array.from({length:9},(_,i)=>({id:'f'+i,sh:i<n?s:os[i%os.length],art:null}));
   const sh=shuffle(items,rng);sh.forEach((o,i)=>{o.art=shapeArt(o.sh,FORMCOL[(i*5+3)%6])});
   return Q.multi(rng,{key:'fh:'+s+sh.map(x=>x.sh[0]).join(''),prompt:'Toca todos los '+s+'s.',items:sh.map(o=>({id:o.id,art:o.art})),targets:sh.filter(o=>o.sh===s).map(o=>o.id),explain:'Hay '+n+' '+s+'s escondidos entre las demás figuras.'})},
  c:(ctx,rng)=>{const ss=sample(ctx.shapes,2,rng),cs=sample(FORMCOL,4,rng),items=[0,1,2,3].map(i=>({id:'o'+i,art:shapeArt(i===0?ss[1]:ss[0],cs[i])}));
   return Q.choose(rng,{key:'fo:'+ss.join()+cs.join(),prompt:'Tres tienen la misma forma. ¿Cuál tiene otra forma?',options:items,answer:'o0',explain:'Tres son '+ss[0]+' y este es '+ss[1]+'. Tiene otra forma.'})}},
 plan:{examples:['a','c'],practice:['a','b','c'],reinforce:['b','a'],check:['a','b','c']},
 home:'Pidan: «tráeme algo redondo» o «algo con esquinas».'});

C.skill({id:'tamano',mod:'clasificar',icon:'📏',title:'Tamaños y medidas',blurb:'Grande, pequeño, largo, corto, alto, bajo',
 learn:ctx=>({title:'Podemos comparar el tamaño',say:'Esta es grande y esta es pequeña. También hay cosas largas y cortas, altas y bajas, gruesas y delgadas.',
  cards:[{arts:[colorObj('apple','rojo',{scale:1}),colorObj('apple','rojo',{scale:.45})],label:'grande y pequeña',say:'Una manzana grande y una manzana pequeña.'},{arts:[objArt('bar','cinta larga',{len:.95,th:.16,color:'azul'}),objArt('bar','cinta corta',{len:.45,th:.16,color:'azul'})],label:'larga y corta',say:'Una cinta larga y una cinta corta.'},{arts:[objArt('tower','torre alta',{h:.95,color:'rojo'}),objArt('tower','torre baja',{h:.45,color:'rojo'})],label:'alta y baja',say:'Una torre alta y una torre baja.'},{arts:[objArt('trunk','tronco grueso',{w:.9,color:'café'}),objArt('trunk','tronco delgado',{w:.35,color:'café'})],label:'gruesa y delgada',say:'Un tronco grueso y un tronco delgado.'}],
  adult:'Comparen objetos reales: lápiz largo y corto, vaso alto y bajo (Cuadernillo MINED, p. 15).'}),
 gens:{
  a:(ctx,rng)=>{const ts=sample(OT,2,rng),cs=sample(VIS,2,rng),items=ts.flatMap((t,i)=>[1,.45].map(sc=>({id:t+sc,art:colorObj(t,cs[i],{scale:sc}),bin:sc===1?'big':'small'})));
   return Q.sort(rng,{key:'ts:'+items.map(x=>x.id).join(),prompt:'Pon las cosas grandes con las grandes y las pequeñas con las pequeñas.',bins:[{id:'big',art:colorObj('apple','rojo',{scale:1,label:'grande'}),label:'grandes'},{id:'small',art:colorObj('apple','rojo',{scale:.45,label:'pequeña'}),label:'pequeñas'}],items,explain:'Las más grandes van con las grandes y las más chicas con las pequeñas.'})},
  b:(ctx,rng)=>{const t=pick(OT,rng),c=pick(VIS,rng),asc=rng()<.6,sz=[['s',.45,'pequeño'],['m',.7,'mediano'],['l',1,'grande']],items=sz.map(([id,sc,w])=>({id,art:colorObj(t,c,{scale:sc}),say:w}));
   return Q.order({key:'to:'+t+c+asc,prompt:asc?'Pon del más pequeño al más grande.':'Pon del más grande al más pequeño.',items:asc?items:items.slice().reverse(),explain:asc?'Primero el pequeño, luego el mediano y al final el grande.':'Primero el grande, luego el mediano y al final el pequeño.'})},
  c:(ctx,rng)=>{const sz=[['s',.45,'pequeño','pequeña'],['m',.7,'mediano','mediana'],['l',1,'grande','grande']];
   return Q.match(rng,{key:'tm:'+rng(),prompt:'Une cada perrito con la casa de su tamaño.',pairs:sz.map(([id,sc,m,f])=>({id,l:em('🐶','perro '+m,{scale:sc}),r:em('🏠','casa '+f,{scale:sc}),say:'El perro '+m+' va con la casa '+f+'.'})),explain:'Cada perro entra en la casa de su tamaño.'})},
  d:(ctx,rng)=>{const D=[{t:'bar',a:'más largo',b:'más corto',x:['la cinta más larga','la cinta más corta'],mk:(big,col)=>objArt('bar',big?'cinta larga':'cinta corta',{len:big?.95:.45,th:.16,color:col})},{t:'tower',x:['la torre más alta','la torre más baja'],mk:(big,col)=>objArt('tower',big?'torre alta':'torre baja',{h:big?.95:.45,color:col})},{t:'trunk',x:['el tronco más grueso','el tronco más delgado'],mk:(big,col)=>objArt('trunk',big?'tronco grueso':'tronco delgado',{w:big?.9:.35,color:col})}],
   d=pick(D,rng),big=rng()<.5,col=pick(VIS,rng);
   return Q.choose(rng,{key:'tc:'+d.t+big+col,prompt:'Toca '+d.x[big?0:1]+'.',options:[{id:'big',art:d.mk(true,col)},{id:'small',art:d.mk(false,col)}],answer:big?'big':'small',explain:'Este es '+d.x[big?0:1]+'. Los comparamos uno al lado del otro.'})}},
 plan:{examples:['a','d'],practice:['d','a','b'],reinforce:['c','b'],check:['d','a','b']},
 home:'Ordenen tres vasos, lápices o zapatos de menor a mayor.'});

const CATN={animal:'animales',fruta:'frutas',ropa:'prendas de ropa',transporte:'transportes',juguete:'juguetes',verdura:'verduras'};
const CATONE={animal:'un animal',fruta:'una fruta',ropa:'una prenda de ropa',transporte:'un medio de transporte',juguete:'un juguete',verdura:'una verdura'};
const CATE={animal:'🐾',fruta:'🍎',ropa:'👕',transporte:'🚗',juguete:'🧸',verdura:'🥕'};
const catWords=c=>WORDS.filter(w=>w.cat===c);
C.skill({id:'categorias',mod:'clasificar',icon:'🧩',title:'Grupos y categorías',blurb:'Animales, frutas, ropa y más',
 learn:ctx=>({title:'Las cosas se agrupan por lo que son',say:'Los animales van juntos, las frutas van juntas y la ropa va junta. Cada grupo tiene un nombre.',
  cards:['animal','fruta','ropa','transporte'].map(c=>({arts:[wordArt(catWords(c)[0]),wordArt(catWords(c)[3])],label:CATN[c],say:catWords(c)[0].name+' y '+catWords(c)[3].name+' son '+CATN[c]+'.'})),
  adult:'Preguntemos: «¿a qué grupo pertenece?». Guarden la ropa, los juguetes y la comida cada uno en su lugar.'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const k=phase==='check'?3:2,cs=sample(Object.keys(CATN),k,rng),items=cs.flatMap(c=>sample(catWords(c),2,rng).map(w=>({id:w.name,art:wordArt(w),bin:c})));
   return Q.sort(rng,{key:'ct:'+items.map(x=>x.id).join(),prompt:'Pon cada cosa en su grupo.',bins:cs.map(c=>({id:c,art:em(CATE[c],CATN[c]),label:CATN[c]})),items,explain:items.map(x=>x.id+' son '+CATN[x.bin]).join('; ')+'.'})},
  b:(ctx,rng)=>{const [x,y]=sample(Object.keys(CATN),2,rng),good=sample(catWords(x),3,rng),odd=pick(catWords(y),rng),ws=[...good,odd];
   return Q.choose(rng,{key:'cd:'+ws.map(w=>w.name).join(),prompt:'Tres son '+CATN[x]+'. ¿Cuál no es '+CATONE[x]+'?',options:ws.map(w=>({id:w.name,art:wordArt(w)})),answer:odd.name,listen:ws.map(w=>w.name),explain:odd.name+' no es '+CATONE[x]+'. Es '+CATONE[y]+'.'})},
  c:(ctx,rng)=>{const cs=sample(Object.keys(CATN),3,rng),c=cs[0],ws=cs.map(k=>pick(catWords(k),rng));
   return Q.choose(rng,{key:'cc:'+ws.map(w=>w.name).join(),prompt:'Toca '+CATONE[c]+'.',options:ws.map(w=>({id:w.name,art:wordArt(w)})),answer:ws[0].name,listen:ws.map(w=>w.name),explain:ws[0].name+' es '+CATONE[c]+'.'})}},
 plan:{examples:['a','c'],practice:['c','a','b'],reinforce:['b','a'],check:['c','b','a']},
 home:'Ordenar la ropa limpia, los juguetes y los cubiertos es clasificar de verdad.'});

const MOVE={camina:['🐾','camina','¿Quién camina por la tierra?','camina'],nada:['🌊','nada','¿Quién nada en el agua?','nada'],vuela:['☁️','vuela','¿Quién vuela por el cielo?','vuela']};
const mv=t=>WORDS.filter(w=>w.tag===t);
C.skill({id:'donde-viven',mod:'clasificar',icon:'🐾',title:'Cómo se mueven los animales',blurb:'Camina, nada o vuela',
 learn:ctx=>({title:'Unos animales caminan, otros nadan y otros vuelan',say:'El perro camina, el pez nada y el pájaro vuela.',
  cards:[['perro','camina'],['pez','nada'],['pájaro','vuela']].map(([n,v])=>({arts:[wordArt(byName[n]),em(MOVE[v][0],v)],label:n+' · '+v,say:'El '+n+' '+v+'.'})),
  adult:'Imiten cómo se mueve cada animal con el cuerpo: caminar, nadar con los brazos, volar.'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const k=phase==='check'?3:2,ts=sample(Object.keys(MOVE),k,rng),items=ts.flatMap(t=>sample(mv(t),2,rng).map(w=>({id:w.name,art:wordArt(w),bin:t})));
   return Q.sort(rng,{key:'dv:'+items.map(x=>x.id).join(),prompt:'Pon cada animal donde se mueve: camina, nada o vuela.',bins:ts.map(t=>({id:t,art:em(MOVE[t][0],t),label:t})),items,explain:items.map(x=>x.id+' '+x.bin).join('; ')+'.'})},
  b:(ctx,rng)=>{const t=pick(Object.keys(MOVE),rng),w=pick(mv(t),rng),ds=sample(WORDS.filter(x=>x.cat==='animal'&&x.tag&&x.tag!==t),2,rng);
   return Q.choose(rng,{key:'dw:'+t+w.name,prompt:MOVE[t][2],options:[w,...ds].map(x=>({id:x.name,art:wordArt(x)})),answer:w.name,listen:[w,...ds].map(x=>x.name),explain:'El '+w.name+' '+t+'.'})},
  c:(ctx,rng)=>{const t=pick(Object.keys(MOVE),rng),good=sample(mv(t),3,rng),odd=pick(WORDS.filter(x=>x.cat==='animal'&&x.tag&&x.tag!==t),rng),ws=[...good,odd];
   return Q.choose(rng,{key:'dn:'+t+ws.map(w=>w.name).join(),prompt:'Tres animales '+(t==='camina'?'caminan':t==='nada'?'nadan':'vuelan')+'. ¿Cuál no '+t+'?',options:ws.map(w=>({id:w.name,art:wordArt(w)})),answer:odd.name,listen:ws.map(w=>w.name),explain:'El '+odd.name+' no '+t+': '+(odd.tag==='camina'?'camina':odd.tag==='nada'?'nada':'vuela')+'.'})}},
 plan:{examples:['a','b'],practice:['b','a','b'],reinforce:['c','a'],check:['b','c','a']},
 home:'Miren libros o videos de animales y pregunten cómo se mueve cada uno.'});

const MED={aire:['☁️','por aire','el aire'],agua:['🌊','por agua','el agua'],tierra:['🛣️','por tierra','la tierra']};
const tr=m=>WORDS.filter(w=>w.cat==='transporte'&&w.tag===m);
C.skill({id:'transporte',mod:'clasificar',icon:'🚌',title:'Medios de transporte',blurb:'Por aire, por agua y por tierra',
 learn:ctx=>({title:'Hay transportes que viajan por aire, por agua y por tierra',say:'El avión viaja por aire. El barco viaja por agua. El carro viaja por tierra.',
  cards:[['avión','aire'],['barco','agua'],['carro','tierra']].map(([n,m])=>({arts:[wordArt(byName[n]),em(MED[m][0],MED[m][1])],label:n+' · '+MED[m][1],say:'El '+n+' viaja '+MED[m][1]+'.'})),
  adult:'En la calle: «¿ese va por tierra? ¿y el avión?» (Cuadernillo MINED, p. 23).'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const ms=phase==='check'?['aire','agua','tierra']:sample(['aire','agua','tierra'],2,rng),items=ms.flatMap(m=>sample(tr(m),2,rng).map(w=>({id:w.name,art:wordArt(w),bin:m})));
   return Q.sort(rng,{key:'tr:'+items.map(x=>x.id).join(),prompt:'Pon cada transporte donde viaja: por aire, por agua o por tierra.',bins:ms.map(m=>({id:m,art:em(MED[m][0],MED[m][1]),label:MED[m][1]})),items,explain:items.map(x=>x.id+' '+MED[x.bin][1]).join('; ')+'.'})},
  b:(ctx,rng)=>{const m=pick(Object.keys(MED),rng),ws=['aire','agua','tierra'].map(k=>pick(tr(k),rng)),w=ws.find(x=>x.tag===m);
   return Q.choose(rng,{key:'tb:'+m+ws.map(x=>x.name).join(),prompt:'Toca el que viaja '+MED[m][1]+'.',options:ws.map(x=>({id:x.name,art:wordArt(x)})),answer:w.name,listen:ws.map(x=>x.name),explain:'El '+w.name+' viaja '+MED[m][1]+'.'})},
  c:(ctx,rng)=>{const ws=['aire','agua','tierra'].map(k=>pick(tr(k),rng));
   return Q.match(rng,{key:'tm:'+ws.map(x=>x.name).join(),prompt:'Une cada transporte con el lugar por donde viaja.',pairs:ws.map(w=>({id:w.name,l:wordArt(w),r:em(MED[w.tag][0],MED[w.tag][1]),say:'El '+w.name+' viaja '+MED[w.tag][1]+'.'})),explain:ws.map(w=>w.name+' '+MED[w.tag][1]).join('; ')+'.'})}},
 plan:{examples:['a','b'],practice:['b','a','c'],reinforce:['c','b'],check:['b','a','c']},
 home:'Cuenten cuántos transportes por tierra ven en un paseo. ¿Vieron alguno por aire?'});

/* ===================== FORMAS Y COLORES ===================== */
const SOBJ={círculo:[['wheel','rueda'],['ball','pelota']],cuadrado:[['window','ventana']],triángulo:[['roof','techo']],rectángulo:[['door','puerta']],óvalo:[['egg','huevo']],rombo:[['kite','cometa']]};
const sobj=(s,rng)=>{const [t,l]=pick(SOBJ[s],rng);return t==='ball'?colorObj('ball','rojo'):objArt(t,l)};
C.skill({id:'figuras',mod:'formas',icon:'⭐',title:'Figuras geométricas',blurb:'Círculo, cuadrado, triángulo y más',
 learn:ctx=>({title:'Cada figura tiene su forma y su nombre',say:'Estas son las figuras que vamos a conocer. Toca cada una para escuchar su nombre.',
  cards:ctx.shapes.map(s=>({arts:[shapeArt(s,pick(VIS,Math.random))],label:s,say:'Esta figura es el '+s+'.',observe:{area:'shapes',id:s}})),
  adult:'Dibujen cada figura en el aire con el dedo y busquen la misma forma en casa (Cuadernillo MINED, p. 14: figuras geométricas).'}),
 gens:{
  a:(ctx,rng)=>{const s=pick(ctx.shapes,rng),os=sample(ctx.shapes.filter(x=>x!==s),2,rng),cs=sample(VIS,3,rng);
   return Q.choose(rng,{key:'fn:'+s+os.join(),prompt:'Toca el '+s+'.',options:[s,...os].map((x,i)=>({id:x,art:shapeArt(x,cs[i])})),answer:s,explain:'Este es el '+s+'.'})},
  b:(ctx,rng)=>{const s=pick(ctx.shapes,rng),k=Math.min(3,ctx.shapes.length-1),os=sample(ctx.shapes.filter(x=>x!==s),k,rng),cs=sample(VIS,k+2,rng);
   return Q.choose(rng,{key:'fm:'+s+os.join(),prompt:'Busca la que tiene la misma forma que el modelo.',model:[shapeArt(s,cs[0])],options:[{id:s,art:shapeArt(s,cs[1],{scale:.7})},...os.map((x,i)=>({id:x,art:shapeArt(x,cs[i+2])}))],answer:s,explain:'Tiene la misma forma: '+s+'. El color o el tamaño pueden cambiar.'})},
  c:(ctx,rng)=>{const s=pick(ctx.shapes,rng),os=sample(SHAPES.filter(x=>x!==s),2,rng);
   return Q.choose(rng,{key:'fo:'+s+os.join(),prompt:'¿Qué cosa tiene forma de '+s+'?',options:[{id:s,art:sobj(s,rng)},...os.map(x=>({id:x,art:sobj(x,rng)}))],answer:s,explain:'Esta cosa tiene forma de '+s+'.'})},
  d:(ctx,rng)=>{const s=pick(ctx.shapes,rng),os=ctx.shapes.filter(x=>x!==s),n=pick([3,4],rng),items=shuffle(Array.from({length:9},(_,i)=>({id:'f'+i,sh:i<n?s:os[i%os.length]})),rng).map((o,i)=>Object.assign(o,{art:shapeArt(o.sh,VIS[(i*5+1)%6])}));
   return Q.multi(rng,{key:'fd:'+s+items.map(x=>x.sh[0]).join(''),prompt:'Encuentra todos los '+s+'s.',items:items.map(o=>({id:o.id,art:o.art})),targets:items.filter(o=>o.sh===s).map(o=>o.id),explain:'Hay '+n+' figuras con forma de '+s+'.'})},
  e:(ctx,rng)=>{const ss=sample(ctx.shapes,3,rng),cs=sample(VIS,6,rng);
   return Q.match(rng,{key:'fe:'+ss.join()+cs.join(),prompt:'Une cada figura con su contorno.',pairs:ss.map((s,i)=>({id:s,l:shapeArt(s,cs[i]),r:shapeArt(s,cs[i+3],{outline:true,scale:.85,label:'contorno de '+s}),say:'El '+s+' va con su contorno.'})),explain:ss.map(s=>s).join(', ')+': cada figura con su contorno.'})}},
 plan:{examples:['a','c'],practice:['a','b','e'],reinforce:['c','d'],check:['a','b','d']},
 home:'Dibujen figuras en papel y recórtenlas. Armen una casita con triángulo, cuadrado y rectángulo.'});

const OBJN={apple:'la manzana',ball:'la pelota',leaf:'la hoja',sun:'el sol',fish:'el pez',bird:'el pájaro',frog:'la rana',chick:'el pollito'};
C.skill({id:'colores-uso',mod:'formas',icon:'🎨',title:'Usar los colores',blurb:'¿De qué color es? Buscar por color',
 learn:ctx=>({title:'Todo tiene un color',say:'Las cosas tienen colores. Escucha los colores que vamos a usar.',
  cards:ctx.colors.map(c=>({arts:[swArt(c)],label:c,say:'Este es el color '+c+'.',observe:{area:'colors',id:c}})),
  adult:'Pregunten por el color de la ropa, la fruta y los juguetes durante el día (Cuadernillo MINED, pp. 6 y 11).'}),
 gens:{
  a:(ctx,rng)=>{const t=pick(OT,rng),c=pick(ctx.colors,rng),o=colorObj(t,c);
   return Q.choose(rng,{key:'cu:'+t+c,prompt:'¿De qué color es '+OBJN[t]+'?',model:[o],options:[c,...sample(ctx.colors.filter(x=>x!==c),2,rng)].map(x=>({id:x,art:swArt(x)})),answer:c,explain:o.label+': es de color '+c+'.'})},
  b:(ctx,rng)=>{const t=pick(OT,rng),cs=sample(ctx.colors,3,rng),o=colorObj(t,cs[0]);
   return Q.choose(rng,{key:'cb:'+t+cs.join(),prompt:'Toca '+OBJN[t]+' '+adj(cs[0],o.fem)+'.',options:cs.map(c=>({id:c,art:colorObj(t,c)})),answer:cs[0],explain:'Esta es '+OBJN[t]+' '+adj(cs[0],o.fem)+'.'})},
  c:(ctx,rng)=>{const cs=sample(ctx.colors,3,rng),ts=sample(OT,3,rng);
   return Q.match(rng,{key:'cm:'+cs.join()+ts.join(),prompt:'Une cada cosa con su color.',pairs:cs.map((c,i)=>({id:c,l:colorObj(ts[i],c),r:swArt(c),say:colorObj(ts[i],c).label+' es de color '+c+'.'})),explain:cs.join(', ')+': cada cosa con su color.'})}},
 plan:{examples:['a','b'],practice:['a','b','c'],reinforce:['b','c'],check:['a','b','c']},
 home:'Jueguen a «veo, veo» con colores: «algo de color verde».'});

const PCOL=['rojo','azul','amarillo','verde','naranja','morado'];
const pstep=(scene,r,c)=>({region:r,color:c,text:'Pinta '+C.PAINT[scene].regions[r]+' de '+c+'.'});
const palette=(steps,ctx,rng)=>{const need=[...new Set(steps.map(s=>s.color))],more=shuffle([...new Set([...ctx.colors,...BASIC])].filter(c=>!need.includes(c)),rng);return need.concat(more).slice(0,Math.max(4,need.length))};
function paintQ(scene,steps,ctx,rng,key){return Q.raw('paint',{key,scene,steps,palette:shuffle(palette(steps,ctx,rng),rng),prompt:steps.map(s=>s.text).join(' '),explain:'Seguimos cada instrucción: '+steps.map(s=>C.PAINT[scene].regions[s.region]+' '+s.color).join(', ')+'.'})}
C.skill({id:'pintar',mod:'formas',icon:'🖌️',title:'Pinta como se indica',blurb:'Seguir la instrucción y colorear',
 learn:ctx=>({title:'Escucha, elige el color y pinta',say:'Primero escuchas qué parte pintar y de qué color. Después eliges el color y tocas esa parte.',
  cards:[...new Set([...ctx.colors,...BASIC])].slice(0,6).map(c=>({arts:[swArt(c)],label:c,say:c})),
  adult:'Después pueden colorear de verdad una hoja con las mismas instrucciones (Cuadernillo MINED, pp. 6, 11, 23 y 24).'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const rs=sample(Object.keys(C.PAINT.body.regions),phase==='check'?3:2,rng),cs=sample([...new Set([...ctx.colors,...BASIC])],rs.length,rng),st=rs.map((r,k)=>pstep('body',r,cs[k]));return paintQ('body',st,ctx,rng,'pb:'+st.map(s=>s.region+s.color).join())},
  b:(ctx,rng,i,phase)=>{const rs=sample(Object.keys(C.PAINT.house.regions),phase==='check'?3:2,rng),cs=sample([...new Set([...ctx.colors,...BASIC])],rs.length,rng),st=rs.map((r,k)=>pstep('house',r,cs[k]));return paintQ('house',st,ctx,rng,'ph:'+st.map(s=>s.region+s.color).join())},
  c:(ctx,rng)=>{const st=[pstep('light','arriba','rojo'),pstep('light','medio','amarillo'),pstep('light','abajo','verde')];return paintQ('light',st,ctx,rng,'pl:'+rng())},
  d:(ctx,rng)=>{const st=[pstep('flag','arriba','azul'),pstep('flag','medio','blanco'),pstep('flag','abajo','azul')];return Object.assign(paintQ('flag',st,ctx,rng,'pf:'+rng()),{note:'La bandera de Nicaragua tiene azul, blanco y azul.'})},
  e:(ctx,rng)=>{const pos=pick([['arriba','rojo'],['medio','amarillo'],['abajo','verde']],rng),txt={arriba:'de arriba',medio:'del medio',abajo:'de abajo'}[pos[0]];
   return Q.choose(rng,{key:'pe:'+pos[0],prompt:'En un semáforo, ¿de qué color es la luz '+txt+'?',model:[objArt('trafficlight','semáforo apagado',{on:'ninguna'})],options:['rojo','amarillo','verde'].map(c=>({id:c,art:swArt(c)})),answer:pos[1],explain:'En el semáforo, la luz '+txt+' es de color '+pos[1]+'.'})}},
 plan:{examples:['a'],practice:['a','b'],reinforce:['c','e'],check:['d','b']},
 home:'Coloreen la bandera y el semáforo con crayones (Cuadernillo MINED, pp. 23 y 24).'});

/* ===================== PIENSO Y DESCUBRO ===================== */
const PICS=['gato','pez','pájaro','manzana','estrella','carro','sol','flor'];
function domain(rng,ctx,kind,k){
 if(kind==='color')return sample(ctx.colors,k,rng).map(c=>({id:c,art:swArt(c)}));
 if(kind==='shape')return sample(ctx.shapes,k,rng).map(s=>({id:s,art:shapeArt(s,'morado')}));
 if(kind==='size')return [{id:'big',art:shapeArt('círculo','azul',{label:'círculo grande'})},{id:'small',art:shapeArt('círculo','azul',{scale:.5,label:'círculo pequeño'})}];
 return sample(PICS,k,rng).map(n=>({id:n,art:wordArt(byName[n])}))}
const PAT={AB:[0,1],AAB:[0,0,1],ABB:[0,1,1],ABC:[0,1,2]};
const PNAME={AB:'se repiten por turnos',AAB:'dos iguales y uno distinto',ABB:'uno distinto y dos iguales',ABC:'tres distintos que se repiten'};
function seriesBase(rng,ctx,pat,kinds){const kind=pick(pat==='ABC'?kinds.filter(x=>x!=='size'):kinds,rng),cyc=PAT[pat],k=pat==='ABC'?3:2,dom=domain(rng,ctx,kind,pat==='ABC'?3:Math.min(3,kind==='size'?2:3));return{kind,cyc,dom,items:dom.slice(0,k)}}
const KINDS=['color','shape','picture','size'];
function nextQ(pat){return (ctx,rng)=>{const b=seriesBase(rng,ctx,pat,KINDS),T=b.cyc.length*2+1,seq=Array.from({length:T},(_,i)=>b.items[b.cyc[i%b.cyc.length]]),ans=b.items[b.cyc[T%b.cyc.length]];
 const opts=b.dom.length>=3?b.dom:b.items;
 return Q.choose(rng,{key:'sr:'+pat+b.kind+seq.map(x=>x.id).join(),prompt:'Mira la fila. ¿Cuál sigue?',model:[...seq.map(x=>x.art),tx('?','','falta uno')],options:opts.map(o=>({id:o.id,art:o.art})),answer:ans.id,explain:seq.map(x=>x.art.label).join(', ')+'… sigue '+ans.art.label+'. '+PNAME[pat][0].toUpperCase()+PNAME[pat].slice(1)+'.'})}}
C.skill({id:'series',mod:'razonar',icon:'🔁',title:'Series y patrones',blurb:'Qué sigue en la fila',
 learn:ctx=>({title:'Un patrón es algo que se repite',say:'Rojo, azul, rojo, azul… ¿qué sigue? Sigue rojo. Un patrón se repite siempre igual.',
  cards:[{arts:[swArt('rojo'),swArt('azul'),swArt('rojo'),swArt('azul'),tx('?','','falta uno')],label:'rojo, azul…',say:'Rojo, azul, rojo, azul. Sigue el rojo.'},{arts:[shapeArt('círculo','morado'),shapeArt('círculo','morado'),shapeArt('cuadrado','morado'),shapeArt('círculo','morado'),shapeArt('círculo','morado'),tx('?','','falta uno')],label:'dos y uno',say:'Círculo, círculo, cuadrado, círculo, círculo. Sigue el cuadrado.'}],
  adult:'Armen patrones con cuentas, bloques o hojas: rojo-azul-rojo-azul (Cuadernillo MINED, p. 19: seriación).'}),
 gens:{a:nextQ('AB'),b:(ctx,rng)=>nextQ(pick(['AAB','ABB'],rng))(ctx,rng),c:nextQ('ABC'),
  d:(ctx,rng)=>{const pat=pick(['AB','AAB','ABB'],rng),b=seriesBase(rng,ctx,pat,KINDS.filter(x=>x!=='size')),T=b.cyc.length*2,seq=Array.from({length:T},(_,i)=>b.items[b.cyc[i%b.cyc.length]]),bl=[b.items[b.cyc[T%b.cyc.length]],b.items[b.cyc[(T+1)%b.cyc.length]]],pal=b.dom.slice(0,Math.max(b.items.length,3));
   return Q.raw('fill',{key:'sf:'+pat+b.kind+seq.map(x=>x.id).join(),prompt:'Completa la fila: faltan dos.',seq:[...seq.map(x=>x.art),null,null],blanks:bl.map(x=>x.id),palette:shuffle(pal.map(o=>({id:o.id,art:o.art})),rng),explain:seq.map(x=>x.art.label).join(', ')+'… siguen '+bl.map(x=>x.art.label).join(' y ')+'.'})},
  e:(ctx,rng)=>{const pat=pick(['AB','AAB'],rng),b=seriesBase(rng,ctx,pat,KINDS.filter(x=>x!=='size')),T=b.cyc.length*2+2,full=Array.from({length:T},(_,i)=>b.items[b.cyc[i%b.cyc.length]]),hole=pick([2,3],rng),ans=full[hole];
   return Q.choose(rng,{key:'sm:'+pat+b.kind+full.map(x=>x.id).join()+hole,prompt:'Falta uno en el medio. ¿Cuál es?',model:full.map((x,i)=>i===hole?tx('?','','falta uno'):x.art),options:b.dom.slice(0,3).map(o=>({id:o.id,art:o.art})),answer:ans.id,explain:'En el medio va '+ans.art.label+', porque la fila se repite.'})}},
 plan:{examples:['a','b'],practice:['a','a','d'],reinforce:['b','e'],check:['b','c','d']},
 home:'Armen collares de macarrones o fichas siguiendo un patrón y pídanle que lo continúe.'});

const shapeVar=(rng,ctx,base,n)=>{const attrs=shuffle(['color','shape','size'],rng),out=[];
 for(const a of attrs.slice(0,n)){const v=Object.assign({},base);
  if(a==='color')v.color=pick(VIS.filter(c=>c!==base.color),rng);
  if(a==='shape')v.shape=pick(SHAPES.filter(s=>s!==base.shape).slice(0,5),rng);
  if(a==='size')v.scale=base.scale===1?.55:1;out.push(v)}return out};
const fig=v=>shapeArt(v.shape,v.color,{scale:v.scale});
C.skill({id:'igual-diferente',mod:'razonar',icon:'🔍',title:'Igual y diferente',blurb:'Observar con atención los detalles',
 learn:ctx=>({title:'Mirar con cuidado',say:'Dos cosas son iguales cuando tienen la misma forma, el mismo color y el mismo tamaño. Si algo cambia, ya son diferentes.',
  cards:[{arts:[shapeArt('círculo','rojo'),shapeArt('círculo','rojo')],label:'iguales',say:'Estos dos son iguales.'},{arts:[shapeArt('círculo','rojo'),shapeArt('círculo','azul')],label:'diferentes',say:'Estos son diferentes: cambia el color.'}],
  adult:'Preguntemos «¿qué cambió?»: color, forma o tamaño. Observar es el primer paso para comparar.'}),
 gens:{
  a:(ctx,rng)=>{const base={shape:pick(ctx.shapes.slice(0,3),rng),color:pick(VIS,rng),scale:1},vs=shapeVar(rng,ctx,base,3);
   return Q.choose(rng,{key:'if:'+JSON.stringify(base)+vs.map(v=>v.color+v.shape+v.scale).join(),prompt:'Busca el que es igual al modelo.',model:[fig(base)],options:[{id:'same',art:fig(base)},...vs.map((v,i)=>({id:'v'+i,art:fig(v)}))],answer:'same',explain:'Este tiene la misma forma, el mismo color y el mismo tamaño que el modelo.'})},
  b:(ctx,rng)=>{const base={shape:pick(ctx.shapes.slice(0,3),rng),color:pick(VIS,rng),scale:1},[v]=shapeVar(rng,ctx,base,1);
   return Q.choose(rng,{key:'id:'+JSON.stringify(base)+v.color+v.shape+v.scale,prompt:'Tres son iguales. Toca el que es diferente.',options:[{id:'odd',art:fig(v)},{id:'f1',art:fig(base)},{id:'f2',art:fig(base)},{id:'f3',art:fig(base)}],answer:'odd',explain:'Este es diferente: cambia '+(v.color!==base.color?'el color':v.shape!==base.shape?'la forma':'el tamaño')+'.'})},
  c:(ctx,rng)=>{const row=sample(WORDS.filter(w=>['animal','fruta','juguete','objeto'].includes(w.cat)),5,rng),i=Math.floor(rng()*4),row2=row.slice(0,4);row2[i]=row[4];
   return Q.raw('choose',{key:'is:'+row.map(w=>w.name).join(),prompt:'Mira la fila de arriba. En la fila de abajo, ¿cuál es diferente?',model:row.slice(0,4).map(wordArt),options:row2.map((w,k)=>({id:String(k),art:wordArt(w)})),answer:String(i),row:true,explain:'En la fila de abajo cambió '+row[i].name+' por '+row[4].name+'.'})},
  d:(ctx,rng)=>{const base={shape:pick(ctx.shapes.slice(0,3),rng),color:pick(VIS,rng),scale:1},n=pick([2,3],rng),vs=shapeVar(rng,ctx,base,3),items=[];
   for(let i=0;i<n;i++)items.push({id:'s'+i,art:fig(base)});vs.forEach((v,i)=>items.push({id:'d'+i,art:fig(v)}));
   return Q.multi(rng,{key:'im:'+JSON.stringify(base)+n+vs.map(v=>v.color+v.shape+v.scale).join(),prompt:'Toca todos los que son iguales al modelo.',model:[fig(base)],items,targets:items.filter(x=>x.id[0]==='s').map(x=>x.id),explain:'Hay '+n+' iguales al modelo: misma forma, mismo color y mismo tamaño.'})},
  e:(ctx,rng)=>{const ss=sample(ctx.shapes,3,rng),cs=sample(VIS,3,rng);
   return Q.match(rng,{key:'ie:'+ss.join()+cs.join(),prompt:'Une los que son iguales.',pairs:ss.map((s,i)=>({id:s+i,l:fig({shape:s,color:cs[i],scale:1}),r:fig({shape:s,color:cs[i],scale:1}),say:'Estos dos son iguales.'})),explain:'Cada figura va con la que es igual a ella.'})}},
 plan:{examples:['a','c'],practice:['a','d','c'],reinforce:['e','b'],check:['a','b','d']},
 home:'Jueguen a «¿qué cambió?»: cambien algo en la mesa mientras cierra los ojos.'});

const MEM=WORDS.filter(w=>['animal','fruta','juguete','objeto','ropa'].includes(w.cat));
function recallQ(mode,n){return (ctx,rng)=>{const ws=sample(MEM,n+3,rng),orig=ws.slice(0,n);
 if(mode==='missing'){const gone=pick(orig,rng),shown=orig.filter(x=>x!==gone),opts=[gone,...ws.slice(n,n+2)];
  return Q.raw('recall',{key:'rm:'+orig.map(w=>w.name).join(),mode,prompt:'¿Cuál falta?',study:'Mira bien estas imágenes. Cuando estés listo, toca «Ya las miré».',items:orig.map(w=>({id:w.name,art:wordArt(w)})),shown:shown.map(w=>({id:w.name,art:wordArt(w)})),answer:gone.name,options:shuffle(opts.map(w=>({id:w.name,art:wordArt(w)})),rng),explain:'Faltaba '+gone.art+' '+gone.name+'. Estaba en las imágenes de antes.'})}
 const i=Math.floor(rng()*n),nw=ws[n],shown=orig.slice();shown[i]=nw;
 return Q.raw('recall',{key:'rn:'+orig.map(w=>w.name).join(),mode,prompt:'¿Cuál es nuevo?',study:'Mira bien estas imágenes. Cuando estés listo, toca «Ya las miré».',items:orig.map(w=>({id:w.name,art:wordArt(w)})),shown:shown.map(w=>({id:w.name,art:wordArt(w)})),answer:nw.name,options:shown.map(w=>({id:w.name,art:wordArt(w)})),row:true,explain:'Ahora aparece '+nw.art+' '+nw.name+'. Antes estaba '+orig[i].art+' '+orig[i].name+'.'})}}
const orderQ=(n)=>(ctx,rng)=>{const ws=sample(MEM,n,rng);return Q.raw('recall',{key:'ro:'+ws.map(w=>w.name).join(),mode:'order',prompt:'Pon las imágenes en el mismo orden.',study:'Mira bien el orden de estas imágenes. Cuando estés listo, toca «Ya las miré».',items:ws.map(w=>({id:w.name,art:wordArt(w),say:w.name})),shown:[],answer:null,options:[],explain:'El orden era: '+ws.map(w=>w.name).join(', ')+'.'})};
C.skill({id:'que-falta',mod:'razonar',icon:'🧠',title:'¿Qué falta? ¿Qué cambió?',blurb:'Memoria visual y atención',
 learn:ctx=>({title:'Miramos, recordamos y encontramos',say:'Primero miramos con atención unas imágenes. Después las escondemos y buscamos cuál falta o cuál cambió.',
  cards:[{arts:[wordArt(byName.gato),wordArt(byName.manzana),wordArt(byName.pelota)],label:'miro y recuerdo',say:'Gato, manzana, pelota. Mira y recuerda.'}],
  adult:'Con tres juguetes sobre la mesa: tape los ojos, quite uno y pregunte cuál falta.'}),
 gens:{a:recallQ('missing',3),b:recallQ('new',3),c:recallQ('missing',4),d:orderQ(3)},
 plan:{examples:['a','b'],practice:['a','a','b'],reinforce:['d','c'],check:['a','b','d']},
 home:'Juego de Kim: objetos cubiertos con un paño, quitar uno y adivinar cuál.'});

const NAMES1=WORDS.filter(w=>['animal','fruta','juguete','objeto','ropa','transporte'].includes(w.cat));
function followBoard(rng,n){return sample(NAMES1,n,rng)}
C.skill({id:'instrucciones',mod:'razonar',icon:'👂',title:'Escucha y haz',blurb:'Seguir instrucciones de uno y dos pasos',
 learn:ctx=>({title:'Escuchamos todo y hacemos lo que dice',say:'Voy a decirte qué tocar. A veces es una sola cosa y a veces son dos, en orden. Escucha bien.',
  cards:[{arts:[wordArt(byName.gato)],label:'un paso',say:'Toca el gato.'},{arts:[wordArt(byName.sol),wordArt(byName.luna)],label:'dos pasos',say:'Toca el sol y después la luna.'}],
  adult:'En casa: «ve a la cocina y trae una cuchara» (dos pasos). Aumenten de a poco.'}),
 gens:{
  a:(ctx,rng)=>{const ws=followBoard(rng,6),t=ws[0];return Q.raw('follow',{key:'f1:'+ws.map(w=>w.name).join(),prompt:'Toca '+t.art+' '+t.name+'.',board:shuffle(ws.map(w=>({id:w.name,art:wordArt(w)})),rng),targets:[t.name],explain:'La instrucción decía '+t.art+' '+t.name+'. Es este.'})},
  b:(ctx,rng)=>{const ws=followBoard(rng,6),[x,y]=ws;return Q.raw('follow',{key:'f2:'+ws.map(w=>w.name).join(),prompt:'Toca '+x.art+' '+x.name+' y después '+y.art+' '+y.name+'.',board:shuffle(ws.map(w=>({id:w.name,art:wordArt(w)})),rng),targets:[x.name,y.name],explain:'Primero '+x.art+' '+x.name+' y después '+y.art+' '+y.name+', en ese orden.'})},
  c:(ctx,rng)=>{const combos=[];for(const s of ctx.shapes.slice(0,4))for(const c of ctx.colors.slice(0,4))combos.push([s,c]);const bd=sample(combos,6,rng),[x,y]=bd,id=p=>p[0]+' '+p[1];
   return Q.raw('follow',{key:'f3:'+bd.map(id).join(),prompt:'Toca el '+id(x)+' y después el '+id(y)+'.',board:shuffle(bd.map(p=>({id:id(p),art:shapeArt(p[0],p[1])})),rng),targets:[id(x),id(y)],explain:'Primero el '+id(x)+' y después el '+id(y)+'.'})},
  d:(ctx,rng)=>{const ws=sample(NAMES1,3,rng),say='Toca en este orden: '+ws.map((w,i)=>(i===0?'primero ':i===1?'después ':'al final ')+w.art+' '+w.name).join(', ')+'.';
   return Q.order({key:'f4:'+ws.map(w=>w.name).join(),prompt:'Toca en este orden: '+ws.map(w=>w.name).join(', ')+'.',say,items:ws.map(w=>({id:w.name,art:wordArt(w),say:w.name})),explain:'El orden era '+ws.map(w=>w.name).join(', ')+'.'})}},
 plan:{examples:['a','b'],practice:['a','b','b'],reinforce:['d','c'],check:['b','c','d']},
 home:'Den dos instrucciones seguidas en la rutina: «guarda el libro y busca tus zapatos».'});

function simonQ(np,L){return (ctx,rng)=>{const cs=[...new Set([...ctx.colors,...BASIC])].slice(0,np),seq=[];while(seq.length<L){const x=Math.floor(rng()*np);if(seq.length===0||seq[seq.length-1]!==x||rng()<.3)seq.push(x)}
 return Q.raw('simon',{key:'sim:'+np+seq.join(''),prompt:'Mira los colores y repítelos en el mismo orden.',pads:cs,seq,explain:'El orden era: '+seq.map(i=>cs[i]).join(', ')+'.'})}}
C.skill({id:'simon',mod:'razonar',icon:'🔴',title:'Repite los colores',blurb:'Memoria de secuencias con sonido',
 learn:ctx=>({title:'Miramos y repetimos en el mismo orden',say:'Se van a encender colores, uno por uno. Míralos y escúchalos. Después tócalos en el mismo orden.',
  cards:[{arts:[swArt('rojo'),swArt('azul'),swArt('rojo')],label:'rojo, azul, rojo',say:'Rojo, azul, rojo. Ese es el orden.'}],
  adult:'Pueden jugar igual con palmadas: ustedes hacen un ritmo y el niño lo repite.'}),
 gens:{a:simonQ(3,2),b:simonQ(3,3),c:simonQ(4,4),
  d:(ctx,rng)=>{const cs=sample(ctx.colors,3,rng);return Q.raw('recall',{key:'sd:'+cs.join(),mode:'order',prompt:'Pon los colores en el mismo orden.',study:'Mira bien el orden de los colores. Cuando estés listo, toca «Ya los miré».',items:cs.map(c=>({id:c,art:swArt(c),say:c})),shown:[],answer:null,options:[],explain:'El orden era: '+cs.join(', ')+'.'})}},
 plan:{examples:['a'],practice:['a','a'],reinforce:['d','b'],check:['b','c','d']},
 home:'Repitan ritmos con palmadas o golpes en la mesa: corto-corto-largo.'});

const FIGS=(()=>{const poly=(n,r,off)=>Array.from({length:n},(_,k)=>{const a=(off+360/n*k)*Math.PI/180;return[+(50+r*Math.cos(a)).toFixed(1),+(50+r*Math.sin(a)).toFixed(1)]});
 const star=Array.from({length:5},(_,k)=>{const a=(-90+144*k)*Math.PI/180;return[+(50+38*Math.cos(a)).toFixed(1),+(54+38*Math.sin(a)).toFixed(1)]});
 return[{n:3,name:'una montaña',pts:[[50,18],[88,82],[12,82]]},{n:3,name:'una vela de barco',pts:[[28,15],[28,82],[85,82]]},{n:3,name:'un sombrero de fiesta',pts:[[50,12],[76,84],[24,84]]},
 {n:4,name:'una cometa',pts:[[50,10],[84,45],[50,90],[16,45]]},{n:4,name:'una ventana',pts:[[22,22],[78,22],[78,78],[22,78]]},{n:4,name:'un barquito',pts:[[10,40],[90,40],[72,78],[28,78]]},
 {n:5,name:'una casa',pts:[[18,85],[18,48],[50,18],[82,48],[82,85]]},{n:5,name:'una estrella',pts:star},{n:6,name:'un panal de abejas',pts:poly(6,38,0)},
 {n:7,name:'una flecha',pts:[[50,10],[86,46],[62,46],[62,90],[38,90],[38,46],[14,46]]},{n:8,name:'una señal de alto',pts:poly(8,38,22.5)}]})();
function dotsQ(lo,hi){return (ctx,rng)=>{const M=Math.max(...ctx.numbers),ok=FIGS.filter(f=>f.n<=Math.min(M,hi)&&f.n>=Math.min(lo,M)),f=pick(ok.length?ok:FIGS.filter(x=>x.n<=M),rng),flip=rng()<.5,sh=Math.floor(rng()*f.n);
 let pts=f.pts.map(p=>flip?[100-p[0],p[1]]:p);pts=pts.slice(sh).concat(pts.slice(0,sh));
 return Q.raw('dots',{key:'dt:'+f.name+flip+sh,n:f.n,points:pts,name:f.name,prompt:'Une los puntos en orden, siguiendo los números.',explain:'Seguimos los números en orden y aparece '+f.name+'.'})}}
C.skill({id:'une-puntos',mod:'razonar',icon:'🔵',title:'Une los puntos',blurb:'Seguir los números y descubrir el dibujo',
 learn:ctx=>({title:'Los números nos guían',say:'Cada punto tiene un número. Tocamos el uno, luego el dos, luego el tres, y así aparece un dibujo escondido.',
  cards:[{arts:[numArt(1),numArt(2),numArt(3)],label:'1, 2, 3',say:'Uno, dos, tres. Los números van en orden.',observe:{area:'numbers',id:'1'}}],
  adult:'También pueden hacerlo en papel con lápiz, uniendo con una línea suave (Cuadernillo MINED, p. 20: grafomotricidad).'}),
 gens:{a:dotsQ(3,4),b:dotsQ(3,6),c:dotsQ(3,10),
  d:(ctx,rng)=>{const M=Math.max(...ctx.numbers),n=Math.min(M,pick([3,4,5],rng)),ids=shuffle(Array.from({length:n},(_,i)=>String(i+1)),rng);return Q.raw('follow',{key:'tn:'+ids.join(''),prompt:'Toca los números en orden, empezando por el uno.',board:ids.map(i=>({id:i,art:numArt(+i)})),targets:Array.from({length:n},(_,i)=>String(i+1)),explain:'Tocamos '+Array.from({length:n},(_,i)=>NW[i+1]).join(', ')+', en ese orden.'})}},
 plan:{examples:['a'],practice:['a','d','b'],reinforce:['d','c'],check:['b','d','c']},
 home:'Dibujen puntos numerados en papel y que los una con crayón.'});

const PAIRSET={
 comida:{title:'¿Qué come?',pairs:[['conejo','🐰','zanahoria','🥕','¿Qué come el conejo?','El conejo come zanahoria.'],['perro','🐶','hueso','🦴','¿Qué le gusta roer al perro?','Al perro le gusta roer un hueso.'],['gato','🐱','pescado','🐟','¿Qué come el gato?','El gato come pescado.'],['mono','🐵','plátano','🍌','¿Qué come el mono?','El mono come plátano.'],['oso','🐻','miel','🍯','¿Qué le gusta comer al oso?','Al oso le gusta la miel.'],['ratón','🐭','queso','🧀','¿Qué come el ratón?','El ratón come queso.']]},
 uso:{title:'¿Para qué sirve?',pairs:[['calcetín','🧦','pie','🦶','¿Dónde se pone el calcetín?','El calcetín se pone en el pie.'],['llave','🔑','puerta','🚪','¿Qué abre la llave?','La llave abre la puerta.'],['paraguas','☂️','lluvia','🌧️','¿De qué nos protege el paraguas?','El paraguas nos protege de la lluvia.'],['lápiz','✏️','papel','📄','¿Sobre qué escribe el lápiz?','El lápiz escribe sobre el papel.'],['cuchara','🥄','sopa','🍲','¿Qué comemos con la cuchara?','Con la cuchara comemos sopa.'],['gorra','🧢','sol','☀️','¿De qué nos protege la gorra?','La gorra nos protege del sol.']]},
 hogar:{title:'¿Dónde vive?',pairs:[['pez','🐟','agua','🌊','¿Dónde vive el pez?','El pez vive en el agua.'],['pájaro','🐦','árbol','🌳','¿Dónde vive el pájaro?','El pájaro vive en el árbol.'],['perro','🐶','casa','🏠','¿Dónde vive el perro?','El perro vive en una casa.'],['abeja','🐝','flor','🌸','¿A dónde va la abeja?','La abeja visita las flores.']]}};
const pp=p=>({id:p[0],l:em(p[1],p[0]),r:em(p[3],p[2]),q:p[4],say:p[5]});
C.skill({id:'parejas-func',mod:'razonar',icon:'🔗',title:'Cosas que van juntas',blurb:'Animal y comida, objeto y uso, animal y hogar',
 learn:ctx=>({title:'Algunas cosas van juntas por una razón',say:'El conejo come zanahoria. La llave abre la puerta. Hay cosas que van juntas.',
  cards:[PAIRSET.comida.pairs[0],PAIRSET.uso.pairs[1],PAIRSET.hogar.pairs[0]].map(p=>({arts:[em(p[1],p[0]),em(p[3],p[2])],label:p[0]+' · '+p[2],say:p[5]})),
  adult:'Pregunten el porqué: «¿por qué el paraguas va con la lluvia?». Lo importante es la razón, no solo la respuesta.'}),
 gens:{
  a:(ctx,rng)=>{const k=pick(Object.keys(PAIRSET),rng),ps=sample(PAIRSET[k].pairs,3,rng).map(pp);
   return Q.match(rng,{key:'pm:'+k+ps.map(p=>p.id).join(),prompt:PAIRSET[k].title+' Une cada dibujo con el que va con él.',pairs:ps,explain:ps.map(p=>p.say).join(' ')})},
  b:(ctx,rng)=>{const k=pick(Object.keys(PAIRSET),rng),all=PAIRSET[k].pairs.map(pp),p=pick(all,rng),ds=sample(all.filter(x=>x!==p&&x.r.label!==p.r.label),2,rng);
   return Q.choose(rng,{key:'pc:'+k+p.id,prompt:p.q,model:[p.l],options:[p,...ds].map(x=>({id:x.r.label,art:x.r})),answer:p.r.label,listen:[p,...ds].map(x=>x.r.label),explain:p.say})}},
 plan:{examples:['a','b'],practice:['b','a','b'],reinforce:['a','b'],check:['b','b','a']},
 home:'Pregunten «¿qué comen los animales?» y «¿para qué sirve esto?» con cosas de casa.'});
})(typeof globalThis!=='undefined'?globalThis:this);
