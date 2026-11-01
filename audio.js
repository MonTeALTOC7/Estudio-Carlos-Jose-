/* Audio de la aplicación: tres canales independientes y persistentes (voz, música ambiental, efectos).
   · Voz de instrucciones: automática | solo al tocar «Escuchar» | desactivada. Los botones «Escuchar» siempre funcionan salvo que el adulto desactive la voz.
   · Música ambiental: composición ORIGINAL generada por esta misma aplicación (escala pentatónica y acordes suaves con sonido tipo piano/pad,
     semilla fija). No usa archivos de audio, servicios externos ni material con licencia de terceros, y funciona sin conexión.
     No se presenta como método para aumentar la inteligencia: solo busca un ambiente agradable.
   · Efectos: tonos breves de acierto/error/toque.
   Reglas de la música: opcional, volumen bajo y ajustable, empieza solo tras un toque del usuario (política de los navegadores), baja mientras se habla,
   se calla en comprobaciones, memoria y secuencias (atención), se pausa al salir de la aplicación y nunca suenan dos pistas a la vez. */
(function(root){
'use strict';
root.AudioUI=function(K){
 const DEF={voice:{mode:'auto'},music:{mode:'clases',vol:18},fx:{on:true,vol:60}};
 const S=()=>K.state();
 function cfg(){const s=S();let a=s.audio;if(!a||typeof a!=='object'){a=s.audio=JSON.parse(JSON.stringify(DEF));if(s.sound===false){a.voice.mode='off';a.fx.on=false}}
  a.voice=Object.assign({},DEF.voice,a.voice);a.music=Object.assign({},DEF.music,a.music);a.fx=Object.assign({},DEF.fx,a.fx);return a}
 const MUSIC_MAX=1.6;                      // ganancia a volumen 100 (pico ≈ -10 dBFS); el valor por defecto (18) queda en torno a -38 dBFS RMS: suave, por debajo de la voz
 let ctx=null,bus=null,lp=null,mg=null,timer=null,unlocked=false,att=false,speaking=false,duckT=0,force=0,fxCount=0,notes=0,beat=0,nextT=0,idx=3,seed=20261101;
 const rnd=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
 function ac(){if(!ctx){const A=root.AudioContext||root.webkitAudioContext;if(!A)return null;try{ctx=new A()}catch(e){return null}}return ctx}
 function wake(){const c=ac();if(c&&c.state==='suspended'&&unlocked)c.resume().catch(()=>{});return c}

 /* ---------- efectos ---------- */
 function tone(f,d,type,vol){const a=cfg();if(!a.fx.on)return;const c=wake();if(!c||!unlocked)return;
  try{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime,v=(vol||.06)*(a.fx.vol/60);o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05);fxCount++}catch(e){}}

 /* ---------- voz ---------- */
 const voiceMode=()=>cfg().voice.mode;
 const canSpeak=tap=>{const m=voiceMode();return m==='off'?false:m==='tap'?!!tap:true};
 function duck(on){speaking=!!on;duckT=Date.now();sync()}

 /* ---------- música generativa ---------- */
 const CHORDS=[[130.81,196,261.63],[110,164.81,220],[87.31,130.81,174.61],[98,146.83,196]];  // C, Am, F, G (graves, suaves)
 const SCALE=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];                              // pentatónica de do
 function makeGraph(c){const g={c};g.mg=c.createGain();g.mg.gain.value=0;g.lp=c.createBiquadFilter();g.lp.type='lowpass';g.lp.frequency.value=1700;g.bus=c.createGain();g.bus.gain.value=1;
  const d=c.createDelay(1);d.delayTime.value=.42;const fb=c.createGain();fb.gain.value=.3;g.bus.connect(g.lp);g.bus.connect(d);d.connect(fb);fb.connect(d);d.connect(g.lp);g.lp.connect(g.mg);g.mg.connect(c.destination);return g}
 let G=null;
 function graph(){const c=ac();if(!c||G)return c;G=makeGraph(c);mg=G.mg;return c}
 function note(g,f,t,dur,gain,type,att){const c=g.c,o=c.createOscillator(),n=c.createGain();o.type=type;o.frequency.value=f;const a=att||.012;
  n.gain.setValueAtTime(.0001,t);n.gain.linearRampToValueAtTime(gain,t+a);n.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(n);n.connect(g.bus);o.start(t);o.stop(t+dur+.1);notes++}
 /* Programa las notas hasta «until» (segundos del contexto). Es la composición: acordes de pad por compás y una melodía pentatónica dispersa. */
 function schedule(g,until){const BEAT=1;while(nextT<until){const bar=Math.floor(beat/4)%CHORDS.length,b=beat%4;
   if(b===0)for(const f of CHORDS[bar])note(g,f,nextT,4.2,.05,'triangle',1.1);
   if(b===0||rnd()<.5){idx=Math.max(0,Math.min(SCALE.length-1,idx+Math.round((rnd()-.5)*3)));const f=SCALE[idx];note(g,f,nextT,2,.07,'sine',.015);note(g,f*2,nextT,.9,.012,'sine',.01)}
   beat++;nextT+=BEAT}}
 function tick(){if(!ctx||!G)return;schedule(G,ctx.currentTime+1.4)}
 /* Renderiza N segundos sin altavoz (para pruebas objetivas de la composición). No toca la reproducción en curso. */
 function renderOffline(sec,vol){const O=root.OfflineAudioContext||root.webkitOfflineAudioContext;if(!O)return Promise.resolve(null);
  const keep={beat,idx,nextT,seed,notes};beat=0;idx=3;nextT=0;seed=20261101;const off=new O(1,Math.round(44100*sec),44100),g=makeGraph(off);g.mg.gain.value=(vol==null?cfg().music.vol:vol)/100*MUSIC_MAX;schedule(g,sec);
  Object.assign({},keep);beat=keep.beat;idx=keep.idx;nextT=keep.nextT;seed=keep.seed;notes=keep.notes;return off.startRendering().then(b=>b.getChannelData(0))}
 function start(){if(timer)return;const c=graph();if(!c)return;wake();nextT=c.currentTime+.15;tick();timer=setInterval(tick,300)}
 function stopSched(){if(timer){clearInterval(timer);timer=null}}
 const wantMusic=()=>{const a=cfg().music;if(force&&Date.now()<force)return true;if(!unlocked||document.hidden||a.mode==='off')return false;return a.mode==='siempre'||(a.mode==='clases'&&!!(K.course&&K.course.active()))};
 const factor=()=>(att?0:1)*(speaking&&Date.now()-duckT<15000?.25:1);
 let stopTimer=null;
 function sync(){const want=wantMusic();
  if(want){clearTimeout(stopTimer);stopTimer=null;start();if(mg){const c=ctx,g=cfg().music.vol/100*MUSIC_MAX*factor();mg.gain.cancelScheduledValues(c.currentTime);mg.gain.setTargetAtTime(g,c.currentTime,.5)}}
  else if(mg&&timer){mg.gain.cancelScheduledValues(ctx.currentTime);mg.gain.setTargetAtTime(0,ctx.currentTime,.35);if(!stopTimer)stopTimer=setTimeout(()=>{stopTimer=null;if(!wantMusic())stopSched()},1800)}}
 function attention(on){on=!!on;if(att===on)return;att=on;sync()}
 function unlock(){if(unlocked)return;unlocked=true;wake();sync()}
 /* Pausar al salir: la pestaña oculta o la app en segundo plano detienen la música; al volver se retoma solo si corresponde. */
 root.document.addEventListener('visibilitychange',()=>{if(document.hidden){if(mg&&ctx){mg.gain.cancelScheduledValues(ctx.currentTime);mg.gain.value=0}stopSched();if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{})}else{if(ctx&&unlocked)ctx.resume().catch(()=>{});sync()}});
 root.addEventListener('pagehide',()=>{stopSched();if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{})});
 ['pointerdown','keydown','touchstart'].forEach(ev=>root.addEventListener(ev,unlock,{passive:true,once:false}));

 function testMusic(){unlock();force=Date.now()+9000;attention(false);sync();setTimeout(sync,9200)}
 function testFx(){tone(660,.12);setTimeout(()=>tone(880,.16),110)}
 function status(){return{unlocked,playing:!!timer,gain:mg?+mg.gain.value.toFixed(4):0,target:+(cfg().music.vol/100*MUSIC_MAX*factor()).toFixed(4),attention:att,speaking,ctx:ctx?ctx.state:'none',notes,fxCount,cfg:JSON.parse(JSON.stringify(cfg()))}}

 /* ---------- panel de adultos ---------- */
 const opt=(v,cur,l)=>'<option value="'+v+'"'+(v===cur?' selected':'')+'>'+l+'</option>';
 function panelHTML(){const a=cfg();return '<h3 style="margin-top:22px">Sonido</h3><p class="small">Tres controles independientes. Ya no hay botón de sonido en la pantalla del niño. Los botones «Escuchar» de las clases siguen disponibles.</p>'+
  '<div class="audiobox"><label for="auVoice">Voz de instrucciones</label><select id="auVoice">'+opt('auto',a.voice.mode,'Automática (lee cada pantalla)')+opt('tap',a.voice.mode,'Solo al tocar «Escuchar»')+opt('off',a.voice.mode,'Desactivada')+'</select><div class="row"><button class="soft" id="auVoiceTest">Probar voz</button></div>'+
  '<label for="auMusic">Música ambiental</label><select id="auMusic">'+opt('clases',a.music.mode,'Solo durante las clases')+opt('siempre',a.music.mode,'Siempre')+opt('off',a.music.mode,'Desactivada')+'</select><label for="auMusicVol">Volumen de la música (bajo recomendado)</label><input type="range" id="auMusicVol" min="0" max="60" step="2" value="'+a.music.vol+'"><div class="row"><button class="soft" id="auMusicTest">Probar música (9 s)</button></div>'+
  '<label class="chk"><input type="checkbox" id="auFx"'+(a.fx.on?' checked':'')+'> Efectos de sonido (aciertos, toques)</label><label for="auFxVol">Volumen de los efectos</label><input type="range" id="auFxVol" min="10" max="100" step="5" value="'+a.fx.vol+'"><div class="row"><button class="soft" id="auFxTest">Probar efecto</button></div>'+
  '<p class="small">La música es una composición original generada por la propia aplicación: no usa archivos, servicios externos ni material con licencia de terceros, y funciona sin conexión. Baja sola cuando se habla y se calla en las comprobaciones, memoria y secuencias. Es solo ambiente agradable; no se presenta como método para aumentar la inteligencia. En algunos teléfonos la voz depende de las voces en español instaladas.</p></div>'}
 function bindPanel(){const a=cfg(),$=id=>document.getElementById(id),save=()=>K.save();
  const v=$('auVoice');if(v)v.onchange=()=>{a.voice.mode=v.value;K.state().sound=a.voice.mode!=='off';save()};
  const m=$('auMusic');if(m)m.onchange=()=>{a.music.mode=m.value;save();sync()};
  const mv=$('auMusicVol');if(mv)mv.oninput=()=>{a.music.vol=+mv.value;save();sync()};
  const f=$('auFx');if(f)f.onchange=()=>{a.fx.on=f.checked;save()};const fv=$('auFxVol');if(fv)fv.oninput=()=>{a.fx.vol=+fv.value;save()};
  const vt=$('auVoiceTest');if(vt)vt.onclick=()=>K.speakTap('Hola, soy la voz de las instrucciones.');const mt=$('auMusicTest');if(mt)mt.onclick=testMusic;const ft=$('auFxTest');if(ft)ft.onclick=testFx}
 const api={renderOffline,cfg,tone,voiceMode,canSpeak,duck,attention,unlock,sync,status,testMusic,testFx,panelHTML,bindPanel,DEF};
 root.__cjAudio=api;return api};
})(typeof globalThis!=='undefined'?globalThis:this);
