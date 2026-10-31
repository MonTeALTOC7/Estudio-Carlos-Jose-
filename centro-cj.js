/* Centro de Estudios Carlos José · extensión v4.1. Los datos y la fotografía permanecen locales. */
(()=>{
'use strict';
const $=s=>document.querySelector(s),STORE='primerosPasos3',PHOTO='cjPhotoLocalV1',MISSIONS='cjMisionesV1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
const shuffle=a=>{const v=a.slice();for(let i=v.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[v[i],v[j]]=[v[j],v[i]]}return v};
function progress(){
 const rows=Object.values(load(STORE,{}).games?.skills||{}),attempted=rows.filter(r=>r.runs>0).length,passed=rows.filter(r=>r.best>=3).length,repeated=rows.filter(r=>(r.perfectDates||[]).length>=2).length;
 const levels=[['Primeros pasos',0,0,0],['Explorador',5,2,0],['Investigador',12,6,0],['Descubridor',24,14,4],['Gran científico',36,30,12]];
 let level=1;for(let i=1;i<levels.length;i++)if(attempted>=levels[i][1]&&passed>=levels[i][2]&&repeated>=levels[i][3])level=i+1;
 return{attempted,passed,repeated,level,name:levels[level-1][0]};
}
function celebrate(message){
 document.querySelector('.cjConfetti')?.remove();const layer=document.createElement('div');layer.className='cjConfetti';layer.setAttribute('aria-live','polite');layer.innerHTML='<div class="cjCheer">🌟 '+esc(message||'¡Buen trabajo!')+'</div>';
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<24;i++){const p=document.createElement('i');p.style.setProperty('--x',Math.floor(Math.random()*100)+'vw');p.style.setProperty('--delay',(Math.random()*.35).toFixed(2)+'s');p.style.setProperty('--dur',(1.3+Math.random()*.8).toFixed(2)+'s');p.style.setProperty('--rot',Math.floor(Math.random()*460)+'deg');p.style.background=['#eeb843','#287859','#7260a6','#df4848','#428ccc'][i%5];layer.append(p)}
 document.body.append(layer);setTimeout(()=>layer.remove(),2600);
}
window.CJCelebrate=celebrate;
function photoHTML(){
 const uri=localStorage.getItem(PHOTO);
 return '<div class="cjPhotoCard">'+(uri?'<img src="'+esc(uri)+'" alt="Fotografía de Carlos José" class="cjPhoto">':'<span aria-hidden="true" class="cjDocEmoji">👨‍⚕️</span>')+'<span class="cjDoctorLabel">🩺 ¡A descubrir el mundo!</span></div>';
}
function renderHome(){
 const main=$('#main'),hero=main?.querySelector('.hero');if(!hero||main.querySelector('#cjLearning'))return;
 const p=progress(),art=hero.querySelector('.hero-art');if(art){art.removeAttribute('aria-hidden');art.innerHTML=photoHTML()}
 hero.querySelector('.eyebrow')?.replaceChildren(document.createTextNode('Centro de Estudios Carlos José'));
 const h=hero.querySelector('h1');if(h)h.textContent='¡Aprendo, juego y descubro!';
 const box=document.createElement('section');box.id='cjLearning';box.className='cjLearning';box.setAttribute('aria-label','Niveles y juegos');
 box.innerHTML='<div class="cjLevel"><span class="cjMedal">🏅</span><div class="cjLevelInfo"><span class="eyebrow">Mi camino de aprendizaje</span><h2>Nivel '+p.level+' · '+esc(p.name)+'</h2><div class="cjMeter" role="progressbar" aria-label="Habilidades exploradas" aria-valuemin="0" aria-valuemax="40" aria-valuenow="'+p.attempted+'"><span style="width:'+Math.round(p.attempted/40*100)+'%"></span></div><p>'+p.attempted+' de 40 habilidades exploradas · '+p.passed+' con una comprobación completa · '+p.repeated+' reforzadas en días distintos.</p><small>Son etapas de práctica, no calificaciones ni diagnóstico escolar.</small></div></div><div class="cjMissionCard"><span class="cjMedal">🎮</span><div><h2>Misiones para jugar</h2><p>Minijuegos cortos de colores, números y partes del cuerpo.</p></div><button type="button" class="primary" id="cjPlay">¡Jugar!</button></div>';
 hero.insertAdjacentElement('afterend',box);$('#cjPlay').onclick=showMissions;
}
const adventure=[
 {id:'colores',icon:'🎨',title:'El maletín de colores',desc:'Encuentra los colores del maletín',items:[['rojo','🟥'],['azul','🟦'],['amarillo','🟨'],['verde','🟩']]},
 {id:'numeros',icon:'🩹',title:'Contemos las curitas',desc:'Contar del 1 al 3 para empezar',items:[['1','🩹'],['2','🩹🩹'],['3','🩹🩹🩹']]},
 {id:'cuerpo',icon:'🩺',title:'Conozco mi cuerpo',desc:'Escuchar y señalar partes del cuerpo',items:[['mano','✋'],['ojo','👁️'],['oreja','👂'],['nariz','👃']]}
];
let game=null;
function home(){($('#directHome')||$('#home'))?.click()}
function speak(t){const s=load(STORE,{});if(s.sound===false||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='es-NI';u.rate=.85;speechSynthesis.speak(u)}catch{}}
function showMissions(){
 const main=$('#main');if(!main)return;const results=load(MISSIONS,{});
 main.innerHTML='<section class="cjGame"><button class="soft" id="cjBack">← Inicio</button><span class="eyebrow">Aprender jugando</span><h1>Misiones de Carlos José</h1><p>Elige una misión. No hay reloj ni castigos por equivocarse.</p><div class="cjMissionGrid">'+adventure.map(x=>'<button class="cjMission" data-adventure="'+x.id+'"><span>'+x.icon+'</span><strong>'+x.title+'</strong><small>'+x.desc+'</small>'+(results[x.id]?'<small>Jugado '+results[x.id].runs+' veces</small>':'')+'</button>').join('')+'</div></section>';
 $('#cjBack').onclick=home;main.querySelectorAll('[data-adventure]').forEach(b=>b.onclick=()=>startGame(b.dataset.adventure));
}
function startGame(id){
 const x=adventure.find(x=>x.id===id);if(!x)return;
 const symbols=x.items.slice();game={x,symbols,index:0,ind:0,assisted:0,streak:0,wrong:false,answered:false,order:shuffle(symbols)};showExample();
}
function showExample(){
 const g=game,first=g.symbols[0];
 $('#main').innerHTML='<section class="cjGame"><button class="soft" id="cjBack">← Misiones</button><span class="eyebrow">Primero aprendemos</span><h1>'+esc(g.x.title)+'</h1><div class="study cjExample"><div class="cjSample">'+first[1]+'</div><h2>Esto es '+esc(first[0])+'.</h2><p>Mira y escucha el ejemplo antes de jugar.</p><button class="soft" id="cjHear">♫ Escuchar</button></div><button class="primary" id="cjNext">Ahora juego →</button></section>';
 $('#cjBack').onclick=showMissions;$('#cjHear').onclick=()=>speak('Esto es '+first[0]);$('#cjNext').onclick=question;speak('Esto es '+first[0]);
}
function question(){
 const g=game,k=g.index,item=g.order[k];g.wrong=false;g.answered=false;
 const choices=shuffle(g.symbols),prompt=g.x.id==='numeros'?'¿Cuántas curitas hay?':g.x.id==='cuerpo'?'¿Dónde está '+item[0]+'?':'Busca el color '+item[0];
 $('#main').innerHTML='<section class="cjGame"><button class="soft" id="cjBack">← Misiones</button><span class="eyebrow">Pregunta '+(k+1)+' de '+g.order.length+'</span><h1>'+esc(g.x.title)+'</h1><h2>'+esc(prompt)+'</h2>'+(g.x.id==='numeros'?'<div class="cjCount">'+item[1]+'</div>':'')+'<div class="cjAnswers">'+choices.map(c=>'<button class="cjAnswer" data-answer="'+esc(c[0])+'">'+(g.x.id==='numeros'?esc(c[0]):c[1])+'</button>').join('')+'</div><p class="cjFeedback" id="cjFeedback" aria-live="polite"></p><button class="primary" id="cjNext" hidden>Siguiente →</button></section>';
 $('#cjBack').onclick=showMissions;$('#cjNext').onclick=()=>{g.index++;g.index<g.order.length?question():finish()};
 $('#main').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
  if(g.answered||b.disabled)return;
  if(b.dataset.answer!==item[0]){g.wrong=true;g.streak=0;b.disabled=true;b.classList.add('try');$('#cjFeedback').textContent='Mira otra vez. ¡Puedes intentarlo!';speak('Vamos a mirar otra vez');return}
  g.answered=true;b.classList.add('good');$('#main').querySelectorAll('.cjAnswer').forEach(c=>c.disabled=true);
  if(g.wrong){g.assisted++;g.streak=0;$('#cjFeedback').textContent='¡Lo encontramos juntos!'}else{g.ind++;g.streak++;$('#cjFeedback').textContent='¡Buen trabajo!';if(g.streak===3)celebrate('¡Tres respuestas seguidas!')}
  speak($('#cjFeedback').textContent);$('#cjNext').hidden=false;
 });speak(prompt);
}
function finish(){
 const g=game,data=load(MISSIONS,{}),r=data[g.x.id]||{runs:0,best:0};r.runs++;r.best=Math.max(r.best,g.ind);r.last=g.ind;data[g.x.id]=r;try{localStorage.setItem(MISSIONS,JSON.stringify(data))}catch{}
 $('#main').innerHTML='<section class="cjGame cjFinished"><span class="cjFinishedIcon">🏆</span><h1>¡Misión completada!</h1><p>Respuestas sin ayuda: '+g.ind+' · con apoyo: '+g.assisted+'</p><p>Jugamos para aprender, no para sacar una nota.</p><button class="primary" id="cjAgain">Jugar otra vez</button><button class="soft" id="cjBack">Elegir misión</button></section>';
 $('#cjAgain').onclick=()=>startGame(g.x.id);$('#cjBack').onclick=showMissions;if(g.ind===g.order.length)celebrate('¡Misión completada!');
}
function renderAdult(){
 const panel=$('#dialogContent');if(!panel||!panel.querySelector('#settings')||panel.querySelector('#cjPhotoZone'))return;
 const section=document.createElement('section');section.id='cjPhotoZone';section.className='cjPhotoZone';
 section.innerHTML='<h3>📸 Foto de Carlos José</h3><p>Se guarda solo en este navegador; no se publica en GitHub ni se sincroniza. El marco tiene temática de médico.</p><input type="file" id="cjFile" accept="image/png,image/jpeg,image/webp"><button class="soft" id="cjRemovePhoto">Quitar foto</button><small id="cjPhotoMessage" role="status"></small>';
 panel.append(section);$('#cjRemovePhoto').onclick=()=>{localStorage.removeItem(PHOTO);$('#cjPhotoMessage').textContent='Foto eliminada de este navegador.'};
 $('#cjFile').onchange=async e=>{
  const f=e.target.files?.[0];if(!f)return;
  if(!/^image\/(png|jpeg|webp)$/.test(f.type)||f.size>10*1024*1024){$('#cjPhotoMessage').textContent='Usa JPG, PNG o WebP de hasta 10 MB.';return}
  try{
   const img=await createImageBitmap(f),cv=document.createElement('canvas');cv.width=320;cv.height=320;const ctx=cv.getContext('2d'),m=Math.min(img.width,img.height);
   ctx.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,320,320);img.close?.();localStorage.setItem(PHOTO,cv.toDataURL('image/jpeg',.72));
   $('#cjPhotoMessage').textContent='Foto guardada solamente en este dispositivo.';
  }catch{$('#cjPhotoMessage').textContent='No se pudo guardar la fotografía.'}
 };
}
const main=$('#main');if(main){new MutationObserver(renderHome).observe(main,{childList:true});renderHome()}
const panel=$('#dialogContent');if(panel)new MutationObserver(renderAdult).observe(panel,{childList:true});
})();