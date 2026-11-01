/* PWA: instalación guiada y actualizaciones seguras. Diseño completo en docs/PWA_INSTALACION_ACTUALIZACION.md.
   INSTALACIÓN: una invitación dentro de la propia pantalla «Hoy» (no modal, no tapa contenido) cuando el navegador la permite
     · Chrome/Edge/Android: evento beforeinstallprompt; prompt() solo se llama al tocar «Instalar» (acción del usuario).
     · Safari de iPhone/iPad: instrucciones de «Añadir a pantalla de inicio» (no existe API de instalación).
     · Sin API y sin instrucciones útiles: no se muestra nada inservible (la ayuda queda en Ajustes).
     · Ya instalada (modo standalone) o «Ahora no» reciente: no se muestra. Nunca se piden permisos de notificaciones.
   ACTUALIZACIÓN: el service worker nuevo se descarga y queda en espera; solo se activa si el adulto lo pide y es seguro.
     Se verifica tras recargar, no hay recarga en bucle y un fallo conserva la versión que funciona y todos los datos. */
(function(root){
'use strict';
root.PwaUI=function(K,Sh){
 const $=K.$,esc=K.escape,APPI=root.APP||{channel:'producción',version:'0',build:'dev'},S=()=>K.state();
 const secure=location.protocol==='https:'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
 const DAY=86400000,COOLDOWN=[7,21,60];                     // días antes de volver a invitar tras el 1.º, 2.º y siguientes «Ahora no»
 const st=()=>{const s=S();s.pwa=s.pwa&&typeof s.pwa==='object'?s.pwa:{};s.pwa.inst=s.pwa.inst||{d:[]};s.pwa.inst.d=s.pwa.inst.d||[];s.pwa.upd=s.pwa.upd||{};return s.pwa};
 const name=APPI.channel==='prueba'?'Centro de Estudios Carlos José · PRUEBA':'Centro de Estudios Carlos José';
 /* ================= INSTALACIÓN ================= */
 let deferred=null,installing=false;
 const mq=q=>{try{return root.matchMedia&&root.matchMedia(q).matches}catch(e){return false}};
 const isStandalone=()=>mq('(display-mode: standalone)')||mq('(display-mode: fullscreen)')||mq('(display-mode: minimal-ui)')||navigator.standalone===true||/^android-app:\/\//.test(document.referrer||'');
 const ua=navigator.userAgent||'',isIOS=()=>/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&(navigator.maxTouchPoints||0)>1);
 const iosSafari=()=>isIOS()&&!/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
 function installMode(){if(isStandalone())return'instalada';if(deferred)return'nativa';if(isIOS())return'ios';return'ninguna'}
 function cooling(){const d=st().inst.d;if(!d.length)return false;const days=COOLDOWN[Math.min(d.length,COOLDOWN.length)-1];return Date.now()-d[d.length-1]<days*DAY}
 const pendingInstall=()=>{const p=st().inst.pending;return !!p&&Date.now()-p<DAY};   // aceptó el diálogo del sistema hace poco: la instalación está en curso
 const canInvite=()=>{const m=installMode();return(m==='nativa'||m==='ios')&&!cooling()&&!st().inst.at&&!pendingInstall()};
 function postpone(){const i=st().inst;i.d.push(Date.now());if(i.d.length>6)i.d.shift();K.save()}
 function offlineLine(){return root.appOfflineReady?'Ya está lista para usarse sin conexión.':'Se está preparando para usarse sin conexión.'}

 /* ================= VENTANA MODAL (instalación, actualización y avisos) =================
    Un <dialog> nativo abierto con showModal(): capa superior, fondo oscurecido, el resto de la página queda inerte (foco atrapado),
    Esc cierra, el foco vuelve a donde estaba y el desplazamiento del fondo se bloquea. Solo existe uno a la vez. */
 let dlg=null,kind=null,lastFocus=null,activePtr=0;
 const lock=on=>{document.documentElement.classList.toggle('pwa-lock',!!on)};
 function ensureDlg(){if(dlg)return dlg;dlg=document.createElement('dialog');dlg.id='pwaModal';dlg.className='pwamodal';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-labelledby','pmT');dlg.setAttribute('aria-describedby','pmP');document.body.appendChild(dlg);
  dlg.addEventListener('cancel',e=>{e.preventDefault();if(applying)return;const no=dlg.querySelector('#pwaNo,#updlater');if(no)no.click()});   // Esc = la opción secundaria; nunca queda bloqueado
  dlg.addEventListener('close',()=>{lock(false);kind=null;setTimeout(refresh,0)});return dlg}
 function openModal(k,o){const d=ensureDlg();kind=k;
  d.dataset.kind=k;d.innerHTML='<div class="pm-band"><img class="pm-icon" src="icon-192.png" alt="" width="96" height="96"></div><div class="pm-body"><h2 id="pmT">'+o.title+'</h2><p id="pmP">'+o.text+'</p>'+(o.extra||'')+'<div class="pm-actions">'+o.buttons+'</div></div>';
  lastFocus=document.activeElement;lock(true);if(!d.open)d.showModal();const f=d.querySelector('[autofocus]')||d.querySelector('button');if(f)f.focus();return d}
 function closeModal(){lock(false);if(dlg&&dlg.open)dlg.close();kind=null}
 /* ---- instalación ---- */
 function installModal(){const m=installMode(),ios=m==='ios';
  const T='¡Instala '+esc(name)+'!';
  if(ios)return openModal('install-ios',{title:T,text:'Para tenerla en tu pantalla de inicio, incluso sin conexión:',extra:'<ol class="pm-steps"><li>Toca <b>Compartir</b> <span aria-hidden="true">⬆️</span> en la barra de Safari.</li><li>Elige <b>«Añadir a pantalla de inicio»</b>.</li><li>Toca <b>«Añadir»</b>.</li></ol>'+(iosSafari()?'':'<p class="pm-note">Si no ves la opción, abre esta página en Safari.</p>'),buttons:'<button class="primary xl" id="pwaOk" autofocus>Entendido</button><button class="soft" id="pwaNo">Ahora no</button>'});
  return openModal('install',{title:T,text:'Aprende y juega desde tu pantalla de inicio, incluso sin conexión.',buttons:'<button class="primary xl" id="pwaGo" autofocus>Instalar aplicación</button><button class="soft" id="pwaNo">Ahora no</button>'})}
 function bindInstall(){const go=$('#pwaGo'),no=$('#pwaNo'),ok=$('#pwaOk');
  const later=()=>{postpone();closeModal()};
  if(no)no.onclick=later;if(ok)ok.onclick=later;
  if(go)go.onclick=async()=>{const ev=deferred;if(!ev||installing)return;installing=true;deferred=null;go.disabled=true;               // el evento solo sirve una vez y solo tras este toque
   try{await ev.prompt();const r=await ev.userChoice;
    if(r&&r.outcome==='accepted'){const i=st().inst;i.pending=Date.now();K.save();closeModal();K.notice('Instalando… cuando termine aparecerá en tu pantalla de inicio.')}   // aceptar NO es haber instalado: eso lo confirma «appinstalled»
    else{postpone();closeModal();K.notice('Está bien, puedes instalarla más adelante desde Ajustes.')}}
   catch(e){closeModal();K.notice('No se pudo abrir la instalación. Prueba desde Ajustes.')}finally{installing=false}}}
 root.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;refresh();rerenderSettings()});
 root.addEventListener('appinstalled',()=>{deferred=null;installing=false;const i=st().inst;i.at=Date.now();delete i.pending;K.save();if(kind&&/^install/.test(kind))closeModal();K.notice('¡Listo! Ya está instalada.');rerenderSettings()});
 /* Ningún toque ni arrastre en curso: no se abre nada encima de un dedo */
 document.addEventListener('pointerdown',()=>{activePtr++},true);const pu=()=>{activePtr=Math.max(0,activePtr-1)};document.addEventListener('pointerup',pu,true);document.addEventListener('pointercancel',pu,true);
 const calm=()=>hubNow()&&activePtr===0&&!($('#dialog')&&$('#dialog').open)&&!(dlg&&dlg.open)&&!document.querySelector('#drawing');
 /* ================= ACTUALIZACIÓN ================= */
 let reg=null,pend=null,applying=false,deferredThisSession=false,classEnded=false,lastCheck=0;
 const swc=()=>navigator.serviceWorker&&navigator.serviceWorker.controller;
 function getInfo(w){return new Promise(res=>{if(!w)return res(null);try{const ch=new MessageChannel();ch.port1.onmessage=e=>res(e.data||null);w.postMessage({type:'GET_INFO'},[ch.port2]);setTimeout(()=>res(null),1500)}catch(e){res(null)}})}
 const hubNow=()=>{const a=$('#app');return !!a&&a.dataset.mode==='hub'&&!(K.course&&K.course.active())};
 function setPending(w){if(!w||!swc())return;getInfo(w).then(info=>{
  /* Si la página ya es la versión nueva (se recargó con red y el service worker viejo seguía activo) basta activar la copia sin conexión en silencio: no hace falta avisar ni recargar. */
  pend={worker:w,build:info&&info.build,version:info&&info.version};
  if(info&&info.build===APPI.build){pend.silent=true;silentWhenSafe()}else{refresh()}rerenderSettings()})}
 function silentWhenSafe(){if(!pend||!pend.silent)return;if(hubNow()){try{sessionStorage.setItem('cj_silent','1')}catch(e){}pend.worker.postMessage({type:'SKIP_WAITING'})}else setTimeout(silentWhenSafe,15000)}
 function track(r){reg=r;root.appReg=r;
  if(r.waiting&&swc())setPending(r.waiting);
  r.addEventListener('updatefound',()=>{const w=r.installing;if(!w)return;w.addEventListener('statechange',()=>{
   if(w.state==='installed'&&swc())setPending(w);
   if(w.state==='redundant'&&!r.waiting&&!pend){st().upd.err=Date.now();K.save();if(applying)failApply('No se pudo descargar la versión nueva. Seguimos con la actual.')}})})}
 function check(force){if(!reg||!navigator.onLine)return Promise.resolve();const n=Date.now();if(!force&&n-lastCheck<20*60e3)return Promise.resolve();lastCheck=n;return reg.update().catch(()=>{})}
 /* Barra de aviso: solo en las pantallas de navegación (no durante clases ni actividades) y respetando «Después de mi clase». */
 /* Un único punto de decisión. Instalación: al entrar, en cuanto el navegador la permita. Actualización: solo con la versión descargada y un momento seguro (nunca en clase, trazo, arrastre o juego). */
 function refresh(){if(!calm())return;
  if(canInvite()){installModal();bindInstall();return}
  const show=!!pend&&!pend.silent&&!applying&&(!deferredThisSession||classEnded)&&st().upd.applied!==pend.build;
  if(show){deferredThisSession=false;classEnded=false;updateModal()}}
 function updateModal(){openModal('update',{title:'Hay una nueva versión de Carlos José',text:'<span id="updtxt">Tu avance y tu clase se conservan'+(pend&&pend.version&&pend.version!==APPI.version?' (versión '+esc(pend.version)+')':'')+'.</span>',buttons:'<button class="primary xl" id="updgo" autofocus>Actualizar ahora</button><button class="soft" id="updlater">Después de mi clase</button>'});
  $('#updgo').onclick=()=>apply();$('#updlater').onclick=()=>{if(applying)return;deferredThisSession=true;classEnded=false;closeModal();K.notice('Te lo volveremos a ofrecer al terminar tu clase o al abrir la aplicación.')}}
 function showMsg(text,btn){deferredThisSession=true;classEnded=false;openModal('msg',{title:'Sobre la actualización',text:esc(text),buttons:'<button class="primary xl" id="updlater" autofocus>'+esc(btn||'Entendido')+'</button>'});$('#updlater').onclick=()=>closeModal()}
 function failApply(text){applying=false;try{sessionStorage.removeItem('cj_upd')}catch(e){}showMsg(text||'No se pudo activar la versión nueva. Seguimos con la actual; puedes intentarlo más tarde.');rerenderSettings()}
 /* Aplicar: guarda el estado, pide la activación a la versión en espera, recarga UNA sola vez y verifica. */
 async function apply(){if(applying)return;const unsafe=!hubNow()&&!$('#dialog').open;if(unsafe){K.notice('Primero vuelve a «Hoy»: así tu clase queda guardada.');return}
  if(document.querySelector('#drawing')){K.notice('Termina o borra el trazo antes de actualizar.');return}
  applying=true;K.save();refreshBusy(true);
  try{let w=pend&&pend.worker;if(!w||w.state==='redundant')w=reg&&reg.waiting;
   if(!w&&reg&&reg.installing){await new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('tiempo')),20000);reg.installing.addEventListener('statechange',function f(){if(this.state==='installed'){clearTimeout(t);ok()}else if(this.state==='redundant'){clearTimeout(t);no(new Error('redundante'))}})});w=reg.waiting}
   if(!w){if(swc()&&pend&&pend.build&&pend.build!==APPI.build){doReload();return}throw new Error('sin versión pendiente')}
   try{sessionStorage.setItem('cj_upd',JSON.stringify({from:APPI.build,to:pend&&pend.build||'',ts:Date.now()}))}catch(e){}
   let done=false;const onc=()=>{if(done)return;done=true;doReload()};navigator.serviceWorker.addEventListener('controllerchange',onc,{once:true});
   w.postMessage({type:'SKIP_WAITING'});
   setTimeout(()=>{if(!done){done=true;navigator.serviceWorker.removeEventListener('controllerchange',onc);failApply('No se pudo activar la versión nueva. Seguimos con la actual; tu avance está intacto.')}},10000)
  }catch(e){failApply(e&&e.message==='tiempo'?'La versión nueva tarda en descargarse (¿sin conexión?). Seguimos con la actual.':'No se pudo actualizar. Seguimos con la versión actual; tu avance está intacto.')}}
 function refreshBusy(on){const g=$('#updgo');if(g){g.disabled=!!on;g.textContent=on?'Actualizando…':'Actualizar ahora'}const l=$('#updlater');if(l)l.disabled=!!on}
 function doReload(){K.save();location.reload()}
 /* Tras la recarga: confirma que la versión nueva es la activa y retira el aviso; nunca recarga otra vez. */
 function verifyAfterReload(){let f=null;try{f=JSON.parse(sessionStorage.getItem('cj_upd')||'null');sessionStorage.removeItem('cj_upd')}catch(e){}
  if(!f)return;const u=st().upd;
  if(f.from!==APPI.build){u.applied=APPI.build;u.at=Date.now();delete u.err;K.save();setTimeout(()=>K.notice('Listo: ahora usas la versión '+APPI.version+'. Tu avance sigue igual.'),800)}
  else{u.failedBuild=f.to||'?';K.save();setTimeout(()=>showMsg('La actualización no cambió la versión. Seguimos con la actual; tu avance está intacto.'),800)}}
 /* ================= ARRANQUE ================= */
 function init(){verifyAfterReload();
  if(!('serviceWorker'in navigator)||!secure||root.CJ_PREVIEW)return;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{                       // sin la marca de «actualizando» o «silencioso» nunca se recarga solo
   let silent=false;try{silent=sessionStorage.getItem('cj_silent')==='1';sessionStorage.removeItem('cj_silent')}catch(e){}if(silent){pend=null;K.save();rerenderSettings();return}
   getInfo(swc()).then(i=>{if(i&&i.build&&i.build!==APPI.build&&!applying){pend={worker:null,build:i.build,version:i.version};refresh()}})});
  navigator.serviceWorker.register('./sw.js').then(r=>{track(r);check(true);return navigator.serviceWorker.ready}).then(()=>{root.appOfflineReady=true;rerenderSettings()}).catch(()=>{K.notice('No se pudo preparar el uso sin conexión. Puedes seguir jugando con internet.')});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check(false)});
  setInterval(()=>{if(!dlg||!dlg.open)refresh()},3000);                         // reintenta cuando hay algo que ofrecer y el momento ya es tranquilo
  root.addEventListener('online',()=>check(false))}
 /* ================= AJUSTES (adultos) ================= */
 function panelHTML(){const m=installMode(),u=st().upd,inst=st().inst;
  const instTxt=m==='instalada'?'Ya está abierta como aplicación instalada.':m==='nativa'?'Tu navegador permite instalarla ahora.':m==='ios'?'En iPhone/iPad: Compartir → «Añadir a pantalla de inicio».':'Tu navegador no ofrece instalación directa. En Chrome o Edge: menú ⋮ → «Instalar aplicación». En Safari de iPhone/iPad: Compartir → «Añadir a pantalla de inicio».';
  const updTxt=pend&&!pend.silent?'Hay una versión nueva descargada'+(pend.version?' ('+pend.version+')':'')+'. Se activa cuando pulses «Actualizar ahora».':(u.at?'Última actualización aplicada: '+new Date(u.at).toLocaleDateString('es')+'.':'Estás usando la versión más reciente conocida.');
  return '<h3 style="margin-top:22px">Instalación y actualización</h3><div class="pwapanel"><p class="small"><b>'+esc(name)+'</b> · versión '+esc(APPI.version)+' · build '+esc(APPI.build)+'</p><p class="small">'+esc(instTxt)+' '+esc(offlineLine())+'</p>'+
   '<div class="row">'+(m==='nativa'?'<button class="primary" id="pwaSetInstall">Instalar ahora</button>':'')+(inst.d.length&&m!=='instalada'?'<button class="soft" id="pwaReinvite">Volver a mostrar la invitación</button>':'')+'</div>'+
   '<p class="small">'+esc(updTxt)+'</p><div class="row"><button class="soft" id="pwaCheck">Buscar actualizaciones</button>'+(pend&&!pend.silent?'<button class="primary" id="pwaApply">Actualizar ahora</button>':'')+'</div><p class="small" id="pwaMsg" role="status"></p>'+
   '<p class="small">Las actualizaciones nunca borran tu avance, tus fotos ni tus respaldos. Sin conexión la aplicación sigue funcionando con la última versión descargada.</p></div>'}
 function bindPanel(){const msg=t=>{const m=$('#pwaMsg');if(m)m.textContent=t};
  const si=$('#pwaSetInstall');if(si)si.onclick=async()=>{const ev=deferred;if(!ev)return;deferred=null;try{await ev.prompt();const r=await ev.userChoice;if(r.outcome==='accepted'){st().inst.pending=Date.now();K.save();msg('Instalando…')}else{postpone();msg('Cancelaste la instalación. Puedes intentarlo cuando quieras.')}}catch(e){msg('No se pudo abrir la instalación.')}rerenderSettings()};
  const rv=$('#pwaReinvite');if(rv)rv.onclick=()=>{st().inst.d=[];K.save();msg('Volverás a ver la invitación en «Hoy».')};
  const ck=$('#pwaCheck');if(ck)ck.onclick=async()=>{if(!reg){msg('Aquí no hay service worker activo (abre la dirección HTTPS de la aplicación).');return}if(!navigator.onLine){msg('Sin conexión: se usa la última versión descargada.');return}msg('Buscando…');await check(true);setTimeout(()=>{rerenderSettings();msg(pend&&!pend.silent?'Hay una versión nueva. Pulsa «Actualizar ahora».':'Ya tienes la versión más reciente.')},1500)};
  const ap=$('#pwaApply');if(ap)ap.onclick=()=>{const d=$('#dialog');if(d&&d.open)d.close();apply()}}
 function rerenderSettings(){const p=$('.pwapanel');if(p&&p.closest('#dialogContent')){const wrap=p.parentNode.previousElementSibling&&p.parentNode;/* se repinta solo el panel */const h=document.createElement('div');h.innerHTML=panelHTML();const nw=h.querySelector('.pwapanel');if(nw){p.replaceWith(nw);bindPanel()}}}
 const noteClassEnd=()=>{classEnded=true;refresh()};
 return{init,refresh,panelHTML,bindPanel,noteClassEnd,apply,check,installMode,canInvite,state:()=>({mode:installMode(),pending:pend&&{build:pend.build,silent:!!pend.silent},applying,cooling:cooling(),deferred:!!deferred}),_testHooks:{setPending:w=>setPending(w),getReg:()=>reg}}};
})(typeof globalThis!=='undefined'?globalThis:this);
