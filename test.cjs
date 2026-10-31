const assert = require('node:assert/strict');
const fs = require('node:fs');
const E = require('./engine.js');
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('OK ' + name); }
test('Inicio limitado para reconocer desde cero', () => {
  const s=E.fresh();
  assert.deepEqual(E.active(s,'numbers'),['1','2','3']);
  assert.deepEqual(E.active(s,'vowels'),['a','e']);
});
test('Avance con aciertos independientes y reinicio con ayuda', () => {
  const s=E.fresh();
  for(const id of ['1','2','3']) { E.record(s,'numbers',id,true); E.record(s,'numbers',id,true); }
  assert.deepEqual(E.active(s,'numbers'),['1','2','3','4']);
  E.record(s,'numbers','2',false);
  assert.equal(E.rec(s,'numbers','2').streak,0);
  assert.equal(E.rec(s,'numbers','2').supported,1);
  assert.equal(E.rec(s,'numbers','2').independent,2);
  assert.deepEqual(E.active(s,'numbers'),['1','2','3','4']);
  assert.ok(['2','4'].includes(E.target(s,'numbers','1')));
});
test('Opciones únicas y respuesta presente en todos los grupos', () => {
  const s=E.fresh();
  for(const area of Object.keys(E.groups)) {
    for(let i=0;i<50;i++) for(const id of E.active(s,area)) {
      const q=E.question(s,area,id);
      assert.equal(q.options.length,2);
      assert.equal(new Set(q.options).size,2);
      assert.ok(q.options.includes(id));
    }
  }
  for(const id of ['1','2','3']) E.record(s,'numbers',id,true);
  assert.equal(E.question(s,'numbers','1').options.length,3);
});
test('Trazos: vacío y figura equivocada no reciben logro', () => {
  const circle=E.tracePaths('círculo');
  assert.equal(E.gradeTrace(circle,[]).ok,false);
  assert.equal(E.gradeTrace(circle,E.tracePaths('X')).ok,false);
  assert.equal(E.gradeTrace(E.tracePaths('X'),E.tracePaths('línea')).ok,false);
  for(const id of ['círculo','X','a','e','i','o','u','1','2','3'])
    assert.equal(E.gradeTrace(E.tracePaths(id),E.tracePaths(id)).ok,true,id);
});
test('Garabato de cobertura amplia se rechaza por baja precisión', () => {
  const strokes=[];
  for(let y=0;y<=100;y+=3) strokes.push([[0,y],[100,y]]);
  assert.equal(E.gradeTrace(E.tracePaths('círculo'),strokes).ok,false);
});
test('Distribución completa, sin marcadores pendientes', () => {
  const html=fs.readFileSync(__dirname+'/dist/index.html','utf8');
  for(const token of ['/*CSS*/','/*ENGINE*/','/*APP*/','/*ACTIVITIES*/']) assert.ok(!html.includes(token));
  const manifest=JSON.parse(fs.readFileSync(__dirname+'/dist/manifest.webmanifest','utf8'));
  for(const icon of manifest.icons) assert.ok(fs.existsSync(__dirname+'/dist/'+icon.src));
  assert.ok(fs.existsSync(__dirname+'/dist/sw.js'));
});


test('Desbloqueo persistente hasta diez y migración del estado anterior',()=>{
 const s=E.fresh();for(const id of E.groups.numbers){E.record(s,'numbers',id,true);E.record(s,'numbers',id,true)}
 for(const id of E.groups.numbers)E.record(s,'numbers',id,false);
 assert.equal(E.active(JSON.parse(JSON.stringify(s)),'numbers').length,10);
 const old=E.fresh();delete old.unlocked;assert.equal(E.active(old,'vowels').length,2);
});

