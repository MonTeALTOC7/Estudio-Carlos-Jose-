/* Auditoría pedagógica automatizada (sin navegador). Revisa las 40 habilidades y el currículo contra los criterios de docs/AUDITORIA_PEDAGOGICA_FINAL.md.
   Uso: node qa/audit-pedagogica.cjs [--verbose]
   Lo que NO puede juzgar una máquina (calidad de la voz, claridad percibida por un niño, ritmo) queda en la lista de revisión humana del documento. */
const path=require('node:path'),fs=require('node:fs');
const root=path.join(__dirname,'..');
const C=require(root+'/content.js');['a','b','c'].forEach(x=>require(root+'/skills-'+x+'.js'));
const PE=require(root+'/people.js');globalThis.People=PE;
const CUR=require(root+'/curriculum.js');const E=require(root+'/engine.js');
const verbose=process.argv.includes('--verbose');
let fails=0,warns=0;const bad=(k,m)=>{fails++;console.log('FALLA  ['+k+'] '+m)},warn=(k,m)=>{warns++;if(verbose)console.log('aviso  ['+k+'] '+m)},ok=(k,m)=>console.log('OK     ['+k+'] '+m);
const ctxMax={numbers:[1,2,3,4,5,6,7,8,9,10],vowels:['a','e','i','o','u'],colors:['rojo','azul','amarillo','verde','naranja','morado','rosado','café'],shapes:['círculo','cuadrado','triángulo','rectángulo','óvalo','rombo'],name:'Carlos José',day:3};
const ctxMin=C.ctxFrom(E,E.fresh(),new Date(2026,9,31));
const words=s=>String(s).replace(/[¿?¡!.,:;«»]/g,' ').split(/\s+/).filter(Boolean).length;
const sentences=s=>String(s).split(/[.?!]+/).map(x=>x.trim()).filter(Boolean).length;

/* 1 · Progresión de números, vocales, colores y figuras: el texto de cada lección dice exactamente lo que se desbloquea */
{const G={numbers:['1','2','3','4','5','6','7','8','9','10'],vowels:['a','e','i','o','u'],colors:['rojo','azul','amarillo','verde','naranja','morado','rosado','café'],shapes:['círculo','X','cuadrado','triángulo','rectángulo','óvalo','rombo']};
 const last={};let n=0;
 for(const l of CUR.lessons.filter(x=>x.kind==='symbols')){n++;const prev=last[l.area]||0;
  if(l.reach<=prev)bad('progresión',l.id+': el alcance ('+l.reach+') no crece respecto a la lección anterior ('+prev+')');last[l.area]=l.reach;
  const txt=(l.kid+' '+l.goal).toLowerCase();
  if(l.area==='numbers'){const nums=(txt.match(/\d+/g)||[]).map(Number),max=Math.max(...nums);if(max!==l.reach)bad('progresión',l.id+': el texto menciona hasta el '+max+' pero la lección desbloquea hasta el '+l.reach)}
  else if(l.area==='vowels'){const m=G.vowels.slice(0,l.reach);if(l.reach<5&&!(m.every(v=>txt.includes(v))))bad('progresión',l.id+': el texto no nombra '+m.join(', '));if(l.reach===5&&!/cinco|todas/.test(txt))bad('progresión',l.id+': el texto no dice «todas»/«cinco»')}
  else{const set=G[l.area].slice(0,l.reach),prevSet=G[l.area].slice(0,prev),nuevos=set.filter(x=>!prevSet.includes(x));if(l.reach<G[l.area].length&&!nuevos.every(x=>x==='X'?/\bx\b/.test(txt):txt.includes(x)))bad('progresión',l.id+': el texto no nombra '+nuevos.join(', '))}}
 if(!fails)ok('progresión','el texto de '+n+' lecciones de símbolos coincide con lo que desbloquean (números, vocales, colores, figuras)')}

/* 2 · Cada habilidad: explicación antes de evaluar, variedad, fuera de pantalla, estructura de fases */
const PH=['examples','practice','reinforce','check'];let nSk=0;
for(const sk of C.skills){nSk++;const id=sk.id,ctx=sk.needsName||sk.available&&!sk.available(ctxMin)?ctxMax:ctxMax;
 let L;try{L=sk.learn(ctx)}catch(e){bad(id,'learn falla: '+e.message);continue}
 if(!L.title||!L.say||!(L.cards&&L.cards.length||L.figs&&L.figs.length||L.steps))bad(id,'no explica antes de evaluar (sin título, voz o tarjetas)');
 if(!L.adult||L.adult.length<40)bad(id,'falta orientación para el adulto');if(!sk.home||sk.home.length<25)bad(id,'falta actividad fuera de la pantalla');
 for(const p of PH)if(!(sk.plan[p]&&sk.plan[p].length))bad(id,'fase sin preguntas: '+p);
 const fchk=new Set(sk.plan.check);if(fchk.size<2)bad(id,'la comprobación usa un solo formato: poca variedad');
 const typesCheck=new Set();
 for(const p of PH)for(const f of sk.plan[p])if(!sk.gens[f])bad(id,'formato inexistente '+f);
 /* preguntas: consigna corta, explicación, validez, voz */
 let maxW=0,long=[];
 for(const ph of PH)for(const f of sk.plan[ph]){for(let i=0;i<30;i++){let q;try{q=sk.gens[f](ctx,Math.random,i,ph)}catch(e){bad(id,'genera '+f+'/'+ph+': '+e.message);break}
   const er=C.validate(q,ctx);if(er.length){bad(id,f+'/'+ph+' inválida: '+er.join('; '));break}
   const w=q.type==='paint'&&q.steps?Math.max(...q.steps.map(s=>words(s.text))):words(q.prompt);maxW=Math.max(maxW,w);if(w>20)long.push(w+'p: '+q.prompt);
   if(sentences(q.prompt)>3)warn(id,'consigna con '+sentences(q.prompt)+' frases: '+q.prompt);
   if(!q.explain||q.explain.length<8)bad(id,f+': sin explicación');
   if(ph==='check')typesCheck.add(q.type)}}
 if(long.length)bad(id,'consigna demasiado larga para leerla un niño con voz ('+long[0]+')');
 if(typesCheck.size<2&&sk.plan.check.length>=2)warn(id,'la comprobación usa un solo tipo de pregunta');
}
ok('habilidades','revisadas '+nSk+' habilidades: explicación previa, orientación a adultos, actividad fuera de pantalla, fases completas, preguntas válidas con explicación y consignas cortas');

