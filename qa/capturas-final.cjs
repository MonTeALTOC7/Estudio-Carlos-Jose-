/* Capturas de la etapa final (docs/capturas/final_*.png): cinco habilidades humanas, mejoras adicionales,
   invitación de instalación contextual, aviso de actualización y encabezado sin «Instalar».
   Uso: node qa/capturas-final.cjs [--out=docs/capturas] [--viewport=390x844]
   Son capturas de Chromium emulado (no de la tablet física). La invitación y el aviso usan los mismos eventos simulados que qa/pwa-smoke.cjs. */
const {chromium}=require('playwright');const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const serve=require('./serve.cjs');const {solve,sleep}=require('./solver.cjs');
const arg=(n,d)=>{const a=process.argv.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d};
const OUT=path.resolve(arg('out',path.join(__dirname,'..','docs','capturas'))),[W,H]=arg('viewport','390x844').split('x').map(Number),tag='_'+W;
fs.mkdirSync(OUT,{recursive:true});
const STUB="window.SpeechSynthesisUtterance=function(t){this.text=t};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){setTimeout(()=>u.onstart&&u.onstart(),0);setTimeout(()=>u.onend&&u.onend(),30)},cancel(){},getVoices(){return[]},addEventListener(){}}});";
const copyDir=(a,b)=>{fs.mkdirSync(b,{recursive:true});for(const e of fs.readdirSync(a,{withFileTypes:true})){const s=path.join(a,e.name),d=path.join(b,e.name);e.isDirectory()?copyDir(s,d):fs.copyFileSync(s,d)}};
const hideToast=p=>p.addStyleTag({content:'#cheer,#notice{display:none!important}'});
(async()=>{const b=await chromium.launch(),sv=await serve();
 const mk=async(o)=>{const ctx=await b.newContext(Object.assign({viewport:{width:W,height:H},hasTouch:true,isMobile:W<700,serviceWorkers:'block'},o||{}));await ctx.addInitScript(STUB);const p=await ctx.newPage();p.on('pageerror',e=>console.log('PAGEERROR',e.message));await p.goto(sv.url);await p.waitForSelector('.hero5');await hideToast(p);return{ctx,p}};
 /* ---- 1 · Encabezado sin «Instalar», invitación contextual (Android/Chrome) y iPhone ---- */
 {const {ctx,p}=await mk();await p.screenshot({path:path.join(OUT,'final_encabezado_sin_instalar'+tag+'.png'),clip:{x:0,y:0,width:W,height:170}});
  await p.evaluate(()=>{window.__prompts=0;const ev=new Event('beforeinstallprompt',{cancelable:true});ev.prompt=()=>{window.__prompts++;return Promise.resolve()};ev.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(ev)});await p.waitForSelector('#pwaCard');
  await p.evaluate(()=>document.querySelector('#pwaCard').scrollIntoView({block:'center'}));await sleep(200);await p.screenshot({path:path.join(OUT,'final_instalar_contextual'+tag+'.png')});await ctx.close()}
 {const {ctx,p}=await mk({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'});
  await p.reload();await p.waitForSelector('#pwaCard');await p.evaluate(()=>document.querySelector('#pwaCard').scrollIntoView({block:'center'}));await sleep(200);await p.screenshot({path:path.join(OUT,'final_instalar_ios'+tag+'.png')});await ctx.close()}
 /* ---- 2 · Aviso de actualización (service worker real, versión «publicada» en una copia) ---- */
 {const dir=path.join(os.tmpdir(),'cj-cap-'+Date.now());copyDir(path.join(__dirname,'..','dist'),dir);const s2=await serve(0,{'/':dir});
  const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:W<700,serviceWorkers:'allow'}),p=await ctx.newPage();await ctx.addInitScript(STUB);await p.goto(s2.url);await p.waitForFunction(()=>window.appOfflineReady===true);await p.reload();await p.waitForSelector('.hero5');await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const old=await p.evaluate(()=>window.APP.build);let h=fs.readFileSync(path.join(dir,'index.html'),'utf8').replace('"build":"'+old+'"','"build":"nuevo0001"');fs.writeFileSync(path.join(dir,'index.html'),h);
  fs.writeFileSync(path.join(dir,'sw.js'),fs.readFileSync(path.join(dir,'sw.js'),'utf8').replace("const BUILD='"+old+"';","const BUILD='nuevo0001';"));
  await p.evaluate(()=>window.appReg.update());await p.waitForSelector('#updbar:not([hidden])',{timeout:15000});await hideToast(p);await sleep(300);await p.screenshot({path:path.join(OUT,'final_aviso_actualizacion'+tag+'.png')});await ctx.close();s2.srv.close()}
 /* ---- 3 · Habilidades: se recorre la sesión hasta ver cada tipo de pregunta pedido ---- */
 const open=async(p,mod,skill)=>{await p.click('[data-tab="aprender"]');await p.click('[data-mod="'+mod+'"]');await p.click('[data-skill="'+skill+'"]');await p.waitForSelector('.gcards')};
 async function run(mod,skill,wanted,learnShot){const got=new Set();
  for(let attempt=0;attempt<8&&got.size<wanted.length;attempt++){const {ctx,p}=await mk();await open(p,mod,skill);
   if(learnShot&&attempt===0){await p.screenshot({path:path.join(OUT,'final_'+skill+'_aprendo'+tag+'.png')});}
   await p.click('#gnext');
   for(let i=0;i<60;i++){const kind=await p.evaluate(()=>document.querySelector('#gprompt')?'q':document.querySelector('.gexplain')?'ex':document.querySelector('.gcards')?'learn':'?');
    if(kind==='learn'){await p.click('#gnext');continue}if(kind==='ex'){const l=(await p.textContent('#gnext')).includes('Ahora yo');await p.click('#gnext');if(l)break;continue}await sleep(60)}
   for(let k=0;k<12;k++){await p.waitForSelector('#gprompt,.clsclose,#gdone',{timeout:8000}).catch(()=>{});if(!(await p.locator('#gprompt').count()))break;const q=await p.evaluate(()=>window.__gq);
    for(const w of wanted)if(!got.has(w.id)&&w.re.test(q.prompt)&&(!w.type||w.type===q.type)){await sleep(150);await p.screenshot({path:path.join(OUT,'final_'+skill+'_'+w.id+tag+'.png')});got.add(w.id)}
    if(got.size===wanted.length)break;await solve(p,q,false);await p.waitForSelector('#gnext:not([hidden])');await p.click('#gnext');await sleep(80)}
   await ctx.close()}
  console.log(skill+': '+[...got].join(', ')+(got.size<wanted.length?' · FALTAN '+wanted.filter(w=>!got.has(w.id)).map(w=>w.id).join(','):''))}
 await run('cuerpo','emociones',[{id:'caras',re:/Toca la cara/},{id:'situacion',re:/¿Cómo se siente\?/},{id:'unir',re:/Une cada situación/}],true);
 await run('cuerpo','sentidos',[{id:'accion',re:/¿Con qué parte del cuerpo lo hace\?/},{id:'toque_cara',re:/Toca la parte de la cara/}],true);
 await run('espacio','orden-eventos',[{id:'rutina',re:/lo que hace/},{id:'cosas',re:/imágenes en orden/}],true);
 await run('espacio','izq-der',[{id:'manos',re:/Toca tu mano/}],true);
 await run('lenguaje','mi-nombre',[{id:'completo',re:/nombre completo/},{id:'grandes',re:/letras grandes/}],true);
 await run('cuerpo','seguridad',[{id:'fuego',re:/fuego o humo/},{id:'enchufe',re:/enchufe/},{id:'autocuidado',re:/manos jugando|duele la barriga|mucho sol|Ya cené/}],false);
 await run('espacio','dia-noche',[{id:'rutina',re:/en la mañana, en la tarde/}],false);
 await b.close();sv.srv.close()})().catch(e=>{console.error(e);process.exit(1)});