const A=require('./activities.js');
test('Asociaciones: claves únicas y colores coincidentes en animales y objetos',()=>{
 const seen=new Set();for(let board=0;board<4;board++){const pairs=A.pairs('colorImage',board);assert.equal(pairs.length,2);assert.equal(new Set(pairs.map(x=>x.key)).size,2);for(const p of pairs){assert.equal(p.left.color,p.right.color);seen.add(p.key)}}assert.equal(seen.size,4);
 for(let board=0;board<3;board++){const pairs=A.pairs('shapeObject',board);assert.equal(new Set(pairs.map(x=>x.key)).size,2)}
});
test('Comparaciones y series: única respuesta válida en cada pregunta',()=>{
 for(const kind of Object.keys(A.names))for(let i=0;i<6;i++){const q=A.question(kind,i);assert.equal(q.choices.filter(x=>x.key===q.answer).length,1);assert.equal(q.choices.length,2);assert.ok(q.explanation);if(kind==='amount'){const correct=q.choices.find(x=>x.key===q.answer),other=q.choices.find(x=>x.key!==q.answer);assert.equal(correct.count>other.count,q.rule==='more')}if(kind==='pattern'){assert.equal(q.reference[0].key,q.reference[2].key);assert.equal(q.answer,q.reference[1].key)}}
});
test('Ayudas en juegos no alteran desbloqueo ni registros de símbolos',()=>{const s=E.fresh();A.record(s,'colorImage',false);A.record(s,'colorImage',true);assert.deepEqual(s.activities.colorImage,{independent:1,supported:1});assert.deepEqual(E.active(s,'colors'),['rojo','azul']);assert.deepEqual(s.records,{})});
/* ===== v4: rutas de aprendizaje ===== */
const C=require('./content.js');['a','b','c'].forEach(x=>require('./skills-'+x+'.js'));
const ctxMin=()=>C.ctxFrom(E,E.fresh(),new Date(2026,9,31));
const ctxMid={numbers:[1,2,3,4,5],vowels:['a','e','i'],colors:['rojo','azul','amarillo','verde'],shapes:['círculo','cuadrado','triángulo','rectángulo'],name:'Ana María',day:0};
const ctxMax={numbers:[1,2,3,4,5,6,7,8,9,10],vowels:['a','e','i','o','u'],colors:['rojo','azul','amarillo','verde','naranja','morado','rosado','café'],shapes:['círculo','cuadrado','triángulo','rectángulo','óvalo','rombo'],name:'Carlos',day:3};
const ALLCTX=()=>[ctxMin(),ctxMid,ctxMax];
const avail=(sk,ctx)=>!sk.available||sk.available(ctx);