/* 3 · Lateralidad: nunca personas de frente (inversión) y siempre desde el propio cuerpo */
{const sk=C.byId['izq-der'];let n=0;for(let i=0;i<200;i++)for(const g of Object.keys(sk.gens)){const q=sk.gens[g](ctxMax,Math.random,i,PH[i%4]);const j=JSON.stringify(q);n++;if(/-cara|-cuerpo|"k":"face"|"who"/.test(j))bad('izq-der','aparece una persona en '+g);if(g==='a'&&!/a tu (izquierda|derecha)|en el medio/.test(q.prompt))bad('izq-der','consigna sin «tu»: '+q.prompt)}
 ok('lateralidad','izquierda/derecha: '+n+' preguntas desde el propio cuerpo, sin personas de frente')}

/* 4 · Anatomía: solo partes visibles; sin resaltado previo en práctica ni comprobación */
{let n=0;for(const sk of C.skills)for(const ph of PH)for(const f of sk.plan[ph])for(let i=0;i<20;i++){const q=sk.gens[f](ctxMax,Math.random,i,ph);if(q.type==='tap'){n++;if(!PE.parts(q.fig).includes(q.answer))bad(sk.id,'pregunta por una parte oculta: '+q.answer+' en '+q.fig);if(/lengua|corazón|cerebro|estómago/.test(q.prompt))bad(sk.id,'pregunta por anatomía oculta: '+q.prompt)}}
 const g=fs.readFileSync(root+'/games.js','utf8');const hl=g.match(/hl:q\.answer/g)||[];if(hl.length!==1)bad('resaltado','se esperaba un único uso de hl:q.answer (el ejemplo resuelto) y hay '+hl.length);
 const line=g.split('\n').find(l=>/hl:q\.answer/.test(l))||'';if(!/^\s*tap:q=>'<div class="gpaint solo">/.test(line))bad('resaltado','hl:q.answer fuera del renderizado de ejemplos');
 ok('anatomía','toques sobre partes: '+n+' preguntas, todas sobre partes visibles; el resaltado solo existe en el ejemplo resuelto')}

/* 5 · Transferencia: al comprobar se usan sobre todo otras personas / contextos distintos de los de aprendizaje */
{const sk=['partes','sentidos','emociones','orden-eventos','dia-noche','alimentos'],LF={partes:/carlos-/,sentidos:/carlos-/,emociones:/nino-cara|nina-cara/},learnFigs0=/carlos-|nino-cara/;
 for(const id of sk){const s=C.byId[id];let tot=0,self=0;for(let i=0;i<300;i++)for(const f of s.plan.check){const j=JSON.stringify(s.gens[f](ctxMax,Math.random,i,'check'));if(/-cara|-cuerpo|"who"/.test(j)){tot++;if((LF[id]||learnFigs0).test(j))self++}}
  if(tot&&self/tot>.4)bad('transferencia',id+': '+Math.round(100*self/tot)+' % de las comprobaciones usa al protagonista o los dibujos del aprendizaje (máximo 40 %)');else if(tot)warn('transferencia',id+': '+Math.round(100*self/tot)+' % con personas del aprendizaje')}
 ok('transferencia','al comprobar, las habilidades con personas usan mayoritariamente personas distintas de las del aprendizaje (Partes y Sentidos conservan caras de Carlos solo como una de varias)')}

/* 6 · Consignas de emoción: ninguna presenta una emoción como «mala» */
{const s=JSON.stringify(C.byId.emociones.learn(ctxMax));if(/mal(o|a)\b|no debes|no se debe/i.test(s))bad('emociones','lenguaje que juzga las emociones');else ok('emociones','todas las emociones se presentan como normales y con una estrategia');}

console.log('\n'+(fails?fails+' fallas':'sin fallas')+' · '+warns+' avisos'+(verbose?'':' (usa --verbose para verlos)'));process.exit(fails?1:0);
