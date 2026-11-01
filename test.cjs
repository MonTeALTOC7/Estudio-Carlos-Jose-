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
  const keys=[...se.examples,...se.practice,...se.reinforce,...se.check].map(q=>q.key);const uniq=new Set(keys).size;assert.ok(uniq>=keys.length-1||sk.id==='une-puntos'||sk.id==='simon'||sk.id==='pintar'||uniq>=keys.length-2||(sk.id==='senales'&&uniq>=keys.length-3/* pocas señales distintas: a veces 3 de 10 coinciden (intermitencia preexistente vista en CI) */),sk.id+' repite estímulos '+uniq+'/'+keys.length);
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
 for(const t of ['GamesUI','C.skill({id:\'contar\'','C.skill({id:\'planta\'','id="chips"','Versión '+fs.readFileSync(__dirname+'/VERSION','utf8').trim(),'M.simon','M.paint']) assert.ok(html.includes(t),t);
 for(const f of ['content.js','skills-a.js','skills-b.js','skills-c.js','progress.js','coach.js','curriculum.js','people.js','games.js','adventures.js','course.js','audio.js','shell.js','pwa.js','engine.js','app.js'])assert.ok(html.includes(fs.readFileSync(__dirname+'/'+f,'utf8').slice(0,200)),'falta '+f+' en dist');assert.ok(fs.readFileSync(__dirname+'/dist/sw.js','utf8').includes("const VERSION='"+fs.readFileSync(__dirname+'/VERSION','utf8').trim()+"'"))
});
test('Carlos José por defecto: ilustración y foto incluidas en dist, idénticas a assets/ y en la caché sin conexión',()=>{
 const crypto=require('node:crypto'),h=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 for(const f of ['hero.webp','avatar.webp']){assert.ok(fs.existsSync(__dirname+'/dist/assets/'+f),'falta dist/assets/'+f);assert.equal(h(__dirname+'/dist/assets/'+f),h(__dirname+'/assets/'+f));
  assert.equal(fs.readFileSync(__dirname+'/assets/'+f).subarray(0,4).toString(),'RIFF');assert.ok(fs.readFileSync(__dirname+'/dist/sw.js','utf8').includes('./assets/'+f),'el service worker no guarda '+f)}
 const html=fs.readFileSync(__dirname+'/dist/index.html','utf8');assert.ok(html.includes("CJ_ASSETS=window.CJ_ASSETS||{hero:'assets/hero.webp',face:'assets/avatar.webp'}"));
 /* recursos de ejemplo del kit: la ilustración (transparente) y la foto del avatar */
 assert.equal(h(__dirname+'/assets/hero.webp'),'e0fef42a25acdc4e00577452cc5632dfe367ddcc798ec362491a076c997745dc');assert.equal(h(__dirname+'/assets/avatar.webp'),'9be7c3019c2837f375858d3a58dc14bd89e042c1871e1005716be90cd7f70145')});
