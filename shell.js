/* Centro de Estudios Carlos José · cáscara de la aplicación (v5):
   identidad, navegación (Hoy · Aprender · Jugar · Logros), portada personalizada, logros, celebraciones.
   Las imágenes personales NO viajan en el repositorio: se cargan en el dispositivo (ver panel adulto). */
(function(root){
'use strict';
root.ShellUI=function(K,G,Adv,L){
const C=K.Content,P=root.Progress,CO=root.Coach,esc=K.escape,$=K.$,$$=K.$$,S=()=>K.state();
const DEF='Carlos José',AS=root.CJ_ASSETS||{};
const nm=()=>S().name||DEF;
const qa=(s,r)=>Array.from((r||document).querySelectorAll(s));
function st(){const s=S();s.badges=s.badges||{};s.adv=s.adv||{};s.settings=s.settings||{anim:'auto'};s.profile=s.profile||{};return s}

/* ---------- datos derivados ---------- */
const advList=()=>Adv?Adv.list.map(a=>({id:a.id,title:a.title,icon:a.icon,skills:a.skills})):[];
function snapshot(){const s=st(),now=Date.now(),recs=(s.games&&s.games.skills)||{},skills=C.skills.map(k=>({id:k.id,mod:k.mod,title:k.title,icon:k.icon})),states=P.all(skills,recs,now),advDone=Object.keys(s.adv).filter(k=>s.adv[k].runs>0).length,pts=P.points(states,advDone);return{s,now,recs,skills,states,pts,lv:P.level(pts,s.maxLevel||1),advDone}}
/* Calcula insignias y nivel. Lo ganado se conserva para siempre. */
function evaluate(silent){const sn=snapshot(),s=sn.s,bc=P.badgeCtx(sn.skills,C.modules,advList(),sn.recs,s.adv,sn.states,sn.now),ids=P.earned(bc),defs=P.allBadges(bc),fresh=ids.filter(i=>!s.badges[i]);
 fresh.forEach(i=>s.badges[i]={ts:sn.now});const prev=s.maxLevel||1;let up=null;if(sn.lv.level.n>prev){s.maxLevel=sn.lv.level.n;up=sn.lv.level}K.save();
 return silent?null:{newBadges:fresh.map(i=>defs.find(b=>b.id===i)),levelUp:up}}
function plan(max){const sn=snapshot();return CO.plan({skills:sn.skills,mods:C.modules,states:sn.states,recs:sn.recs,adventures:advList(),adv:sn.s.adv,now:sn.now,max:max||3})}

/* ---------- movimiento y confeti ---------- */
const motionOK=()=>{const a=st().settings.anim;return a==='off'?false:a==='on'?true:!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)};
const applyMotion=()=>document.body.classList.toggle('reduce-motion',!motionOK());
const COL=['#f5b13d','#e4473f','#4aa56a','#7b6cb0','#4b8fd1','#ee7fa6','#fff'];
let raf=0;
function confetti(n,ms){if(!motionOK())return;const cv=$('#confetti');if(!cv)return;const d=Math.min(root.devicePixelRatio||1,2),w=root.innerWidth,h=root.innerHeight;cv.width=w*d;cv.height=h*d;const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);
 const ps=Array.from({length:n},()=>({x:w*(.2+Math.random()*.6),y:h*.35,vx:(Math.random()-.5)*9,vy:-4-Math.random()*8,r:4+Math.random()*5,c:COL[Math.floor(Math.random()*COL.length)],a:Math.random()*6,va:(Math.random()-.5)*.4}));
 const t0=performance.now();cancelAnimationFrame(raf);
 (function f(t){const k=t-t0;x.clearRect(0,0,w,h);ps.forEach(p=>{p.vy+=.25;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.globalAlpha=Math.max(0,1-k/ms);x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()});if(k<ms)raf=requestAnimationFrame(f);else x.clearRect(0,0,w,h)})(t0)}
const CHEER=['¡Tres seguidas sin ayuda, NAME!','¡Qué bien lo haces, NAME!','¡Sigue así, NAME!','¡Eso es, NAME!'];let cheerT=0;
function cheer(){const el=$('#cheer');if(!el)return;const t=CHEER[Math.floor(Math.random()*CHEER.length)].replace('NAME',nm());el.textContent='🎉 '+t;el.classList.add('on');clearTimeout(cheerT);cheerT=setTimeout(()=>el.classList.remove('on'),1900);confetti(45,1300)}
let queue=[],showing=false;
function overlay(it){const el=$('#celebrate');let icon,title,text;
 if(it.kind==='level'){icon=it.lv.icon;title='¡Subiste de nivel!';text='¡'+nm()+', ahora eres '+it.lv.name+'!'}
 else if(it.kind==='adv'){icon=it.a.icon;title='¡Aventura completada!';text='«'+it.a.title+'»'+(it.stars?' · '+'⭐'.repeat(it.stars):'')}
 else{icon=it.b.icon;title='¡Nueva insignia!';text='«'+it.b.title+'». '+it.b.kid}
 el.innerHTML='<div class="cel-card" role="alertdialog" aria-label="'+esc(title)+'"><div class="cel-icon" aria-hidden="true">'+icon+'</div><h2>'+esc(title)+'</h2><p>'+esc(text)+'</p><button class="primary" id="celok">¡Genial!</button></div>';el.classList.add('on');
 confetti(110,2200);K.speak(title+' '+text);const close=()=>{el.classList.remove('on');el.innerHTML='';showing=false;setTimeout(nextCel,250)};$('#celok').onclick=close;$('#celok').focus();setTimeout(()=>{if(showing&&el.classList.contains('on'))close()},9000)}
function nextCel(){if(showing||!queue.length)return;showing=true;overlay(queue.shift())}
function showNew(n){if(!n)return;if(n.levelUp)queue.push({kind:'level',lv:n.levelUp});(n.newBadges||[]).filter(b=>b&&!/^nivel-/.test(b.id)).forEach(b=>queue.push({kind:'badge',b}));if(n.adv)queue.unshift({kind:'adv',a:n.adv,stars:n.stars});setTimeout(nextCel,700)}
function celebrate(o){if(o.kind==='streak')cheer()}

/* ---------- identidad: logo y personaje ---------- */
const LOGO='<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lgS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f86"/><stop offset=".55" stop-color="#e4573f"/><stop offset="1" stop-color="#f5b13d"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#lgS)"/><circle cx="32" cy="40" r="13" fill="#ffe29a"/><g stroke="#ffe29a" stroke-width="3" stroke-linecap="round"><path d="M32 17v5M17 25l3.5 3.5M47 25l-3.5 3.5M11 38h5M48 38h5"/></g><path d="M0 46h64v18H0z" fill="#2f7d4f"/><g stroke="#8fd3a0" stroke-width="2.4" stroke-linecap="round"><path d="M6 64l12-18M20 64l8-18M32 64v-18M44 64l-8-18M58 64L46 46"/></g><path d="M50 12l1.6 3.4 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff"/></svg>';
function character(o){o=o||{};const coat=o.coat!==false;
 return '<svg class="charsvg" viewBox="0 0 200 330" role="img" aria-label="'+esc(nm())+'">'+
 '<ellipse cx="100" cy="318" rx="58" ry="8" fill="#0002"/>'+
 '<path d="M68 292h26v14q0 8-8 8H66q-10 0-10-8 0-6 12-8zM106 292h26q12 2 12 8 0 8-10 8h-20q-8 0-8-8z" fill="#8d949a"/><path d="M66 296h28v6H66zM106 296h28v6h-28z" fill="#c6e03b"/>'+
 '<rect x="72" y="214" width="24" height="82" rx="10" fill="#eab98d"/><rect x="104" y="214" width="24" height="82" rx="10" fill="#eab98d"/>'+
 '<path d="M64 168h72l4 62q-38 8-80 0z" fill="#1f2d5a"/><path d="M99 172v52" stroke="#16224a" stroke-width="3"/>'+
 '<path d="M66 108q34-14 68 0l8 66H58z" fill="#e0383e"/>'+
 '<rect x="40" y="112" width="22" height="56" rx="11" fill="#eab98d" transform="rotate(10 50 114)"/>'+
 '<g transform="rotate(-150 138 118)"><rect x="127" y="112" width="22" height="56" rx="11" fill="#eab98d"/></g><circle cx="173" cy="72" r="12" fill="#eab98d"/>'+
 (coat?'<path d="M62 112q-6 6-4 70l-4 70q-1 6 5 6h28l6-136zM138 112q6 6 4 70l4 70q1 6-5 6h-28l-6-136z" fill="#f7f9fb" stroke="#cdd6df" stroke-width="2" transform="translate(0 -24) scale(1 .93)"/><path d="M92 112l8 30 8-30" fill="#e0383e"/><rect x="108" y="160" width="20" height="20" rx="3" fill="#fff" stroke="#cdd6df" stroke-width="2"/><path d="M80 110q-4 40 20 50 24-10 20-50" fill="none" stroke="#2f66c9" stroke-width="4"/><circle cx="120" cy="158" r="7" fill="#aab4be" stroke="#6b7480" stroke-width="2"/>':'')+
 '<rect x="88" y="96" width="24" height="22" rx="8" fill="#eab98d"/>'+
 '<ellipse cx="62" cy="68" rx="8" ry="11" fill="#e3ab7d"/><ellipse cx="138" cy="68" rx="8" ry="11" fill="#e3ab7d"/>'+
 '<circle cx="100" cy="64" r="42" fill="#eab98d"/>'+
 '<path d="M58 60q-2-36 40-38 44-2 46 36-14-18-30-17-22 0-34 10-10 4-22 9z" fill="#7a5436"/>'+
 '<path d="M72 54q10-3 16 0M112 54q10-3 16 0" stroke="#5e3f27" stroke-width="3.4" stroke-linecap="round" fill="none"/>'+
 '<ellipse cx="84" cy="66" rx="6" ry="7.4" fill="#2b1d17"/><ellipse cx="116" cy="66" rx="6" ry="7.4" fill="#2b1d17"/><circle cx="86" cy="63" r="2.2" fill="#fff"/><circle cx="118" cy="63" r="2.2" fill="#fff"/>'+
 '<path d="M97 74q3 6 6 0" stroke="#c98e63" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+
 '<path d="M82 84q18 18 36 0" fill="#fff" stroke="#9c4b3d" stroke-width="3" stroke-linejoin="round"/><circle cx="76" cy="80" r="6" fill="#f2937f" opacity=".45"/><circle cx="124" cy="80" r="6" fill="#f2937f" opacity=".45"/></svg>'}
/* Foto y personaje: primero lo cargado en este dispositivo; si no, recursos de la vista previa; si no, el dibujo propio. */
function avatar(kind,cls){const p=st().profile,src=kind==='face'?(p.face||AS.face):(p.hero||AS.hero);
 if(src)return '<img class="avimg av-'+kind+' '+(cls||'')+'" src="'+esc(src)+'" alt="'+esc(nm())+'">';
 return '<span class="avsvg av-'+kind+' '+(cls||'')+'">'+(kind==='face'?'<svg viewBox="40 8 120 118" role="img" aria-label="'+esc(nm())+'">'+character().replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')+'</svg>':character())+'</span>'}

/* ---------- navegación ---------- */
const TABS={hoy:'home',aprender:'aprender',jugar:'jugar',logros:'logros'};
const HUB=['home','aprender','jugar','logros'];
function mode(name){const hub=HUB.includes(name)||String(name).startsWith('gm:'),app=$('#app');if(app)app.dataset.mode=hub?'hub':'focus';
 const act=name==='home'?'hoy':name==='jugar'?'jugar':name==='logros'?'logros':'aprender';$$('[data-tab]').forEach(b=>{b.classList.toggle('on',hub&&b.dataset.tab===act);if(hub&&b.dataset.tab===act)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
const go=t=>({hoy,aprender,jugar,logros})[t]();
function bindTabs(){$$('[data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab))}
const pips=(ids,states)=>'<span class="pips" aria-hidden="true">'+ids.map(i=>'<i class="pip s-'+states[i].state+'"></i>').join('')+'</span>';
const KIND={nuevo:['✨','Nuevo'],seguir:['🌱','Seguir'],repasar:['🔁','Repasar'],confirmar:['✅','Comprobar'],recordar:['🧠','Recordar'],aventura:['🎒','Aventura']};

/* ---------- Hoy ---------- */
function startRec(r){if(r.advId)Adv.open(r.advId);else G.openSkill(r.skillId,r.mode)}
function hoy(){
 const sn=snapshot(),recs=plan(3),ri=G.resumeInfo(),advR=Adv&&Adv.resumeInfo?Adv.resumeInfo():null,res=advR||ri,lv=sn.lv,pct=lv.next?Math.round(lv.into/lv.span*100):100;
 const last=Object.entries(sn.s.badges).sort((a,b)=>b[1].ts-a[1].ts).filter(([id])=>!/^nivel-/.test(id))[0],bc=P.badgeCtx(sn.skills,C.modules,advList(),sn.recs,sn.s.adv,sn.states,sn.now),defs=P.allBadges(bc),lastB=last&&defs.find(b=>b.id===last[0]);
 const first=recs[0],contT=res?'Continuar: '+res.title:first?(first.kind==='nuevo'?'Empezar: ':'Seguir con: ')+first.title:'Explorar',contS=res?res.label:first?first.kid:'¡Elige una aventura!';
 K.page('<section class="hoy"><div class="hero5"><div class="hero5-sky" aria-hidden="true"><svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice"><circle cx="300" cy="120" r="46" fill="#ffe29a" opacity=".9"/><circle cx="300" cy="120" r="70" fill="#ffe29a" opacity=".22"/><path d="M0 150Q80 120 160 138T400 130V200H0z" fill="#3d7f55"/><path d="M0 172Q90 150 190 164T400 158V200H0z" fill="#2f6b49"/><g stroke="#8fd3a0" stroke-width="2" opacity=".5"><path d="M20 200l40-34M90 200l30-34M160 200l16-34M230 200l-6-34M300 200l-30-34M370 200l-52-34"/></g></svg></div>'+
 '<div class="hero5-text"><span class="eyebrow">Aprendo, juego y descubro</span><h1>¡Hola, '+esc(nm())+'!</h1><div class="lvl"><span class="lvl-i" aria-hidden="true">'+lv.level.icon+'</span><span><b>'+esc(lv.level.name)+'</b><small>Nivel '+lv.level.n+(lv.next?' · camino a '+esc(lv.next.name):' · ¡el más alto!')+'</small></span></div><div class="lvbar" role="img" aria-label="Camino al siguiente nivel"><i style="width:'+Math.max(6,pct)+'%"></i></div>'+
 '<div class="row hero-actions"><button class="primary xl" id="cont"><span>▶ '+esc(contT)+'</span><small>'+esc(contS)+'</small></button><button class="soft" id="greet" aria-label="Escuchar el saludo">♫</button></div></div>'+
 '<div class="hero5-char" aria-hidden="true">'+avatar('hero')+'</div></div>'+
 '<div class="section-title"><h2>Mi aventura de hoy</h2><small>Elige lo que quieras</small></div><div class="today">'+(recs.length?recs.map((r,i)=>'<button class="tcard k-'+r.kind+'" data-rec="'+i+'"><span class="tc-i" aria-hidden="true">'+r.icon+'</span><span class="tc-t"><em>'+KIND[r.kind][0]+' '+KIND[r.kind][1]+'</em><strong>'+esc(r.title)+'</strong><small>'+esc(r.kid)+'</small></span><span class="tc-go" aria-hidden="true">›</span></button>').join(''):'<p>¡Todo al día! Juega una aventura.</p>')+'</div>'+
 '<div class="section-title"><h2>Aventuras</h2><button class="linkb" id="alladv">Ver todas ›</button></div><div class="advrow">'+(Adv?Adv.list.map(a=>advCard(a,sn.s.adv[a.id])).join(''):'')+'</div>'+
 '<div class="section-title"><h2>Mi último logro</h2></div><div class="lastb">'+(lastB?'<span class="lb-i" aria-hidden="true">'+lastB.icon+'</span><span><strong>'+esc(lastB.title)+'</strong><small>'+esc(lastB.kid)+'</small></span>':'<span class="lb-i" aria-hidden="true">🌱</span><span><strong>Tus logros aparecerán aquí</strong><small>Cada habilidad que practiques te dará estrellas e insignias.</small></span>')+'<button class="soft" id="allach">Ver mis logros</button></div></section>','home');
 $('#cont').onclick=()=>{if(advR&&Adv.resume())return;if(ri&&G.resume())return;if(first)startRec(first);else jugar()};
 $('#greet').onclick=()=>K.speak('¡Hola, '+nm()+'! ¿Listo para aprender, jugar y descubrir?');
 qa('[data-rec]').forEach(b=>b.onclick=()=>startRec(recs[+b.dataset.rec]));
 $('#alladv').onclick=jugar;$('#allach').onclick=logros;bindAdv()}
function advCard(a,rec){const done=rec&&rec.runs>0,stars=rec&&rec.stars||0;return '<button class="advcard" data-adv="'+a.id+'" style="--a:'+a.color+'"><span class="adv-i" aria-hidden="true">'+a.icon+'</span><strong>'+esc(a.title)+'</strong><small>'+esc(a.blurb)+'</small><span class="adv-s">'+(done?'⭐'.repeat(stars)+'<em>Jugada</em>':'<em>Nueva</em>')+'</span></button>'}
function bindAdv(){qa('[data-adv]').forEach(b=>b.onclick=()=>Adv.open(b.dataset.adv))}

/* ---------- Aprender ---------- */
function aprender(){
 const sn=snapshot(),s=sn.s,E=K.E,basics=[['numbers','1 2 3','#f9e7c8','Números','Reconocer y contar'],['vowels','a e i','#e9e2f1','Vocales','Mirar y escuchar'],['colors','● ●','#dfeddf','Colores','Encontrar el color'],['shapes','○ ×','#f6e0d5','Figuras y X','Formas y símbolos']];
 K.page('<h1 class="pagetitle">Aprender</h1><p class="lead">Elige una ruta. Cada habilidad tiene cinco pasos: aprendo, ejemplos, practico, refuerzo y compruebo.</p><div class="section-title"><h2>Lo básico</h2><small>Paso a paso</small></div><div class="grid">'+basics.map(([a,v,bg,t,d])=>'<button class="tile" style="--bg:'+bg+'" data-area="'+a+'"><span class="arrow">↗</span><span class="symbol">'+v+'</span><h3>'+t+'</h3><small>'+d+' · '+E.active(s,a).length+' de '+E.groups[a].length+'</small></button>').join('')+'</div>'+
 '<div class="section-title"><h2>Rutas de aprendizaje</h2><small>8 rutas · '+C.skills.length+' habilidades</small></div><div class="grid routes">'+C.modules.map(m=>{const ids=C.skillsOf(m.id).map(k=>k.id),r=P.route(ids,sn.states);return '<button class="tile route" style="--bg:'+m.bg+'" data-mod="'+m.id+'"><span class="arrow">↗</span><span class="symbol">'+m.icon+'</span><h3>'+esc(m.title)+'</h3>'+pips(ids,sn.states)+'<small>'+r.descubiertas+' de '+r.total+' descubiertas'+(r.comprobadas?' · '+r.comprobadas+' ⭐':'')+(r.repaso?' · '+r.repaso+' para repasar':'')+'</small></button>'}).join('')+'</div>'+
 '<div class="section-title"><h2>Comprobar</h2><small>Sin presión</small></div><div class="row"><button class="soft" id="mixed">🎲 Reto variado</button><button class="soft" id="check">✓ Un pequeño reto</button></div>','aprender');
 qa('[data-area]').forEach(b=>b.onclick=()=>L.openArea(b.dataset.area));qa('[data-mod]').forEach(b=>b.onclick=()=>G.openModule(b.dataset.mod));$('#mixed').onclick=()=>G.mixed();$('#check').onclick=L.check}

/* ---------- Jugar ---------- */
function jugar(){
 const s=st();
 K.page('<h1 class="pagetitle">Jugar</h1><p class="lead">Aventuras con historia: ayudas, exploras y descubres.</p><div class="advgrid">'+(Adv?Adv.list.map(a=>advCard(a,s.adv[a.id])).join(''):'')+'</div><div class="section-title"><h2>Minijuegos</h2><small>Para variar</small></div><div class="extras"><button class="extra" id="relations">🎯 Relacionamos<small>Colores, animales, tamaños y series</small></button><button class="extra" id="join">🔗 Unimos parejas<small>Iguales, cantidades y vocales</small></button><button class="extra" id="draw">✎ Mi dedo dibuja<small>Círculo, X y 25 trazos</small></button><button class="extra" id="memory">🏡 Recuerdo y encuentro<small>Casas y lugares conocidos</small></button><button class="extra" id="positions">↕ Arriba, abajo, dentro y fuera<small>Posiciones con una pelota</small></button></div>','jugar');
 bindAdv();$('#relations').onclick=L.relations;$('#join').onclick=L.join;$('#draw').onclick=L.draw;$('#memory').onclick=L.memory;$('#positions').onclick=L.positions}

/* ---------- Logros ---------- */
function logros(){
 const sn=snapshot(),lv=sn.lv,bc=P.badgeCtx(sn.skills,C.modules,advList(),sn.recs,sn.s.adv,sn.states,sn.now),defs=P.allBadges(bc),have=sn.s.badges;
 const ord=defs.filter(b=>!/^nivel-/.test(b.id));
 K.page('<h1 class="pagetitle">Mis logros</h1><div class="lvcard"><span class="lvc-i" aria-hidden="true">'+lv.level.icon+'</span><div><span class="eyebrow">Nivel '+lv.level.n+'</span><h2>'+esc(lv.level.name)+'</h2><p>'+(lv.next?'Sigue descubriendo para llegar a '+esc(lv.next.name)+'.':'¡Llegaste al nivel más alto!')+'</p><div class="lvbar"><i style="width:'+(lv.next?Math.max(6,Math.round(lv.into/lv.span*100)):100)+'%"></i></div></div></div>'+
 '<div class="section-title"><h2>Insignias</h2><small>'+ord.filter(b=>have[b.id]).length+' de '+ord.length+'</small></div><div class="badges">'+ord.map(b=>have[b.id]?'<div class="badge on" title="'+esc(b.kid)+'"><span aria-hidden="true">'+b.icon+'</span><b>'+esc(b.title)+'</b></div>':'<div class="badge" title="Aún por ganar"><span aria-hidden="true">❔</span><b>'+esc(b.title)+'</b></div>').join('')+'</div>'+
 '<div class="section-title"><h2>Mis rutas</h2><small>Lo que ya descubrí</small></div><div class="routelist">'+C.modules.map(m=>{const ks=C.skillsOf(m.id),ids=ks.map(k=>k.id),r=P.route(ids,sn.states);return '<details class="rt"><summary><span class="rt-i" aria-hidden="true">'+m.icon+'</span><span class="rt-t"><strong>'+esc(m.title)+'</strong><small>'+r.descubiertas+' de '+r.total+' descubiertas · '+r.enPractica+' en práctica · '+r.comprobadas+' comprobadas'+(r.repaso?' · '+r.repaso+' para repasar':'')+'</small></span>'+pips(ids,sn.states)+'</summary><ul>'+ks.map(k=>{const x=sn.states[k.id];return '<li><span aria-hidden="true">'+k.icon+'</span><span>'+esc(k.title)+'</span><em class="st st-'+x.state+'">'+P.ICON[x.state]+' '+P.LABEL[x.state]+(x.repaso?' · repasar':'')+'</em></li>'}).join('')+'</ul></details>'}).join('')+'</div>'+
 '<p class="small">Las estrellas se ganan con comprobaciones sin ayuda en días distintos. Lo que ya ganaste no se pierde.</p>','logros')}

/* ---------- ajustes personales (panel adulto) ---------- */
function readImg(file,kind,done){const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas'),x=cv.getContext('2d');
  if(kind==='face'){const side=Math.min(im.width,im.height),sx=(im.width-side)/2,sy=Math.max(0,(im.height-side)*.15);cv.width=cv.height=480;x.drawImage(im,sx,sy,side,side,0,0,480,480);done(cv.toDataURL('image/jpeg',.82))}
  else{const r=Math.min(1,640/im.height,420/im.width);cv.width=Math.round(im.width*r);cv.height=Math.round(im.height*r);x.drawImage(im,0,0,cv.width,cv.height);done(cv.toDataURL('image/webp',.86))}};im.onerror=()=>done(null);im.src=rd.result};rd.onerror=()=>done(null);rd.readAsDataURL(file)}
function personalHTML(){const s=st(),p=s.profile;return '<h3 style="margin-top:22px">Personalización</h3><div class="persona"><div class="pa">'+avatar('face','sm')+'</div><div><p><b>Foto y personaje de '+esc(nm())+'</b></p><p class="small">Las imágenes se guardan <b>solo en este dispositivo</b> (no se suben a internet ni al repositorio). Sin imágenes, se usa un personaje dibujado.</p><label class="filebtn">Cargar foto del rostro<input type="file" accept="image/*" id="fFace" hidden></label> <label class="filebtn">Cargar personaje (PNG/WebP transparente)<input type="file" accept="image/*" id="fHero" hidden></label> <button class="soft" id="fClear">Quitar imágenes</button></div></div>'+
 '<label for="anim">Animaciones y confeti</label><select id="anim"><option value="auto" '+(s.settings.anim==='auto'?'selected':'')+'>Según el dispositivo (recomendado)</option><option value="on" '+(s.settings.anim==='on'?'selected':'')+'>Siempre</option><option value="off" '+(s.settings.anim==='off'?'selected':'')+'>Reducir (sin confeti ni movimiento)</option></select>'}
function bindPersonal(refresh){const s=st();
 const up=(id,kind,key)=>{const el=$('#'+id);if(el)el.onchange=()=>{const f=el.files&&el.files[0];if(!f)return;readImg(f,kind,u=>{if(!u){K.notice('No se pudo leer la imagen.');return}s.profile[key]=u;K.save();K.notice('Imagen guardada en este dispositivo.');refresh()})}};
 up('fFace','face','face');up('fHero','hero','hero');
 const c=$('#fClear');if(c)c.onclick=()=>{delete s.profile.face;delete s.profile.hero;K.save();refresh()};
 const a=$('#anim');if(a)a.onchange=()=>{s.settings.anim=a.value;K.save();applyMotion()}}


/* ---------- panel adulto ---------- */
const fmtD=d=>{const [y,m,dd]=String(d).split('-');return dd+'/'+m};
const bars=h=>'<span class="hist" role="img" aria-label="Últimas comprobaciones">'+h.slice(-8).map(e=>'<i class="'+(P.good(e)?'g':e.ok*2<e.of?'b':'')+'" style="height:'+(6+Math.round(e.ok/e.of*18))+'px" title="'+fmtD(e.d)+': '+e.ok+' de '+e.of+' sin ayuda"></i>').join('')+'</span>';
function adultTabs(tab){return '<h2>Para mamá o papá</h2><div class="atabs" role="tablist">'+[['resumen','Resumen'],['progreso','Progreso'],['casa','En casa'],['ajustes','Ajustes']].map(([k,l])=>'<button role="tab" data-atab="'+k+'" class="'+(k===tab?'on':'')+'" aria-selected="'+(k===tab)+'">'+l+'</button>').join('')+'</div>'}
function sessionsOf(sn){const out=[];for(const k of C.skills)for(const e of P.hist(sn.recs[k.id]))out.push({k,e});return out.sort((a,b)=>b.e.ts-a.e.ts)}
function recHTML(max){return plan(max).map(r=>'<div class="recbox"><b>'+r.icon+' '+KIND[r.kind][1]+': '+esc(r.title)+'</b><small>'+esc(r.reason)+'</small></div>').join('')||'<p>Todo al día por hoy.</p>'}
function resumen(){const sn=snapshot(),ss=sessionsOf(sn),days=new Set(ss.map(x=>x.e.d)),st=Object.values(sn.states),cnt=k=>st.filter(x=>x.state===k).length,adv=Object.keys(sn.s.adv).filter(k=>sn.s.adv[k].runs>0);
 return '<div class="persona"><div class="pa">'+avatar('face','sm')+'</div><div><h3 style="margin:0">'+esc(nm())+'</h3><p>'+sn.lv.level.icon+' Nivel '+sn.lv.level.n+': '+esc(sn.lv.level.name)+'.<br>'+ss.length+' sesiones de habilidades en '+days.size+' día'+(days.size===1?'':'s')+' distinto'+(days.size===1?'':'s')+' · '+adv.length+' de '+Adv.list.length+' aventuras jugadas.</p></div></div>'+
 '<div class="reports"><div class="report"><b>⭐ Comprobadas</b><p>'+(cnt('comprobada')+cnt('consolidacion'))+' habilidades ('+cnt('consolidacion')+' en consolidación)</p></div><div class="report"><b>🌱 En práctica</b><p>'+(cnt('aprendiendo')+cnt('practicando'))+' habilidades</p></div><div class="report"><b>🔁 Para repasar</b><p>'+st.filter(x=>x.repaso).length+' habilidades</p></div><div class="report"><b>🔍 Sin probar</b><p>'+cnt('descubrir')+' de '+C.skills.length+'</p></div></div>'+
 '<h3>Sugerido para jugar hoy</h3>'+recHTML(3)+
 '<h3>Actividad reciente</h3>'+(ss.length?'<table class="adulttbl"><thead><tr><th>Día</th><th>Habilidad</th><th>Comprobación</th><th>Errores · pistas</th></tr></thead><tbody>'+ss.slice(0,8).map(x=>'<tr><td>'+fmtD(x.e.d)+'</td><td>'+x.k.icon+' '+esc(x.k.title)+(x.e.mode&&x.e.mode!=='full'?' <small>('+(x.e.mode==='review'?'repaso corto':'ejemplos extra')+')</small>':'')+'</td><td>'+x.e.ok+' de '+x.e.of+' sin ayuda</td><td>'+(x.e.er||0)+' · '+(x.e.hn||0)+'</td></tr>').join('')+'</tbody></table>':'<p>Todavía no hay sesiones. Prueba una sugerencia de la portada.</p>')+
 '<p class="small">«Sin ayuda» significa acierto al primer intento y sin pista. Son datos observados en pocas respuestas: no son una nota, un porcentaje ni un diagnóstico, y no equivalen a un examen.</p>'}
function progreso(){const sn=snapshot();
 return '<p class="small">Cada ruta muestra el estado de sus habilidades y cómo fueron las últimas comprobaciones (barras: más alta = más respuestas sin ayuda; verde = buena).</p>'+C.modules.map(m=>{const ks=C.skillsOf(m.id),r=P.route(ks.map(k=>k.id),sn.states);
  return '<details class="rt" '+(r.descubiertas?'open':'')+'><summary><span class="rt-i">'+m.icon+'</span><span class="rt-t"><strong>'+esc(m.title)+'</strong><small>'+r.descubiertas+' de '+r.total+' descubiertas · '+r.enPractica+' en práctica · '+r.comprobadas+' comprobadas'+(r.repaso?' · '+r.repaso+' para repasar':'')+'</small></span></summary><table class="adulttbl"><thead><tr><th>Habilidad</th><th>Estado</th><th>Sesiones</th><th>Evolución</th></tr></thead><tbody>'+ks.map(k=>{const x=sn.states[k.id],rec=sn.recs[k.id],h=P.hist(rec);return '<tr><td>'+k.icon+' '+esc(k.title)+'</td><td><em class="st st-'+x.state+'">'+P.ICON[x.state]+' '+P.LABEL[x.state]+(x.repaso?' · repasar':'')+'</em>'+(x.goodDays?'<br><small>'+x.goodDays+' día'+(x.goodDays===1?'':'s')+' con comprobación buena</small>':'')+'</td><td>'+h.length+(rec?'<br><small>'+rec.ind+' sin ayuda · '+rec.sup+' con ayuda</small>':'')+'</td><td>'+(h.length?bars(h):'—')+'</td></tr>'}).join('')+'</tbody></table></details>'}).join('')+
 '<h3>Aventuras</h3><table class="adulttbl"><tbody>'+Adv.list.map(a=>{const x=sn.s.adv[a.id];return '<tr><td>'+a.icon+' '+esc(a.title)+'</td><td>'+(x?x.runs+' vez'+(x.runs===1?'':'es')+' · '+'⭐'.repeat(x.stars||0)+(x.last?' · última: '+x.last.ind+' de '+x.last.of+' sin ayuda':''):'Sin jugar')+'</td></tr>'}).join('')+'</tbody></table>'+
 '<h3>Cómo se decide cada estado</h3><ul class="small"><li><b>Por descubrir</b>: todavía no se ha jugado.</li><li><b>Aprendiendo</b>: se jugó, pero ninguna comprobación tuvo '+P.RULES.practicando+'.</li><li><b>Practicando</b>: '+P.RULES.practicando+', en un solo día.</li><li><b>Comprobada</b>: '+P.RULES.comprobada+'.</li><li><b>En consolidación</b>: '+P.RULES.consolidacion+'.</li></ul><p class="small">Una comprobación perfecta no basta. Una mala sesión no quita lo logrado: solo sugiere repasar. Los puntos de nivel salen del estado de las habilidades, no de contar partidas.</p>'}
function casa(){const sn=snapshot(),rs=plan(5).filter(r=>r.skillId),weak=C.skills.filter(k=>sn.states[k.id].repaso||sn.states[k.id].state==='aprendiendo').slice(0,5);
 return '<h3>Para esta semana</h3>'+(rs.length?rs.map(r=>'<div class="recbox"><b>'+r.icon+' '+esc(r.title)+'</b><small>'+esc(C.byId[r.skillId].home)+'</small></div>').join(''):'<p>Empiecen por una sugerencia de la portada; luego vuelvo con ideas para casa.</p>')+
 (weak.length?'<h3>Si algo cuesta</h3><p class="small">Pasen a objetos reales y a tareas más cortas, sin corregir con prisa:</p>'+weak.map(k=>'<div class="recbox"><b>'+k.icon+' '+esc(k.title)+'</b><small>'+esc(k.home)+'</small></div>').join(''):'')+
 '<h3>Sesiones y descanso</h3><p class="small">Para cinco años funciona mejor una habilidad o una aventura por sesión (5–10 minutos), acompañado, y descansar entre una y otra. Alternen pantalla con juego libre, dibujo y movimiento.</p>'+G.offscreen()}
function backupHTML(){return '<h3 style="margin-top:22px">Respaldo de avances</h3><p class="small">Los avances viven solo en este navegador (no hay cuentas ni servidores). Descarga un archivo para guardarlo o pasarlo a otro dispositivo. Las fotos no se incluyen.</p><div class="row"><button class="soft" id="bkExp">Descargar respaldo</button><label class="filebtn">Restaurar desde archivo<input type="file" accept="application/json,.json" id="bkImp" hidden></label><button class="soft" id="bkPersist">Proteger datos en este dispositivo</button></div><p class="small" id="bkMsg" role="status"></p>'}
function aboutHTML(){return '<h3 style="margin-top:22px">Acerca de</h3><p class="small"><b>Centro de Estudios Carlos José</b> · «Aprendo, juego y descubro» · By Carlos Tijerino · versión 5.0. Basado en el Cuadernillo Didáctico de III Nivel (MINED, 2021). No reproduce un examen del colegio.</p>'}
function bindBackup(){const msg=t=>{const m=$('#bkMsg');if(m)m.textContent=t};
 $('#bkExp').onclick=()=>{const data=JSON.parse(JSON.stringify(S()));delete data.resume;delete data.profile;const blob=new Blob([JSON.stringify({app:'centro-carlos-jose',v:5,exportado:Date.now(),estado:data},null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='respaldo-carlos-jose-'+P.day(Date.now())+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);msg('Respaldo descargado.')};
 $('#bkImp').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result),d=o.estado||o;if(!d||d.version!==3||typeof d.records!=='object')throw new Error('formato');if(!confirm('Esto reemplaza los avances de este dispositivo por los del archivo. ¿Continuar?'))return;const keep=S().profile;K.replaceState(Object.assign({},d,{profile:keep}));applyMotion();evaluate(true);msg('Avances restaurados.');adult('ajustes')}catch(err){msg('No se pudo leer el archivo: no parece un respaldo de esta aplicación.')}};rd.readAsText(f)};
 $('#bkPersist').onclick=async()=>{try{const ok=navigator.storage&&navigator.storage.persist?await navigator.storage.persist():false;msg(ok?'Listo: el navegador protegerá los datos de borrados automáticos.':'Este navegador no confirmó la protección. Descarga un respaldo de vez en cuando.')}catch(e){msg('No disponible en este navegador. Descarga un respaldo de vez en cuando.')}}}
function adult(tab){const d=$('#dialog'),c=$('#dialogContent');tab=tab||'resumen';
 if(tab==='ajustes'){K.legacyDash();c.insertAdjacentHTML('afterbegin',adultTabs('ajustes'));c.insertAdjacentHTML('beforeend',personalHTML()+backupHTML()+aboutHTML());bindPersonal(()=>adult('ajustes'));bindBackup()}
 else c.innerHTML=adultTabs(tab)+({resumen,progreso,casa})[tab]();
 qa('[data-atab]',c).forEach(b=>b.onclick=()=>adult(b.dataset.atab));if(!d.open)d.showModal()}

function init(){applyMotion();bindTabs();if(root.matchMedia)try{root.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',applyMotion)}catch(e){}evaluate(true)}
return{init,hoy,aprender,jugar,logros,mode,go,evaluate,showNew,celebrate,confetti,motionOK,applyMotion,avatar,character,LOGO,snapshot,plan,personalHTML,bindPersonal,advCard,bindAdv,nm,startRec,KIND,adult}
};
})(typeof globalThis!=='undefined'?globalThis:this);
