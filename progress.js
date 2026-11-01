/* Dominio de aprendizaje: estados por habilidad, nivel general e insignias.
   Puro y determinista (recibe «ahora»). Principio: el estado se deriva solo de COMPROBACIONES buenas
   repartidas en días distintos; una mala sesión nunca quita lo ya logrado (solo marca «repaso»).
   No se afirman capacidades: se describe lo observado. */
(function(root){
'use strict';
const P={};
const pad=n=>String(n).padStart(2,'0');
P.day=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
P.dayNum=day=>{const [y,m,d]=day.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/86400000)};
P.STATES=['descubrir','aprendiendo','practicando','comprobada','consolidacion'];
P.LABEL={descubrir:'Por descubrir',aprendiendo:'Aprendiendo',practicando:'Practicando',comprobada:'Comprobada',consolidacion:'En consolidación'};
P.ICON={descubrir:'🔍',aprendiendo:'🌱',practicando:'✋',comprobada:'⭐',consolidacion:'🌟'};
P.rank=s=>P.STATES.indexOf(s);
/* Una comprobación es buena si hay al menos 2 de cada 3 respuestas sin ayuda. */
P.good=e=>e.of>0&&e.ok*3>=e.of*2;
/* Historial de una habilidad; los registros de la v4.0 (sin historial) cuentan como una sola sesión. */
P.hist=rec=>{if(!rec)return[];if(rec.hist&&rec.hist.length)return rec.hist;return rec.last?[{d:P.day(rec.ts||0),ts:rec.ts||0,ok:rec.last.ok,of:rec.last.of,ty:[],er:0,hn:0,legacy:true}]:[]};

/* Pruebas permanentes: el historial se recorta (últimas 14 sesiones) pero lo demostrado NO se descarta.
   proof.days = días con comprobación buena; proof.types = formas de jugar con acierto sin ayuda;
   proof.active = días con actividad; proof.persever = hubo una sesión terminada con 3 errores o más.
   Solo crece, así que el estado derivado nunca baja por haber descartado registros antiguos. */
P.HIST_CAP=14;P.PROOF_CAP=120;
const uniq=(a,cap)=>{let u=[...new Set(a)].sort();if(cap&&u.length>cap)u=u.slice(0,10).concat(u.slice(-(cap-10)));return u};
P.proof=rec=>{const b=(rec&&rec.proof)||{},h=P.hist(rec),g=h.filter(P.good);
 return{days:uniq([...(b.days||[]),...g.map(e=>e.d)],P.PROOF_CAP),types:[...new Set([...(b.types||[]),...g.flatMap(e=>e.ty||[])])],active:uniq([...(b.active||[]),...h.map(e=>e.d)],P.PROOF_CAP),persever:!!b.persever||h.some(e=>(e.er||0)>=3)}};
/* Agrega una sesión al registro de una habilidad: recorta el historial sin perder las pruebas. Mutates y devuelve rec. */
P.record=(rec,entry,cap)=>{const o=rec||{},base=o.hist?o.hist.slice():P.hist(o),pr=P.proof({proof:o.proof,hist:base});
 if(P.good(entry)){pr.days=uniq(pr.days.concat(entry.d),P.PROOF_CAP);pr.types=[...new Set(pr.types.concat(entry.ty||[]))]}
 pr.active=uniq(pr.active.concat(entry.d),P.PROOF_CAP);if((entry.er||0)>=3)pr.persever=true;
 base.push(entry);o.hist=base.slice(-(cap||P.HIST_CAP));o.proof=pr;return o};

/* Reglas (también se muestran al adulto):
   Por descubrir: nunca se ha jugado.
   Aprendiendo: se jugó, pero ninguna comprobación tuvo 2 de 3 o más sin ayuda.
   Practicando: una comprobación buena en un solo día.
   Comprobada: comprobaciones buenas en 2 días distintos y con 2 tipos de juego distintos.
   En consolidación: comprobada, con comprobaciones buenas en 3 días distintos repartidos en 6 días o más. */
P.RULES={practicando:'1 comprobación con 2 de 3 o más sin ayuda',comprobada:'comprobaciones buenas en 2 días distintos y con 2 formas de jugar distintas',consolidacion:'comprobaciones buenas en 3 días distintos, repartidas en 6 días o más'};
P.skillState=(rec,nowTs)=>{
 const h=P.hist(rec),today=P.day(nowTs==null?Date.now():nowTs);
 if(!h.length)return{state:'descubrir',repaso:false,sinceGood:null,goodDays:0,types:0,sessions:0,last:null,lastGoodDay:null,lastDay:null};
 const pf=P.proof(rec),days=pf.days,types=new Set(pf.types),last=h[h.length-1];
 let state='aprendiendo';
 if(days.length>=1)state='practicando';
 if(days.length>=2&&types.size>=2)state='comprobada';
 if(state==='comprobada'&&days.length>=3&&P.dayNum(days[days.length-1])-P.dayNum(days[0])>=6)state='consolidacion';
 const lastGoodDay=days.length?days[days.length-1]:null;
 return{state,repaso:P.rank(state)>=2&&last.ok*2<last.of,sinceGood:lastGoodDay?P.dayNum(today)-P.dayNum(lastGoodDay):null,goodDays:days.length,types:types.size,sessions:Math.max(h.length,(rec&&rec.runs)||0),last,lastGoodDay,lastDay:last.d}};
P.WEIGHT={descubrir:0,aprendiendo:1,practicando:2,comprobada:4,consolidacion:6};
P.LEVELS=[{n:1,name:'Explorador',min:0,icon:'🧭'},{n:2,name:'Investigador',min:10,icon:'🔍'},{n:3,name:'Descubridor',min:35,icon:'🔭'},{n:4,name:'Gran Explorador',min:80,icon:'🏔️'},{n:5,name:'Gran Descubridor',min:140,icon:'🌟'}];
/* Puntos = peso del estado actual de cada habilidad + 3 por cada aventura completada alguna vez.
   Repetir una misma habilidad el mismo día no suma: el nivel no depende de contar clics ni partidas. */
P.points=(states,advDone)=>Object.values(states).reduce((a,s)=>a+P.WEIGHT[s.state],0)+3*(advDone||0);
P.level=(pts,storedN)=>{let cur=P.LEVELS[0];for(const L of P.LEVELS)if(pts>=L.min)cur=L;if(storedN&&storedN>cur.n)cur=P.LEVELS[storedN-1];const next=P.LEVELS[cur.n]||null;
 return{level:cur,next,into:Math.max(0,pts-cur.min),span:next?next.min-cur.min:0,remaining:next?Math.max(0,next.min-pts):0,points:pts}};

/* Resumen por ruta: cuántas habilidades hay en cada estado. No se calculan porcentajes. */
P.route=(skillIds,states)=>{const c={descubrir:0,aprendiendo:0,practicando:0,comprobada:0,consolidacion:0,repaso:0,total:skillIds.length};
 for(const id of skillIds){const s=states[id];c[s.state]++;if(s.repaso)c.repaso++}
 c.descubiertas=c.total-c.descubrir;c.enPractica=c.aprendiendo+c.practicando;c.comprobadas=c.comprobada+c.consolidacion;return c};

/* Estados de todas las habilidades a partir del registro guardado. */
P.all=(skills,recs,nowTs)=>{const out={};for(const s of skills)out[s.id]=P.skillState((recs||{})[s.id],nowTs);return out};

/* Insignias: se ganan una vez y se conservan para siempre. */
P.badgeCtx=(skills,mods,advList,recs,adv,states,nowTs)=>{
 const days=new Set(),routes=new Set();let sessions=0,persever=false,recalled=false;
 for(const s of skills){const rec=(recs||{})[s.id],h=P.hist(rec);if(!h.length)continue;routes.add(s.mod);sessions+=Math.max(h.length,(rec&&rec.runs)||0);const pf=P.proof(rec);pf.active.forEach(d=>days.add(d));if(pf.persever)persever=true;
  const gd=pf.days;if(gd.length>=2&&P.dayNum(gd[gd.length-1])-P.dayNum(gd[0])>=3)recalled=true}
 const advDone=new Set(Object.keys(adv||{}).filter(k=>adv[k].runs>0));for(const k of advDone)if(adv[k].ts)days.add(P.day(adv[k].ts));
 return{skills,mods,advList,states,routes,days,sessions,persever,recalled,advDone,pts:P.points(states,advDone.size)};};
const nS=(c,min)=>Object.values(c.states).filter(s=>P.rank(s.state)>=P.rank(min)).length;
P.BADGES=[
 {id:'primer-paso',icon:'👣',title:'Primer paso',kid:'¡Empezaste a aprender!',test:c=>c.sessions>=1},
 {id:'curioso',icon:'🔎',title:'Curioso',kid:'Probaste cuatro rutas distintas.',test:c=>c.routes.size>=4},
 {id:'volvio',icon:'🌅',title:'Volví a jugar',kid:'Volviste a jugar en otros días.',test:c=>c.days.size>=3},
 {id:'perseverante',icon:'💪',title:'Sigo intentando',kid:'Aunque costó, terminaste.',test:c=>c.persever},
 {id:'recordo',icon:'🧠',title:'¡Me acordé!',kid:'Lo recordaste días después.',test:c=>c.recalled},
 {id:'estrella-1',icon:'⭐',title:'Primera estrella',kid:'Una habilidad comprobada.',test:c=>nS(c,'comprobada')>=1},
 {id:'estrella-5',icon:'🌠',title:'Cinco estrellas',kid:'Cinco habilidades comprobadas.',test:c=>nS(c,'comprobada')>=5},
 {id:'consolidada',icon:'🌟',title:'Se quedó conmigo',kid:'Una habilidad ya consolidada.',test:c=>nS(c,'consolidacion')>=1},
 {id:'aventuras-todas',icon:'🏆',title:'Gran aventurero',kid:'Completaste todas las aventuras.',test:c=>c.advList.length>0&&c.advList.every(a=>c.advDone.has(a.id))},
 ...[2,3,4,5].map(n=>({id:'nivel-'+n,icon:P.LEVELS[n-1].icon,title:'Nivel '+P.LEVELS[n-1].name,kid:'¡Ahora eres '+P.LEVELS[n-1].name+'!',test:c=>c.pts>=P.LEVELS[n-1].min}))];
/* Las insignias de ruta y de aventura dependen del contenido; se generan al evaluar. */
P.allBadges=c=>[...P.BADGES,
 ...c.mods.map(m=>({id:'ruta-'+m.id,icon:m.icon,title:'Explorador: '+m.title,kid:'Practicaste buena parte de esta ruta.',test:cc=>{const ids=cc.skills.filter(s=>s.mod===m.id).map(s=>s.id);return ids.filter(i=>P.rank(cc.states[i].state)>=2).length>=Math.ceil(ids.length/2)}})),
 ...c.advList.map(a=>({id:'aventura-'+a.id,icon:a.icon,title:a.title,kid:'¡Completaste esta aventura!',test:cc=>cc.advDone.has(a.id)}))];
P.earned=c=>P.allBadges(c).filter(b=>b.test(c)).map(b=>b.id);

if(typeof module!=='undefined'&&module.exports)module.exports=P;root.Progress=P;
})(typeof globalThis!=='undefined'?globalThis:this);