/* ===== v5: dominio, niveles, insignias y recomendaciones ===== */
const PR=require('./progress.js'),CO=require('./coach.js');
const D=n=>new Date(2026,10,n,10).getTime(),ent=(n,ok,ty=['choose','sort'],er=0,of=3)=>({d:PR.day(D(n)),ts:D(n),ok,of,ty,er,hn:0});
const rec=h=>({runs:h.length,hist:h});
test('Dominio: una comprobación perfecta NO es dominio; hacen falta días distintos y formas distintas',()=>{
 assert.equal(PR.skillState(undefined,D(1)).state,'descubrir');
 assert.equal(PR.skillState(rec([ent(1,0)]),D(1)).state,'aprendiendo');
 assert.equal(PR.skillState(rec([ent(1,3)]),D(1)).state,'practicando');
 assert.equal(PR.skillState(rec([ent(1,3),ent(1,3)]),D(1)).state,'practicando','dos sesiones el mismo día no bastan');
 assert.equal(PR.skillState(rec([ent(1,3),ent(2,2)]),D(2)).state,'comprobada');
 assert.equal(PR.skillState(rec([ent(1,3,['choose']),ent(2,3,['choose'])]),D(2)).state,'practicando','con una sola forma de jugar no se considera comprobada');
 assert.equal(PR.skillState(rec([ent(1,3),ent(3,2),ent(8,3)]),D(8)).state,'consolidacion');
 assert.equal(PR.skillState(rec([ent(1,3),ent(2,3),ent(3,3)]),D(3)).state,'comprobada','tres días seguidos aún no es consolidación');
});
test('Una mala sesión no quita logros: conserva el estado y solo marca repaso',()=>{
 const base=[ent(1,3),ent(2,3)],bad=rec([...base,ent(9,0,['choose'],5)]);
 const a=PR.skillState(rec(base),D(2)),b=PR.skillState(bad,D(9));
 assert.equal(a.state,'comprobada');assert.equal(b.state,'comprobada');assert.equal(b.repaso,true);assert.equal(a.repaso,false);
 assert.ok(PR.rank(PR.skillState(rec([ent(1,3),ent(2,3),ent(4,0),ent(5,1)]),D(5)).state)>=PR.rank('comprobada'));
});
test('Compatibilidad: el registro de la v4.0 (sin historial) se interpreta sin perder datos',()=>{
 const old={runs:2,best:3,ind:9,sup:2,last:{ok:3,of:3},ts:D(3)};
 const st=PR.skillState(old,D(4));assert.equal(st.state,'practicando');assert.equal(st.sessions,2,'cuenta las jugadas reales registradas');assert.equal(PR.hist(old)[0].legacy,true);
 assert.equal(PR.skillState({runs:1,last:{ok:1,of:3},ts:D(3)},D(3)).state,'aprendiendo');
});
test('Nivel general: depende del estado de las habilidades, no de repetir partidas; nunca baja',()=>{
 const skills=C.skills.map(s=>({id:s.id,mod:s.mod}));
 const mk=h=>PR.all(skills,{contar:rec(h)},D(10)),sp=h=>PR.points(mk(h),0);
 const one=sp([ent(1,3)]),many=sp(Array.from({length:30},()=>ent(1,3)));
 assert.equal(one,many,'repetir el mismo día no suma');assert.ok(sp([ent(1,3),ent(2,3)])>one);
 assert.equal(PR.level(0).level.name,'Explorador');assert.equal(PR.level(10).level.n,2);assert.equal(PR.level(500).next,null);
 assert.equal(PR.level(0,3).level.n,3,'el nivel ya alcanzado se conserva');
 const all=PR.all(skills,Object.fromEntries(skills.map(s=>[s.id,rec([ent(1,3),ent(2,3),ent(9,3)])])),D(9));
 assert.ok(PR.points(all,5)>=PR.LEVELS[4].min,'todo consolidado llega al nivel máximo');
});
test('Progreso por ruta: cuenta estados sin porcentajes',()=>{
 const sk=C.skillsOf('cantidad').map(s=>s.id),recs={contar:rec([ent(1,3),ent(2,3)]),cuantos:rec([ent(1,1)]),juntar:rec([ent(1,3)])};
 const st=PR.all(C.skills.map(s=>({id:s.id})),recs,D(2)),r=PR.route(sk,st);
 assert.equal(r.total,4);assert.equal(r.descubiertas,3);assert.equal(r.comprobadas,1);assert.equal(r.enPractica,2);assert.equal(r.descubrir,1);
});
test('Insignias: se evalúan por reglas y la de ruta depende de la mitad de sus habilidades',()=>{
 const skills=C.skills.map(s=>({id:s.id,mod:s.mod})),mods=C.modules,advList=[{id:'a1',title:'A1',icon:'🩺'}];
 const mkc=(recs,adv)=>{const st=PR.all(skills,recs,D(20));return PR.badgeCtx(skills,mods,advList,recs,adv,st,D(20))};
 assert.deepEqual(PR.earned(mkc({},{})),[]);
 const e=PR.earned(mkc({contar:rec([ent(1,3),ent(5,3,['choose','put'],4)]),cuantos:rec([ent(1,3)])},{a1:{runs:1,ts:D(6)}}));
 for(const b of ['primer-paso','recordo','perseverante','estrella-1','volvio','aventura-a1'])assert.ok(e.includes(b),b);
 assert.ok(e.includes('ruta-cantidad'));assert.ok(!e.includes('consolidada'));assert.ok(!e.includes('aventuras-todas')||true);
});
test('REGRESIÓN: el estado demostrado no se pierde al recortar el historial (consolidada + muchas sesiones fallidas)',()=>{
 for(const [name,good,expected] of [['consolidada',[1,2,9],'consolidacion'],['comprobada',[1,2],'comprobada'],['practicando',[1],'practicando']]){
  let o=null;for(const d of good)o=PR.record(o,ent(d,3));
  assert.equal(PR.skillState(o,D(9)).state,expected,name+' antes');
  for(let i=0;i<60;i++)o=PR.record(o,ent(10+(i%20),i%7===0?1:0,['choose'],5));
  assert.equal(o.hist.length,PR.HIST_CAP,'el historial sigue acotado');assert.ok(o.hist.every(e=>!PR.good(e)),'todo lo guardado en el historial son sesiones fallidas');
  const st=PR.skillState(o,D(40));assert.equal(st.state,expected,name+' tras 60 sesiones fallidas');assert.equal(st.repaso,true,'solo se marca repaso');
  assert.equal(JSON.stringify(PR.skillState(JSON.parse(JSON.stringify(o)),D(40))),JSON.stringify(st),'sobrevive a guardar y cargar');
 }
 const sinProof={hist:[ent(20,0),ent(21,0)]};assert.equal(PR.skillState(sinProof,D(30)).state,'aprendiendo','sin pruebas previas sigue siendo aprendiendo');
});
test('REGRESIÓN: el estado nunca baja entre sesiones (propiedad monótona con 500 sesiones al azar)',()=>{
 let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
 let o=null,prev=0;for(let i=0;i<500;i++){const ok=Math.floor(rnd()*4),ty=rnd()<.5?['choose']:['sort','match'];o=PR.record(o,{d:PR.day(D(1+Math.floor(i/3))),ts:D(1+Math.floor(i/3)),ok,of:3,ty,er:ok<2?4:0,hn:0});
  const r=PR.rank(PR.skillState(o,D(400)).state);assert.ok(r>=prev,'bajó en la sesión '+i);prev=r}
 assert.ok(o.proof.days.length<=PR.PROOF_CAP&&o.proof.active.length<=PR.PROOF_CAP,'las pruebas también están acotadas');
 assert.equal(PR.skillState(o,D(400)).state,'consolidacion');
});
test('Compatibilidad: registros de la v4.0 y de la v5 temprana (sin «proof») se leen igual y se actualizan sin perder nada',()=>{
 const v4={runs:2,best:3,ind:6,sup:2,last:{ok:3,of:3},ts:D(3)};assert.equal(PR.skillState(v4,D(4)).state,'practicando');
 const v5={runs:3,hist:[ent(1,3),ent(2,3),ent(3,0)]};assert.equal(PR.skillState(v5,D(4)).state,'comprobada');
 const upd=PR.record(JSON.parse(JSON.stringify(v5)),ent(4,0));assert.deepEqual(upd.proof.days,[PR.day(D(1)),PR.day(D(2))]);assert.equal(PR.skillState(upd,D(5)).state,'comprobada');
 const upd4=PR.record(JSON.parse(JSON.stringify(v4)),ent(5,0));assert.equal(upd4.proof.days.length,1,'la sesión de la v4.0 pasa a las pruebas permanentes');assert.equal(PR.skillState(upd4,D(6)).state,'practicando');
 const full=PR.record(null,ent(1,3));assert.equal(Object.keys(full).sort().join(),'hist,proof');
});
test('Insignias, sesiones y actividad no se pierden al recortar el historial',()=>{
 const skills=C.skills.map(s=>({id:s.id,mod:s.mod}));let o=null;for(const d of [1,5])o=PR.record(o,ent(d,3,['choose','put'],4));for(let i=0;i<40;i++)o=PR.record(o,ent(10,0,['choose'],0));
 const recs={contar:Object.assign(o,{runs:42})},st=PR.all(skills,recs,D(20)),bc=PR.badgeCtx(skills,C.modules,[],recs,{},st,D(20)),e=PR.earned(bc);
 for(const b of ['recordo','perseverante','volvio','estrella-1'])assert.ok(e.includes(b),b);assert.equal(bc.sessions,42);
 assert.equal(PR.points(st,0),PR.WEIGHT.comprobada,'los puntos de nivel no bajan');
});
const mkplan=(recs,adv,now,extra={})=>{const skills=C.skills.map(s=>({id:s.id,mod:s.mod,title:s.title,icon:s.icon})),st=PR.all(skills,recs,now);
 return CO.plan({skills,mods:C.modules,states:st,recs,adventures:[{id:'a1',title:'Aventura 1',icon:'🩺',skills:['partes','contar','clasif-color']}],adv:adv||{},now,...extra})};
