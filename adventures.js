/* Aventuras: historia breve → retos con mecánicas distintas → conclusión con medalla.
   Reutilizan las 40 habilidades (retos «q») y añaden mecánicas propias. Sin diagnósticos ni procedimientos médicos reales. */
(function(root){
'use strict';
root.AdventuresUI=function(K,G){
const C=K.Content,h=C.h,E=K.E,esc=K.escape,S=()=>K.state(),NW=h.NW;
const X=G.parts,qa=X.qa,q1=X.q1,A=X.A,hue=X.hue;
const pickOf=X.pickOf,shuffle=h.shuffle,sample=h.sample,pick=h.pick;
const ctxNow=()=>C.ctxFrom(E,S(),new Date());
const sk=(id,fmt,ctx,rng)=>{const q=C.byId[id].gens[fmt](ctx,rng,0,'practice');q.fmt=fmt;q.skill=id;return q};

/* ===================== mecánicas propias ===================== */
const MEC={};

/* Curitas: arrastrar (o tocar) la curita hasta la parte del cuerpo pedida. */
MEC.heal=(ch,box,ctl)=>{
 let k=0,armed=false;const T=C.TAP.body,fill={};Object.keys(T).forEach(r=>fill[r]='#d9a46a');
 box.innerHTML='<div class="gpaint solo teddy">'+X.bodySvg(X.TAPIDS,fill)+'</div><div class="row center"><button class="gitem bandage" id="bandage" aria-label="Curita">🩹</button></div><p class="center small" id="hstep"></p>';
 const svg=q1('svg',box),band=q1('#bandage',box),rg=qa('.rg',box),step=()=>{q1('#hstep',box).textContent=k<ch.parts.length?'Ponle una curita en '+T[ch.parts[k]]+'.':''};step();
 function apply(r){if(ctl.st.done)return;if(!armed){ctl.fb('Primero toma la curita 🩹.');K.speak('Primero toma la curita.');return}
  if(r.dataset.r===ch.parts[k]){const bb=r.getBBox(),t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',bb.x+bb.width/2);t.setAttribute('y',bb.y+bb.height/2);t.setAttribute('font-size','16');t.setAttribute('text-anchor','middle');t.setAttribute('dominant-baseline','central');t.setAttribute('pointer-events','none');t.textContent='🩹';svg.appendChild(t);X.sGood();k++;armed=false;band.classList.remove('selected');
   if(k===ch.parts.length)ctl.ok('¡Peluche curado! Ya no le duele.');else{ctl.fb('¡Sí! Ahora '+T[ch.parts[k]]+'.');step();K.speak('Ahora '+T[ch.parts[k]]+'.')}}
  else ctl.err('Esa es '+T[r.dataset.r]+'. Busca '+T[ch.parts[k]]+'.')}
 X.tapOnly(band,()=>{armed=!armed;band.classList.toggle('selected',armed);X.sTap()});
 X.drag(band,t=>{const r=t&&t.closest&&t.closest('.rg');if(r){armed=true;apply(r)}});
 rg.forEach(r=>r.onclick=()=>apply(r));
 return{hint(){const r=rg.find(x=>x.dataset.r===ch.parts[k]);if(r)r.classList.add('ghint');band.classList.add('ghint');ctl.fb('Mira esta parte.');K.speak('Ponle la curita en '+T[ch.parts[k]]+'.')}}};

/* Lista de compras en dibujos: llenar la bolsa con las cantidades pedidas. */
MEC.bag=(ch,box,ctl)=>{
 const bag={};ch.list.forEach(x=>bag[x.e]=0);const prods=ch.prods;
 const row=(e,n)=>Array.from({length:n},()=>'<span class="bagit">'+e+'</span>').join('');
 box.innerHTML='<div class="shoplist"><b>Lista de compras</b><div>'+ch.list.map(x=>'<span class="sl-row">'+row(x.e,x.n)+'</span>').join('')+'</div></div><div class="stall">'+prods.map(e=>'<button class="gitem prod" data-e="'+e+'" aria-label="Poner uno en la bolsa">'+e+'</button>').join('')+'</div><div class="gbasket"><span class="bl">bolsa</span><span class="bitems" id="bagbox"></span></div><div class="row center"><button class="primary" id="bagok">¡Ya tengo todo!</button></div>';
 const bb=q1('#bagbox',box),sync=()=>{bb.innerHTML=Object.entries(bag).flatMap(([e,n])=>Array.from({length:n},()=>'<button class="gitem bagx" data-e="'+e+'" aria-label="Sacar de la bolsa">'+e+'</button>')).join('');qa('.bagx',bb).forEach(b=>b.onclick=()=>{if(ctl.st.done)return;bag[b.dataset.e]--;X.sTap();sync()})};
 qa('.prod',box).forEach(b=>b.onclick=()=>{if(ctl.st.done)return;const e=b.dataset.e;bag[e]=(bag[e]||0)+1;X.sTap();K.speak(NW[Math.min(bag[e],10)]);sync()});
 q1('#bagok',box).onclick=()=>{if(ctl.st.done)return;const extra=Object.keys(bag).filter(e=>!ch.list.some(x=>x.e===e)&&bag[e]>0).length,okc=ch.list.every(x=>bag[x.e]===x.n);if(okc&&!extra)ctl.ok('¡Compraste justo lo que decía la lista!');else ctl.err('Mira la lista otra vez: cuenta cada cosa.')};
 sync();
 return{hint(){ctl.fb('Cuenta cada dibujo de la lista.');K.speak('Necesitas '+ch.list.map(x=>(x.n===1?'una ':NW[x.n]+' ')+x.name).join(' y ')+'.')}}};

/* Buscar en la escena: encontrar los animales escondidos entre plantas. */
MEC.find=(ch,box,ctl)=>{
 let found=0;const items=ch.items;
 box.innerHTML='<div class="findbox" id="findbox" role="group" aria-label="Escena de la sabana">'+items.map((it,i)=>'<button class="fitem" data-i="'+i+'" style="left:'+it.x+'%;top:'+it.y+'%" aria-label="'+esc(it.name)+'">'+it.e+'</button>').join('')+ch.decor.map(d=>'<span class="fdec" style="left:'+d.x+'%;top:'+d.y+'%" aria-hidden="true">'+d.e+'</span>').join('')+'</div><p class="center" id="fcount"></p>';
 const upd=()=>{q1('#fcount',box).textContent='Encontraste '+found+' de '+ch.need+'.'};upd();
 const bs=qa('.fitem',box);
 bs.forEach(b=>b.onclick=()=>{if(ctl.st.done||b.classList.contains('good'))return;const it=items[+b.dataset.i];if(it.target){b.classList.add('good');found++;X.sGood();upd();if(found===ch.need)ctl.ok('¡Encontraste todos '+ch.plural+'!');else K.speak(NW[found])}else{b.classList.add('try');setTimeout(()=>b.classList.remove('try'),600);ctl.err('Ese es '+it.name+'. Busca '+ch.name+'.')}});
 return{hint(){const b=bs.find(x=>items[+x.dataset.i].target&&!x.classList.contains('good'));if(b)b.classList.add('ghint');ctl.fb('Mira por aquí.');K.speak('Busca '+ch.plural+'.')}}};

/* Memoria con tarjetas: el error al destapar no cuenta como ayuda (forma parte del juego). */
MEC.memory=(ch,box,ctl)=>{
 const deck=shuffle(ch.cards.flatMap((c,i)=>[{c,i},{c,i}]));let open=[],matched=0,lock=false;
 box.innerHTML='<div class="memorygrid m'+deck.length+'">'+deck.map((d,i)=>'<button class="memorycard" data-m="'+i+'" aria-label="Tarjeta oculta">✦</button>').join('')+'</div>';
 const cs=qa('.memorycard',box);
 cs.forEach(b=>b.onclick=()=>{if(lock||ctl.st.done||b.classList.contains('open')||b.classList.contains('done'))return;const d=deck[+b.dataset.m];b.classList.add('open');b.textContent=d.c.e;b.setAttribute('aria-label',d.c.name);X.sTap();K.speak(d.c.name);open.push(b);
  if(open.length===2){lock=true;const [a,z]=open;if(deck[+a.dataset.m].i===deck[+z.dataset.m].i){a.classList.add('done');z.classList.add('done');matched++;open=[];lock=false;X.sGood();if(matched===ch.cards.length)ctl.ok('¡Encontraste todas las parejas!')}else K.later(()=>{open.forEach(x=>{x.classList.remove('open');x.textContent='✦';x.setAttribute('aria-label','Tarjeta oculta')});open=[];lock=false},1100)}});
 return{hint(){lock=true;cs.forEach(b=>{if(!b.classList.contains('done')){b.classList.add('open');b.textContent=deck[+b.dataset.m].c.e}});ctl.fb('Mira bien dónde está cada una.');K.later(()=>{cs.forEach(b=>{if(!b.classList.contains('done')){b.classList.remove('open');b.textContent='✦'}});lock=false},1800)}}};

/* Laboratorio: mezclar dos colores primarios para obtener otro. */
const RECIPE={naranja:['rojo','amarillo'],verde:['azul','amarillo'],morado:['rojo','azul']};
const mixOf=(a,b)=>Object.keys(RECIPE).find(k=>RECIPE[k].includes(a)&&RECIPE[k].includes(b)&&a!==b);
MEC.mix=(ch,box,ctl)=>{
 let k=0,sel=[];
 box.innerHTML='<div class="mixwrap"><div class="pots">'+['rojo','azul','amarillo'].map(c=>'<button class="pot" data-c="'+c+'" style="--c:'+hue(c)+'" aria-label="Pintura '+c+'"><span>'+c+'</span></button>').join('')+'</div><div class="beaker"><div class="bslots" id="bslots"></div><div class="bres" id="bres" aria-live="polite"></div></div></div><div class="row center"><button class="soft" id="mclear">Vaciar</button><button class="primary" id="mmix">🧪 Mezclar</button></div><p class="center" id="mgoal"></p>';
 const goal=()=>{q1('#mgoal',box).innerHTML=k<ch.targets.length?'Haz el color <b>'+ch.targets[k]+'</b>.':''};goal();
 const slots=()=>{q1('#bslots',box).innerHTML=[0,1].map(i=>'<button class="bslot" data-i="'+i+'" style="--c:'+(sel[i]?hue(sel[i]):'#fff')+'" aria-label="'+(sel[i]||'vacío')+'"></button>').join('');qa('.bslot',box).forEach(b=>b.onclick=()=>{sel.splice(+b.dataset.i,1);slots()})};slots();
 qa('.pot',box).forEach(b=>b.onclick=()=>{if(ctl.st.done)return;if(sel.length<2){sel.push(b.dataset.c);X.sTap();K.speak(b.dataset.c);slots()}});
 q1('#mclear',box).onclick=()=>{sel=[];slots();q1('#bres',box).innerHTML=''};
 q1('#mmix',box).onclick=()=>{if(ctl.st.done)return;if(sel.length<2){ctl.fb('Pon dos pinturas en el vaso.');K.speak('Pon dos pinturas en el vaso.');return}const r=mixOf(sel[0],sel[1]),res=q1('#bres',box);
  if(!r){res.innerHTML='<span class="blob" style="--c:#8f8f8f"></span>';ctl.err('Esa mezcla no cambia el color. Prueba con dos pinturas distintas.')}
  else{res.innerHTML='<span class="blob" style="--c:'+hue(r)+'"></span>';if(r===ch.targets[k]){X.sGood();K.speak('¡Salió '+r+'!');k++;sel=[];slots();goal();if(k===ch.targets.length)ctl.ok('¡Salió '+r+'! '+RECIPE[r][0]+' y '+RECIPE[r][1]+' hacen '+r+'.');else ctl.fb('¡Salió '+r+'! Ahora otro color.')}
   else ctl.err('Salió '+r+'. Prueba otra mezcla para hacer '+ch.targets[k]+'.')}};
 return{hint(){const t=ch.targets[k],ing=RECIPE[t];box.querySelectorAll('.pot').forEach(p=>{if(ing.includes(p.dataset.c))p.classList.add('ghint')});ctl.fb('Mira estas dos pinturas.');K.speak('Para hacer '+t+' mezcla '+ing[0]+' con '+ing[1]+'.')}}};

/* Rompecabezas de figuras: armar un dibujo con rectángulos, triángulos y círculos. */
const FIGS={
 casa:{name:'una casa',slots:[{s:'cuadrado',x:50,y:90,w:100,h:90,c:'amarillo'},{s:'triángulo',x:40,y:30,w:120,h:62,c:'rojo'},{s:'rectángulo',x:90,y:128,w:30,h:52,c:'café'},{s:'círculo',x:60,y:106,w:24,h:24,c:'azul'}]},
 cohete:{name:'un cohete',slots:[{s:'rectángulo',x:78,y:66,w:44,h:96,c:'azul'},{s:'triángulo',x:78,y:30,w:44,h:40,c:'rojo'},{s:'triángulo',x:50,y:122,w:30,h:42,c:'rojo'},{s:'triángulo',x:120,y:122,w:30,h:42,c:'rojo'},{s:'círculo',x:90,y:84,w:20,h:20,c:'amarillo'}]},
 robot:{name:'un robot',slots:[{s:'cuadrado',x:66,y:26,w:68,h:68,c:'azul'},{s:'rectángulo',x:56,y:98,w:88,h:70,c:'verde'},{s:'círculo',x:80,y:48,w:16,h:16,c:'amarillo'},{s:'círculo',x:104,y:48,w:16,h:16,c:'amarillo'},{s:'triángulo',x:90,y:6,w:20,h:22,c:'rojo'}]}};
const shpSvg=(s,x,y,w,hh,f,stroke,extra)=>{const a=(stroke?'fill="'+(f||'#ffffff55')+'" stroke="'+stroke+'" stroke-width="2.4" stroke-dasharray="5 4"':'fill="'+f+'" stroke="#0003" stroke-width="1.6"')+' '+(extra||'');
 if(s==='círculo'||s==='óvalo')return '<ellipse cx="'+(x+w/2)+'" cy="'+(y+hh/2)+'" rx="'+w/2+'" ry="'+hh/2+'" '+a+'/>';
 if(s==='triángulo')return '<polygon points="'+(x+w/2)+','+y+' '+(x+w)+','+(y+hh)+' '+x+','+(y+hh)+'" '+a+'/>';
 if(s==='rombo')return '<polygon points="'+(x+w/2)+','+y+' '+(x+w)+','+(y+hh/2)+' '+(x+w/2)+','+(y+hh)+' '+x+','+(y+hh/2)+'" '+a+'/>';
 return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+hh+'" rx="3" '+a+'/>'};
MEC.puzzle=(ch,box,ctl)=>{
 const F=FIGS[ch.fig],filled=F.slots.map(()=>false);let sel=null;
 const draw=()=>'<svg class="gscene puzsvg" viewBox="0 0 200 190" role="group" aria-label="Rompecabezas">'+F.slots.map((s,i)=>filled[i]?shpSvg(s.s,s.x,s.y,s.w,s.h,hue(s.c)):'<g class="pslot" data-i="'+i+'">'+shpSvg(s.s,s.x,s.y,s.w,s.h,'#fff9','#6f7b74')+'</g>').join('')+'</svg>';
 const pieces=shuffle(F.slots.map((s,i)=>({i,s})));
 box.innerHTML='<div class="gpaint solo" id="pzb">'+draw()+'</div><div class="gtray puz">'+pieces.map(p=>'<button class="gitem piece" data-i="'+p.i+'" data-s="'+p.s.s+'" aria-label="Pieza: '+p.s.s+'"><svg viewBox="0 0 '+(p.s.w+4)+' '+(p.s.h+4)+'" style="width:'+Math.max(30,Math.min(72,p.s.w*.7))+'px;height:'+Math.max(30,Math.min(72,p.s.h*.7))+'px">'+shpSvg(p.s.s,2,2,p.s.w,p.s.h,hue(p.s.c))+'</svg></button>').join('')+'</div>';
 const pcs=qa('.piece',box);let left=F.slots.length;
 function place(pc,slotEl){if(ctl.st.done)return;const i=slotEl?+slotEl.dataset.i:-1;if(i>=0&&!filled[i]&&F.slots[i].s===pc.dataset.s){filled[i]=true;pc.remove();left--;q1('#pzb',box).innerHTML=draw();bindS();X.sGood();sel=null;if(!left)ctl.ok('¡Armaste '+F.name+'!');else ctl.fb('¡Encaja!')}else{pc.classList.add('shake');setTimeout(()=>pc.classList.remove('shake'),500);ctl.err(slotEl?'Esa pieza no va ahí. Mira su forma.':'Llévala hasta un hueco punteado.')}}
 function bindS(){qa('.pslot',box).forEach(g=>g.onclick=()=>{if(sel&&sel.isConnected)place(sel,g)})}bindS();
 pcs.forEach(pc=>{X.tapOnly(pc,()=>{pcs.forEach(x=>x.classList.remove('selected'));sel=pc;pc.classList.add('selected');X.sTap();K.speak(pc.dataset.s)});X.drag(pc,t=>{const g=t&&t.closest&&t.closest('.pslot');place(pc,g)})});
 return{hint(){const pc=pcs.find(p=>p.isConnected);if(!pc)return;const slot=qa('.pslot',box).find(g=>F.slots[+g.dataset.i].s===pc.dataset.s);pc.classList.add('ghint');if(slot)slot.classList.add('ghint');ctl.fb('Esta pieza va en este hueco.');K.speak('Busca el hueco con la forma de '+pc.dataset.s+'.')}}};

/* Camino con flechas: llevar al personaje hasta la escuela esquivando árboles. */
const DIRS={up:[0,-1,'arriba','⬆️'],down:[0,1,'abajo','⬇️'],left:[-1,0,'a la izquierda','⬅️'],right:[1,0,'a la derecha','➡️']};
function walkPlan(rng){for(let t=0;t<60;t++){const W=4,H=3,sy=Math.floor(rng()*H),gy=Math.floor(rng()*H),obs=new Set();while(obs.size<3){const x=1+Math.floor(rng()*2),y=Math.floor(rng()*H);if(!(x===0&&y===sy)&&!(x===3&&y===gy))obs.add(x+','+y)}
 const seen=new Set(['0,'+sy]),q=[[0,sy]];while(q.length){const [x,y]=q.shift();for(const [dx,dy] of Object.values(DIRS).map(d=>d)){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=W||ny>=H||obs.has(k)||seen.has(k))continue;seen.add(k);q.push([nx,ny])}}
 if(seen.has('3,'+gy))return{W,H,start:[0,sy],goal:[3,gy],obs:[...obs]}}
 return{W:4,H:3,start:[0,1],goal:[3,1],obs:[]}}
MEC.walk=(ch,box,ctl)=>{
 let [x,y]=ch.start;const face=K.shell?K.shell.avatar('face','tiny'):'🧒',obs=new Set(ch.obs);
 const cells=()=>{let o='';for(let j=0;j<ch.H;j++)for(let i=0;i<ch.W;i++){const k=i+','+j;o+='<span class="wcell'+(obs.has(k)?' obs':'')+'">'+(obs.has(k)?'🌳':(i===ch.goal[0]&&j===ch.goal[1]?'🏫':(i===x&&j===y?'<span class="wme">'+face+'</span>':'')))+'</span>'}return o};
 box.innerHTML='<div class="wgrid" id="wgrid" style="--cols:'+ch.W+'">'+cells()+'</div><div class="arrows"><button class="arr up" data-d="up" aria-label="Arriba">⬆️</button><button class="arr left" data-d="left" aria-label="A la izquierda">⬅️</button><button class="arr down" data-d="down" aria-label="Abajo">⬇️</button><button class="arr right" data-d="right" aria-label="A la derecha">➡️</button></div>';
 const redraw=()=>{q1('#wgrid',box).innerHTML=cells()};
 qa('.arr',box).forEach(b=>b.onclick=()=>{if(ctl.st.done)return;const d=DIRS[b.dataset.d],nx=x+d[0],ny=y+d[1];K.speak(d[2]);
  if(nx<0||ny<0||nx>=ch.W||ny>=ch.H){ctl.err('Por ahí no hay camino.');return}
  if(obs.has(nx+','+ny)){ctl.err('¡Ahí hay un árbol! Busca otro camino.');return}
  x=nx;y=ny;X.sTap();redraw();if(x===ch.goal[0]&&y===ch.goal[1])ctl.ok('¡Llegaste a la escuela!');else ctl.fb('')});
 return{hint(){const seen=new Set([x+','+y]),Q=[[x,y,[]]];let path=[];while(Q.length){const [cx,cy,p]=Q.shift();if(cx===ch.goal[0]&&cy===ch.goal[1]){path=p;break}for(const k of Object.keys(DIRS)){const d=DIRS[k],nx=cx+d[0],ny=cy+d[1],kk=nx+','+ny;if(nx<0||ny<0||nx>=ch.W||ny>=ch.H||obs.has(kk)||seen.has(kk))continue;seen.add(kk);Q.push([nx,ny,p.concat(k)])}}
  const nxt=path[0];if(nxt){const b=qa('.arr',box).find(a=>a.dataset.d===nxt);if(b)b.classList.add('ghint');ctl.fb('Prueba '+DIRS[nxt][2]+'.');K.speak('Prueba '+DIRS[nxt][2]+'.')}}}};

/* Semáforo: cruzar solo cuando la luz está en verde (con un adulto). Sin tiempo límite ni puntos de velocidad. */
MEC.cross=(ch,box,ctl)=>{
 let light='rojo',ok=0,busy=false;
 box.innerHTML='<div class="crossbox" id="cbox"><div class="clight" id="clight"></div><div class="street"><span class="cwalker" id="cwalker">'+(K.shell?K.shell.avatar('face','tiny'):'🧒')+'</span></div></div><p class="center" id="cstat"></p><div class="row center"><button class="primary xl" id="cgo">🚶 ¡Cruzar!</button></div>';
 const setL=l=>{light=l;q1('#clight',box).innerHTML=A({k:'obj',type:'trafficlight',on:l,label:'semáforo en '+l});q1('#cstat',box).textContent=l==='verde'?'Verde: ya se puede cruzar con un adulto.':l==='amarillo'?'Amarillo: ya casi cambia. ¡Espera!':'Rojo: me detengo y espero.'};
 const dur={rojo:()=>2400+Math.random()*1800,verde:()=>4500,amarillo:()=>1600};
 function tick(){if(ctl.st.done)return;const nx=light==='rojo'?'verde':light==='verde'?'amarillo':'rojo';K.later(()=>{if(busy){tick();return}setL(nx);if(nx==='verde')K.speak('¡Verde! Ya puedes cruzar con un adulto.');tick()},dur[light]())}
 setL('rojo');tick();
 q1('#cgo',box).onclick=()=>{if(ctl.st.done||busy)return;
  if(light!=='verde'){ctl.err(light==='rojo'?'¡Rojo! Me detengo y espero la luz verde.':'¡Amarillo! Todavía no. Espero.');return}
  busy=true;const w=q1('#cwalker',box);w.classList.add('go');X.sGood();K.later(()=>{ok++;w.classList.remove('go');w.classList.add('back');busy=false;if(ok>=ch.times)ctl.ok('¡Cruzaste con la luz verde!');else{ctl.fb('¡Muy bien! Otra vez: espera el verde.');setL('rojo');w.classList.remove('back')}},1700)};
 return{hint(){ctl.fb('Mira el semáforo.');K.speak(light==='verde'?'Está en verde: puedes cruzar con un adulto.':'Está en '+light+': espera.')}}};

/* Retos basados en las habilidades existentes. */
MEC.q=(ch,box,ctl)=>X.M[ch.q.type](ch.q,box,ctl);

/* ===================== construcción de cada aventura ===================== */
const FRUITS=[['🍎','manzanas','manzana'],['🍌','plátanos','plátano'],['🍐','peras','pera'],['🍇','uvas','uva'],['🍊','naranjas','naranja'],['🍓','fresas','fresa']];
function marketList(rng,ctx){const [a,b]=sample(FRUITS,2,rng),M=Math.min(3,Math.max(...ctx.numbers)),na=1+Math.floor(rng()*M),nb=1+Math.floor(rng()*Math.min(2,M)),prods=[a[0],b[0],...sample(FRUITS.map(f=>f[0]).filter(e=>e!==a[0]&&e!==b[0]),3,rng)];
 return{list:[{e:a[0],n:na,name:na===1?a[2]:a[1]},{e:b[0],n:nb,name:nb===1?b[2]:b[1]}],prods:shuffle(prods)}}
function stallSort(rng){const fr=sample(C.h.WORDS.filter(w=>w.cat==='fruta'),2,rng),vg=sample(C.h.WORDS.filter(w=>w.cat==='verdura'),2,rng),items=[...fr.map(w=>({id:w.name,art:h.wordArt(w),bin:'fruta'})),...vg.map(w=>({id:w.name,art:h.wordArt(w),bin:'verdura'}))];
 return h.Q.sort(rng,{key:'ms:'+items.map(i=>i.id).join(),prompt:'Ordena la mercadería: las frutas en un puesto y las verduras en otro.',bins:[{id:'fruta',art:h.em('🍎','puesto de frutas'),label:'frutas'},{id:'verdura',art:h.em('🥕','puesto de verduras'),label:'verduras'}],items,explain:'Las frutas van con las frutas y las verduras con las verduras.'})}
const SIZEANI=[['🐭','ratón'],['🐱','gato'],['🐶','perro'],['🐴','caballo'],['🐘','elefante']];
function sizeOrder(rng){const idx=sample([0,1,2,3,4],3,rng).sort((a,b)=>a-b),asc=rng()<.7,its=idx.map(i=>SIZEANI[i]),list=asc?its:its.slice().reverse();
 return h.Q.order({key:'sz:'+idx.join()+asc,prompt:asc?'Pon los animales del más pequeño al más grande.':'Pon los animales del más grande al más pequeño.',items:list.map(([e,n])=>({id:n,art:h.em(e,n),say:n})),explain:asc?'Primero el más pequeño y al final el más grande.':'Primero el más grande y al final el más pequeño.'})}
function hygiene(rng){const seqs=[[['🧼','me lavo las manos'],['🍽️','como'],['🦷','me cepillo los dientes']],[['🍽️','como'],['🦷','me cepillo los dientes'],['🛏️','me voy a dormir']],[['🚿','me baño'],['👕','me visto'],['🏫','voy a la escuela']]],s=pick(seqs,rng);
 return h.Q.order({key:'hy:'+s[0][1],prompt:'Cuidamos nuestro cuerpo: ¿qué hacemos primero, después y al final?',items:s.map(([e,l])=>({id:l,art:h.em(e,l),say:l})),explain:s.map(x=>x[1]).join(', después ')+'.'})}
function feelQ(rng,ctx){return sk('emociones','b',ctx,rng)}

const ADV=[
 {id:'consultorio',title:'Mi consultorio de peluches',icon:'🩺',color:'#6fb6c9',blurb:'Cuida a tus peluches: curitas, frutas, colores y hábitos.',medal:'🩺',coat:true,
  skills:['partes','contar','clasif-color','orden-eventos','emociones'],
  story:'¡Los peluches de Carlos José necesitan ayuda! Abre el consultorio y cuídalos con mucho cariño. Es un juego: nadie está enfermo de verdad.',end:'¡Todos los peluches están contentos! Eres un gran doctor de peluches.',
  build:(rng,ctx)=>[{mech:'heal',title:'Una curita para el peluche',say:'El peluche se dio un golpecito. Ponle una curita donde le duele.',parts:sample(Object.keys(C.TAP.body),3,rng)},
   {mech:'q',title:'La hora de comer',say:'El peluche tiene hambre. Dale su fruta.',q:sk('contar','c',ctx,rng)},
   {mech:'q',title:'Ordenar el consultorio',say:'Guarda las cosas con las de su mismo color.',q:sk('clasif-color','a',ctx,rng)},
   {mech:'q',title:'Cuidar el cuerpo',say:'Los peluches también se cuidan. Ordena lo que hacemos.',q:hygiene(rng)},
   {mech:'q',title:'¿Cómo se siente?',say:'Escucha y dile al peluche cómo se siente.',q:feelQ(rng,ctx)}]},
 {id:'mercado',title:'El mercado de Carlos José',icon:'🛒',color:'#f0b45a',blurb:'Compra, ordena puestos, compara y cuenta.',medal:'🧺',coat:false,
  skills:['contar','categorias','cuantos','juntar','clasif-color'],
  story:'Hoy vamos al mercado. Hay frutas, verduras y mucho por contar. ¡Ayuda con las compras!',end:'¡Compras listas! Gracias por ayudar en el mercado.',
  build:(rng,ctx)=>{const m=marketList(rng,ctx);return[{mech:'bag',title:'La lista de compras',say:'Mira la lista de dibujos y llena la bolsa con lo que dice.',list:m.list,prods:m.prods},
   {mech:'q',title:'Los puestos del mercado',say:'Pon cada producto en su puesto.',q:stallSort(rng)},
   {mech:'q',title:'¿Cuál canasta tiene más?',say:'Compara las canastas.',q:sk('cuantos','c',ctx,rng)},
   {mech:'q',title:'Vendiendo y guardando',say:'Cuenta cuántos quedan.',q:sk('juntar',rng()<.5?'a':'b',ctx,rng)},
   {mech:'q',title:'Todo lo que es de un color',say:'Busca por colores.',q:sk('clasif-color','b',ctx,rng)}]}},
 {id:'safari',title:'Safari de animales',icon:'🦁',color:'#8fc46a',blurb:'Encuentra animales, memoriza y compara tamaños.',medal:'🧭',coat:false,
  skills:['donde-viven','que-falta','tamano','adivinanzas','parejas-func'],
  story:'¡Nos vamos de safari! Mira con mucha atención: los animales se esconden entre las plantas.',end:'¡Qué safari tan bonito! Conoces muy bien a los animales.',
  build:(rng,ctx)=>{const A_=[['🦒','jirafas','jirafa'],['🐘','elefantes','elefante'],['🦁','leones','león'],['🐵','monos','mono']],t=pick(A_,rng),need=2+Math.floor(rng()*2),others=sample(A_.filter(a=>a!==t).concat([['🐸','ranas','rana'],['🐢','tortugas','tortuga']]),4,rng),cells=sample(Array.from({length:12},(_,i)=>i),need+others.length,rng),pos=c=>({x:+(10+(c%4)*24+(rng()-.5)*6).toFixed(1),y:+(16+Math.floor(c/4)*28+(rng()-.5)*6).toFixed(1)}),
   items=[...Array.from({length:need},()=>({e:t[0],name:t[2],target:true})),...others.map(o=>({e:o[0],name:o[2],target:false}))].map((it,i)=>Object.assign(it,pos(cells[i]))),decor=sample(Array.from({length:12},(_,i)=>i),6,rng).map(c=>({e:pick(['🌿','🌳','🌴'],rng),x:+(12+(c%4)*24+8).toFixed(1),y:+(22+Math.floor(c/4)*28+6).toFixed(1)}));
   return[{mech:'find',title:'¿Dónde están?',say:'Encuentra '+need+' '+t[1]+' en la sabana. ¡Se esconden entre las plantas!',items,decor,need,name:t[2],plural:t[1]},
   {mech:'memory',title:'Memoria de animales',say:'Destapa las tarjetas y encuentra las parejas.',cards:sample([['🐘','elefante'],['🦒','jirafa'],['🦁','león'],['🐵','mono'],['🐢','tortuga'],['🐸','rana']].map(([e,n])=>({e,name:n})),3,rng)},
   {mech:'q',title:'Grandes y pequeños',say:'Ordena los animales por tamaño.',q:sizeOrder(rng)},
   {mech:'q',title:'¿Cómo se mueven?',say:'Pon cada animal donde se mueve.',q:sk('donde-viven','a',ctx,rng)},
   {mech:'q',title:'Adivina el animal',say:'Escucha la pista.',q:sk('adivinanzas','a',ctx,rng)}]}},
 {id:'laboratorio',title:'Laboratorio de descubrimientos',icon:'🧪',color:'#a99be0',blurb:'Mezcla colores, arma figuras y descubre patrones.',medal:'🔬',coat:true,
  skills:['series','clasif-forma','igual-diferente','colores-uso','figuras'],
  story:'¡Bienvenido al laboratorio! Aquí mezclamos colores, armamos figuras y descubrimos secretos con los ojos bien abiertos.',end:'¡Descubriste muchos secretos! Eres un gran científico.',
  build:(rng,ctx)=>[{mech:'mix',title:'Mezclando colores',say:'Mezcla dos pinturas para hacer un color nuevo.',targets:sample(Object.keys(RECIPE),2,rng)},
   {mech:'puzzle',title:'Armamos una figura',say:'Lleva cada pieza a su hueco. Mira bien su forma.',fig:pick(Object.keys(FIGS),rng)},
   {mech:'q',title:'El patrón secreto',say:'Mira qué se repite y completa.',q:sk('series',rng()<.5?'a':'d',ctx,rng)},
   {mech:'q',title:'Observa con atención',say:'Encuentra lo que es diferente.',q:sk('igual-diferente','c',ctx,rng)},
   {mech:'q',title:'Clasificando formas',say:'Pon cada figura con las que se parecen.',q:sk('clasif-forma','a',ctx,rng)}]},
 {id:'colegio',title:'Mi camino al colegio',icon:'🚌',color:'#f08a6b',blurb:'Direcciones, semáforo, transportes y mi mañana.',medal:'🎒',coat:false,
  skills:['posiciones','transporte','orden-eventos','senales','izq-der'],
  story:'¡Hoy es día de colegio! Vamos a llegar caminando con mucho cuidado: miramos, esperamos y seguimos las señales.',end:'¡Llegaste al colegio sano y salvo! Sabes cuidarte en el camino.',
  build:(rng,ctx)=>[Object.assign({mech:'walk',title:'Camino a la escuela',say:'Lleva a Carlos José hasta la escuela con las flechas. Los árboles estorban.'},walkPlan(rng)),
   {mech:'cross',title:'El semáforo',say:'Para cruzar espera la luz verde. Con un adulto, ¡siempre!',times:2},
   {mech:'q',title:'¿En qué viajamos?',say:'Pon cada transporte donde viaja.',q:sk('transporte','a',ctx,rng)},
   {mech:'q',title:'Mi mañana',say:'Ordena lo que hacemos antes del colegio.',q:sk('orden-eventos','a',ctx,rng)},
   {mech:'q',title:'Señales del camino',say:'¿Qué nos dice esta señal?',q:sk('senales','a',ctx,rng)}]}];
ADV.forEach(a=>{a.skills=a.skills.filter(i=>C.byId[i])});

/* ===================== ejecución ===================== */
let run=null;
const advOf=id=>ADV.find(a=>a.id===id);
const view=id=>run&&run.lesson?'cls:adv':'adv:'+id;
function dots(i,n,res){return '<div class="advdots" aria-hidden="true">'+Array.from({length:n},(_,k)=>'<i class="'+(k<i?(res[k]?'ok':'help'):k===i?'now':'')+'"></i>').join('')+'</div>'}
function snapA(){if(!run||run.lesson)return;const s=S();s.resume={k:'adv',id:run.a.id,i:run.i,res:run.res,chs:run.chs,ts:Date.now()};K.save()}
function open(id){const a=advOf(id),ctx=ctxNow(),rng=Math.random;run={a,chs:a.build(rng,ctx),i:-1,res:[]};intro()}
function resumeInfo(){const r=S().resume;if(!r||r.k!=='adv'||Date.now()-r.ts>72*3600e3)return null;const a=advOf(r.id);return a?{title:a.title,icon:a.icon,label:'Reto '+(r.i+1)+' de '+r.chs.length,kind:'adv'}:null}
function resume(){const r=S().resume,info=resumeInfo();if(!info)return false;run={a:advOf(r.id),chs:r.chs,i:r.i,res:r.res};r.i<0?intro():challenge();return true}
function leave(){if(run&&run.lesson){run.onLeave();return}K.shell?K.shell.jugar():K.home()}
function intro(){const a=run.a,face=K.shell.avatar('hero','adv');
 K.page(K.head(a.title,leave,'Aventura')+'<div class="advintro" style="--a:'+a.color+'"><div class="ai-scene" aria-hidden="true"><span class="ai-big">'+a.icon+'</span></div><div class="ai-row"><div class="ai-char">'+face+'</div><div class="ai-bubble"><p>'+esc(a.story)+'</p></div></div><div class="row center"><button class="soft" id="ahear">♫ Escuchar</button><button class="primary xl" id="astart">¡Vamos!</button></div></div>',view(a.id));
 K.bindBack(leave);q1('#ahear').onclick=()=>K.speakTap(a.story);q1('#astart').onclick=()=>{run.i=0;snapA();challenge()};K.speak(a.story);snapA()}
function challenge(){
 const a=run.a,ch=run.chs[run.i],n=run.chs.length;snapA();
 K.page(K.head(a.title,leave,run.lesson?'Jugamos':'Reto '+(run.i+1)+' de '+n)+'<div class="advframe" style="--a:'+a.color+'">'+dots(run.i,n,run.res)+'<div class="ch-say"><span class="ch-face">'+K.shell.avatar('face','tiny')+'</span><div class="ai-bubble"><b>'+esc(ch.title)+'</b><p id="chsay">'+esc(ch.say)+'</p></div><button class="soft" id="chear" aria-label="Escuchar">♫</button></div>'+(ch.mech==='q'?'<h2 class="gprompt">'+esc(ch.q.prompt)+'</h2>':'')+'<div id="gbox"></div><div class="feedback" id="gfb" aria-live="polite"></div><div class="row center"><button class="soft" id="ghint">Ver una pista</button><button class="primary" id="gnext" hidden>Siguiente →</button></div></div>',view(a.id));
 window.__gch=ch;K.bindBack(leave);if(K.audio)K.audio.attention(ch.mech==='memory');
 const sayT=ch.mech==='q'?ch.say+' '+(ch.q.say||ch.q.prompt):ch.say;q1('#chear').onclick=()=>K.speakTap(sayT);
 const st={errors:0,hinted:false,done:false},ctl={st,fb:t=>{const f=q1('#gfb');if(f)f.innerHTML=t},
  err(m){st.errors++;X.sBad();if(m){ctl.fb(m);K.speak(X.plain(m))}},
  ok(m){if(st.done)return;st.done=true;X.sGood();const asst=st.errors>0||st.hinted,msg=m||(asst?'¡Lo encontramos juntos!':pickOf(X.GOODS));ctl.fb(msg);K.speak(X.plain(msg));q1('#ghint').hidden=true;q1('#gnext').hidden=false;run.res[run.i]=!asst;
   run.streak=asst?0:(run.streak||0)+1;if(!asst&&run.streak%3===0&&K.shell)K.shell.celebrate({kind:'streak'});const nb=q1('#gnext');if(nb.scrollIntoView)nb.scrollIntoView({block:'nearest',behavior:'smooth'})}};
 const m=MEC[ch.mech](ch,q1('#gbox'),ctl);
 q1('#ghint').onclick=()=>{if(st.done)return;st.hinted=true;m.hint()};
 q1('#gnext').onclick=()=>{run.i++;if(run.i>=n){if(run.lesson){run.onDone({ok:!!run.res[0]});return}finish()}else challenge()};
 if(ch.mech!=='cross'&&ch.mech!=='memory')K.speak(sayT)}
function finish(){
 const a=run.a,ind=run.res.filter(Boolean).length,n=run.chs.length,frac=ind/n,stars=frac>=.8?3:frac>=.5?2:1,s=S();s.adv=s.adv||{};const o=s.adv[a.id]||{runs:0,stars:0};o.runs++;o.stars=Math.max(o.stars||0,stars);o.ts=Date.now();o.last={ind,of:n};s.adv[a.id]=o;delete s.resume;s.sessions=(s.sessions||0)+1;K.save();
 const news=K.shell.evaluate();if(news){news.adv=a;news.stars=stars}
 K.page(K.head(a.title,leave,'¡Aventura completada!')+'<div class="center advend" style="--a:'+a.color+'"><div class="medal" aria-hidden="true">'+a.medal+'</div><span class="eyebrow">Medalla</span><h1>'+esc(a.title)+'</h1><p class="stars" aria-label="'+stars+' estrellas">'+'⭐'.repeat(stars)+'☆'.repeat(3-stars)+'</p><p class="endtxt">'+esc(a.end)+'</p><p class="small">Sin ayuda: '+ind+' de '+n+' retos. Las estrellas muestran cuánto lo hizo solo hoy; se puede jugar otra vez con retos nuevos.</p><div class="row center"><button class="primary" id="aagain">Jugar otra vez</button><button class="soft" id="aback">Más aventuras</button></div></div>',view(a.id));
 K.bindBack(leave);q1('#aagain').onclick=()=>open(a.id);q1('#aback').onclick=leave;K.speak(a.end);K.shell.showNew(news)}

/* Un solo reto de una aventura dentro de una clase guiada (no guarda medalla, estrellas ni s.resume). */
function playChallenge(id,idx,o){const a=advOf(id),chs=a.build(Math.random,ctxNow());run={a,chs:[chs[Math.min(idx,chs.length-1)]],i:0,res:[],lesson:true,onDone:o.onDone,onLeave:o.onLeave};challenge()}

return{list:ADV,open,playChallenge,resume,resumeInfo,MEC,FIGS,walkPlan}
};
})(typeof globalThis!=='undefined'?globalThis:this);