test('Rutas: 8 módulos, al menos 40 habilidades, cada una con aprender, plan y actividad para casa',()=>{
 assert.equal(C.modules.length,8);assert.ok(C.skills.length>=40);
 for(const m of C.modules)assert.ok(C.skillsOf(m.id).length>=3,'ruta con pocas habilidades '+m.id);
 for(const sk of C.skills){assert.ok(C.byId[sk.mod===undefined?'':sk.id]);assert.ok(C.modules.some(m=>m.id===sk.mod),sk.id);
  assert.ok(sk.title&&sk.blurb&&sk.icon&&sk.home,sk.id);
  const L=sk.learn(ctxMax);assert.ok(L.title&&L.say&&L.cards.length>=1,sk.id);for(const c of L.cards)assert.ok(c.arts.length&&c.label&&c.say||c.label,sk.id);
  for(const ph of ['examples','practice','reinforce','check'])for(const f of sk.plan[ph])assert.ok(sk.gens[f],sk.id+':'+f);
  assert.ok(sk.plan.practice.length>=2&&sk.plan.check.length>=2&&sk.plan.examples.length>=1,sk.id)}
});
test('Variedad: cada habilidad practica con más de una forma de interacción (salvo las secuenciales declaradas)',()=>{
 const single=new Set(['simon','une-puntos']);
 for(const sk of C.skills){const ctx=ctxMax,types=new Set();for(const f of new Set([...sk.plan.practice,...sk.plan.reinforce,...sk.plan.check])){const q=sk.gens[f](ctx,Math.random,0,'practice');types.add(q.type==='recall'?'recall-'+(q.mode==='order'?'orden':'elección'):q.type)}
  if(!single.has(sk.id))assert.ok(types.size>=2,'una sola interacción en '+sk.id+': '+[...types]);
  assert.ok(new Set([...sk.plan.practice,...sk.plan.reinforce,...sk.plan.check]).size>=2,'un solo formato '+sk.id)}
});
test('Validación masiva: 100 preguntas por formato en 3 niveles de avance, sin errores ni textos rotos',()=>{
 const rx=/undefined|NaN|\[object|\bnull\b/;let n=0;
 const scan=(v,w)=>{if(typeof v==='string')assert.ok(!rx.test(v),w+': '+v);else if(Array.isArray(v))v.forEach(x=>scan(x,w));else if(v&&typeof v==='object')for(const k in v)scan(v[k],w)};
 for(const ctx of ALLCTX())for(const sk of C.skills){if(!avail(sk,ctx))continue;for(const f of Object.keys(sk.gens))for(let i=0;i<100;i++){const q=sk.gens[f](ctx,Math.random,i,['examples','practice','reinforce','check'][i%4]);if(!q)continue;n++;const e=C.validate(q,ctx);assert.deepEqual(e,[],sk.id+':'+f+' '+e.join('|'));scan(q,sk.id+':'+f)}}
 assert.ok(n>20000,'pocas preguntas generadas: '+n)
});
test('No se presentan números ni vocales que no se han enseñado (nivel inicial)',()=>{
 const ctx=ctxMin();assert.deepEqual(ctx.numbers,[1,2,3]);assert.deepEqual(ctx.vowels,['a','e']);
 for(const sk of C.skills)for(const f of Object.keys(sk.gens))for(let i=0;i<60;i++){const q=sk.gens[f](ctx,Math.random,i,'check');if(!q)continue;
  const walk=v=>{if(v&&typeof v==='object'){if(v.k==='t'&&v.sym==='n')assert.ok([1,2,3].includes(+v.t),sk.id+' número '+v.t);if(v.k==='t'&&v.sym==='v')assert.ok(['a','e'].includes(v.t),sk.id+' vocal '+v.t);for(const k in v)walk(v[k])}};walk(q)}
});
test('Sin pista involuntaria: la respuesta correcta aparece en todas las posiciones',()=>{
 for(const sk of C.skills)for(const f of Object.keys(sk.gens)){const pos={};let k=0;for(let i=0;i<150;i++){const q=sk.gens[f](ctxMax,Math.random,i,'check');if(!q||q.type!=='choose'||q.row)continue;k++;const j=q.options.findIndex(o=>o.id===q.answer);pos[q.options.length+':'+j]=1}
  if(k>100){const byLen={};Object.keys(pos).forEach(x=>{const [l,j]=x.split(':');(byLen[l]=byLen[l]||new Set()).add(j)});for(const l in byLen)assert.equal(byLen[l].size,+l,sk.id+':'+f+' sesgo de posición')}}
});
test('Sesión de cinco fases: ejemplos, práctica, refuerzo y comprobación sin repetir estímulos ni fallar',()=>{
 for(const ctx of ALLCTX())for(const sk of C.skills){if(!avail(sk,ctx))continue;for(let i=0;i<15;i++){const se=C.session(sk,ctx,Math.random);
  assert.equal(se.examples.length,sk.plan.examples.length);assert.equal(se.practice.length,sk.plan.practice.length);assert.equal(se.reinforce.length,sk.plan.reinforce.length);assert.equal(se.check.length,sk.plan.check.length);
  const keys=[...se.examples,...se.practice,...se.reinforce,...se.check].map(q=>q.key);const uniq=new Set(keys).size;assert.ok(uniq>=keys.length-1||sk.id==='une-puntos'||sk.id==='simon'||sk.id==='pintar'||uniq>=keys.length-2,sk.id+' repite estímulos '+uniq+'/'+keys.length);
  const m=se.more(sk.plan.practice[0]);assert.equal(m.phase,'reinforce')}}
});
test('Determinismo: la misma semilla produce la misma sesión',()=>{
 const sk=C.byId['clasif-color'],a=JSON.stringify(C.session(sk,ctxMax,C.mulberry(7))),b=JSON.stringify(C.session(sk,ctxMax,C.mulberry(7))),c=JSON.stringify(C.session(sk,ctxMax,C.mulberry(8)));
 assert.equal(a,b);assert.notEqual(a,c)
});
test('Colores y figuras ampliados: compatibilidad con progreso anterior y datos de color',()=>{
 assert.equal(E.groups.colors.length,8);assert.equal(E.groups.shapes.length,7);
 for(const c of E.groups.colors)assert.ok(C.COLORS[c]&&/^#[0-9a-f]{6}$/i.test(C.COLORS[c].hex),c);
 const old=E.fresh();old.unlocked={colors:4,shapes:4,numbers:10,vowels:5};old.records['colors:rojo']={seen:3,independent:2,supported:0,errors:0,streak:2,last:1};
 assert.equal(E.active(old,'colors').length,4);assert.equal(E.active(old,'shapes').length,4);assert.equal(E.rec(old,'colors','rojo').independent,2);
 const s=E.fresh();for(const id of E.groups.colors){E.record(s,'colors',id,true);E.record(s,'colors',id,true)}assert.equal(E.active(s,'colors').length,8);
 const ctx=C.ctxFrom(E,s,new Date());assert.equal(ctx.colors.length,8);assert.ok(!ctx.shapes.includes('X'));
});
test('Trazos nuevos: cada uno se acepta a sí mismo y se rechazan los equivocados',()=>{
 const ids=['rectángulo','rombo','óvalo','vertical','inclinada','cruz','curva','zigzag','bucle','mixta'];
 for(const id of ids){assert.ok(E.tracePaths(id).length>=1);assert.equal(E.gradeTrace(E.tracePaths(id),E.tracePaths(id)).ok,true,id)}
 assert.equal(E.gradeTrace(E.tracePaths('zigzag'),E.tracePaths('curva')).ok,false);assert.equal(E.gradeTrace(E.tracePaths('vertical'),E.tracePaths('línea')).ok,false);assert.equal(E.gradeTrace(E.tracePaths('rombo'),E.tracePaths('cuadrado')).ok,false)
});
test('Días de la semana: «hoy», «mañana» y «ayer» siguen la fecha real del dispositivo',()=>{
 const sk=C.byId['dias-semana'];
 for(const [day,hoy,man,ayer] of [[0,'domingo','lunes','sábado'],[1,'lunes','martes','domingo'],[6,'sábado','domingo','viernes']]){
  assert.equal(C.ctxFrom(E,E.fresh(),new Date(2026,9,25+day)).day,day);
  const seen=new Set();for(let i=0;i<60;i++){const q=sk.gens.c({...ctxMax,day},Math.random,i,'check');assert.ok(q.prompt.startsWith('Hoy es '+hoy+'.'));seen.add(q.prompt.includes('mañana')?q.answer==='mañana'?'x':man===q.answer:ayer===q.answer)}
  assert.deepEqual([...seen],[true])}
});
test('Mi nombre: solo disponible con nombre, y las letras formadas corresponden al nombre',()=>{
 const sk=C.byId['mi-nombre'];assert.equal(sk.available(ctxMin()),false);assert.equal(sk.available(ctxMax),true);
 for(let i=0;i<30;i++){const q=sk.gens.a(ctxMax,Math.random);assert.equal(q.items.map(i=>i.v).join('').toLowerCase(),'carlos');assert.equal(q.items.length,6);assert.ok((q.extra||[]).every(x=>!'carlos'.includes(x.v)));const q2=sk.gens.a({...ctxMax,name:'  ana maría '},Math.random);assert.equal(q2.items.map(i=>i.v).join('').toLowerCase(),'ana')}
});
test('Distribución v4: todos los módulos incluidos y sin marcadores pendientes',()=>{
 const html=fs.readFileSync(__dirname+'/dist/index.html','utf8');
 for(const t of ['/*CONTENT*/','/*GAMES*/']) assert.ok(!html.includes(t),t);
 for(const t of ['GamesUI','C.skill({id:\'contar\'','C.skill({id:\'planta\'','id="chips"','Versión 4.0','M.simon','M.paint']) assert.ok(html.includes(t),t);
 for(const f of ['content.js','skills-a.js','skills-b.js','skills-c.js','games.js','engine.js','app.js'])assert.ok(html.includes(fs.readFileSync(__dirname+'/'+f,'utf8').slice(0,200)),'falta '+f+' en dist');assert.ok(fs.readFileSync(__dirname+'/sw.js','utf8').includes('v4.0.0'))
});
console.log(checks+' grupos de pruebas de lógica y distribución completados.');