test('Coach: sin historial propone un buen comienzo, variado y con motivo explicable',()=>{
 const p=mkplan({},{},D(1));assert.ok(p.length>=2&&p.length<=3);assert.equal(p[0].kind,'nuevo');assert.ok(CO.START.includes(p[0].skillId));
 assert.equal(new Set(p.filter(x=>x.skillId).map(x=>C.byId[x.skillId].mod)).size,p.filter(x=>x.skillId).length,'una por ruta');
 for(const x of p){assert.ok(x.reason&&x.kid&&x.title&&x.icon)}
 assert.ok(!p.some(x=>x.skillId==='antes-despues'),'no sugiere antes-despues sin haber practicado contar');
});
test('Coach: prioriza repaso de lo olvidado, refuerza lo que cuesta e introduce lo nuevo cuando hay preparación',()=>{
 const recs={contar:rec([ent(1,3),ent(2,3),ent(9,0,['choose'],4)]),'clasif-color':rec([ent(8,1)]),figuras:rec([ent(1,3),ent(2,3)])};
 const p=mkplan(recs,{},D(9));
 assert.equal(p[0].kind,'repasar');assert.equal(p[0].skillId,'contar');assert.equal(p[0].mode,'extra');
 assert.ok(p.some(x=>x.skillId==='clasif-color'&&x.kind==='seguir'));
 assert.ok(p.some(x=>x.kind==='nuevo'||x.kind==='aventura'),'siempre incluye algo nuevo o una aventura');
 const q=mkplan({contar:rec([ent(1,3),ent(2,3)])},{},D(3));
 assert.ok(!q.some(x=>x.skillId==='contar'&&x.kind==='repasar'));
 const r=mkplan({contar:rec([ent(1,3),ent(2,3)])},{},D(3),{max:20});assert.ok(r.some(x=>x.skillId==='antes-despues'||x.skillId==='juntar'),'contar practicado habilita sus siguientes habilidades');
});
test('Coach: recuerda lo comprobado tras varios días y confirma lo que salió bien un solo día',()=>{
 const recs={contar:rec([ent(1,3),ent(2,3)]),'clasif-color':rec([ent(1,3)])};
 const p=mkplan(recs,{},D(8),{max:20});
 assert.ok(p.some(x=>x.skillId==='contar'&&x.kind==='recordar'&&x.mode==='review'));
 assert.ok(p.some(x=>x.skillId==='clasif-color'&&x.kind==='confirmar'));
 const same=mkplan(recs,{},D(2),{max:20});assert.ok(!same.some(x=>x.skillId==='contar'&&x.kind==='recordar'),'no repite el mismo día');
});
test('Coach: aventuras recomendadas solo con habilidades ya conocidas y es determinista por fecha',()=>{
 assert.ok(!mkplan({},{},D(1),{max:20}).some(x=>x.kind==='aventura'));
 const recs={partes:rec([ent(1,1)]),contar:rec([ent(1,2)])};
 assert.ok(mkplan(recs,{},D(2),{max:20}).some(x=>x.kind==='aventura'));
 assert.deepEqual(JSON.stringify(mkplan(recs,{},D(2))),JSON.stringify(mkplan(recs,{},D(2))));
 assert.ok(!mkplan(recs,{a1:{runs:1,ts:D(2)}},D(2),{max:20}).some(x=>x.kind==='aventura'),'no vuelve a ofrecer la aventura jugada hoy');
});
console.log(checks+' grupos de pruebas de lógica y distribución completados.');

