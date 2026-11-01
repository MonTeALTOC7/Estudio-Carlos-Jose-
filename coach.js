/* Recomendaciones de «Mi aventura de hoy». Reglas pedagógicas explicables, sin servicios externos:
   cada sugerencia trae el motivo en lenguaje claro para el adulto. Determinista por fecha. */
(function(root){
'use strict';
const P=root.Progress||require('./progress.js');
const K={};
/* Prerrequisitos suaves: la habilidad nueva se sugiere cuando estas ya están al menos «practicando». */
K.PREREQ={'antes-despues':['contar'],'juntar':['contar'],'vocal-final':['vocal-inicial'],'mi-nombre':['vocal-inicial'],'clasif-forma':['figuras'],'colores-uso':['clasif-color'],'pintar':['colores-uso'],'series':['clasif-color'],'posiciones2':['posiciones'],'izq-der':['posiciones'],'dias-semana':['orden-eventos'],'rimas':['silabas']};
K.START=['contar','clasif-color','posiciones','partes','vocal-inicial','series'];
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0)%1000};
const lastTs=h=>h.length?h[h.length-1].ts||0:0;

/* ctx: {skills:[{id,mod,title,icon}], mods, states, recs, adventures:[{id,title,icon,skills}], adv, now, max} */
K.plan=ctx=>{
 const {skills,states,recs,adventures,adv}=ctx,now=ctx.now==null?Date.now():ctx.now,today=P.day(now),max=ctx.max||3;
 const byId=Object.fromEntries(skills.map(s=>[s.id,s]));
 const hist=id=>P.hist((recs||{})[id]);
 const doneToday=id=>hist(id).filter(e=>e.d===today).length;
 const ready=id=>(K.PREREQ[id]||[]).every(p=>!byId[p]||P.rank(states[p].state)>=2);
 const routeToday=new Set();for(const s of skills)if(doneToday(s.id))routeToday.add(s.mod);
 const anyPlayed=skills.some(s=>states[s.id].state!=='descubrir');
 const cands=[];
 const add=(c)=>{c.tie=hash(today+(c.skillId||c.advId));cands.push(c)};
 for(const s of skills){const st=states[s.id],h=hist(s.id),last=st.last,r=P.rank(st.state);
  const lastTxt=last?last.ok+' de '+last.of+' sin ayuda':'';
  if(st.state==='descubrir'){if(!ready(s.id))continue;const si=K.START.indexOf(s.id);
   add({kind:'nuevo',skillId:s.id,mod:s.mod,mode:'full',score:50+(si>=0&&!anyPlayed?40-si*3:0)-(routeToday.has(s.mod)?15:0)+(anyPlayed&&K.PREREQ[s.id]?6:0),
    reason:K.PREREQ[s.id]?'Está lista para empezar: ya practicó '+K.PREREQ[s.id].map(p=>(byId[p]||{}).title).join(' y ')+'.':(anyPlayed?'Es una habilidad nueva en una ruta distinta, para alternar áreas.':'Buen punto de partida: usa objetos y dibujos cotidianos.'),kid:'¡Vamos a descubrir algo nuevo!'});continue}
  if(r>=2&&st.repaso){add({kind:'repasar',skillId:s.id,mod:s.mod,mode:'extra',score:100,reason:'Ya la tenía bien, pero la última vez salieron '+lastTxt+'. Conviene verla otra vez con ejemplos distintos.',kid:'Vamos a mirarla otra vez con ejemplos nuevos.'});continue}
  if(st.state==='aprendiendo'){if(doneToday(s.id)>=2)continue;add({kind:'seguir',skillId:s.id,mod:s.mod,mode:'extra',score:80-(doneToday(s.id)?20:0),reason:'La última vez salieron '+lastTxt+'. Seguir practicando con ejemplos distintos ayuda a que la entienda.',kid:'¡Sigamos practicando!'});continue}
  if(st.state==='practicando'&&st.lastGoodDay!==today){add({kind:'confirmar',skillId:s.id,mod:s.mod,mode:'review',score:70,reason:'Salió bien un día ('+lastTxt+'). Falta confirmarlo en otro día para considerarla comprobada.',kid:'Veamos si te acuerdas.'});continue}
  if(r>=3&&st.sinceGood!=null&&st.sinceGood>=(st.state==='consolidacion'?10:3)){add({kind:'recordar',skillId:s.id,mod:s.mod,mode:'review',score:60,reason:'La comprobó bien hace '+st.sinceGood+' días. Un repaso corto ayuda a que se quede.',kid:'¿Te acuerdas de esto?'})}}
 for(const a of adventures){const used=a.skills.filter(i=>byId[i]),known=used.filter(i=>P.rank(states[i].state)>=1).length,rec=(adv||{})[a.id],doneBefore=rec&&rec.runs>0;
  if(used.length&&known*2>=used.length&&!(rec&&rec.ts&&P.day(rec.ts)===today))add({kind:'aventura',advId:a.id,mod:null,mode:'adv',score:doneBefore?30:55,reason:doneBefore?'Para jugar de nuevo con lo que ya conoce: '+used.slice(0,3).map(i=>byId[i].title).join(', ')+'.':'Usa habilidades que ya conoce ('+known+' de '+used.length+') en una historia.',kid:doneBefore?'¡Otra vez a la aventura!':'¡Una aventura nueva!'})}
 cands.sort((a,b)=>b.score-a.score||a.tie-b.tie);
 const out=[],mods=new Set(),kinds={};
 for(const c of cands){if(out.length>=max)break;if(c.mod&&mods.has(c.mod))continue;if(c.kind==='repasar'&&kinds.repasar>=1)continue;out.push(c);if(c.mod)mods.add(c.mod);kinds[c.kind]=(kinds[c.kind]||0)+1}
 /* Equilibrio: siempre que exista, incluir una propuesta nueva o una aventura (no solo repasos). */
 if(!out.some(c=>c.kind==='nuevo'||c.kind==='aventura')){const alt=cands.find(c=>(c.kind==='nuevo'||c.kind==='aventura')&&!out.includes(c)&&!(c.mod&&mods.has(c.mod)&&out.length>=max));
  if(alt){if(out.length>=max)out.pop();out.push(alt)}}
 return out.map(c=>Object.assign({},c,{title:c.skillId?byId[c.skillId].title:(adventures.find(a=>a.id===c.advId)||{}).title,icon:c.skillId?byId[c.skillId].icon:(adventures.find(a=>a.id===c.advId)||{}).icon}))};

/* Siguiente paso sugerido dentro del botón «Continuar» (primera recomendación). */
K.next=ctx=>K.plan(Object.assign({},ctx,{max:1}))[0]||null;
if(typeof module!=='undefined'&&module.exports)module.exports=K;root.Coach=K;
})(typeof globalThis!=='undefined'?globalThis:this);
