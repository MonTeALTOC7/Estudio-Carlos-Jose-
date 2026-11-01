/* Rutas 1 y 2: Números y cantidades · Palabras y sonidos.
   Cada habilidad define: aprender, formatos de pregunta distintos y un plan Ejemplos → Practicar → Reforzar → Comprobar. */
(function(root){
'use strict';
const C=root.Content||require('./content.js');
const {shuffle,pick,sample,NW,numArt,vowelArt,em,wordArt,tx,group,Q,WORDS,byName,wordsBy,W,EMO}=C.h;
const G={manzana:'f',pez:'m',estrella:'f',carro:'m',globo:'m',gato:'m',flor:'f',pelota:'f',plátano:'m',pollito:'m'};
const ph=(n,it)=>n===1?(G[it[1]]==='f'?'una ':'un ')+it[1]:NW[n]+' '+it[2];
const cw=n=>Array.from({length:n},(_,i)=>NW[i+1]).join(', ');
const LAY=['line','scatter','grid'];

C.module({id:'cantidad',title:'Números y cantidades',icon:'🔢',bg:'#f4e5cd',blurb:'Contar, comparar, ordenar y juntar'});
C.module({id:'lenguaje',title:'Palabras y sonidos',icon:'🔤',bg:'#e9e2f1',blurb:'Vocales, sílabas, rimas y adivinanzas'});

/* ===================== NÚMEROS Y CANTIDADES ===================== */
C.skill({id:'contar',mod:'cantidad',icon:'🍎',title:'Contar objetos',blurb:'Un número por cada cosa',
 learn:ctx=>({title:'Contar: un número por cada cosa',say:'Vamos a contar. Tocamos cada cosa y decimos un número. El último número que decimos dice cuántos hay.',
  cards:ctx.numbers.slice(0,4).map(n=>({arts:[numArt(n),group('🍎',n,'line',null,'manzanas')],label:NW[n],say:'Este es el número '+NW[n]+'. Hay '+ph(n,EMO[0])+'.',observe:{area:'numbers',id:String(n)}})),
  adult:'Cuenten juntos con el dedo, una cosa a la vez. Si se salta alguna, empiecen de nuevo sin regañar.'}),
 gens:{
  a:(ctx,rng)=>{const n=pick(ctx.numbers,rng),it=pick(EMO,rng),lay=pick(LAY,rng);
   return Q.choose(rng,{key:'c:'+n+it[0],prompt:'Toca cada uno para contar. ¿Cuántos hay?',model:[group(it[0],n,lay,rng,it[2],{tap:true})],options:[n,...sample(ctx.numbers.filter(x=>x!==n),2,rng)].map(x=>({id:String(x),art:numArt(x)})),answer:String(n),explain:'Contamos: '+cw(n)+'. Hay '+ph(n,it)+'. Es el número '+NW[n]+'.'})},
  b:(ctx,rng)=>{const n=pick(ctx.numbers,rng),it=pick(EMO,rng);
   return Q.choose(rng,{key:'g:'+n+it[0],prompt:'Toca el grupo que tiene '+NW[n]+'.',model:[numArt(n)],options:[n,...sample(ctx.numbers.filter(x=>x!==n),2,rng)].map(x=>({id:String(x),art:group(it[0],x,pick(LAY,rng),rng,it[2])})),answer:String(n),explain:'El número '+NW[n]+' va con '+ph(n,it)+'. Contamos: '+cw(n)+'.'})},
  c:(ctx,rng)=>{const n=pick(ctx.numbers,rng),it=pick(EMO,rng);
   return Q.raw('put',{key:'p:'+n+it[0],prompt:'Pon '+ph(n,it)+' en la canasta.',model:[numArt(n)],item:it[0],name:it[2],target:n,tray:Math.min(12,n+3),explain:'Ponemos uno por uno hasta llegar a '+NW[n]+': '+cw(n)+'.'})},
  d:(ctx,rng)=>{const n=pick(ctx.numbers,rng);
   return Q.choose(rng,{key:'n:'+n,prompt:'Toca el número '+NW[n]+'.',options:[n,...sample(ctx.numbers.filter(x=>x!==n),2,rng)].map(x=>({id:String(x),art:numArt(x)})),answer:String(n),explain:'Este es el '+NW[n]+'. Se escribe así.'})}},
 plan:{examples:['a','b'],practice:['a','a','c'],reinforce:['b','b'],check:['a','b','c']},
 home:'Pidan «tráeme 4 cucharas» o «reparte 3 galletas». Cuenten escaleras, pasos y frutas.'});

C.skill({id:'cuantos',mod:'cantidad',icon:'⚖️',title:'Mucho, poco y ninguno',blurb:'Más, menos y más lleno',
 learn:ctx=>({title:'Muchos, pocos, ninguno',say:'Hay grupos con muchos, grupos con pocos y a veces no hay ninguno. También podemos decir quién tiene más y quién tiene menos.',
  cards:[{arts:[group('🍎',8,'scatter',null,'manzanas')],label:'muchos',say:'Aquí hay muchos.'},{arts:[group('🍎',2,'scatter',null,'manzanas')],label:'pocos',say:'Aquí hay pocos.'},{arts:[group('🍎',0,'scatter',null,'manzanas',{frame:true})],label:'ninguno',say:'Aquí no hay ninguno.'}],
  adult:'Usen frases como «más galletas», «menos agua», «ninguna». Es vocabulario antes que números (Cuadernillo MINED, p. 6 y 13).'}),
 gens:{
  a:(ctx,rng)=>{const it=pick(EMO,rng),many=pick([7,8,9],rng),few=pick([1,2],rng),m=rng()<.5;
   return Q.choose(rng,{key:'mp:'+m+it[0]+many+few,prompt:m?'Toca el grupo que tiene muchos.':'Toca el grupo que tiene pocos.',options:[{id:'many',art:group(it[0],many,'scatter',rng,it[2])},{id:'few',art:group(it[0],few,'scatter',rng,it[2])}],answer:m?'many':'few',explain:m?'Aquí hay muchos.':'Aquí hay pocos.'})},
  b:(ctx,rng)=>{const it=pick(EMO,rng),ns=shuffle([0,pick([2,3],rng),pick([5,6],rng)],rng);
   return Q.choose(rng,{key:'ni:'+it[0]+ns.join(''),prompt:'Toca la canasta donde no hay ninguno.',options:ns.map(n=>({id:String(n),art:group(it[0],n,'scatter',rng,it[2],{frame:true})})),answer:'0',explain:'Esta canasta está vacía: no hay ninguno.'})},
  c:(ctx,rng)=>{const it=pick(EMO,rng),more=rng()<.5,ns=sample([2,3,4,5,6,7,8,9],3,rng).sort((x,y)=>x-y);
   if(ns[1]-ns[0]<1||ns[2]-ns[1]<1)return null;
   return Q.choose(rng,{key:'mm:'+more+it[0]+ns.join(''),prompt:more?'¿Dónde hay más?':'¿Dónde hay menos?',options:ns.map(n=>({id:String(n),art:group(it[0],n,pick(LAY,rng),rng,it[2])})),answer:String(more?ns[2]:ns[0]),explain:(more?'Este grupo tiene más: ':'Este grupo tiene menos: ')+'comparamos cuántos hay en cada uno.'})},
  d:(ctx,rng)=>{const more=rng()<.5,ls=sample([.12,.4,.65,.92],3,rng).sort((x,y)=>x-y);
   return Q.choose(rng,{key:'gl:'+more+ls.join(),prompt:more?'Toca el vaso más lleno.':'Toca el vaso más vacío.',options:ls.map(l=>({id:String(l),art:{k:'obj',type:'glass2',level:l,label:'vaso'}})),answer:String(more?ls[2]:ls[0]),explain:more?'Este vaso tiene más agua. Está más lleno.':'Este vaso tiene menos agua. Está más vacío.'})},
  e:(ctx,rng)=>{const it=pick(EMO,rng),ns=sample([1,2,3,4,5,6,7,8],3,rng).sort((x,y)=>x-y),asc=rng()<.6,list=asc?ns:ns.slice().reverse();
   return Q.order({key:'og:'+it[0]+ns.join()+asc,prompt:asc?'Pon los grupos del que tiene menos al que tiene más.':'Pon los grupos del que tiene más al que tiene menos.',items:list.map(n=>({id:String(n),art:group(it[0],n,'scatter',rng,it[2]),say:n===ns[0]?'el que tiene menos':n===ns[2]?'el que tiene más':'el del medio'})),explain:asc?'Primero el que tiene menos, después el del medio y al final el que tiene más.':'Primero el que tiene más, después el del medio y al final el que tiene menos.'})},
  f:(ctx,rng)=>{const its=sample(EMO,4,rng),ms=[7,8,9],fs=[1,2],items=[0,1].map(i=>({id:'m'+i,art:group(its[i][0],pick(ms,rng),'scatter',rng,its[i][2]),bin:'many'})).concat([2,3].map(i=>({id:'f'+i,art:group(its[i][0],pick(fs,rng),'scatter',rng,its[i][2]),bin:'few'})));
   return Q.sort(rng,{key:'mf:'+its.map(x=>x[0]).join(''),prompt:'Pon los grupos donde corresponde: muchos o pocos.',bins:[{id:'many',art:group('🍎',8,'scatter',rng,'manzanas'),label:'muchos'},{id:'few',art:group('🍎',2,'scatter',rng,'manzanas'),label:'pocos'}],items,explain:'Los que tienen muchos van con muchos y los que tienen pocos van con pocos.'})}},
 plan:{examples:['a','d'],practice:['a','e','d'],reinforce:['f','c'],check:['a','e','b']},
 home:'Con dos vasos y agua: «¿cuál está más lleno?». Con galletas: «¿quién tiene más?».'});

C.skill({id:'antes-despues',mod:'cantidad',icon:'↔️',title:'Antes y después',blurb:'Qué número va antes y después',
 learn:ctx=>({title:'Los números van en fila',say:'Los números tienen un orden. Después del uno viene el dos. Antes del tres está el dos.',
  cards:ctx.numbers.slice(0,4).map(n=>({arts:[numArt(n)],label:NW[n],say:n===1?'El uno es el primero.':'Antes del '+NW[n]+' va el '+NW[n-1]+'.',observe:{area:'numbers',id:String(n)}})),
  adult:'Pueden jugar a «el número que se escondió» con tarjetas escritas a mano (Cuadernillo MINED, p. 28: antecesor y sucesor).'}),
 gens:{
  a:(ctx,rng)=>{const M=Math.max(...ctx.numbers),n=pick(ctx.numbers.filter(x=>x<M),rng),it=pick(EMO,rng);
   return Q.choose(rng,{key:'ad:'+n+it[0],prompt:'¿Qué número va después del '+NW[n]+'?',model:[numArt(n),group(it[0],n,'line',rng,it[2])],options:[n+1,...sample(ctx.numbers.filter(x=>x!==n+1),2,rng)].map(x=>({id:String(x),art:numArt(x)})),answer:String(n+1),explain:'Después del '+NW[n]+' viene el '+NW[n+1]+'. Contamos: '+cw(n+1)+'.'})},
  b:(ctx,rng)=>{const n=pick(ctx.numbers.filter(x=>x>1),rng),it=pick(EMO,rng);
   return Q.choose(rng,{key:'ab:'+n+it[0],prompt:'¿Qué número va antes del '+NW[n]+'?',model:[numArt(n),group(it[0],n,'line',rng,it[2])],options:[n-1,...sample(ctx.numbers.filter(x=>x!==n-1),2,rng)].map(x=>({id:String(x),art:numArt(x)})),answer:String(n-1),explain:'Antes del '+NW[n]+' va el '+NW[n-1]+'. Contamos: '+cw(n)+'.'})},
  c:(ctx,rng)=>{const k=Math.min(ctx.numbers.length,rng()<.5?3:4),ns=sample(ctx.numbers,k,rng).sort((x,y)=>x-y);
   return Q.order({key:'on:'+ns.join(),prompt:'Pon los números en orden, del más pequeño al más grande.',items:ns.map(n=>({id:String(n),art:numArt(n),say:NW[n]})),explain:'En orden: '+ns.map(n=>NW[n]).join(', ')+'.'})},
  d:(ctx,rng)=>{const M=Math.max(...ctx.numbers),s=pick(ctx.numbers.filter(x=>x+2<=M),rng);
   return Q.choose(rng,{key:'gp:'+s,prompt:'Falta un número. ¿Cuál es?',model:[numArt(s),{k:'t',t:'?',sym:'',label:'falta uno'},numArt(s+2)],options:[s+1,...sample(ctx.numbers.filter(x=>x!==s+1),2,rng)].map(x=>({id:String(x),art:numArt(x)})),answer:String(s+1),explain:'Entre el '+NW[s]+' y el '+NW[s+2]+' va el '+NW[s+1]+': '+NW[s]+', '+NW[s+1]+', '+NW[s+2]+'.'})}},
 plan:{examples:['a','b'],practice:['a','b','c'],reinforce:['d','c'],check:['a','b','d']},
 home:'Escriban 1, 2, 3 en papelitos, escondan uno y pregunten cuál falta.'});

C.skill({id:'juntar',mod:'cantidad',icon:'➕',title:'Juntar y quitar',blurb:'Llegan más, se van algunos',
 learn:ctx=>({title:'Si llegan más, hay más',say:'Si llegan más, juntamos y hay más. Si se van algunos, quedan menos. Vamos a contar para saber cuántos quedan.',
  cards:[{arts:[group('🐥',1,'line',null,'pollitos'),em('➕','y llegan más'),group('🐥',1,'line',null,'pollitos')],label:'juntar',say:'Había un pollito y llega otro. Ahora hay dos.'},{arts:[group('🐥',3,'line',null,'pollitos',{gone:[2]})],label:'quitar',say:'Había tres y se va uno. Quedan dos.'}],
  adult:'Usen objetos reales. Esto prepara la suma y la resta; no hace falta escribir operaciones.'}),
 gens:{
  a:(ctx,rng)=>{const M=Math.max(...ctx.numbers),pairs=[];for(let x=1;x<M;x++)for(let y=1;x+y<=M;y++)pairs.push([x,y]);const [x,y]=pick(pairs,rng),it=pick(EMO,rng);
   return Q.choose(rng,{key:'j:'+x+y+it[0],prompt:'Había '+ph(x,it)+' y llegan '+(y===1?'uno más':NW[y]+' más')+'. ¿Cuántos hay ahora?',model:[group(it[0],x,'line',rng,it[2]),em('➕','y llegan'),group(it[0],y,'line',rng,it[2])],options:[x+y,...sample(ctx.numbers.filter(n=>n!==x+y),2,rng)].map(n=>({id:String(n),art:numArt(n)})),answer:String(x+y),explain:'Contamos todos juntos: '+cw(x+y)+'. Hay '+NW[x+y]+'.'})},
  b:(ctx,rng)=>{const M=Math.max(...ctx.numbers),x=pick(ctx.numbers.filter(n=>n>=2),rng),k=pick(Array.from({length:x-1},(_,i)=>i+1),rng),it=pick(EMO,rng),gone=Array.from({length:k},(_,i)=>x-1-i);
   return Q.choose(rng,{key:'q:'+x+k+it[0],prompt:'Había '+ph(x,it)+' y se '+(k===1?'va uno':'van '+NW[k])+'. ¿Cuántos quedan?',model:[group(it[0],x,'line',rng,it[2],{gone})],options:[x-k,...sample(ctx.numbers.filter(n=>n!==x-k),2,rng)].map(n=>({id:String(n),art:numArt(n)})),answer:String(x-k),explain:'Los que están tachados se fueron. Contamos los que quedan: '+cw(x-k)+'.'})},
  c:(ctx,rng)=>{const M=Math.max(...ctx.numbers),n=pick(ctx.numbers.filter(x=>x>=2),rng),it=pick(EMO,rng);
   return Q.raw('put',{key:'jp:'+n+it[0],prompt:'Hay muchas en la mesa. Pon '+ph(n,it)+' en el plato.',model:[numArt(n)],item:it[0],name:it[2],target:n,tray:Math.min(12,n+3),explain:'Ponemos '+cw(n)+' y paramos.'})}},
 plan:{examples:['a','b'],practice:['a','b','a'],reinforce:['b','c'],check:['a','b','c']},
 home:'Con tapitas: «tienes 2 y te doy 1 más, ¿cuántas tienes?».'});

/* ===================== PALABRAS Y SONIDOS ===================== */
const vwords=v=>WORDS.filter(w=>w.init===v);
const fwords=v=>WORDS.filter(w=>w.last===v);
const vopts=(V,ans,rng)=>V.length<=3?V:[ans,...sample(V.filter(x=>x!==ans),2,rng)];

C.skill({id:'vocal-inicial',mod:'lenguaje',icon:'🅰️',title:'Con qué vocal empieza',blurb:'El primer sonido de las palabras',
 learn:ctx=>({title:'Las palabras empiezan con un sonido',say:'Cada palabra empieza con un sonido. Escucha: avión, a. Empieza con la a.',
  cards:ctx.vowels.map(v=>({arts:[vowelArt(v),wordArt(vwords(v)[0])],label:v+' · '+vwords(v)[0].name,say:vwords(v)[0].name+' empieza con la '+v+'.',observe:{area:'vowels',id:v}})),
  adult:'Digan la palabra alargando el primer sonido: «aaaavión». El niño oye primero, después relaciona con la letra (Cuadernillo MINED, p. 21).'}),
 gens:{
  a:(ctx,rng)=>{const v=pick(ctx.vowels,rng),w=pick(vwords(v),rng);
   return Q.choose(rng,{key:'vi:'+w.name,prompt:'¿Con qué vocal empieza '+w.name+'?',say:'Escucha: '+w.name+'. ¿Con qué vocal empieza?',model:[wordArt(w)],options:vopts(ctx.vowels,v,rng).map(x=>({id:x,art:vowelArt(x)})),answer:v,explain:w.name+' empieza con la '+v+'.'})},
  b:(ctx,rng)=>{const v=pick(ctx.vowels,rng),w=pick(vwords(v),rng),ds=sample(WORDS.filter(x=>x.init!==v),2,rng);
   return Q.choose(rng,{key:'vp:'+v+w.name,prompt:'Toca lo que empieza con la '+v+'.',model:[vowelArt(v)],options:[w,...ds].map(x=>({id:x.name,art:wordArt(x)})),answer:w.name,listen:[w,...ds].map(x=>x.name),explain:w.name+' empieza con la '+v+'.'})},
  c:(ctx,rng,i,phase)=>{const k=phase==='check'&&ctx.vowels.length>=3?3:2,vs=sample(ctx.vowels,k,rng),items=vs.flatMap(v=>sample(vwords(v),2,rng).map(w=>({id:w.name,art:wordArt(w),bin:v})));
   return Q.sort(rng,{key:'vs:'+items.map(x=>x.id).join(),prompt:'Pon cada dibujo con la vocal con la que empieza.',bins:vs.map(v=>({id:v,art:vowelArt(v),label:'la '+v})),items,explain:items.map(x=>x.id+' con la '+x.bin).join('; ')+'.'})}},
 plan:{examples:['a','b'],practice:['a','a','b'],reinforce:['c','b'],check:['a','b','c']},
 home:'En la casa: «busquen algo que empiece con a». Pinten con el color que prefieran la letra inicial (Cuadernillo MINED, p. 21).'});

C.skill({id:'vocal-final',mod:'lenguaje',icon:'🔚',title:'Con qué vocal termina',blurb:'El último sonido de las palabras',
 learn:ctx=>{const V=ctx.vowels.filter(v=>fwords(v).length>=3);return{title:'Las palabras también terminan con un sonido',say:'Escucha: casa. Termina con la a. Escucha: gato. Termina con la o.',
  cards:V.map(v=>({arts:[wordArt(fwords(v)[0]),vowelArt(v)],label:fwords(v)[0].name+' · '+v,say:fwords(v)[0].name+' termina con la '+v+'.',observe:{area:'vowels',id:v}})),adult:'Alarguen el final: «casaaa». Pueden jugar a decir palabras que terminan igual (Cuadernillo MINED, p. 21: sonidos finales).'}},
 gens:{
  a:(ctx,rng)=>{const V=ctx.vowels.filter(v=>fwords(v).length>=3),v=pick(V,rng),w=pick(fwords(v),rng);
   return Q.choose(rng,{key:'vf:'+w.name,prompt:'¿Con qué vocal termina '+w.name+'?',say:'Escucha: '+w.name+'. ¿Con qué vocal termina?',model:[wordArt(w)],options:vopts(V,v,rng).map(x=>({id:x,art:vowelArt(x)})),answer:v,explain:w.name+' termina con la '+v+'.'})},
  b:(ctx,rng,i,phase)=>{const V=ctx.vowels.filter(v=>fwords(v).length>=3),k=phase==='check'&&V.length>=3?3:2,vs=sample(V,k,rng),items=vs.flatMap(v=>sample(fwords(v),2,rng).map(w=>({id:w.name,art:wordArt(w),bin:v})));
   return Q.sort(rng,{key:'vfs:'+items.map(x=>x.id).join(),prompt:'Pon cada dibujo con la vocal con la que termina.',bins:vs.map(v=>({id:v,art:vowelArt(v),label:'la '+v})),items,explain:items.map(x=>x.id+' termina con la '+x.bin).join('; ')+'.'})},
  c:(ctx,rng)=>{const V=ctx.vowels.filter(v=>fwords(v).length>=3),v=pick(V,rng),w=pick(fwords(v),rng),same=pick(fwords(v).filter(x=>x!==w),rng),ds=sample(WORDS.filter(x=>x.last!==v&&/[aeiou]/.test(x.last)),2,rng);
   return Q.choose(rng,{key:'vfm:'+w.name+same.name,prompt:'Escucha: '+w.name+'. ¿Cuál termina con el mismo sonido?',model:[wordArt(w)],options:[same,...ds].map(x=>({id:x.name,art:wordArt(x)})),answer:same.name,listen:[same,...ds].map(x=>x.name),explain:w.name+' y '+same.name+' terminan con la '+v+'.'})}},
 plan:{examples:['a','c'],practice:['a','c','a'],reinforce:['b','c'],check:['a','b','c']},
 home:'Jueguen a «¿con qué termina?» con nombres de la familia y objetos de casa.'});

const wordsSyl=n=>WORDS.filter(w=>w.syl===n);
const SYLWORDS=['sol','gato','tortuga','mariposa'];
C.skill({id:'silabas',mod:'lenguaje',icon:'👏',title:'Palmadas de las palabras',blurb:'Partir palabras en sílabas',
 learn:ctx=>({title:'Las palabras se pueden partir en palmadas',say:'Aplaudimos cada parte de la palabra. Sol, una palmada. Ga, to, dos palmadas.',
  cards:SYLWORDS.map(n=>{const w=byName[n];return{arts:[wordArt(w),group('👏',w.syl,'line',null,'palmadas')],label:w.parts.join(' · '),say:w.name+': '+w.parts.join(', ')+'. '+(w.syl===1?'Una palmada.':NW[w.syl]+' palmadas.')}}),
  adult:'Aplaudan con él al ritmo de cada sílaba. No hace falta contar en voz alta todavía (Cuadernillo MINED, p. 22).'}),
 gens:{
  a:(ctx,rng,i,phase)=>{const w=pick(wordsSyl(pick(phase==='check'?[2,3,4]:[1,2,3],rng)),rng);
   return Q.raw('clap',{key:'cl:'+w.name,prompt:'Aplaude cada parte de la palabra '+w.name+'.',say:'Aplaude cada parte de la palabra '+w.name+'.',word:w,explain:w.name+': '+w.parts.join(' - ')+'. '+(w.syl===1?'Una palmada.':NW[w.syl]+' palmadas.')})},
  b:(ctx,rng,i,phase)=>{const bs=phase==='check'?[1,2,3]:sample([1,2,3],2,rng).sort(),items=bs.flatMap(n=>sample(wordsSyl(n),2,rng).map(w=>({id:w.name,art:wordArt(w),bin:String(n)})));
   return Q.sort(rng,{key:'ss:'+items.map(x=>x.id).join(),prompt:'Pon cada dibujo donde corresponde: cuántas palmadas tiene su nombre.',bins:bs.map(n=>({id:String(n),art:group('👏',n,'line',rng,'palmadas'),label:n===1?'una palmada':NW[n]+' palmadas'})),items,explain:items.map(x=>x.id+' tiene '+(x.bin==='1'?'una palmada':NW[+x.bin]+' palmadas')).join('; ')+'.'})},
  c:(ctx,rng)=>{const a=pick(WORDS,rng),b=pick(WORDS.filter(w=>w.syl!==a.syl),rng),long=rng()<.5,win=(a.syl>b.syl)===long?a:b;
   return Q.choose(rng,{key:'ms:'+a.name+b.name,prompt:long?'¿Cuál palabra es más larga? Cuenta las palmadas.':'¿Cuál palabra es más corta? Cuenta las palmadas.',options:[a,b].map(x=>({id:x.name,art:wordArt(x)})),answer:win.name,listen:[a.name,b.name],explain:a.name+' tiene '+a.syl+' y '+b.name+' tiene '+b.syl+'. '+win.name+' es más '+(long?'larga':'corta')+'.'})}},
 plan:{examples:['a','b'],practice:['a','a','c'],reinforce:['b','c'],check:['a','b','a']},
 home:'Al caminar, aplaudan nombres de la familia: Ma-rí-a, Pa-pá, Lu-is.'});

const RHY=[['gato','pato'],['rana','manzana'],['gallo','caballo'],['león','avión'],['queso','beso'],['pelota','bota'],['mano','gusano']];
C.skill({id:'rimas',mod:'lenguaje',icon:'🎵',title:'Palabras que suenan igual',blurb:'Rimas y finales parecidos',
 learn:ctx=>({title:'Algunas palabras suenan parecido al final',say:'Gato y pato suenan parecido al final. Eso se llama rima.',
  cards:RHY.slice(0,3).map(([a,b])=>({arts:[wordArt(byName[a]),wordArt(byName[b])],label:a+' · '+b,say:a+' y '+b+' suenan parecido al final.'})),
  adult:'Canten o inventen rimas tontas: «el gato come pato». Lo importante es oír el final (Cuadernillo MINED, p. 21: rimas y canciones).'}),
 gens:{
  a:(ctx,rng)=>{const pr=shuffle(pick(RHY,rng).map(n=>byName[n]),rng),[w,r]=pr,ds=sample(WORDS.filter(x=>x.end2!==w.end2&&x.name!==w.name),2,rng);
   return Q.choose(rng,{key:'ri:'+w.name+r.name,prompt:'Escucha: '+w.name+'. ¿Cuál suena parecido al final?',model:[wordArt(w)],options:[r,...ds].map(x=>({id:x.name,art:wordArt(x)})),answer:r.name,listen:[r,...ds].map(x=>x.name),explain:w.name+' y '+r.name+' suenan parecido al final.'})},
  b:(ctx,rng)=>{const ps=sample(RHY,3,rng).map(p=>p.map(n=>byName[n]));
   return Q.match(rng,{key:'rm:'+ps.map(p=>p[0].name).join(),prompt:'Une los dibujos que suenan parecido al final.',pairs:ps.map(([x,y])=>({id:x.name,l:wordArt(x),r:wordArt(y),say:x.name+' y '+y.name+' suenan parecido.'})),explain:ps.map(([x,y])=>x.name+' con '+y.name).join('; ')+'.'})}},
 plan:{examples:['a','b'],practice:['a','a','b'],reinforce:['b','a'],check:['a','a','b']},
 home:'Digan una palabra y que el niño invente otra que suene parecido, aunque sea inventada.'});

const RID=[['Es redonda y naranja. Con ella se hace jugo.','naranja'],['Es amarilla y larga. Los monos la pelan para comerla.','plátano'],['Tiene cuatro patas, ladra y mueve la cola.','perro'],['Vive en el agua, nada y tiene aletas.','pez'],['Sale de día y nos da luz y calor.','sol'],['Tiene dos ruedas y se mueve con pedales.','bicicleta'],['Me lo pongo en el pie, antes del zapato.','calcetín'],['Es suave, dice miau y le gusta la leche.','gato'],['Es roja y redonda. Crece en un árbol y se muerde.','manzana'],['Nos da leche y hace muuu.','vaca'],['Tiene alas de colores y antes fue oruga.','mariposa'],['Tengo dos para ver el mundo.','ojo']];
const SND=[['miau','gato'],['guau','perro'],['muuu','vaca'],['cuac','pato'],['oink','cerdo'],['pío, pío','pollito'],['croac','rana'],['beee','oveja'],['ki-ki-ri-kí','gallo']];
C.skill({id:'adivinanzas',mod:'lenguaje',icon:'❓',title:'Adivinanzas y sonidos',blurb:'Escuchar, entender y adivinar',
 learn:ctx=>({title:'Escuchamos pistas y adivinamos',say:'Te voy a decir una pista y tú adivinas qué es. Escucha: tiene cuatro patas, ladra y mueve la cola. ¿Qué es? Es un perro.',
  cards:[{arts:[wordArt(byName.perro)],label:'perro',say:'Tiene cuatro patas, ladra y mueve la cola. Es el perro.'},{arts:[wordArt(byName.vaca)],label:'vaca',say:'Hace muuu. Es la vaca.'}],
  adult:'Lean cada pista despacio. Pueden inventar adivinanzas con los objetos de la casa (Cuadernillo MINED, p. 7: juega a las adivinanzas).'}),
 gens:{
  a:(ctx,rng)=>{const [t,n]=pick(RID,rng),w=byName[n],ds=sample(RID.map(r=>byName[r[1]]).filter(x=>x!==w),2,rng);
   return Q.choose(rng,{key:'ad:'+n,prompt:t+' ¿Qué es?',say:t+' ¿Qué es?',options:[w,...ds].map(x=>({id:x.name,art:wordArt(x)})),answer:n,listen:[w,...ds].map(x=>x.name),explain:t+' Es '+w.art+' '+w.name+'.'})},
  b:(ctx,rng)=>{const [sd,n]=pick(SND,rng),w=byName[n],ds=sample(SND.map(r=>byName[r[1]]).filter(x=>x!==w),2,rng);
   return Q.choose(rng,{key:'sn:'+n,prompt:'¿Quién hace «'+sd+'»?',say:'¿Quién hace '+sd+'?',options:[w,...ds].map(x=>({id:x.name,art:wordArt(x)})),answer:n,listen:[w,...ds].map(x=>x.name),explain:'«'+sd+'» lo dice '+w.art+' '+w.name+'.'})},
  c:(ctx,rng)=>{const ps=sample(SND,6,rng),[x,y]=ps,ax=byName[x[1]],ay=byName[y[1]];
   return Q.raw('follow',{key:'sf:'+ps.map(p=>p[1]).join(),prompt:'Toca al que hace «'+x[0]+'» y después al que hace «'+y[0]+'».',say:'Toca al que hace '+x[0]+' y después al que hace '+y[0]+'.',board:shuffle(ps.map(p=>({id:p[1],art:wordArt(byName[p[1]])})),rng),targets:[x[1],y[1]],explain:'«'+x[0]+'» lo dice '+ax.art+' '+ax.name+' y «'+y[0]+'» lo dice '+ay.art+' '+ay.name+'.'})}},
 plan:{examples:['a','b'],practice:['a','b','c'],reinforce:['c','a'],check:['a','b','c']},
 home:'Hagan una adivinanza por día con objetos de la casa: «es redondo, se come y es naranja».'});

/* El nombre lo escribe el adulto: se respeta completo (acentos incluidos). Si es demasiado largo para armarse en pantalla, la habilidad no se ofrece en vez de mostrar un nombre cortado. */
const nm=ctx=>{const n=String(ctx.name||'').trim().split(/\s+/)[0].replace(/[^\p{L}]/gu,'');return n&&n.length<=12?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():''};
const fullNm=ctx=>{const w=String(ctx.name||'').trim().split(/\s+/).map(x=>x.replace(/[^\p{L}]/gu,'')).filter(Boolean).slice(0,3).map(x=>x.charAt(0).toUpperCase()+x.slice(1).toLowerCase());const f=w.join(' ');return w.length>1&&f.length<=18&&nm(ctx)?f:''};
const DECOY=['Ana','Luis','Sofía','Mateo','Camila','José','Valeria','Daniel','Lucía','Pedro','María','Diego','Elena','Pablo'];
const ALPHA='ABCDEFGHIJLMNOPRSTUV'.split('');
C.skill({id:'mi-nombre',mod:'lenguaje',icon:'✏️',title:'Mi nombre',blurb:'Reconocer y armar mi nombre',needsName:true,
 available:ctx=>nm(ctx).length>=2,
 learn:ctx=>{const n=nm(ctx);return{title:'Este es mi nombre',say:'Este es tu nombre: '+n+'. Tiene '+n.length+' letras. Empieza con la '+n[0]+'.',
  cards:[{arts:[tx(n,'name',n)],label:n,say:n+'. Así se escribe tu nombre.'},{arts:[tx(n,'name',n),tx(n.toUpperCase(),'name',n.toUpperCase())],label:'chicas y grandes',say:'Tu nombre con letras chicas y con letras grandes. Dice lo mismo.'},...(fullNm(ctx)?[{arts:[tx(fullNm(ctx),'name',fullNm(ctx))],label:fullNm(ctx),say:'Tu nombre completo: '+fullNm(ctx)+'.'}]:[]),...[...n].slice(0,6).map(ch=>({arts:[tx(ch,'name',ch)],label:ch,say:'La letra '+ch}))],
  adult:'Escriban su nombre en papel con letras grandes. Primero que lo mire y lo siga con el dedo (Cuadernillo MINED, pp. 14 y 28: nombre propio). El nombre que se usa es el que ustedes escribieron en Ajustes (se puede cambiar cuando quieran). Pueden pegar su foto junto al nombre en una tarjeta. Trazar las letras con el dedo en la pantalla aún no está disponible para cualquier nombre; hágalo en papel.'}},
 gens:{
  a:(ctx,rng)=>{const n=nm(ctx),v=Math.floor(rng()*3),up=v===2,L=[...(up?n.toUpperCase():n)],used=n.toUpperCase(),extra=v===1?sample(ALPHA.filter(x=>!used.includes(x)),2,rng).map((ch,i)=>({id:'x'+i,v:ch.toLowerCase(),art:tx(ch.toLowerCase(),'name',ch.toLowerCase()),say:ch})):[];
   return Q.order({key:'nb:'+n+v,prompt:up?'Pon las letras grandes de tu nombre en orden.':v===1?'Pon las letras de tu nombre en orden. Sobran dos letras.':'Pon las letras de tu nombre en orden.',items:L.map((ch,i)=>({id:String(i),v:ch,art:tx(ch,'name',ch),say:ch})),extra,explain:'Tu nombre se escribe '+L.join(' - ')+'.'})},
  b:(ctx,rng)=>{const n=nm(ctx),ini=n[0],ds=sample(ALPHA.filter(x=>x!==ini),2,rng);
   return Q.choose(rng,{key:'ni:'+n+ds.join(''),prompt:'¿Con qué letra empieza tu nombre?',say:'¿Con qué letra empieza '+n+'?',model:[tx(n,'name',n)],options:[ini,...ds].map(x=>({id:x,art:tx(x,'name',x)})),answer:ini,explain:n+' empieza con la '+ini+'.'})},
  c:(ctx,rng)=>{const n=nm(ctx),ds=sample(DECOY.filter(x=>x!==n),2,rng);
   return Q.choose(rng,{key:'nf:'+n+ds.join(''),prompt:'Busca tu nombre escrito.',say:'Busca tu nombre escrito: '+n+'.',options:[n,...ds].map(x=>({id:x,art:tx(x,'name',x)})),answer:n,explain:'Este dice '+n+'. Es tu nombre.'})},
  d:(ctx,rng)=>{const n=nm(ctx),ds=sample(DECOY.filter(x=>x!==n),2,rng);const ids=[n,...ds];
   return Q.match(rng,{key:'nd:'+n+ds.join(''),prompt:'Une cada nombre con el mismo nombre escrito con letras grandes.',pairs:ids.map(x=>({id:x,l:tx(x,'name',x),r:tx(x.toUpperCase(),'name',x.toUpperCase()),say:x+' y '+x.toUpperCase()+' dicen lo mismo.'})),explain:ids.map(x=>x+' = '+x.toUpperCase()).join('. ')+'. Son iguales aunque cambie el tamaño de las letras.'})},
  e:(ctx,rng)=>{const f=fullNm(ctx);if(!f)return C.byId['mi-nombre'].gens.c(ctx,rng);const w=f.split(' '),last=w[w.length-1],ds=sample(DECOY.filter(x=>x!==last&&x!==w[0]),2,rng),wrong=[w.slice(0,-1).concat(ds[0]).join(' '),[ds[1]].concat(w.slice(1)).join(' ')];
   return Q.choose(rng,{key:'nc:'+f+wrong.join(),prompt:'Busca tu nombre completo.',say:'Busca tu nombre completo: '+f+'.',options:[f,...wrong].map(x=>({id:x,art:tx(x,'name',x)})),answer:f,explain:'Tu nombre completo dice '+f+'.'})}},
 plan:{examples:['a','c'],practice:['c','b','e'],reinforce:['a','d','c'],check:['c','b','e']},
 home:'Pongan su nombre en sus dibujos y busquen su inicial en carteles y envases.'});
})(typeof globalThis!=='undefined'?globalThis:this);