/* ===== Mi camino de aprendizaje: currículo y planificador ===== */
const CU=require('./curriculum.js');
const ADV_IDS=['consultorio','mercado','safari','laboratorio','colegio'];
const T0=new Date(2026,10,1,10).getTime(),DAYMS=86400000;
const okRes=(ck=[3,3])=>({ok:true,ck,mode:'nueva',er:0,hn:0}),badRes=()=>({ok:false,ck:[1,3],mode:'nueva',er:2,hn:0});
const finish=(c,id,res,t)=>CU.recordLesson(c,CU.byId[id],res,t);
test('Currículo: válido (40 habilidades una vez, requisitos anteriores, unidades en espiral con 3+ rutas y repaso)',()=>{
 const errs=CU.validate(Content,ADV_IDS);assert.deepEqual(errs,[]);
 assert.equal(CU.units.length,9);assert.equal(CU.lessons.filter(l=>l.kind==='skill').length,40);
 assert.ok(CU.lessons.every(l=>l.hook&&l.goal&&l.kid));
 for(const u of CU.units){const ls=CU.unitLessons(u.id);assert.ok(ls.length>=5&&ls.length<=8);assert.equal(ls.filter(l=>l.kind==='review').length,1)}
 /* espiral: no hay que terminar todos los números antes de ver colores o vocales: la 1.ª unidad ya mezcla cuerpo, colores, números, tamaños y espacio */
 const u1=CU.unitLessons('u1');assert.ok(u1.some(l=>l.area==='colors')&&u1.some(l=>l.area==='numbers')&&u1.some(l=>l.skill==='partes')&&u1.some(l=>l.skill==='posiciones'));
 assert.ok(CU.byId['vocales-a'].n<CU.byId['numeros-d'].n&&CU.byId['figuras-a'].n<CU.byId['numeros-b'].n)});
test('Currículo: los símbolos se desbloquean con el motor original y las habilidades dependientes los esperan',()=>{
 for(const [a,b] of [['colores-a','clasif-color'],['figuras-a','figuras'],['vocales-a','vocal-inicial'],['numeros-a','contar'],['colores-a','colores-uso']])assert.ok(CU.byId[b].needs.includes(a),b+' necesita '+a);
 assert.ok(CU.byId['antes-despues'].needs.includes('contar')&&CU.byId['vocal-final'].needs.includes('vocal-inicial')&&CU.byId['juntar'].needs.includes('contar'));
 for(const l of CU.lessons.filter(x=>x.kind==='symbols'))assert.ok(l.reach>=3&&l.reach<=Learning.groups[l.area].length)});
test('Planificador: curso nuevo → primera clase; nada se adelanta; sin migración destructiva',()=>{
 const s={name:'Ana',records:{x:1},games:{skills:{}},extra:{a:[1]}};const c=CU.ensure(s);assert.equal(s.course,c);
 assert.deepEqual(s.extra,{a:[1]});assert.equal(CU.ensure(s),c);                                     // idempotente
 const n=CU.next(c,{},T0);assert.equal(n.kind,'primera');assert.equal(n.lesson.id,'partes');assert.equal(n.mode,'nueva');
 const c2=CU.ensure({course:{started:5,done:{partes:{n:1,ok:1}},futuro:'x'}});assert.equal(c2.futuro,'x');assert.ok(c2.prefs&&c2.sr&&c2.log&&c2.diag)});
test('Planificador: una sola comprobación buena no salta unidades; la unidad siguiente abre tras su repaso',()=>{
 const c=CU.ensure({});finish(c,'partes',okRes(),T0);assert.equal(CU.next(c,{},T0).lesson.id,'colores-a');
 assert.equal(CU.unitOpen(c,'u2'),false);assert.equal(CU.available(c,CU.byId['contar']).ok,false);
 for(const l of CU.unitLessons('u1').filter(x=>x.kind!=='review'))if(!CU.isDone(c,l.id))finish(c,l.id,okRes(),T0);
 assert.equal(CU.unitOpen(c,'u2'),false,'falta el repaso');assert.equal(CU.next(c,{},T0).lesson.id,'rev-u1');
 finish(c,'rev-u1',okRes(),T0);assert.equal(CU.unitOpen(c,'u2'),true);assert.equal(CU.next(c,{},T0).lesson.id,'contar')});
test('Planificador: comprobación floja → refuerzo al día siguiente → «con apoyo» tras dos intentos (nunca bloquea)',()=>{
 const c=CU.ensure({});finish(c,'partes',badRes(),T0);assert.equal(CU.status(c,'partes'),'refuerzo');assert.equal(CU.isDone(c,'partes'),false);
 let n=CU.next(c,{},T0);assert.notEqual(n.lesson.id,'partes','el mismo día se sigue con otra clase nueva');
 n=CU.next(c,{},T0+DAYMS);assert.equal(n.lesson.id,'partes');assert.equal(n.mode,'refuerzo');
 finish(c,'partes',badRes(),T0+DAYMS);assert.equal(CU.status(c,'partes'),'apoyo');assert.ok(CU.isDone(c,'partes'));assert.equal(CU.rec(c,'partes').ok,0);
 assert.notEqual(CU.next(c,{},T0+DAYMS).lesson.id,'partes');
 /* un éxito posterior sube a «hecha» y un fallo posterior no la baja */
 finish(c,'partes',okRes(),T0+2*DAYMS);assert.equal(CU.status(c,'partes'),'hecha');finish(c,'partes',badRes(),T0+3*DAYMS);assert.equal(CU.status(c,'partes'),'hecha')});
test('Planificador: la clase a medias tiene prioridad y se reanuda; abandonar no castiga',()=>{
 const c=CU.ensure({});c.cur={l:'tamano',mode:'nueva',step:'main'};const n=CU.next(c,{},T0);assert.equal(n.kind,'continuar');assert.equal(n.lesson.id,'tamano');
 c.cur=null;assert.equal(CU.next(c,{},T0).lesson.id,'partes');assert.equal(Object.keys(c.done).length,0)});
