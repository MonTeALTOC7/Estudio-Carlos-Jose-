/* Núcleo de contenido: vocabulario, constructores de preguntas, sesiones de 5 fases y validador.
   Todo es puro y determinista (acepta un generador aleatorio) para poder probarlo sin navegador.
   Sin puntajes de admisión: solo describe qué respondió el niño con y sin ayuda. */
(function(root){
'use strict';
const C={skills:[],byId:{},modules:[]};
const rand=Math.random;
function shuffle(a,rng=rand){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
const pick=(a,rng=rand)=>a[Math.floor(rng()*a.length)];
const sample=(a,n,rng=rand)=>shuffle(a,rng).slice(0,n);
function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- colores (fuente única para app y juegos) ---------- */
const COLORS={rojo:{hex:'#df4848',fem:'roja'},azul:{hex:'#428ccc',fem:'azul'},amarillo:{hex:'#f4c345',fem:'amarilla'},verde:{hex:'#51a26c',fem:'verde'},naranja:{hex:'#ee8a2c',fem:'naranja'},morado:{hex:'#8a5cb8',fem:'morada'},rosado:{hex:'#ee7fa6',fem:'rosada'},café:{hex:'#8b5a3c',fem:'café'},blanco:{hex:'#ffffff',fem:'blanca'},negro:{hex:'#2f3433',fem:'negra'}};
const adj=(c,fem)=>fem?COLORS[c].fem:c;
const NW=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez'];
const SHAPES=['círculo','cuadrado','triángulo','rectángulo','óvalo','rombo'];

/* ---------- vocabulario: nombre|emoji|sílabas|categoría|etiqueta ---------- */
const RAW=`gato|🐱|ga-to|animal|camina
perro|🐶|pe-rro|animal|camina
vaca|🐮|va-ca|animal|camina
caballo|🐴|ca-ba-llo|animal|camina
cerdo|🐷|cer-do|animal|camina
conejo|🐰|co-ne-jo|animal|camina
elefante|🐘|e-le-fan-te|animal|camina
tigre|🐯|ti-gre|animal|camina
león|🦁|le-ón|animal|camina
mono|🐵|mo-no|animal|camina
oso|🐻|o-so|animal|camina
jirafa|🦒|ji-ra-fa|animal|camina
ratón|🐭|ra-tón|animal|camina
oveja|🐑|o-ve-ja|animal|camina
gallina|🐔|ga-lli-na|animal|camina
gallo|🐓|ga-llo|animal|camina
pollito|🐥|po-lli-to|animal|camina
rana|🐸|ra-na|animal|
tortuga|🐢|tor-tu-ga|animal|
cocodrilo|🐊|co-co-dri-lo|animal|
pato|🦆|pa-to|animal|
gusano|🐛|gu-sa-no|animal|
pez|🐟|pez|animal|nada
ballena|🐳|ba-lle-na|animal|nada
delfín|🐬|del-fín|animal|nada
pulpo|🐙|pul-po|animal|nada
pájaro|🐦|pá-ja-ro|animal|vuela
mariposa|🦋|ma-ri-po-sa|animal|vuela
abeja|🐝|a-be-ja|animal|vuela
búho|🦉|bú-ho|animal|vuela
araña|🕷️|a-ra-ña|animal|
caracol|🐌|ca-ra-col|animal|
hormiga|🐜|hor-mi-ga|animal|
manzana|🍎|man-za-na|fruta|
plátano|🍌|plá-ta-no|fruta|
uva|🍇|u-va|fruta|
naranja|🍊|na-ran-ja|fruta|
sandía|🍉|san-dí-a|fruta|
fresa|🍓|fre-sa|fruta|
pera|🍐|pe-ra|fruta|
piña|🍍|pi-ña|fruta|
zanahoria|🥕|za-na-ho-ria|verdura|
maíz|🌽|ma-íz|verdura|
brócoli|🥦|bró-co-li|verdura|
tomate|🍅|to-ma-te|verdura|
papa|🥔|pa-pa|verdura|
pan|🍞|pan|comida|
queso|🧀|que-so|comida|
huevo|🥚|hue-vo|comida|
leche|🥛|le-che|comida|
helado|🍦|he-la-do|dulce|
pastel|🍰|pas-tel|dulce|
caramelo|🍬|ca-ra-me-lo|dulce|
galleta|🍪|ga-lle-ta|dulce|
paleta|🍭|pa-le-ta|dulce|
dona|🍩|do-na|dulce|
camisa|👕|ca-mi-sa|ropa|
zapato|👞|za-pa-to|ropa|
gorra|🧢|go-rra|ropa|
calcetín|🧦|cal-ce-tín|ropa|
sombrero|👒|som-bre-ro|ropa|
vestido|👗|ves-ti-do|ropa|
bota|👢|bo-ta|ropa|
pelota|⚽|pe-lo-ta|juguete|
globo|🎈|glo-bo|juguete|
peluche|🧸|pe-lu-che|juguete|
avión|✈️|a-vión|transporte|aire
helicóptero|🚁|he-li-cóp-te-ro|transporte|aire
barco|🚢|bar-co|transporte|agua
velero|⛵|ve-le-ro|transporte|agua
lancha|🚤|lan-cha|transporte|agua
carro|🚗|ca-rro|transporte|tierra
bus|🚌|bus|transporte|tierra
moto|🏍️|mo-to|transporte|tierra
bicicleta|🚲|bi-ci-cle-ta|transporte|tierra
tren|🚂|tren|transporte|tierra
camión|🚚|ca-mión|transporte|tierra
ambulancia|🚑|am-bu-lan-cia|transporte|tierra
sol|☀️|sol|naturaleza|
luna|🌙|lu-na|naturaleza|
estrella|⭐|es-tre-lla|naturaleza|
nube|☁️|nu-be|naturaleza|
flor|🌸|flor|naturaleza|
árbol|🌳|ár-bol|naturaleza|
volcán|🌋|vol-cán|naturaleza|
ola|🌊|o-la|naturaleza|
isla|🏝️|is-la|naturaleza|
montaña|⛰️|mon-ta-ña|naturaleza|
arcoíris|🌈|ar-co-í-ris|naturaleza|
lluvia|🌧️|llu-via|naturaleza|
casa|🏠|ca-sa|objeto|
escuela|🏫|es-cue-la|objeto|
cama|🛏️|ca-ma|objeto|
libro|📖|li-bro|objeto|
lápiz|✏️|lá-piz|objeto|
llave|🔑|lla-ve|objeto|
tijeras|✂️|ti-je-ras|objeto|
paraguas|☂️|pa-ra-guas|objeto|
reloj|⏰|re-loj|objeto|
teléfono|📞|te-lé-fo-no|objeto|
mochila|🎒|mo-chi-la|objeto|
corona|👑|co-ro-na|objeto|
ángel|👼|án-gel|objeto|
anillo|💍|a-ni-llo|objeto|
enchufe|🔌|en-chu-fe|objeto|
imán|🧲|i-mán|objeto|
iglesia|⛪|i-gle-sia|objeto|
unicornio|🦄|u-ni-cor-nio|objeto|
uña|💅|u-ña|objeto|
escoba|🧹|es-co-ba|objeto|
olla|🍲|o-lla|objeto|
beso|💋|be-so|objeto|
mano|✋|ma-no|cuerpo|
ojo|👁️|o-jo|cuerpo|
oreja|👂|o-re-ja|cuerpo|
nariz|👃|na-riz|cuerpo|
boca|👄|bo-ca|cuerpo|
diente|🦷|dien-te|cuerpo|`;
const FEM=new Set(['mano','moto','flor','nariz','nube','leche','llave']);
function strip(t){return t.normalize('NFD').replace(/[̀-ͯ]/g,'')}
const WORDS=RAW.split('\n').map(l=>{const [name,e,sy,cat,tag]=l.split('|'),parts=sy.split('-');const s=strip(name);
 const art=name==='tijeras'?'las':(FEM.has(name)||(name.endsWith('a')&&!/^(día)$/.test(name)))?'la':'el';
 return{name,e,parts,syl:parts.length,cat,tag:tag||'',art,init:s[0],last:s[s.length-1],end2:s.slice(-2)}});
const byName={};WORDS.forEach(w=>byName[w.name]=w);
const wordsBy=f=>WORDS.filter(f);
const W=n=>{if(!byName[n])throw new Error('Palabra desconocida '+n);return byName[n]};

/* ---------- constructores de arte (descripciones, no HTML) ---------- */
const em=(e,label,x)=>Object.assign({k:'e',e,label},x||{});
const wordArt=w=>em(w.e,w.name);
const tx=(t,sym,label,x)=>Object.assign({k:'t',t:String(t),sym:sym||'',label:label||String(t)},x||{});
const numArt=n=>tx(n,'n',NW[n]);
const vowelArt=v=>tx(v,'v','la '+v);
const swArt=c=>({k:'sw',color:c,label:c});
const shapeArt=(shape,color,x)=>Object.assign({k:'obj',type:'shape',shape,color,label:shape+(color?' '+color:'')},x||{});
const OBJ={apple:['manzana',1],ball:['pelota',1],leaf:['hoja',1],sun:['sol',0],fish:['pez',0],bird:['pájaro',0],frog:['rana',1],chick:['pollito',0]};
const colorObj=(type,color,x)=>{const [n,f]=OBJ[type];return Object.assign({k:'obj',type,color,label:n+' '+adj(color,f),name:n,fem:f},x||{})};
const objArt=(type,label,x)=>Object.assign({k:'obj',type,label},x||{});
const EMO=[['🍎','manzana','manzanas'],['🐟','pez','peces'],['⭐','estrella','estrellas'],['🚗','carro','carros'],['🎈','globo','globos'],['🐱','gato','gatos'],['🌸','flor','flores'],['⚽','pelota','pelotas'],['🍌','plátano','plátanos'],['🐥','pollito','pollitos']];
function layoutPos(n,layout,rng){rng=rng||rand;
 if(layout==='scatter'){const cells=[];for(let r=0;r<3;r++)for(let c=0;c<4;c++)cells.push([c,r]);return sample(cells,n,rng).map(([c,r])=>[+(14+c*24+(rng()-.5)*8).toFixed(1),+(22+r*28+(rng()-.5)*8).toFixed(1)])}
 const per=layout==='grid'?3:5,rows=Math.ceil(n/per),out=[];
 for(let i=0;i<n;i++){const r=Math.floor(i/per),cnt=Math.min(per,n-r*per),c=i-r*per;out.push([+(50+(c-(cnt-1)/2)*(layout==='grid'?26:19)).toFixed(1),rows===1?50:+(22+r*(56/(rows-1))).toFixed(1)])}
 return out}
function group(e,n,layout,rng,name,x){return Object.assign({k:'grp',e,n,layout,pos:layoutPos(n,layout,rng),label:n+' '+(name||'cosas')},x||{})}

/* ---------- constructores de preguntas ---------- */
const Q={
 choose(rng,o){return Object.assign({type:'choose'},o,{options:shuffle(o.options,rng)})},
 multi(rng,o){return Object.assign({type:'multi'},o,{items:shuffle(o.items,rng)})},
 sort(rng,o){return Object.assign({type:'sort'},o,{items:shuffle(o.items,rng)})},
 match(rng,o){return Object.assign({type:'match'},o)},
 order(o){return Object.assign({type:'order'},o)},
 raw(type,o){return Object.assign({type},o)}
};
function others(pool,exclude,n,rng){return sample(pool.filter(x=>!exclude.includes(x)),n,rng)}

/* ---------- contexto: solo símbolos ya presentados al niño ---------- */
function ctxFrom(E,s,now){
 const numbers=E.active(s,'numbers').map(Number),vowels=E.active(s,'vowels');
 let colors=E.active(s,'colors').slice();for(const c of ['rojo','azul','amarillo','verde'])if(colors.length<3&&!colors.includes(c))colors.push(c);
 let shapes=E.active(s,'shapes').filter(x=>x!=='X');for(const c of ['círculo','cuadrado','triángulo'])if(shapes.length<3&&!shapes.includes(c))shapes.push(c);
 return{numbers,vowels,colors,shapes,name:String(s.name||'').trim(),day:(now||new Date()).getDay()}}

/* ---------- registro y sesión de 5 fases ---------- */
C.module=m=>{C.modules.push(m)};
C.skill=sk=>{if(C.byId[sk.id])throw new Error('Habilidad repetida '+sk.id);C.skills.push(sk);C.byId[sk.id]=sk};
C.skillsOf=mod=>C.skills.filter(s=>s.mod===mod);
function session(skill,ctx,rng,opts){
 opts=opts||{};rng=rng||rand;const used=new Set();
 function make(fmt,phase){
  const g=skill.gens[fmt];if(!g)throw new Error('Formato inexistente '+skill.id+':'+fmt);
  for(let t=0;t<16;t++){const q=g(ctx,rng,used.size,phase);if(!q)continue;q.fmt=fmt;q.phase=phase;q.skill=skill.id;const k=q.key||JSON.stringify(q).slice(0,100);if(used.has(k)&&t<15)continue;used.add(k);return q}
  throw new Error('No se pudo generar '+skill.id+':'+fmt)}
 const P=skill.plan,exFmts=P.examples.concat((opts.extra||[]).filter(f=>skill.gens[f]).slice(0,2));
 return{skill,learn:skill.learn(ctx),examples:exFmts.map(f=>make(f,'examples')),practice:P.practice.map(f=>make(f,'practice')),reinforce:P.reinforce.map(f=>make(f,'reinforce')),check:P.check.map(f=>make(f,'check')),more:f=>make(f,'reinforce')}}
C.session=session;
/* Reconstruye una sesión guardada (JSON) para reanudar donde se quedó el niño. */
C.rebuild=function(skill,ctx,data,rng){rng=rng||rand;const used=new Set();
 return Object.assign({skill},data,{more:fmt=>{for(let t=0;t<16;t++){const q=skill.gens[fmt](ctx,rng,used.size,'reinforce');if(!q)continue;q.fmt=fmt;q.phase='reinforce';q.skill=skill.id;const k=q.key||JSON.stringify(q).slice(0,100);if(used.has(k)&&t<15)continue;used.add(k);return q}throw new Error('rebuild')}})};

/* ---------- regiones y escenas (datos compartidos con la interfaz) ---------- */
C.PAINT={
 body:{title:'Mi cuerpo',regions:{cabeza:'la cabeza',brazos:'los brazos',manos:'las manos',piernas:'las piernas',pies:'los pies',barriga:'la barriga'}},
 house:{title:'Mi casa',regions:{techo:'el techo',puerta:'la puerta',ventana:'la ventana',pared:'la pared'}},
 light:{title:'El semáforo',regions:{arriba:'la luz de arriba',medio:'la luz del medio',abajo:'la luz de abajo'}},
 flag:{title:'La bandera de Nicaragua',regions:{arriba:'la franja de arriba',medio:'la franja del medio',abajo:'la franja de abajo'}}};
C.TAP={body:{cabeza:'la cabeza',brazo:'un brazo',mano:'una mano',pierna:'una pierna',pie:'un pie',barriga:'la barriga'},face:{ojos:'los ojos',nariz:'la nariz',boca:'la boca',orejas:'las orejas',cabello:'el cabello'}};
C.SPACE={mesa:{encima:'encima de la mesa',debajo:'debajo de la mesa','al lado':'al lado de la mesa'},caja:{dentro:'dentro de la caja',fuera:'fuera de la caja',encima:'encima de la caja'},arbol:{delante:'delante del árbol',detrás:'detrás del árbol','al lado':'al lado del árbol'},cajas:{entre:'entre las dos cajas',izquierda:'a la izquierda de las dos cajas',derecha:'a la derecha de las dos cajas'},casa:{cerca:'cerca de la casa',lejos:'lejos de la casa'},lado:{izquierda:'a la izquierda de la caja',derecha:'a la derecha de la caja'}};

/* ---------- validador: usado por las pruebas y por la interfaz en desarrollo ---------- */
function checkArt(a,ctx,errs,where){
 if(!a||typeof a!=='object'){errs.push(where+': arte vacío');return}
 if(!['e','t','sw','obj','grp','scene'].includes(a.k))errs.push(where+': tipo de arte '+a.k);
 if(!a.label||typeof a.label!=='string')errs.push(where+': sin etiqueta');
 if(a.k==='e'&&!a.e)errs.push(where+': emoji vacío');
 if(a.k==='t'){if(a.t==='')errs.push(where+': texto vacío');if(a.sym==='n'&&!ctx.numbers.includes(+a.t))errs.push(where+': número no presentado '+a.t);if(a.sym==='v'&&!ctx.vowels.includes(a.t))errs.push(where+': vocal no presentada '+a.t)}
 if(a.k==='grp'&&(a.pos.length!==a.n||a.n>10))errs.push(where+': grupo mal formado')}
C.validate=function(q,ctx){
 const errs=[],A=(a,w)=>checkArt(a,ctx,errs,w);
 if(!q||!q.type){return['sin tipo']}
 if(!q.prompt)errs.push('sin consigna');if(!q.explain)errs.push('sin explicación');
 const ids=l=>l.map(x=>x.id),uniq=l=>new Set(l).size===l.length;
 (q.model||[]).forEach((a,i)=>A(a,'modelo'+i));
 switch(q.type){
  case'choose':{const i=ids(q.options);if(q.options.length<2)errs.push('menos de 2 opciones');if(!uniq(i))errs.push('opciones repetidas');if(i.filter(x=>x===q.answer).length!==1)errs.push('la respuesta no es única');q.options.forEach((o,k)=>A(o.art,'opción'+k));break}
  case'multi':{const i=ids(q.items);if(!uniq(i))errs.push('ítems repetidos');if(!q.targets.length||q.targets.length>=i.length)errs.push('objetivos inválidos');if(!q.targets.every(t=>i.includes(t)))errs.push('objetivo ausente');q.items.forEach((o,k)=>A(o.art,'ítem'+k));break}
  case'sort':{const b=ids(q.bins);if(b.length<2||!uniq(b))errs.push('contenedores inválidos');if(!uniq(ids(q.items)))errs.push('ítems repetidos');q.items.forEach((o,k)=>{if(!b.includes(o.bin))errs.push('ítem sin contenedor');A(o.art,'ítem'+k)});if(!b.every(x=>q.items.some(o=>o.bin===x)))errs.push('contenedor vacío');q.bins.forEach((o,k)=>A(o.art,'contenedor'+k));break}
  case'match':{if(!uniq(ids(q.pairs)))errs.push('parejas repetidas');if(q.pairs.length<2)errs.push('pocas parejas');q.pairs.forEach((p,k)=>{A(p.l,'izq'+k);A(p.r,'der'+k)});const ls=q.pairs.map(p=>p.l.label),rs=q.pairs.map(p=>p.r.label);if(!uniq(ls)||!uniq(rs))errs.push('etiquetas de pareja repetidas (ambiguas)');break}
  case'order':{const all=q.items.concat(q.extra||[]);if(q.items.length<2||!uniq(ids(all)))errs.push('orden inválido');all.forEach((o,k)=>A(o.art,'orden'+k));break}
  case'put':if(!(q.target>=1&&q.tray>=q.target))errs.push('cantidad inválida');break;
  case'place':{if(!C.SPACE[q.landmark]||!C.SPACE[q.landmark][q.rel])errs.push('relación inexistente');if(!q.zones.includes(q.rel))errs.push('zona de respuesta ausente');if(!uniq(q.zones))errs.push('zonas repetidas');break}
  case'follow':{const i=ids(q.board);if(!uniq(i))errs.push('tablero repetido');if(!q.targets.every(t=>i.includes(t))||!uniq(q.targets))errs.push('objetivos inválidos');q.board.forEach((o,k)=>A(o.art,'tablero'+k));break}
  case'fill':{const p=ids(q.palette);if(!q.blanks.length)errs.push('sin huecos');if(!q.blanks.every(b=>p.includes(b)))errs.push('respuesta fuera de la paleta');if(!uniq(p))errs.push('paleta repetida');q.seq.forEach((a,k)=>a&&A(a,'serie'+k));q.palette.forEach((o,k)=>A(o.art,'paleta'+k));break}
  case'dots':if(q.points.length!==q.n||q.n>Math.max(...ctx.numbers))errs.push('puntos inválidos o número no presentado');break;
  case'paint':{const sc=C.PAINT[q.scene];if(!sc)errs.push('escena');else{if(!q.steps.length)errs.push('sin pasos');q.steps.forEach(s=>{if(!sc.regions[s.region])errs.push('región '+s.region);if(!q.palette.includes(s.color))errs.push('color fuera de la paleta')});if(!uniq(q.steps.map(s=>s.region)))errs.push('región repetida')}break}
  case'tap':{const PE=globalThis.People;if(!C.TAP[q.scene]||!C.TAP[q.scene][q.answer])errs.push('región de toque inexistente');else if(PE&&(!PE.FIGS[q.fig]||PE.FIGS[q.fig].scene!==q.scene||!PE.parts(q.fig).includes(q.answer)))errs.push('parte no visible en la figura '+q.fig+': '+q.answer);break}
  case'clap':if(!(q.word.syl>=1&&q.word.syl<=5))errs.push('sílabas fuera de rango');break;
  case'recall':{if(q.mode==='order'){if(q.items.length<3||!uniq(ids(q.items)))errs.push('recuerdo de orden inválido');q.items.forEach((o,k)=>A(o.art,'recuerdo'+k));break}const i=ids(q.options);if(!uniq(i)||i.filter(x=>x===q.answer).length!==1)errs.push('recuerdo: opciones inválidas');if(q.shown.length<2)errs.push('pocas imágenes');break}
  case'simon':if(q.seq.length<2||q.pads.length<3||!q.seq.every(x=>x>=0&&x<q.pads.length))errs.push('secuencia inválida');break;
  default:errs.push('tipo desconocido '+q.type)}
 return errs};

C.h={shuffle,pick,sample,mulberry,others,NW,numArt,vowelArt,swArt,shapeArt,colorObj,objArt,em,wordArt,tx,group,Q,WORDS,byName,wordsBy,W,EMO,COLORS,adj,SHAPES,OBJ,strip,layoutPos};
C.COLORS=COLORS;C.WORDS=WORDS;C.ctxFrom=ctxFrom;C.shuffle=shuffle;C.sample=sample;C.pick=pick;C.mulberry=mulberry;
if(typeof module!=='undefined'&&module.exports)module.exports=C;root.Content=C;
})(typeof globalThis!=='undefined'?globalThis:this);
