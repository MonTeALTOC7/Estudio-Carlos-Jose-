/* Interfaz de las rutas de aprendizaje. Recibe un "kit" de app.js (pantallas, voz, progreso).
   Cada actividad sigue: Aprender → Ver ejemplos → Practicar → Reforzar → Comprobar. */
(function(root){
'use strict';
root.GamesUI=function(K){
const C=K.Content,E=K.E,esc=K.escape,NW=C.h.NW;
const S=()=>K.state();
const qa=(sel,r)=>Array.from((r||document).querySelectorAll(sel));
const q1=(sel,r)=>(r||document).querySelector(sel);
const hue=c=>(C.COLORS[c]||{hex:'#9aa5a0'}).hex;
const plain=h=>String(h).replace(/<[^>]*>/g,'');
const GOODS=['¡Muy bien!','¡Lo encontraste!','¡Eso es!','¡Perfecto!','¡Bien hecho!'],TRIES=['Mira otra vez.','Casi. Probemos de nuevo.','Vamos a mirar con calma.'];
const pickOf=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=(a)=>C.h.shuffle(a);

/* ---------- sonidos suaves (WebAudio, sin archivos) ---------- */
let ac=null;
function tone(f,d,type,vol){if(!S().sound)return;try{ac=ac||new (root.AudioContext||root.webkitAudioContext)();if(ac.state==='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime,v=vol||.06;o.type=type||'sine';o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+(d||.14));o.start(t);o.stop(t+(d||.14)+.03)}catch(e){}}
const sGood=()=>{tone(660,.12);setTimeout(()=>tone(880,.16),110)},sBad=()=>tone(220,.2,'triangle'),sTap=()=>tone(520,.05,'sine',.04);

/* ---------- dibujo de arte ---------- */
const shapeSvg=a=>{const c=hue(a.color),f=a.outline?'fill="none" stroke="'+c+'" stroke-width="7" stroke-linejoin="round"':'fill="'+c+'" stroke="#00000026" stroke-width="2"';
 return {círculo:'<circle cx="60" cy="60" r="40" '+f+'/>',cuadrado:'<rect x="22" y="22" width="76" height="76" rx="3" '+f+'/>',triángulo:'<polygon points="60,16 104,98 16,98" '+f+'/>',rectángulo:'<rect x="8" y="34" width="104" height="52" rx="3" '+f+'/>',óvalo:'<ellipse cx="60" cy="60" rx="50" ry="31" '+f+'/>',rombo:'<polygon points="60,8 106,60 60,112 14,60" '+f+'/>'}[a.shape]||''};
const OBJS={
 door:a=>a.open?'<rect x="26" y="12" width="68" height="100" fill="#3b2f2a"/><polygon points="26,12 70,22 70,104 26,112" fill="#b67a43" stroke="#7d5129" stroke-width="3"/><circle cx="62" cy="64" r="4" fill="#f1c553"/>':'<rect x="26" y="12" width="68" height="100" rx="3" fill="#b67a43" stroke="#7d5129" stroke-width="3"/><rect x="38" y="24" width="44" height="30" fill="#c98f56"/><circle cx="82" cy="66" r="4.5" fill="#f1c553"/>',
 egg:()=>'<ellipse cx="60" cy="66" rx="34" ry="44" fill="#f6e7c8" stroke="#d3bc8f" stroke-width="3"/>',
 kite:()=>'<polygon points="60,8 100,48 60,92 20,48" fill="#e86f6f" stroke="#a84444" stroke-width="3"/><path d="M60,8V92M20,48H100" stroke="#fff" stroke-width="2"/><path d="M60,92Q48,104 62,110Q76,116 60,120" fill="none" stroke="#6f7f8d" stroke-width="3"/>',
 bar:a=>'<rect x="8" y="'+(60-a.th*50)+'" width="'+a.len*104+'" height="'+a.th*100+'" rx="5" fill="'+hue(a.color)+'" stroke="#00000022" stroke-width="2"/>',
 tower:a=>{const h=a.h*104,n=Math.max(2,Math.round(a.h*5));let r='';for(let i=0;i<n;i++)r+='<rect x="38" y="'+(112-h+i*h/n)+'" width="44" height="'+(h/n-2)+'" rx="3" fill="'+hue(a.color)+'" stroke="#00000022" stroke-width="2"/>';return r},
 trunk:a=>'<ellipse cx="60" cy="22" rx="30" ry="18" fill="#51a26c"/><rect x="'+(60-a.w*30)+'" y="30" width="'+a.w*60+'" height="82" rx="4" fill="#8b5a3c" stroke="#00000022" stroke-width="2"/>',
 glass2:a=>{const top=105-a.level*80;return '<path d="M30 105L26 24H94L90 105Z" fill="#eaf4f8"/><path d="M'+(30-(105-top)*.05)+' '+top+'H'+(90+(105-top)*.05)+'L90 105H30Z" fill="#6fb6e0"/><path d="M26 24H94L90 105H30Z" fill="none" stroke="#657f8a" stroke-width="5" stroke-linejoin="round"/>'},
 box:a=>a.open?'<polygon points="22,48 98,48 108,30 12,30" fill="#a8793f"/><rect x="22" y="48" width="76" height="58" fill="#d9ac72" stroke="#a8793f" stroke-width="3"/><polygon points="22,48 6,22 28,18 42,36" fill="#c28f55" stroke="#a8793f" stroke-width="2"/><polygon points="98,48 114,22 92,18 78,36" fill="#c28f55" stroke="#a8793f" stroke-width="2"/>':'<rect x="16" y="36" width="88" height="14" fill="#c28f55" stroke="#a8793f" stroke-width="3"/><rect x="22" y="50" width="76" height="56" fill="#d9ac72" stroke="#a8793f" stroke-width="3"/><rect x="50" y="36" width="20" height="26" fill="#f1c553" opacity=".8"/>',
 trafficlight:a=>{const L=[['rojo','#df4848',30],['amarillo','#f4c345',60],['verde','#51a26c',90]];return '<rect x="36" y="6" width="48" height="108" rx="12" fill="#3b4a45"/>'+L.map(([n,h,y])=>'<circle cx="60" cy="'+y+'" r="13" fill="'+(a.on===n?h:'#58675f')+'" '+(a.on===n?'stroke="#fff" stroke-width="3"':'')+'/>').join('')}};
const LEGACY=['apple','ball','sun','leaf','fish','bird','chick','frog','wheel','window','roof'];
function objArt(a){
 if(a.type==='shape')return '<svg class="gsvg" viewBox="0 0 120 120" role="img" aria-label="'+esc(a.label)+'">'+shapeSvg(a)+'</svg>';
 if(LEGACY.includes(a.type))return K.art(a).replace('class="learning-art"','class="gsvg"');
 const f=OBJS[a.type];return '<svg class="gsvg" viewBox="0 0 120 120" role="img" aria-label="'+esc(a.label)+'">'+(f?f(a):'')+'</svg>'}
function grpArt(a,tap){
 return '<span class="grp'+(a.frame?' frame':'')+(a.n<=3?' few':'')+'" role="img" aria-label="'+esc(a.label)+'">'+a.pos.map((p,i)=>{const g=a.gone&&a.gone.includes(i),st='style="left:'+p[0]+'%;top:'+p[1]+'%"';return tap?'<button class="gi tapc" data-ci="'+i+'" '+st+' aria-label="Contar uno">'+a.e+'</button>':'<span class="gi'+(g?' gone':'')+'" '+st+'>'+a.e+'</span>'}).join('')+'</span>'}
function A(a,opt){
 opt=opt||{};let inner;
 switch(a.k){
  case'e':inner='<span class="ge" role="img" aria-label="'+esc(a.label)+'">'+a.e+'</span>';break;
  case't':inner='<span class="gt'+(a.sym==='name'||a.sym==='w'?' gname':'')+(a.t.length>3?' long':'')+'" aria-label="'+esc(a.label)+'">'+esc(a.t)+'</span>';break;
  case'sw':inner='<span class="gsw" style="--c:'+hue(a.color)+'" role="img" aria-label="'+esc(a.label)+'"></span>';break;
  case'obj':inner=objArt(a);break;
  case'grp':return grpArt(a,opt.tap);
  case'scene':return sceneArt(a);
  default:inner='';}
 const sc=a.scale&&a.scale!==1?' style="--sc:'+a.scale+'"':'';
 return '<span class="gart'+(a.k==='t'?' text':'')+'"'+sc+'>'+inner+'</span>'}

/* ---------- escenas de posición ---------- */
const SG={
 mesa:{zones:{encima:[120,57],debajo:[120,113],'al lado':[208,114]},back:'',front:'<rect x="56" y="80" width="128" height="11" rx="4" fill="#c98f56"/><rect x="64" y="91" width="10" height="44" fill="#a8723a"/><rect x="166" y="91" width="10" height="44" fill="#a8723a"/>',z:{}},
 caja:{zones:{dentro:[120,74],fuera:[206,112],encima:[120,36]},back:'<polygon points="82,64 158,64 164,80 76,80" fill="#8e6330"/>',front:'<rect x="76" y="80" width="88" height="54" rx="3" fill="#d9ac72" stroke="#a8793f" stroke-width="3"/>',z:{dentro:'mid'}},
 arbol:{zones:{delante:[120,118],detrás:[128,100],'al lado':[200,114]},back:'',front:'<rect x="108" y="86" width="24" height="48" fill="#8b5a3c"/><circle cx="120" cy="56" r="38" fill="#51a26c"/><circle cx="92" cy="72" r="22" fill="#5aaf76"/><circle cx="148" cy="72" r="22" fill="#5aaf76"/>',z:{detrás:'behind'}},
 cajas:{zones:{entre:[120,108],izquierda:[22,108],derecha:[218,108]},back:'',front:'<rect x="54" y="86" width="46" height="48" rx="3" fill="#d9ac72" stroke="#a8793f" stroke-width="3"/><rect x="140" y="86" width="46" height="48" rx="3" fill="#d9ac72" stroke="#a8793f" stroke-width="3"/>',z:{}},
 casa:{zones:{cerca:[120,110],lejos:[218,110]},back:'',front:'<rect x="16" y="76" width="76" height="58" fill="#f0d9a8" stroke="#b9975a" stroke-width="3"/><polygon points="8,78 54,38 100,78" fill="#d87a4e" stroke="#965132" stroke-width="3"/><rect x="44" y="100" width="20" height="34" fill="#b67a43"/><rect x="22" y="90" width="14" height="14" fill="#b5dce9" stroke="#98643f" stroke-width="2"/>',z:{}},
 lado:{zones:{izquierda:[48,110],derecha:[192,110]},back:'',front:'<rect x="94" y="86" width="52" height="48" rx="3" fill="#d9ac72" stroke="#a8793f" stroke-width="3"/><rect x="88" y="78" width="64" height="12" rx="3" fill="#c28f55" stroke="#a8793f" stroke-width="2"/>',z:{}}};
const SKY='<rect width="240" height="134" fill="#e8f3fb"/><rect y="134" width="240" height="26" fill="#cfe5c8"/>';
const objText=(e,p)=>'<text x="'+p[0]+'" y="'+p[1]+'" font-size="38" text-anchor="middle" dominant-baseline="central">'+e+'</text>';
function sceneInner(lm,rel,e){const g=SG[lm],p=rel?g.zones[rel]:null,z=rel&&g.z[rel]||'front';
 return SKY+(z==='behind'&&p?objText(e,p):'')+g.back+(z==='mid'&&p?objText(e,p):'')+g.front+(z==='front'&&p?objText(e,p):'')}
function sceneArt(a){
 if(a.landmark==='vertical')return '<svg class="gscene" viewBox="0 0 240 160" role="img" aria-label="'+esc(a.label)+'"><rect width="240" height="160" fill="#e8f3fb"/><rect y="84" width="240" height="76" fill="#cfe5c8"/>'+objText(a.top,[120,38])+objText(a.bottom,[120,120])+'</svg>';
 if(a.landmark==='fila'){const xs=[26,68,110,152];return '<svg class="gscene" viewBox="0 0 240 160" role="img" aria-label="'+esc(a.label)+'"><rect width="240" height="160" fill="#e8f3fb"/><rect y="104" width="240" height="56" fill="#cfe5c8"/>'+a.items.map((e,i)=>objText(e,[xs[i],92])).join('')+'<text x="205" y="88" font-size="52" text-anchor="middle" dominant-baseline="central">'+a.goal+'</text><path d="M20 140H190M178 132L192 140L178 148" fill="none" stroke="#6b8f77" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
 return '<svg class="gscene" viewBox="0 0 240 160" role="img" aria-label="'+esc(a.label)+'">'+sceneInner(a.landmark,a.rel,a.e)+'</svg>'}

/* ---------- escenas para pintar y tocar ---------- */
const NEU='#e9ede4',STK='#6f7b74';
function bodySvg(ids,fill,hl){const f=r=>(fill&&fill[r])||NEU,h=r=>hl===r?' hl':'';
 const P=(id,inner,attrs)=>'<g class="rg'+h(id)+'" data-r="'+id+'" '+(attrs||'')+'>'+inner+'</g>';
 const sh=(tag,a,id)=>'<'+tag+' '+a+' fill="'+f(id)+'" stroke="'+STK+'" stroke-width="2.5"/>';
 return '<svg class="gscene paintsvg" viewBox="0 0 120 160" role="group" aria-label="Dibujo de un niño">'+
 P(ids.brazos,sh('rect','x="20" y="52" width="16" height="46" rx="8"',ids.brazos)+sh('rect','x="84" y="52" width="16" height="46" rx="8"',ids.brazos))+
 P(ids.piernas,sh('rect','x="43" y="96" width="15" height="42" rx="6"',ids.piernas)+sh('rect','x="62" y="96" width="15" height="42" rx="6"',ids.piernas))+
 P(ids.pies,sh('ellipse','cx="49" cy="144" rx="13" ry="7"',ids.pies)+sh('ellipse','cx="71" cy="144" rx="13" ry="7"',ids.pies))+
 P(ids.barriga,sh('rect','x="40" y="48" width="40" height="52" rx="12"',ids.barriga))+
 P(ids.manos,sh('circle','cx="28" cy="104" r="9"',ids.manos)+sh('circle','cx="92" cy="104" r="9"',ids.manos))+
 P(ids.cabeza,sh('circle','cx="60" cy="27" r="19"',ids.cabeza))+
 '<g class="face" pointer-events="none"><circle cx="53" cy="24" r="2.4" fill="#314d40"/><circle cx="67" cy="24" r="2.4" fill="#314d40"/><path d="M52 33Q60 40 68 33" fill="none" stroke="#314d40" stroke-width="2" stroke-linecap="round"/></g></svg>'}
function faceSvg(hl){const g=(id,inner)=>'<g class="rg'+(hl===id?' hl':'')+'" data-r="'+id+'">'+inner+'</g>';
 return '<svg class="gscene paintsvg" viewBox="0 0 120 120" role="group" aria-label="Una cara">'+
 g('orejas','<ellipse cx="9" cy="62" rx="8" ry="12" fill="#f0c9a2" stroke="'+STK+'" stroke-width="2.5"/><ellipse cx="111" cy="62" rx="8" ry="12" fill="#f0c9a2" stroke="'+STK+'" stroke-width="2.5"/>')+
 '<circle cx="60" cy="62" r="46" fill="#f6d8b8" stroke="'+STK+'" stroke-width="2.5" pointer-events="none"/>'+
 g('cabello','<path d="M14 54Q16 10 60 12Q104 10 106 54Q92 30 60 32Q28 30 14 54Z" fill="#6b4a32" stroke="'+STK+'" stroke-width="2.5"/>')+
 g('ojos','<ellipse cx="42" cy="58" rx="8" ry="6" fill="#fff" stroke="'+STK+'" stroke-width="2"/><ellipse cx="78" cy="58" rx="8" ry="6" fill="#fff" stroke="'+STK+'" stroke-width="2"/><circle cx="42" cy="58" r="3" fill="#314d40"/><circle cx="78" cy="58" r="3" fill="#314d40"/>')+
 g('nariz','<path d="M60 62L52 80H68Z" fill="#e8b890" stroke="'+STK+'" stroke-width="2" stroke-linejoin="round"/>')+
 g('boca','<path d="M40 92Q60 110 80 92Q60 98 40 92Z" fill="#d9605d" stroke="'+STK+'" stroke-width="2" stroke-linejoin="round"/>')+'</svg>'}
const TAPIDS={cabeza:'cabeza',brazos:'brazo',manos:'mano',piernas:'pierna',pies:'pie',barriga:'barriga'};
const PAINTSVG={
 body:fill=>bodySvg({cabeza:'cabeza',brazos:'brazos',manos:'manos',piernas:'piernas',pies:'pies',barriga:'barriga'},fill),
 house:fill=>{const f=r=>(fill&&fill[r])||NEU,g=(id,i)=>'<g class="rg" data-r="'+id+'">'+i+'</g>',s='stroke="'+STK+'" stroke-width="2.5" stroke-linejoin="round"';
  return '<svg class="gscene paintsvg" viewBox="0 0 120 130" role="group" aria-label="Dibujo de una casa">'+g('pared','<rect x="18" y="58" width="84" height="62" fill="'+f('pared')+'" '+s+'/>')+g('techo','<polygon points="8,60 60,16 112,60" fill="'+f('techo')+'" '+s+'/>')+g('puerta','<rect x="30" y="80" width="24" height="40" fill="'+f('puerta')+'" '+s+'/>')+g('ventana','<rect x="68" y="76" width="24" height="24" fill="'+f('ventana')+'" '+s+'/>')+'</svg>'},
 light:fill=>{const f=r=>(fill&&fill[r])||'#d9ddd7',g=(id,y)=>'<g class="rg" data-r="'+id+'"><circle cx="60" cy="'+y+'" r="17" fill="'+f(id)+'" stroke="#fff" stroke-width="3"/></g>';
  return '<svg class="gscene paintsvg" viewBox="0 0 120 150" role="group" aria-label="Un semáforo"><rect x="34" y="6" width="52" height="122" rx="14" fill="#3b4a45"/>'+g('arriba',34)+g('medio',67)+g('abajo',100)+'<rect x="54" y="128" width="12" height="18" fill="#3b4a45"/></svg>'},
 flag:fill=>{const f=r=>(fill&&fill[r])||NEU,g=(id,y)=>'<g class="rg" data-r="'+id+'"><rect x="10" y="'+y+'" width="100" height="28" fill="'+f(id)+'" stroke="'+STK+'" stroke-width="2.5"/></g>';
  return '<svg class="gscene paintsvg" viewBox="0 0 120 120" role="group" aria-label="La bandera"><rect x="6" y="10" width="4" height="100" rx="2" fill="#8b6b4a"/>'+g('arriba',16)+g('medio',44)+g('abajo',72)+'<polygon points="60,50 70,66 50,66" fill="none" stroke="'+STK+'" stroke-width="1.6" pointer-events="none"/></svg>'}};

/* ---------- arrastrar y soltar con respaldo de toque ---------- */
function drag(el,onDrop){
 el.style.touchAction='none';let st=null;
 el.addEventListener('pointerdown',e=>{if(e.isPrimary===false||el.disabled)return;st={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};try{el.setPointerCapture(e.pointerId)}catch(_){}});
 el.addEventListener('pointermove',e=>{if(!st||e.pointerId!==st.id)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;if(!st.moved&&Math.hypot(dx,dy)<12)return;st.moved=true;el.classList.add('dragging');el.style.transform='translate('+dx+'px,'+dy+'px)'});
 const end=(e,cancel)=>{if(!st||e.pointerId!==st.id)return;const s=st;st=null;el.classList.remove('dragging');el.style.transform='';try{if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId)}catch(_){}
  if(!s.moved)return;el._dragged=true;setTimeout(()=>{el._dragged=false},60);if(cancel)return;el.style.visibility='hidden';const t=document.elementFromPoint(e.clientX,e.clientY);el.style.visibility='';onDrop(t)};
 el.addEventListener('pointerup',e=>end(e,false));el.addEventListener('pointercancel',e=>end(e,true))}
const tapOnly=(el,fn)=>el.addEventListener('click',()=>{if(el._dragged)return;fn()});

/* ---------- renderizadores por tipo de pregunta ---------- */
const M={};
M.choose=(q,box,ctl)=>{
 const n=q.options.length,cls=q.row?'row':n===4?'c4':n===2?'c2':'c3';let counted=0;
 const model=q.model?'<div class="gmodel">'+q.model.map(a=>a.k==='grp'&&a.tap?A(a,{tap:true}):A(a)).join('')+'</div>':'';
 box.innerHTML=model+'<div class="gopts '+cls+'">'+q.options.map(o=>'<button class="gopt'+(o.art.k==='t'?' txt':'')+'" data-id="'+esc(o.id)+'" aria-label="'+esc(o.art.label)+'">'+A(o.art)+'</button>').join('')+'</div>'+(q.listen?'<div class="row center"><button class="soft" id="glisten">♫ Escuchar las opciones</button></div>':'');
 const btns=qa('.gopt',box);
 qa('.tapc',box).forEach(b=>b.onclick=()=>{if(b.classList.contains('counted'))return;b.classList.add('counted');counted++;sTap();K.speak(NW[Math.min(counted,10)])});
 const gl=q1('#glisten',box);if(gl)gl.onclick=()=>K.speak(q.listen.join('. '));
 btns.forEach(b=>b.onclick=()=>{if(ctl.st.done)return;if(b.dataset.id===q.answer){b.classList.add('good');btns.forEach(x=>x.disabled=true);ctl.ok()}else{b.classList.add('try');b.disabled=true;ctl.err(pickOf(TRIES))}});
 return{hint(){const g=btns.find(b=>b.dataset.id===q.answer);if(g)g.classList.add('ghint');ctl.fb('Mira este.');K.speak(q.explain)}}};

M.multi=(q,box,ctl)=>{
 let found=0;const T=new Set(q.targets);
 box.innerHTML=(q.model?'<div class="gmodel">'+q.model.map(a=>A(a)).join('')+'</div>':'')+'<div class="gopts multi">'+q.items.map(o=>'<button class="gopt" data-id="'+esc(o.id)+'" aria-label="'+esc(o.art.label)+'">'+A(o.art)+'</button>').join('')+'</div><p class="center small" id="gcount"></p>';
 const btns=qa('.gopt',box),upd=()=>{q1('#gcount',box).textContent='Encontraste '+found+' de '+q.targets.length+'.'};upd();
 btns.forEach(b=>b.onclick=()=>{if(ctl.st.done||b.classList.contains('good'))return;if(T.has(b.dataset.id)){b.classList.add('good');found++;sGood();upd();if(found===T.size){btns.forEach(x=>x.disabled=true);ctl.ok()}else K.speak('Sí. Busca más.')}else{b.classList.add('try');ctl.err(pickOf(TRIES));setTimeout(()=>b.classList.remove('try'),700)}});
 return{hint(){const g=btns.find(b=>T.has(b.dataset.id)&&!b.classList.contains('good'));if(g)g.classList.add('ghint');ctl.fb('Mira este.');K.speak(q.explain)}}};

M.sort=(q,box,ctl)=>{
 const left=new Set(q.items.map(i=>i.id));let sel=null;
 box.innerHTML='<div class="gbins n'+q.bins.length+'">'+q.bins.map(b=>'<button class="gbin" data-bin="'+esc(b.id)+'" aria-label="Grupo: '+esc(b.label)+'"><span class="bhead">'+A(b.art)+'<b>'+esc(b.label)+'</b></span><span class="bbody"></span></button>').join('')+'</div><div class="gtray">'+q.items.map(o=>'<button class="gitem" data-id="'+esc(o.id)+'" aria-label="'+esc(o.art.label)+'">'+A(o.art)+'</button>').join('')+'</div>';
 const items=qa('.gitem',box),bins=qa('.gbin',box),byId=Object.fromEntries(q.items.map(i=>[i.id,i]));
 function select(el){if(sel)sel.classList.remove('selected');sel=el;if(el){el.classList.add('selected');sTap();K.speak(byId[el.dataset.id].art.label)}}
 function drop(el,bin){if(ctl.st.done||!bin)return;const it=byId[el.dataset.id];if(it.bin===bin.dataset.bin){const c=document.createElement('span');c.className='gplaced';c.innerHTML=el.innerHTML;q1('.bbody',bin).appendChild(c);el.remove();left.delete(it.id);sel=null;bin.classList.add('flash');setTimeout(()=>bin.classList.remove('flash'),500);sGood();if(!left.size)ctl.ok();else ctl.fb('¡Sí!')}else{el.classList.add('shake');setTimeout(()=>el.classList.remove('shake'),500);select(null);ctl.err(pickOf(TRIES))}}
 items.forEach(el=>{tapOnly(el,()=>select(el));drag(el,t=>{const b=t&&t.closest&&t.closest('.gbin');if(b)drop(el,b)})});
 bins.forEach(b=>b.onclick=()=>{if(sel)drop(sel,b);else K.speak(b.getAttribute('aria-label').replace('Grupo: ',''))});
 return{hint(){const el=sel&&sel.isConnected?sel:items.find(x=>x.isConnected);if(!el)return;select(el);const it=byId[el.dataset.id],b=bins.find(x=>x.dataset.bin===it.bin);b.classList.add('ghint');ctl.fb('Mira dónde va.');K.speak(it.art.label+' va en '+q.bins.find(x=>x.id===it.bin).label)}}};

const PCOLS=['#e45f5f','#4b8fd1','#e0a92d','#4f9f6d','#a36bc4'];
M.match=(q,box,ctl)=>{
 const L=shuffle(q.pairs),R=shuffle(q.pairs);let sel=null,done=0;const col={};
 const side=(s,arr)=>'<div class="gcol">'+arr.map(p=>'<button class="gm" data-side="'+s+'" data-id="'+esc(p.id)+'" aria-label="'+esc(p[s].label)+'">'+A(p[s])+'</button>').join('')+'</div>';
 box.innerHTML='<div class="gmatch">'+side('l',L)+side('r',R)+'</div><p class="center small">Toca uno de cada lado, o arrástralo hasta su pareja.</p>';
 const btns=qa('.gm',box),pid=Object.fromEntries(q.pairs.map(p=>[p.id,p]));
 function pair(a,b){if(ctl.st.done||a.classList.contains('done')||b.classList.contains('done')||a.dataset.side===b.dataset.side)return;
  if(sel){sel.classList.remove('selected');sel=null}
  if(a.dataset.id===b.dataset.id){const c=PCOLS[done%PCOLS.length];done++;[a,b].forEach(x=>{x.classList.add('done');x.style.setProperty('--pc',c)});sGood();K.speak(pid[a.dataset.id].say||'¡Son pareja!');if(done===q.pairs.length)ctl.ok();else ctl.fb('¡Son pareja!')}
  else{[a,b].forEach(x=>{x.classList.add('shake');setTimeout(()=>x.classList.remove('shake'),500)});ctl.err(pickOf(TRIES))}}
 function click(b){if(b.classList.contains('done'))return;if(!sel||sel.dataset.side===b.dataset.side){if(sel)sel.classList.remove('selected');sel=b;b.classList.add('selected');sTap();K.speak(b.getAttribute('aria-label'));return}pair(sel,b)}
 btns.forEach(b=>{tapOnly(b,()=>click(b));drag(b,t=>{const o=t&&t.closest&&t.closest('.gm');if(o&&o!==b)pair(b,o)})});
 return{hint(){const p=q.pairs.find(p=>!btns.find(b=>b.dataset.id===p.id&&b.classList.contains('done')));if(!p)return;btns.filter(b=>b.dataset.id===p.id).forEach(b=>b.classList.add('ghint'));ctl.fb('Mira estos dos.');K.speak(p.say||q.explain)}}};

M.order=(q,box,ctl)=>{
 const pool=q.items.concat(q.extra||[]);let k=0,tr=shuffle(pool);for(let t=0;t<9&&tr.every((x,i)=>x.id===pool[i].id)&&q.items.length>1;t++)tr=shuffle(pool);
 const same=(a,b)=>(a.v!==undefined&&b.v!==undefined)?a.v===b.v:a.id===b.id;
 box.innerHTML='<div class="gslots">'+q.items.map((_,i)=>'<span class="gslot" data-i="'+i+'"></span>'+(i<q.items.length-1?'<i class="garrow" aria-hidden="true">›</i>':'')).join('')+'</div><div class="gtray">'+tr.map(o=>'<button class="gitem" data-id="'+esc(o.id)+'" aria-label="'+esc(o.art.label)+'">'+A(o.art)+'</button>').join('')+'</div>';
 const slots=qa('.gslot',box),btns=qa('.gitem',box),byId=Object.fromEntries(pool.map(i=>[i.id,i]));
 btns.forEach(b=>b.onclick=()=>{if(ctl.st.done||b.classList.contains('used'))return;const it=byId[b.dataset.id];if(same(it,q.items[k])){b.classList.add('used');b.disabled=true;slots[k].innerHTML=A(it.art);slots[k].classList.add('filled');sGood();if(it.say)K.speak(it.say);k++;if(k===q.items.length)ctl.ok();else ctl.fb('¡Sí! ¿Y después?')}else{b.classList.add('shake');setTimeout(()=>b.classList.remove('shake'),500);ctl.err(pickOf(TRIES))}});
 return{hint(){const g=btns.find(b=>!b.classList.contains('used')&&same(byId[b.dataset.id],q.items[k]));if(g)g.classList.add('ghint');ctl.fb('Mira cuál va ahora.');K.speak(q.explain)}}};

M.put=(q,box,ctl)=>{
 const cur={n:0};
 box.innerHTML='<div class="gmodel">'+(q.model||[]).map(a=>A(a)).join('')+'</div><div class="gbasket" id="gbasket" aria-label="Canasta"><span class="bl">canasta</span><span class="bitems"></span></div><div class="gtray put">'+Array.from({length:q.tray},(_,i)=>'<button class="gitem pitem" data-i="'+i+'" aria-label="Poner uno">'+q.item+'</button>').join('')+'</div><div class="row center"><button class="primary" id="gready">¡Ya los puse!</button></div>';
 const tray=q1('.gtray',box),bi=q1('.bitems',box);
 qa('.pitem',box).forEach(b=>b.onclick=()=>{if(ctl.st.done)return;if(b.parentElement===tray){bi.appendChild(b);cur.n++;sTap();K.speak(NW[Math.min(cur.n,10)])}else{tray.appendChild(b);cur.n--;sTap()}});
 q1('#gready',box).onclick=()=>{if(ctl.st.done)return;if(cur.n===q.target)ctl.ok('¡Pusiste '+NW[q.target]+'!');else{ctl.err(cur.n<q.target?'Todavía faltan. Cuenta de nuevo.':'Hay de más. Quita algunas y cuenta de nuevo.')}};
 return{hint(){ctl.fb('Cuenta mientras las pones: '+Array.from({length:q.target},(_,i)=>NW[i+1]).join(', ')+'.');K.speak(q.explain)}}};

function zoneDraw(q,rel){const g=SG[q.landmark],z=rel&&g.z[rel]||'front',p=rel&&g.zones[rel];return SKY+(z==='behind'&&p?objText(q.obj.e,p):'')+g.back+(z==='mid'&&p?objText(q.obj.e,p):'')+g.front+(z==='front'&&p?objText(q.obj.e,p):'')}
M.place=(q,box,ctl)=>{
 const g=SG[q.landmark];let cur=null;
 const draw=()=>'<svg class="gscene place" viewBox="0 0 240 160" role="group" aria-label="Escena">'+zoneDraw(q,cur)+q.zones.map(z=>'<circle class="zone" data-z="'+esc(z)+'" cx="'+g.zones[z][0]+'" cy="'+g.zones[z][1]+'" r="18"/>').join('')+'</svg>';
 box.innerHTML='<div class="gmodel" id="gplace">'+draw()+'</div><p class="center small">Toca el círculo punteado donde va '+q.obj.label+'.</p>';
 function bind(){qa('.zone',box).forEach(z=>z.onclick=()=>{if(ctl.st.done)return;const r=z.dataset.z;cur=r;q1('#gplace',box).innerHTML=draw();if(r===q.rel){qa('.zone',box).forEach(x=>x.style.display='none');ctl.ok('¡Ahí está! '+q.obj.label.charAt(0).toUpperCase()+q.obj.label.slice(1)+' está '+C.SPACE[q.landmark][r]+'.')}else{ctl.err('Ahí '+q.obj.label+' está '+C.SPACE[q.landmark][r]+'. Probemos otra vez.');bind()}});}
 bind();
 return{hint(){const z=qa('.zone',box).find(x=>x.dataset.z===q.rel);if(z)z.classList.add('ghint');ctl.fb('Mira este círculo.');K.speak(q.explain)}}};

M.follow=(q,box,ctl)=>{
 let k=0;
 box.innerHTML='<div class="gopts c3 board">'+q.board.map(o=>'<button class="gopt" data-id="'+esc(o.id)+'" aria-label="'+esc(o.art.label)+'">'+A(o.art)+'</button>').join('')+'</div><div class="row center"><button class="soft" id="grep">♫ Escuchar la instrucción</button></div>';
 const btns=qa('.gopt',box);q1('#grep',box).onclick=()=>K.speak(q.prompt);
 btns.forEach(b=>b.onclick=()=>{if(ctl.st.done||b.classList.contains('good'))return;if(b.dataset.id===q.targets[k]){b.classList.add('good');k++;sGood();if(k===q.targets.length)ctl.ok();else ctl.fb('¡Sí! Ahora lo que sigue.')}else{b.classList.add('try');setTimeout(()=>b.classList.remove('try'),600);ctl.err(k===0?pickOf(TRIES):'Casi. Escucha la instrucción otra vez.')}});
 return{hint(){const g=btns.find(b=>b.dataset.id===q.targets[k]);if(g)g.classList.add('ghint');ctl.fb('Mira este.');K.speak(q.explain)}}};

M.fill=(q,box,ctl)=>{
 let k=0;const idx=[];q.seq.forEach((a,i)=>{if(!a)idx.push(i)});
 box.innerHTML='<div class="gmodel seq">'+q.seq.map((a,i)=>'<span class="fs" data-i="'+i+'">'+(a?A(a):'<span class="gblank"></span>')+'</span>').join('')+'</div><div class="gopts c3">'+q.palette.map(o=>'<button class="gopt" data-id="'+esc(o.id)+'" aria-label="'+esc(o.art.label)+'">'+A(o.art)+'</button>').join('')+'</div>';
 const cells=qa('.fs',box),btns=qa('.gopt',box),byId=Object.fromEntries(q.palette.map(o=>[o.id,o]));
 btns.forEach(b=>b.onclick=()=>{if(ctl.st.done)return;if(b.dataset.id===q.blanks[k]){cells[idx[k]].innerHTML=A(byId[b.dataset.id].art);cells[idx[k]].classList.add('newfill');k++;sGood();if(k===q.blanks.length){btns.forEach(x=>x.disabled=true);ctl.ok()}else ctl.fb('¡Sí! Falta uno más.')}else{b.classList.add('try');setTimeout(()=>b.classList.remove('try'),600);ctl.err(pickOf(TRIES))}});
 return{hint(){const g=btns.find(b=>b.dataset.id===q.blanks[k]);if(g)g.classList.add('ghint');ctl.fb('Mira este.');K.speak(q.explain)}}};

M.dots=(q,box,ctl)=>{
 let k=0;const P=q.points;
 box.innerHTML='<div class="gdots"><svg viewBox="0 0 100 100" id="gdsvg" role="group" aria-label="Puntos para unir"><polygon id="gfill" points="" fill="#f4c345" opacity="0"/><polyline id="gline" points="" fill="none" stroke="#7260a6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'+P.map((p,i)=>'<g class="dot" data-i="'+i+'" tabindex="0" role="button" aria-label="Punto '+(i+1)+'"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="9" fill="transparent"/><circle class="dc" cx="'+p[0]+'" cy="'+p[1]+'" r="5.6" fill="#fff" stroke="#7260a6" stroke-width="1.6"/><text x="'+p[0]+'" y="'+(p[1]+.2)+'" font-size="6.6" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#4a3b78">'+(i+1)+'</text></g>').join('')+'</svg></div>';
 const dots=qa('.dot',box),line=q1('#gline',box);
 const click=d=>{if(ctl.st.done)return;const i=+d.dataset.i;if(i===k){d.classList.add('on');line.setAttribute('points',P.slice(0,k+1).map(p=>p.join(',')).join(' '));sTap();k++;if(k===P.length){line.setAttribute('points',P.concat([P[0]]).map(p=>p.join(',')).join(' '));const f=q1('#gfill',box);f.setAttribute('points',P.map(p=>p.join(',')).join(' '));f.setAttribute('opacity','.55');ctl.ok('¡Apareció '+q.name+'!')}}else ctl.err(k===0?'Empieza por el punto que tiene el número uno.':'Busca el número que sigue.')};
 dots.forEach(d=>{d.onclick=()=>click(d);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click(d)}}});
 return{hint(){const d=dots[k];if(d)d.classList.add('ghint');ctl.fb('Busca este punto.');K.speak('Sigue con el número '+NW[Math.min(k+1,10)]+'.')}}};

M.paint=(q,box,ctl)=>{
 const fill={};let k=0,color=null;
 const draw=()=>{q1('#gpaint',box).innerHTML=PAINTSVG[q.scene](fill);bind()};
 box.innerHTML='<div class="gpaintwrap"><div id="gpaint" class="gpaint"></div><div class="gside"><p class="gstep" id="gstep"></p><div class="gpal" id="gpal">'+q.palette.map(c=>'<button class="pal" data-c="'+esc(c)+'" style="--c:'+hue(c)+'" aria-label="Color '+esc(c)+'"><span>'+esc(c)+'</span></button>').join('')+'</div></div></div>';
 const step=()=>{q1('#gstep',box).textContent=k<q.steps.length?'Paso '+(k+1)+' de '+q.steps.length+': '+q.steps[k].text:''};
 function bind(){qa('.rg',box).forEach(r=>r.onclick=()=>{if(ctl.st.done)return;const reg=r.dataset.r,s=q.steps[k];if(!color){ctl.fb('Primero elige un color.');K.speak('Primero elige un color.');return}
  if(reg===s.region&&color===s.color){fill[reg]=hue(color);k++;sGood();draw();if(k===q.steps.length){ctl.ok('¡Terminaste de pintar!')}else{ctl.fb('¡Sí!');step();K.speak('Ahora. '+q.steps[k].text)}}
  else if(reg!==s.region){ctl.err('Esa es otra parte. Busca '+C.PAINT[q.scene].regions[s.region]+'.')}else{ctl.err('Ese es otro color. Busca el '+s.color+'.')}})}
 qa('.pal',box).forEach(b=>b.onclick=()=>{color=b.dataset.c;qa('.pal',box).forEach(x=>x.classList.toggle('selected',x===b));sTap();K.speak(color)});
 draw();step();
 return{hint(){const s=q.steps[k];if(!s)return;const r=qa('.rg',box).find(x=>x.dataset.r===s.region);if(r)r.classList.add('ghint');const p=qa('.pal',box).find(x=>x.dataset.c===s.color);if(p)p.classList.add('ghint');ctl.fb('Mira la parte y el color.');K.speak(s.text)}}};

M.tap=(q,box,ctl)=>{
 const svg=q.scene==='body'?bodySvg(TAPIDS,null):faceSvg(null);
 box.innerHTML='<div class="gpaint solo">'+svg+'</div>';
 const rg=qa('.rg',box);
 rg.forEach(r=>r.onclick=()=>{if(ctl.st.done)return;const id=r.dataset.r;if(id===q.answer){r.classList.add('good');ctl.ok('¡Sí! Esta es '+C.TAP[q.scene][q.answer]+'.')}else{r.classList.add('try');setTimeout(()=>r.classList.remove('try'),600);ctl.err('Esa es '+C.TAP[q.scene][id]+'. Busca '+C.TAP[q.scene][q.answer]+'.')}});
 return{hint(){const r=rg.find(x=>x.dataset.r===q.answer);if(r)r.classList.add('ghint');ctl.fb('Mira aquí.');K.speak(q.explain)}}};

M.clap=(q,box,ctl)=>{
 let n=0;const w=q.word,max=5;
 box.innerHTML='<div class="gmodel">'+A(C.h.wordArt(w))+'</div><div class="gboxes" id="gboxes">'+Array.from({length:max},()=>'<span class="gbox"></span>').join('')+'</div><div class="row center"><button class="clap" id="gclap" aria-label="Palmada">👏</button></div><div class="row center"><button class="soft" id="gclear">Borrar</button><button class="primary" id="gdone">Ya terminé</button></div>';
 const boxes=qa('.gbox',box),paint=()=>boxes.forEach((b,i)=>b.classList.toggle('on',i<n));
 const split=()=>'<span class="gsyl">'+w.parts.map(p=>'<b>'+esc(p)+'</b>').join('<i>·</i>')+'</span>';
 const say=()=>K.speak(w.parts.join(', ')+'. '+(w.syl===1?'Una palmada.':NW[w.syl]+' palmadas.'));
 q1('#gclap',box).onclick=()=>{if(ctl.st.done)return;if(n<max)n++;paint();tone(300+n*60,.09,'square',.04)};
 q1('#gclear',box).onclick=()=>{if(ctl.st.done)return;n=0;paint()};
 q1('#gdone',box).onclick=()=>{if(ctl.st.done)return;if(n===w.syl){ctl.ok('¡Sí! '+split()+' son '+(w.syl===1?'una palmada':NW[w.syl]+' palmadas')+'.');say()}else{ctl.err('Escuchemos otra vez: '+split()+'. Intenta de nuevo.');say();n=0;paint()}};
 return{hint(){ctl.fb('Escucha: '+split());say()}}};

M.recall=(q,box,ctl)=>{
 box.innerHTML='<p class="center" id="gstudy">'+esc(q.study)+'</p><div class="gmodel seq">'+q.items.map(o=>A(o.art)).join('')+'</div><div class="row center"><button class="primary" id="gseen">Ya los miré</button></div>';
 K.speak(q.study);let h2=null;
 q1('#gseen',box).onclick=()=>{
  const q2=q.mode==='order'?Object.assign({},q,{type:'order'}):Object.assign({},q,{type:'choose',model:q.mode==='missing'?q.shown.map(o=>o.art):null,row:!!q.row});
  const host=document.createElement('div');box.innerHTML='';box.appendChild(host);
  const note=document.createElement('p');note.className='center';note.innerHTML='<b>'+esc(q.prompt)+'</b>';host.before(note);K.speak(q.prompt);h2=(q.mode==='order'?M.order:M.choose)(q2,host,ctl)};
 return{hint(){if(h2){h2.hint()}else{ctl.fb('Mira con calma y toca «Ya los miré».')}}}};

const FREQ=[262,330,392,523];
M.simon=(q,box,ctl)=>{
 let pos=0,lock=true,playing=0;const cols=q.pads;
 box.innerHTML='<div class="gpads p'+cols.length+'">'+cols.map((c,i)=>'<button class="pad" data-i="'+i+'" style="--c:'+hue(c)+'" aria-label="Color '+esc(c)+'"></button>').join('')+'</div><div class="row center"><button class="soft" id="greplay">▶ Mirar otra vez</button></div>';
 const pads=qa('.pad',box);
 function flash(i,ms){pads[i].classList.add('lit');tone(FREQ[i%4],ms/1000*.9,'sine',.07);setTimeout(()=>pads[i].classList.remove('lit'),ms)}
 function play(){const my=++playing;lock=true;pos=0;ctl.fb('Mira y escucha…');let t=450;q.seq.forEach((i,j)=>{K.later(()=>{if(my===playing)flash(i,520)},t+j*850)});K.later(()=>{if(my===playing){lock=false;ctl.fb('Ahora tú. Toca los colores en el mismo orden.');K.speak('Ahora tú.')}},t+q.seq.length*850)}
 pads.forEach(p=>p.onclick=()=>{if(lock||ctl.st.done)return;const i=+p.dataset.i;flash(i,260);if(i===q.seq[pos]){pos++;if(pos===q.seq.length){lock=true;ctl.ok('¡Los repetiste en orden!')}}else{lock=true;ctl.err('Casi. Mira otra vez.');K.later(play,900)}});
 q1('#greplay',box).onclick=()=>{if(ctl.st.done)return;ctl.st.hinted=true;play()};
 K.later(play,250);
 return{hint(){ctl.st.hinted=true;play()}}};

/* ---------- vistas estáticas para «Ver ejemplos» ---------- */
const solved={
 choose:q=>(q.model?'<div class="gmodel">'+q.model.map(a=>A(a)).join('')+'</div>':'')+'<div class="gopts '+(q.row?'row':q.options.length===4?'c4':q.options.length===2?'c2':'c3')+'">'+q.options.map(o=>'<div class="gopt '+(o.id===q.answer?'good':'dim')+'">'+A(o.art)+'</div>').join('')+'</div>',
 multi:q=>'<div class="gopts multi">'+q.items.map(o=>'<div class="gopt '+(q.targets.includes(o.id)?'good':'dim')+'">'+A(o.art)+'</div>').join('')+'</div>',
 sort:q=>'<div class="gbins n'+q.bins.length+'">'+q.bins.map(b=>'<div class="gbin"><span class="bhead">'+A(b.art)+'<b>'+esc(b.label)+'</b></span><span class="bbody">'+q.items.filter(i=>i.bin===b.id).map(i=>'<span class="gplaced">'+A(i.art)+'</span>').join('')+'</span></div>').join('')+'</div>',
 match:q=>'<div class="gpairs">'+q.pairs.map((p,i)=>'<div class="gpair" style="--pc:'+PCOLS[i%5]+'">'+A(p.l)+'<i>↔</i>'+A(p.r)+'</div>').join('')+'</div>',
 order:q=>'<div class="gslots">'+q.items.map((o,i)=>'<span class="gslot filled">'+A(o.art)+'</span>'+(i<q.items.length-1?'<i class="garrow">›</i>':'')).join('')+'</div>',
 put:q=>'<div class="gmodel">'+(q.model||[]).map(a=>A(a)).join('')+'</div><div class="gbasket"><span class="bl">canasta</span><span class="bitems">'+Array.from({length:q.target},()=>'<span class="gitem">'+q.item+'</span>').join('')+'</span></div>',
 place:q=>'<div class="gmodel"><svg class="gscene" viewBox="0 0 240 160" role="img" aria-label="Escena resuelta">'+zoneDraw(q,q.rel)+'</svg></div>',
 follow:q=>'<div class="gopts c3 board">'+q.board.map(o=>'<div class="gopt '+(q.targets.includes(o.id)?'good':'dim')+'">'+A(o.art)+(q.targets.includes(o.id)?'<small class="ord">'+(q.targets.indexOf(o.id)===0?'primero':'después')+'</small>':'')+'</div>').join('')+'</div>',
 fill:q=>{const f=q.seq.slice(),idx=[];f.forEach((a,i)=>{if(!a)idx.push(i)});const pal=Object.fromEntries(q.palette.map(o=>[o.id,o.art]));idx.forEach((i,j)=>f[i]=pal[q.blanks[j]]);return '<div class="gmodel seq">'+f.map((a,i)=>'<span class="'+(idx.includes(i)?'newfill':'')+'">'+A(a)+'</span>').join('')+'</div>'},
 dots:q=>'<div class="gdots"><svg viewBox="0 0 100 100"><polygon points="'+q.points.map(p=>p.join(',')).join(' ')+'" fill="#f4c345" opacity=".55" stroke="#7260a6" stroke-width="2.4" stroke-linejoin="round"/>'+q.points.map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5.6" fill="#fff" stroke="#7260a6" stroke-width="1.6"/><text x="'+p[0]+'" y="'+(p[1]+.2)+'" font-size="6.6" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#4a3b78">'+(i+1)+'</text>').join('')+'</svg></div>',
 paint:q=>{const f={};q.steps.forEach(s=>f[s.region]=hue(s.color));return '<div class="gpaint solo">'+PAINTSVG[q.scene](f)+'</div>'},
 tap:q=>'<div class="gpaint solo">'+(q.scene==='body'?bodySvg(TAPIDS,null,q.answer):faceSvg(q.answer))+'</div>',
 clap:q=>'<div class="gmodel">'+A(C.h.wordArt(q.word))+'</div><div class="gboxes">'+q.word.parts.map(()=>'<span class="gbox on"></span>').join('')+'</div><p class="center"><span class="gsyl">'+q.word.parts.map(p=>'<b>'+esc(p)+'</b>').join('<i>·</i>')+'</span></p>',
 recall:q=>q.mode==='order'?'<div class="gmodel seq">'+q.items.map(o=>A(o.art)).join('')+'</div><p class="center small">Después se vuelven a poner en el mismo orden.</p>':'<div class="gmodel seq">'+q.items.map(o=>A(o.art)).join('')+'</div><p class="center small">'+(q.mode==='missing'?'Después se esconde uno:':'Después cambia uno:')+'</p><div class="gmodel seq">'+q.shown.map(o=>'<span class="'+(o.id===q.answer?'newfill':'')+'">'+A(o.art)+'</span>').join('')+(q.mode==='missing'?'<span class="gblank"></span>':'')+'</div>',
 simon:q=>'<div class="gmodel seq">'+q.seq.map(i=>'<span class="gsw" style="--c:'+hue(q.pads[i])+'"></span>').join('')+'</div>'};

/* ---------- progreso guardado ---------- */
function gdata(){const s=S();s.games=s.games||{skills:{},mixed:null};s.games.skills=s.games.skills||{};return s.games}
function saveResult(id,res){const g=gdata(),o=g.skills[id]||{runs:0,best:0,ind:0,sup:0,last:null};o.runs++;o.ind+=res.ind;o.sup+=res.sup;o.last={ok:res.ok,of:res.of};o.best=Math.max(o.best,res.ok);o.ts=Date.now();g.skills[id]=o;K.save()}

/* ---------- corredor de 5 fases ---------- */
const PH=[['learn','💡','Aprendo'],['examples','👀','Ejemplos'],['practice','✋','Practico'],['reinforce','🔁','Refuerzo'],['check','⭐','Compruebo']];
function stepper(cur){const ci=PH.findIndex(x=>x[0]===cur);return '<ol class="phases" aria-label="Pasos de la actividad">'+PH.map(([k,e,l],i)=>'<li class="'+(i===ci?'on':i<ci?'done':'')+'"'+(i===ci?' aria-current="step"':'')+'><i aria-hidden="true">'+e+'</i><span>'+l+'</span></li>').join('')+'</ol>'}
let run=null;
const view=(mod)=>'g:'+mod;
function ctxNow(){return C.ctxFrom(E,S(),new Date())}

function openModule(id){
 run=null;const mod=C.modules.find(m=>m.id===id),sk=C.skillsOf(id),g=gdata().skills,first=sk.find(s=>!g[s.id]);
 K.page(K.head(mod.title,K.home,'Ruta')+'<div class="gmodhead" style="--bg:'+mod.bg+'"><span class="gmodicon" aria-hidden="true">'+mod.icon+'</span><p>'+esc(mod.blurb)+'. Cada juego tiene cinco pasos: aprendo, veo ejemplos, practico, refuerzo y compruebo.</p></div><div class="gskills">'+sk.map(s=>{const r=g[s.id],st=r?'<small class="stat">'+(r.last.ok===r.last.of?'⭐ ':'')+'Comprobación: '+r.last.ok+' de '+r.last.of+' sin ayuda</small>':'<small class="stat new">'+(s===first?'Empieza aquí':'Nuevo')+'</small>';return '<button class="gskill'+(s===first?' first':'')+'" data-skill="'+s.id+'"><span class="sk-i" aria-hidden="true">'+s.icon+'</span><span class="sk-t"><strong>'+esc(s.title)+'</strong><small>'+esc(s.blurb)+'</small>'+st+'</span></button>'}).join('')+'</div>',view(id));
 K.bindBack(K.home);qa('[data-skill]').forEach(b=>b.onclick=()=>openSkill(b.dataset.skill))}

function openSkill(id){
 const sk=C.byId[id],ctx=ctxNow();
 if(sk.available&&!sk.available(ctx)){nameScreen(sk);return}
 run={sk,ctx,sess:C.session(sk,ctx,Math.random),phase:'learn',i:0,res:{practice:[],reinforce:[],check:[]},more:false,kind:'skill'};showLearn()}
function nameScreen(sk){K.page(K.head(sk.title,()=>openModule(sk.mod),'Mi nombre')+'<div class="study"><div class="object">✏️</div><h2>¿Cómo se llama?</h2><p>Escribe el nombre del niño o de la niña para jugar con sus letras. Se guarda solo en este teléfono.</p><input id="gname" maxlength="24" aria-label="Nombre" autocomplete="off"><button class="primary" id="gnsave">Guardar y jugar</button></div>',view(sk.mod));K.bindBack(()=>openModule(sk.mod));q1('#gnsave').onclick=()=>{const v=q1('#gname').value.trim();if(v.length<2){K.notice('Escribe al menos dos letras.');return}S().name=v;K.save();openSkill(sk.id)}}

function frame(inner,label){return K.head(run.sk?run.sk.title:'Reto variado',leave,label)+stepper(run.phase)+inner}
function leave(){if(run&&run.kind==='mixed')K.home();else openModule(run.sk.mod)}

function showLearn(){
 const L=run.sess.learn;
 L.cards.forEach(c=>{if(c.observe&&!c._o){c._o=1;E.observe(S(),c.observe.area,c.observe.id)}});K.save();
 K.page(frame('<div class="study gl"><span class="eyebrow">Aprendo</span><h2>'+esc(L.title)+'</h2><p>'+esc(L.say)+'</p><div class="gcards">'+L.cards.map((c,i)=>'<button class="gcard" data-c="'+i+'" aria-label="'+esc(c.label)+'"><span class="gcarts">'+c.arts.map(a=>A(a)).join('')+'</span><small>'+esc(c.label)+'</small></button>').join('')+'</div>'+(L.adult?'<details class="gadult"><summary>Para el adulto</summary><p>'+esc(L.adult)+'</p></details>':'')+'</div><div class="row center"><button class="soft" id="ghear">♫ Escuchar</button><button class="primary" id="gnext">Ver ejemplos →</button></div>','Aprendo'),view(run.sk.mod));
 K.bindBack(leave);qa('.gcard').forEach(b=>b.onclick=()=>{const c=L.cards[+b.dataset.c];b.classList.add('on');K.speak(c.say||c.label)});
 q1('#ghear').onclick=()=>K.speak(L.say);q1('#gnext').onclick=()=>{run.phase='examples';run.i=0;showExample()};K.speak(L.say)}

function showExample(){
 const q=run.sess.examples[run.i],n=run.sess.examples.length;
 K.page(frame('<div class="gq"><span class="eyebrow">Mira cómo se hace</span><h2 class="gprompt">'+esc(q.prompt)+'</h2>'+(solved[q.type]?solved[q.type](q):'')+'<p class="gexplain" id="gex">'+esc(q.explain)+'</p></div><div class="row center"><button class="soft" id="ghear">♫ Escuchar el ejemplo</button><button class="primary" id="gnext">'+(run.i+1<n?'Otro ejemplo →':'Ahora yo →')+'</button></div>','Ejemplo '+(run.i+1)+' de '+n),view(run.sk.mod));
 K.bindBack(leave);q1('#ghear').onclick=()=>K.speak(q.explain);q1('#gnext').onclick=()=>{if(run.i+1<n){run.i++;showExample()}else{run.phase='practice';run.i=0;showQuestion()}};K.speak(q.prompt+' '+q.explain)}

function listFor(ph){return run.sess[ph]}
function showQuestion(){
 const ph=run.phase,list=listFor(ph),q=list[run.i],label=({practice:'Practico',reinforce:'Refuerzo',check:'Compruebo'})[ph]+' '+(run.i+1)+' de '+list.length;
 K.page(frame('<div class="gq"><h2 class="gprompt" id="gprompt">'+esc(q.prompt)+'</h2><div class="row center"><button class="soft" id="ghear">♫ Escuchar</button></div><div id="gbox"></div><div class="feedback" id="gfb" aria-live="polite"></div><div class="row center">'+(ph!=='check'?'<button class="soft" id="ghint">Ver una pista</button>':'')+'<button class="primary" id="gnext" hidden>Siguiente →</button></div></div>',label),view(run.sk?run.sk.mod:'mixed'));
 window.__gq=q;K.bindBack(leave);
 const hearText=q.say||q.prompt;q1('#ghear').onclick=()=>K.speak(hearText);
 const st={errors:0,hinted:false,done:false};
 const ctl={st,fb:h=>{const f=q1('#gfb');if(f)f.innerHTML=h},
  err(m){st.errors++;sBad();if(m){ctl.fb(m);K.speak(plain(m))}},
  ok(m){if(st.done)return;st.done=true;sGood();const assisted=st.errors>0||st.hinted,msg=m||(assisted?'¡Lo encontramos juntos!':pickOf(GOODS));ctl.fb(msg);K.speak(plain(msg));const h=q1('#ghint');if(h)h.hidden=true;q1('#gnext').hidden=false;(run.res[ph]=run.res[ph]||[]).push({ok:!assisted,fmt:q.fmt});const nb=q1('#gnext');if(nb&&nb.scrollIntoView)nb.scrollIntoView({block:'nearest',behavior:'smooth'})}};
 const h=M[q.type](q,q1('#gbox'),ctl);
 if(ph!=='check'){q1('#ghint').onclick=()=>{if(st.done)return;st.hinted=true;h.hint()}}
 q1('#gnext').onclick=()=>advance();
 if(q.type!=='recall'&&q.type!=='simon')K.speak(hearText)}

function advance(){
 const ph=run.phase,list=listFor(ph);
 if(run.i+1<list.length){run.i++;showQuestion();return}
 if(ph==='practice'){
  const miss=run.res.practice.filter(r=>!r.ok);
  if(miss.length&&!run.more){run.more=true;run.sess.reinforce.push(run.sess.more(miss[0].fmt))}
  run.phase='reinforce';run.i=0;showQuestion();return}
 if(ph==='reinforce'){run.phase='check';run.i=0;showQuestion();return}
 if(ph==='check'){finish()}}

function finish(){
 const ck=run.res.check,ok=ck.filter(r=>r.ok).length,of=ck.length;
 if(run.kind==='mixed'){const g=gdata();g.mixed={ok,of,ts:Date.now()};K.save();mixedResult(ok,of);return}
 const all=[...run.res.practice,...run.res.reinforce],ind=all.filter(r=>r.ok).length+ok,sup=all.filter(r=>!r.ok).length+(of-ok);
 saveResult(run.sk.id,{ok,of,ind,sup});S().sessions=(S().sessions||0)+1;K.save();
 const msg=ok===of?'¡Lo lograste sin ayuda!':ok*2>=of?'¡Vas muy bien! Con otro rato de práctica saldrá aún mejor.':'Esto se aprende poco a poco. Repítanlo con ayuda otro día.';
 K.page(K.head(run.sk.title,leave,'Resultado')+stepper('check')+'<div class="center"><div class="result-icon">'+(ok===of?'🌟':'🌱')+'</div><span class="eyebrow">Un paso más</span><h1>'+esc(msg)+'</h1><div class="study" style="min-height:150px"><h3>Comprobación: '+ok+' de '+of+' sin ayuda</h3><p>Practicamos: '+all.filter(r=>r.ok).length+' sin ayuda y '+all.filter(r=>!r.ok).length+' con ayuda.</p><p><b>Para hacer en casa:</b> '+esc(run.sk.home)+'</p><p class="small">Esto es solo una muestra de hoy; no es una nota ni un diagnóstico.</p></div><div class="row center"><button class="primary" id="gagain">Repetir con otras preguntas</button><button class="soft" id="gmod">Otra habilidad</button></div></div>',view(run.sk.mod));
 K.bindBack(leave);q1('#gagain').onclick=()=>openSkill(run.sk.id);q1('#gmod').onclick=()=>openModule(run.sk.mod);K.speak(msg)}

/* ---------- reto variado ---------- */
function mixed(){
 const ctx=ctxNow(),g=gdata().skills,seen=C.skills.filter(s=>g[s.id]&&(!s.available||s.available(ctx))),pool=seen.length>=3?seen:C.skills.filter(s=>['contar','vocal-inicial','figuras','clasif-color','series','posiciones'].includes(s.id));
 const pick=C.sample(pool,Math.min(6,pool.length)),qs=pick.map(sk=>{const se=C.session(sk,ctx,Math.random),q=C.pick(se.check);return q});
 run={kind:'mixed',sk:null,ctx,phase:'check',i:0,res:{check:[]},sess:{check:qs},more:false};
 K.page(K.head('Reto variado',K.home,'Sin nota')+'<div class="study"><div class="object">🎲</div><h2>Un reto con cosas distintas</h2><p>'+qs.length+' preguntas de juegos que ya probó'+(seen.length>=3?'':' (o de juegos iniciales)')+'. Sin pistas; si se equivoca puede intentar otra vez.</p><p class="small">Es una muestra para ver qué recuerda; no es un examen ni un diagnóstico.</p><div class="row"><button class="primary" id="gstart">Empezar</button></div></div>','g:mixed');K.bindBack(K.home);q1('#gstart').onclick=showQuestion}
function mixedResult(ok,of){K.page(K.head('Reto variado',K.home,'Resultado')+'<div class="center"><div class="result-icon">🎲</div><h1>'+ok+' de '+of+' sin ayuda</h1><div class="study" style="min-height:120px"><p>Estas preguntas vienen de varios juegos. Las que costaron se pueden repasar en su ruta, con ayuda.</p><p class="small">Es una muestra de hoy; no es una nota.</p></div><div class="row center"><button class="primary" id="gagain">Otro reto</button><button class="soft" id="ghome">Volver al inicio</button></div></div>','g:mixed');K.bindBack(K.home);q1('#gagain').onclick=mixed;q1('#ghome').onclick=K.home}

/* ---------- informe y guía para adultos ---------- */
function report(){
 const g=gdata(),rows=C.modules.map(m=>{const sk=C.skillsOf(m.id).filter(s=>g.skills[s.id]);if(!sk.length)return '';return '<div class="report"><b>'+m.icon+' '+esc(m.title)+'</b>'+sk.map(s=>{const r=g.skills[s.id];return '<p>'+esc(s.title)+': '+r.runs+(r.runs===1?' vez':' veces')+' · última comprobación '+r.last.ok+' de '+r.last.of+' sin ayuda'+(r.last.ok*2<r.last.of?' · conviene repasar con ayuda':'')+'</p>'}).join('')+'</div>'}).join('');
 const done=C.skills.filter(s=>g.skills[s.id]),grp=f=>done.filter(s=>f(g.skills[s.id].last)).map(s=>esc(s.title)).join(', ')||'—';
 const sum=done.length?'<div class="reports"><div class="report"><b>✅ Sin ayuda en la última comprobación</b><p>'+grp(l=>l.ok===l.of)+'</p></div><div class="report"><b>🌱 En proceso</b><p>'+grp(l=>l.ok!==l.of&&l.ok*2>=l.of)+'</p></div><div class="report"><b>🤝 Conviene repasar con ayuda</b><p>'+grp(l=>l.ok*2<l.of)+'</p></div><div class="report"><b>Sin probar todavía</b><p>'+(C.skills.length-done.length)+' de '+C.skills.length+' habilidades</p></div></div>':'';
 return '<h3>Rutas de aprendizaje</h3>'+sum+(rows?'<div class="reports">'+rows+'</div>':'<p>Aún no se ha completado ninguna habilidad de las rutas.</p>')+(g.mixed?'<p>Último reto variado: '+g.mixed.ok+' de '+g.mixed.of+' sin ayuda.</p>':'')+'<p class="small">Cada habilidad tiene cinco pasos y 3 preguntas de comprobación sin pistas. «Sin ayuda» significa acierto al primer intento y sin pista. No es una nota ni un diagnóstico: unas pocas respuestas no bastan para afirmar que algo está aprendido.</p>'}
const OFF=[['Plastilina o barro','Modelar su cuerpo, un animal o una fruta (MINED p. 8).'],['Rasgado y arrugado','Rasgar papel y pegar bolitas en una tortuga o en las ventanas de un bus (MINED pp. 16–17).'],['Recortar y pegar','Buscar en revistas imágenes de la familia, de comida o de objetos y pegarlas (MINED pp. 12–13).'],['Dactilopintura','Pintar con las manos y dibujar lo que ve (MINED p. 29).'],['Canto y movimiento','Cantar los buenos días, las vocales y villancicos; bailar con música (MINED pp. 5, 12, 19 y 30).'],['Huerto o maceta','Sembrar una semilla y regarla cada día (MINED p. 30).'],['Cuentos y conversación','Comentar láminas, celebraciones familiares, normas de seguridad y derechos y deberes (MINED pp. 17, 25, 26 y 31).'],['Trazos en papel','Líneas rectas, curvas, ondas, zigzag y bucles con crayón (MINED pp. 19–20).'],['Reloj y moneda','Mirar un reloj real y monedas del país; comentar su valor (MINED pp. 28–29). Aún no está en la aplicación.'],['Símbolos patrios y nacionales','La bandera, el escudo, la flor, el ave y el árbol nacionales, con imágenes reales (MINED p. 24). Aún no está en la aplicación.']];
function offscreen(){return '<h3>Para hacer fuera de la pantalla</h3><p>Lo que más enseña a esta edad es manipular, hablar y moverse. Estas ideas siguen el Cuadernillo MINED de III Nivel:</p><div class="reports">'+OFF.map(o=>'<div class="report"><b>'+esc(o[0])+'</b><p>'+esc(o[1])+'</p></div>').join('')+'</div>'}

return{openModule,openSkill,mixed,report,offscreen,moduleOf:v=>String(v).startsWith('g:')?String(v).slice(2):null,modules:C.modules,skillCount:C.skills.length,
 skillMeta:id=>C.byId[id]};
};
})(typeof globalThis!=='undefined'?globalThis:this);