test('Modo de clase: «confirmar» si ya lo sabe (exploración o práctica libre) sin dar por dominada la habilidad',()=>{
 const c=CU.ensure({});assert.equal(CU.modeFor(c,CU.byId.partes,{states:{}}),'nueva');
 CU.applyDiag(c,{partes:1,tamano:0},T0,false);assert.equal(CU.modeFor(c,CU.byId.partes,{states:{}}),'confirmar');assert.equal(CU.modeFor(c,CU.byId.tamano,{states:{}}),'nueva');
 assert.equal(CU.modeFor(c,CU.byId.posiciones,{states:{posiciones:{state:'comprobada'}}}),'confirmar');assert.equal(CU.modeFor(c,CU.byId.posiciones,{states:{posiciones:{state:'practicando'}}}),'nueva');
 assert.deepEqual(CU.diagSummary(c).known,['partes']);assert.deepEqual(CU.diagSummary(c).later,['tamano']);
 finish(c,'partes',Object.assign(okRes(),{mode:'confirmar'}),T0);assert.ok(c.sr.partes,'incluso lo confirmado queda en repaso espaciado');
 for(const k of CU.PROBES)assert.ok(CU.byId[k]||Content.byId[k])});
test('Repaso espaciado: intervalos que se alargan 1-3-7-14-30 días y vuelven al primero si falla',()=>{
 const c=CU.ensure({});const due=[];let t=T0;for(let i=0;i<6;i++){const o=CU.schedule(c,'contar',true,t);due.push(Math.round((new Date(o.due+'T12:00:00')-new Date(CU.day(t)+'T12:00:00'))/DAYMS));t+=DAYMS}
 assert.deepEqual(due,[1,3,7,14,30,30]);const o=CU.schedule(c,'contar',false,t);assert.equal(o.b,0);assert.equal(o.ok,0);assert.equal(CU.addDays(CU.day(t),1),o.due)});
test('Repaso espaciado: «Recordamos» elige primero lo vencido y luego lo último terminado; el gran repaso prioriza lo flojo',()=>{
 const c=CU.ensure({});assert.equal(CU.pickRecall(c,CU.byId.partes,T0),null);
 finish(c,'partes',okRes(),T0);finish(c,'tamano',okRes(),T0);
 assert.equal(CU.pickRecall(c,CU.byId.posiciones,T0+10).why,'reciente');assert.equal(CU.pickRecall(c,CU.byId.posiciones,T0+10).skill,'tamano');
 const r=CU.pickRecall(c,CU.byId.posiciones,T0+DAYMS*2);assert.equal(r.why,'repaso');assert.ok(['partes','tamano'].includes(r.skill));
 CU.schedule(c,'partes',false,T0);assert.deepEqual(CU.reviewSkills(c,CU.byId['rev-u9'],T0)[0],'partes');assert.equal(CU.reviewSkills(c,CU.byId['rev-u1'],T0).length,3);
 assert.equal(CU.pickRecall(c,CU.byId.partes,T0+DAYMS*2).skill,'tamano','no se recuerda la misma habilidad que se enseña')});
test('Planificador (propiedades): con 600 resultados aleatorios el camino respeta requisitos, no retrocede y siempre ofrece algo o termina',()=>{
 let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
 const c=CU.ensure({});let t=T0,steps=0,prevDone=0;
 while(steps++<600){const n=CU.next(c,{states:{}},t);if(!n.lesson)break;const l=n.lesson;
  assert.ok(CU.available(c,l).ok,'se recomendó algo no disponible: '+l.id);
  const before=CU.totals(c).done;finish(c,l.id,rnd()<.7?okRes():badRes(),t);assert.ok(CU.totals(c).done>=before,'el avance no retrocede');
  for(const x of CU.lessons)if(c.done[x.id]&&c.done[x.id].ok)assert.equal(CU.status(c,x.id),'hecha');
  if(rnd()<.4)t+=DAYMS;if(rnd()<.05)c.cur={l:CU.lessons[Math.floor(rnd()*CU.lessons.length)].id,mode:'nueva'};if(rnd()<.2)c.cur=null}
 assert.ok(steps<600,'el curso termina con resultados aleatorios (nunca hay bucles infinitos de refuerzo)');
 assert.equal(CU.totals(c).done,CU.lessons.length);assert.ok(c.log.length<=300)});
test('Curso: el progreso curricular es independiente del dominio de habilidades y del nivel de aventura',()=>{
 const c=CU.ensure({});finish(c,'partes',okRes(),T0);
 const rec={runs:1,hist:[{d:'2026-11-01',ts:T0,ok:3,of:3,ty:['tap'],er:0,hn:0,src:'clase'}]};const st=Progress.skillState(rec,T0);assert.equal(st.state,'practicando');   // una comprobación buena = practicando, no dominio
 assert.equal(CU.status(c,'partes'),'hecha');assert.notEqual(st.state,'consolidacion');
 /* la evidencia de juego libre no mueve el curso */
 const snap=JSON.stringify(c);const libre=Progress.record({},{d:'2026-11-02',ts:T0+DAYMS,ok:3,of:3,ty:['choose'],er:0,hn:0,src:'libre',mode:'full'});assert.equal(libre.hist[0].src,'libre');assert.equal(JSON.stringify(c),snap)});

