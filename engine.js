(function(root){
 'use strict';
 const groups={numbers:['1','2','3','4','5','6','7','8','9','10'],vowels:['a','e','i','o','u'],colors:['rojo','azul','amarillo','verde'],shapes:['círculo','X','cuadrado','triángulo']};
 function fresh(){return{version:3,name:'',sound:true,voice:'',rate:.85,unlocked:{},records:{},sessions:0,drawings:0}}
 function shuffle(a,rng=Math.random){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
 function key(area,id){return area+':'+id}
 function rec(s,area,id){return s.records[key(area,id)]||{seen:0,independent:0,supported:0,errors:0,streak:0,last:0}}
 function active(s,area){const all=groups[area],base=area==='numbers'?3:2;s.unlocked=s.unlocked||{};let n=Math.max(base,Math.min(all.length,Number(s.unlocked[area])||base));while(n<all.length&&all.slice(0,n).every(id=>rec(s,area,id).streak>=2))n++;s.unlocked[area]=n;return all.slice(0,n)}
 function observe(s,area,id){const k=key(area,id);s.records[k]={...rec(s,area,id),seen:rec(s,area,id).seen+1}}
 function record(s,area,id,independent){const k=key(area,id),r={...rec(s,area,id)};r.last=Date.now();if(independent){r.independent++;r.streak++}else{r.supported++;r.errors++;r.streak=0}s.records[k]=r;active(s,area);return r}
 function target(s,area,previous){const pool=active(s,area).filter(x=>x!==previous);const arr=pool.length?pool:active(s,area);return arr.slice().sort((a,b)=>{const x=rec(s,area,a),y=rec(s,area,b);return(x.streak-y.streak)||(x.last-y.last)})[0]}
 function question(s,area,id){const pool=active(s,area),r=rec(s,area,id),n=pool.every(x=>rec(s,area,x).streak>=1)?Math.min(3,pool.length):2;return{area,id,options:shuffle([id,...shuffle(pool.filter(x=>x!==id)).slice(0,n-1)]),hint:r.seen===0}}
 function tracePaths(id){const ellipse=(cx,cy,rx,ry)=>Array.from({length:81},(_,i)=>{const t=-Math.PI/2-i*Math.PI*2/80;return[cx+rx*Math.cos(t),cy+ry*Math.sin(t)]});const map={
 'círculo':[ellipse(50,50,29,32)],'X':[[[23,20],[77,80]],[[77,20],[23,80]]],
 'cuadrado':[[[23,20],[77,20],[77,80],[23,80],[23,20]]],'triángulo':[[[50,17],[82,80],[18,80],[50,17]]],
 '1':[[[35,30],[50,18],[50,82]]], '2':[[[25,30],[32,20],[50,17],[68,24],[73,37],[65,50],[25,82],[76,82]]],
 '3':[[[25,22],[48,17],[68,25],[70,37],[57,48],[45,49],[60,50],[73,62],[68,77],[50,83],[25,78]]],
 'a':[ellipse(46,57,23,25),[[69,31],[69,82]]],'e':[[[23,56],[76,56],[72,40],[59,31],[42,31],[27,41],[23,57],[29,72],[44,81],[61,81],[74,74]]],
 'i':[[[50,40],[50,83]],[[50,21],[50,24]]],'o':[ellipse(50,57,25,26)],'u':[[[25,32],[25,65],[30,77],[44,83],[59,79],[72,67],[72,32],[72,83]]],
 'línea':[[[15,50],[85,50]]],'ondas':[[[10,52],[20,30],[30,52],[40,74],[50,52],[60,30],[70,52],[80,74],[90,52]]]
 };return map[id]||map['círculo']}
 function samplePaths(paths){const out=[];for(const p of paths)for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<=Math.ceil(len/2);j++){const t=j/Math.max(1,Math.ceil(len/2));out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}return out}
 function gradeTrace(paths,strokes){const guide=samplePaths(paths),points=samplePaths(strokes);if(points.length<12)return{ok:false,coverage:0,precision:0};const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<7;const coverage=guide.filter(g=>points.some(p=>near(g,p))).length/guide.length,precision=points.filter(p=>guide.some(g=>near(g,p))).length/points.length;return{ok:coverage>=.72&&precision>=.6,coverage,precision}}
 const api={groups,fresh,shuffle,rec,active,observe,record,target,question,tracePaths,samplePaths,gradeTrace};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.Learning=api;
})(typeof globalThis!=='undefined'?globalThis:this);
