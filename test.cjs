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
console.log(checks+' grupos de pruebas de lógica y distribución completados.');