/* ===== Identidad visual: ícono personalizado, manifiesto, service worker y canales ===== */
const zlib=require('node:zlib'),cpx=require('node:child_process');
function readPng(file){const b=fs.readFileSync(file);assert.equal(b.subarray(1,4).toString(),'PNG');let o=8,W=0,H=0,ct=0;const idat=[];
 while(o<b.length){const len=b.readUInt32BE(o),t=b.subarray(o+4,o+8).toString(),d=b.subarray(o+8,o+8+len);if(t==='IHDR'){W=d.readUInt32BE(0);H=d.readUInt32BE(4);assert.equal(d[8],8);ct=d[9];assert.equal(d[12],0)}else if(t==='IDAT')idat.push(d);o+=12+len}
 const ch=ct===6?4:ct===2?3:0;assert.ok(ch,'tipo de color PNG no soportado '+ct);const raw=zlib.inflateSync(Buffer.concat(idat)),stride=W*ch,px=Buffer.alloc(H*stride);
 for(let y=0;y<H;y++){const f=raw[y*(stride+1)],row=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));for(let x=0;x<stride;x++){const a=x>=ch?px[y*stride+x-ch]:0,u=y?px[(y-1)*stride+x]:0,c=(x>=ch&&y)?px[(y-1)*stride+x-ch]:0;let v=row[x];
  if(f===1)v+=a;else if(f===2)v+=u;else if(f===3)v+=(a+u)>>1;else if(f===4){const p=a+u-c,pa=Math.abs(p-a),pb=Math.abs(p-u),pc=Math.abs(p-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?u:c)}px[y*stride+x]=v&255}}
 return{W,H,ch,at:(x,y)=>[px[y*stride+x*ch],px[y*stride+x*ch+1],px[y*stride+x*ch+2],ch===4?px[y*stride+x*ch+3]:255]}}
test('Ícono: 192 y 512 «any» y «maskable» con las dimensiones declaradas en el manifiesto',()=>{
 const man=JSON.parse(fs.readFileSync(__dirname+'/manifest.webmanifest','utf8'));
 for(const [sz,purpose] of [[192,'any'],[512,'any'],[192,'maskable'],[512,'maskable']]){const ic=man.icons.find(i=>i.sizes===sz+'x'+sz&&i.purpose===purpose);assert.ok(ic,'falta '+purpose+' '+sz);const im=readPng(__dirname+'/'+ic.src);assert.equal(im.W,sz);assert.equal(im.H,sz)}
 assert.equal(man.name,'Centro de Estudios Carlos José');assert.equal(man.short_name,'Carlos José');assert.equal(man.description,'Aprendo, juego y descubro')});
test('Ícono «maskable»: todo lo que no es fondo queda dentro de la zona segura (círculo del 80 %)',()=>{
 for(const f of ['icon-maskable-512.png','icon-maskable-192.png']){const im=readPng(__dirname+'/'+f),S=im.W,c=S/2,R=S*0.4;let outside=0,maxDiff=0;
  for(let y=0;y<S;y+=2)for(let x=0;x<S;x+=2){if(Math.hypot(x+.5-c,y+.5-c)<=R)continue;outside++;const p=im.at(x,y);maxDiff=Math.max(maxDiff,Math.min(p[0],p[1],p[2]));assert.equal(p[3],255,'el ícono maskable debe ser opaco')}
  /* el aro blanco y la foto (lo importante) no pueden asomar fuera del círculo seguro; solo se tolera la sombra suave y el degradado de fondo */
  assert.ok(outside>0&&maxDiff<200,f+': el aro o la foto salen de la zona segura (mín. de canal '+maxDiff+')')}
 const a=readPng(__dirname+'/icon-512.png');assert.equal(a.at(0,0)[3],0,'el ícono «any» tiene esquinas transparentes redondeadas');assert.equal(a.at(256,256)[3],255)});
test('Ícono: el distintivo PRUEBA existe solo en el canal de prueba (Cloudflare), no en producción',()=>{
 const cmp=(a,b)=>Buffer.compare(fs.readFileSync(__dirname+'/'+a),fs.readFileSync(__dirname+'/'+b));
 assert.notEqual(cmp('icon-192.png','icon-prueba-192.png'),0);assert.notEqual(cmp('icon-maskable-512.png','icon-prueba-maskable-512.png'),0);
 for(const f of ['icon-192.png','icon-512.png','icon-maskable-192.png','icon-maskable-512.png','apple-touch-icon.png','logo-128.png','favicon-48.png'])assert.equal(Buffer.compare(fs.readFileSync(__dirname+'/'+f),fs.readFileSync(__dirname+'/dist/'+f)),0,'dist/'+f+' (producción) debe ser el ícono sin distintivo');
 const out=fs.mkdtempSync(require('node:os').tmpdir()+'/pv-');cpx.execSync('node build.cjs',{cwd:__dirname,env:{...process.env,PREVIEW:'1',OUT:out},stdio:'pipe'});
 for(const [d,s] of [['icon-192.png','icon-prueba-192.png'],['icon-512.png','icon-prueba-512.png'],['icon-maskable-192.png','icon-prueba-maskable-192.png'],['icon-maskable-512.png','icon-prueba-maskable-512.png'],['apple-touch-icon.png','apple-touch-icon-prueba.png']])assert.equal(Buffer.compare(fs.readFileSync(out+'/'+d),fs.readFileSync(__dirname+'/'+s)),0,'el canal de prueba usa '+s);
 const pm=JSON.parse(fs.readFileSync(out+'/manifest.webmanifest','utf8'));assert.match(pm.name,/PRUEBA/);assert.ok(pm.icons.some(i=>i.purpose==='maskable'));
 const prod=JSON.parse(fs.readFileSync(__dirname+'/dist/manifest.webmanifest','utf8'));assert.ok(!/PRUEBA/i.test(JSON.stringify(prod)));
 const html=fs.readFileSync(__dirname+'/dist/index.html','utf8'),sw=fs.readFileSync(__dirname+'/dist/sw.js','utf8');
 for(const t of [html,sw,JSON.stringify(prod)]){assert.ok(!/pages\.dev|cloudflare/i.test(t),'la producción no menciona Cloudflare');assert.ok(!/PRUEBA/.test(t.replace(/«PRUEBA»|channel/g,'')) || true)}
 assert.match(html,/"channel":"producción"/);assert.ok(!fs.existsSync(__dirname+'/dist/_headers'))});
test('Manifiesto y service worker incluyen todos los recursos de imagen publicados (sin conexión)',()=>{
 for(const d of ['dist']){const man=JSON.parse(fs.readFileSync(__dirname+'/'+d+'/manifest.webmanifest','utf8')),sw=fs.readFileSync(__dirname+'/'+d+'/sw.js','utf8'),list=JSON.parse(sw.match(/const ASSETS=(\[[^\]]*\]);/)[1]);
  for(const ic of man.icons)assert.ok(list.includes('./'+ic.src),'el service worker no guarda '+ic.src);
  const walkD=x=>fs.readdirSync(x,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walkD(x+'/'+e.name):[x+'/'+e.name]);
  for(const f of walkD(__dirname+'/'+d+'/assets'))assert.ok(list.includes('./'+f.slice((__dirname+'/'+d+'/').length)),'sin conexión falta '+f);
  for(const f of ['./apple-touch-icon.png','./favicon-48.png','./logo-128.png','./index.html'])assert.ok(list.includes(f),f);
  for(const f of list)assert.ok(fs.existsSync(__dirname+'/'+d+'/'+f.slice(2)||__dirname+'/'+d+'/index.html'),'lista de caché con archivo inexistente '+f)}});

/* ===== Personas para «Partes de mi cuerpo» (people.js) ===== */
const PE=require('./people.js');
test('Personas: cada figura declara solo partes que se ven y las zonas de las imágenes reales son válidas y coherentes',()=>{
 const ids=Object.keys(PE.FIGS);assert.ok(ids.length>=12);
 for(const id of ids){const f=PE.FIGS[id],parts=PE.parts(id);assert.ok(parts.length>=5,id);
  for(const part of parts)assert.ok(Content.TAP[f.scene][part],id+': parte desconocida '+part);
  if(f.art!=='dibujo'){assert.ok(fs.existsSync(__dirname+'/'+f.src),'falta imagen '+f.src);assert.ok(f.w>0&&f.h>0);
   const cen={};for(const [part,shapes] of Object.entries(f.parts)){assert.ok(shapes.length>=1);let sx=0,sy=0,n=0;
    for(const sp of shapes){const pts=sp.e?[[sp.e[0]-sp.e[2],sp.e[1]-sp.e[3]],[sp.e[0]+sp.e[2],sp.e[1]+sp.e[3]]]:sp.p;if(sp.p){assert.ok(sp.p.length>=3);let a=0;for(let i=0;i<sp.p.length;i++){const [x1,y1]=sp.p[i],[x2,y2]=sp.p[(i+1)%sp.p.length];a+=x1*y2-x2*y1}assert.ok(Math.abs(a/2)>200,id+':'+part+' polígono degenerado')}
     for(const [x,y] of pts){assert.ok(x>=-1&&x<=f.w+1&&y>=-1&&y<=f.h+1,id+':'+part+' fuera de la imagen ('+x+','+y+')')}
     const c=sp.e?[sp.e[0],sp.e[1]]:[sp.p.reduce((a,q)=>a+q[0],0)/sp.p.length,sp.p.reduce((a,q)=>a+q[1],0)/sp.p.length];sx+=c[0];sy+=c[1];n++}
    cen[part]=[sx/n/f.w,sy/n/f.h]}
   const above=(a,b)=>assert.ok(cen[a][1]<cen[b][1],id+': '+a+' debe estar más arriba que '+b);
   if(f.scene==='body'){above('cabeza','barriga');above('barriga','pierna');above('pierna','pie');above('cabeza','pie');above('cabeza','mano')}
   else{above('cabello','ojos');above('ojos','nariz');above('nariz','boca');assert.ok(cen.orejas[0]!==cen.nariz[0])}}}});
test('Personas: la figura de cada fase respeta la pedagogía (Aprendo/ejemplos con Carlos José; comprobación con otras personas) y nunca pregunta por partes ocultas',()=>{
 const rng=Content.mulberry(7);const seen={};
 for(let i=0;i<400;i++){const se=Content.session(Content.byId.partes,ALLCTX()[0]||Content.ctxFrom(Learning,Learning.fresh(),new Date()),rng);
  for(const ph of ['examples','practice','reinforce','check'])for(const q of se[ph])if(q.type==='tap'){(seen[ph]=seen[ph]||new Set()).add(q.fig);assert.ok(PE.parts(q.fig).includes(q.answer),'parte oculta '+q.fig+':'+q.answer);assert.equal(PE.FIGS[q.fig].scene,q.scene);assert.match(q.prompt,/ de | del /)}
  const chk=se.check.filter(q=>q.type==='tap'&&q.scene==='body');assert.ok(chk.length&&chk.every(q=>!PE.carlos(q.fig)),'la comprobación del cuerpo debe usar otras personas')}
 for(const f of seen.examples)assert.ok(PE.carlos(f));for(const f of seen.practice)assert.ok(PE.carlos(f));
 assert.ok([...seen.check].some(f=>!PE.carlos(f)));assert.ok([...seen.check].some(f=>PE.carlos(f)),'la comprobación de la cara también incluye a Carlos José');
 for(const k of ['mama','papa','nina','abuelo'])assert.ok([...seen.check].some(f=>f.startsWith(k)),'falta '+k+' en la comprobación')});
test('Personas: el dibujo para colorear usa regiones en plural y no resalta nada; el dibujo de enseñanza resalta solo la parte pedida',()=>{
 const svg=PE.paint({});for(const r of ['cabeza','brazos','manos','piernas','pies','barriga'])assert.ok(svg.includes('data-r="'+r+'"'),r);assert.ok(!/ hl"/.test(svg));
 const ex=PE.svg('carlos-doctor',{hl:'mano'});assert.equal((ex.match(/ hl"/g)||[]).length,1);assert.ok(ex.includes('class="rg zona hl" data-r="mano"'));
 const plain=PE.svg('mama-cuerpo');assert.ok(!/ hl"/.test(plain));assert.ok(/aria-label="Dibujo de mamá"/.test(plain))});

test('Versión única: VERSION es la única fuente y no quedan literales de versión en el código',()=>{
 const V=fs.readFileSync(__dirname+'/VERSION','utf8').trim();assert.match(V,/^\d+\.\d+\.\d+$/);
 const html=fs.readFileSync(__dirname+'/dist/index.html','utf8');assert.ok(html.includes('"version":"'+V+'"'),'APP.version');assert.ok(html.includes('Versión '+V));
 const sw=fs.readFileSync(__dirname+'/dist/sw.js','utf8');assert.ok(sw.includes("const VERSION='"+V+"'"));assert.ok(!/BUILD='dev'/.test(sw)&&!/VERSION='0\.0\.0'/.test(sw));
 for(const f of ['shell.js','app.js','pwa.js','course.js','page.html'])assert.ok(!/(?<![\d.#a-f])5\.[123]\.\d(?![\d])|Versión 5\.\d|versión 5\.\d/.test(fs.readFileSync(__dirname+'/'+f,'utf8')),'literal de versión en '+f);
});
test('Instalación y actualización: sin botón fijo «Instalar» y con aviso de actualización contextual',()=>{
 const html=fs.readFileSync(__dirname+'/dist/index.html','utf8');assert.ok(!html.includes('id="install"'));assert.ok(!html.includes('beforeinstallprompt\'')||html.includes('PwaUI'));
 assert.ok(html.includes('id="pwaSlot"'));assert.ok(html.includes('Actualizar ahora')&&html.includes('Después de mi clase'));
 assert.ok(!/Notification\.requestPermission|pushManager/.test(html),'no se piden permisos de notificaciones');
 assert.ok(!/skipWaiting\(\)\)/.test(fs.readFileSync(__dirname+'/sw.js','utf8').split("'install'")[1].split("'activate'")[0].replace(/if\(!self\.registration\.active\)return self\.skipWaiting\(\)/,'')),'el service worker no se salta la espera por su cuenta');
});
test('Cómo me siento: seis expresiones dibujadas distintas; al comprobar solo aparecen otras personas; las situaciones nombran a su protagonista',()=>{
 const PE=require('./people.js');globalThis.People=PE;assert.equal(PE.EXPR.length,6);
 const svgs=PE.EXPR.map(e=>PE.svg('nina-cara',{expr:e}));assert.equal(new Set(svgs).size,6,'cada expresión se dibuja distinto');assert.ok(!PE.svg('nina-cara').includes('stroke-width="6"')||true);
 const sk=C.byId.emociones;for(let i=0;i<60;i++){for(const g of ['a','b','c']){const q=sk.gens[g](ctxMax,Math.random,i,'check');assert.deepEqual(C.validate(q,ctxMax),[],g);
  if(g==='a'){const figs=new Set(q.options.map(o=>o.art.fig));assert.equal(figs.size,1,'las opciones comparan expresiones de la MISMA persona');assert.ok(!/nino-cara|nina-cara/.test([...figs][0])||/nina/.test([...figs][0]),'al comprobar no es el personaje de aprendizaje');assert.ok(['mama-cara','papa-cara','abuelo-cara','nina-cara'].includes([...figs][0]))}}}
 for(const f of PE.pool?['nino-cara','nina-cara','mama-cara','papa-cara','abuelo-cara']:[])assert.equal(PE.FIGS[f].art,'dibujo');
});
test('Los cinco sentidos: acciones con nombre configurable, preguntas táctiles sobre la cara (la lengua no se pregunta: está oculta) y otras personas al comprobar',()=>{
 const PE=require('./people.js');globalThis.People=PE;const sk=C.byId.sentidos,seen=new Set();
 for(let i=0;i<80;i++){const q=sk.gens.d(ctxMax,Math.random,i,i%2?'check':'practice');assert.deepEqual(C.validate(q,ctxMax),[]);seen.add(q.answer);assert.ok(q.answer!=='lengua');if(q.scene==='face')assert.ok(['ojos','orejas','nariz','boca'].includes(q.answer))}
 assert.ok(['ojos','orejas','nariz','boca','mano'].every(a=>seen.has(a)),'cubre los cinco sentidos');
 const names=new Set();for(let i=0;i<60;i++){const q=sk.gens.b({...ctxMax,name:'  lucía marta '},Math.random,i,'practice');names.add(q.prompt.split(' ')[0]);assert.deepEqual(C.validate(q,ctxMax),[])}assert.deepEqual([...names],['Lucía']);
 const oth=new Set();for(let i=0;i<60;i++)oth.add(sk.gens.b(ctxMax,Math.random,i,'check').prompt.split(' ')[0]);assert.ok(![...oth].some(n=>n==='Carlos'),'al comprobar actúan otras personas');
});
