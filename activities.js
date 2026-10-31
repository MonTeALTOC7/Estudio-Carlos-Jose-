/* Small, deterministic activity models. No school-admission scoring. */
(function(root){
'use strict';
const colors=['rojo','azul','amarillo','verde'];
const names={size:'Grande y pequeño',amount:'Más y menos',pattern:'¿Qué sigue?',same:'Igual y diferente',full:'Lleno y vacío'};
const item=(type,label,extra={})=>({type,label,...extra});
function pairs(kind,index=0){
 if(kind==='colorImage'){const animals=['bird','fish','chick','frog'],objects=['apple','ball','sun','leaf'],animalNames=['pájaro rojo','pez azul','pollito amarillo','rana verde'],objectNames=['manzana roja','pelota azul','sol amarillo','hoja verde'];const offset=(index%2)*2,isAnimal=Math.floor(index/2)%2===0;return colors.slice(offset,offset+2).map((color,i)=>{const n=offset+i;return{key:color,left:item('color',color,{color}),right:item(isAnimal?animals[n]:objects[n],isAnimal?animalNames[n]:objectNames[n],{color}),explanation:'Mira esta imagen: '+(isAnimal?animalNames[n]:objectNames[n])+'. La unimos con el color '+color+'.'}})}
 if(kind==='shapeObject'){const forms=['círculo','cuadrado','triángulo'],objects=['wheel','window','roof'],labels=['rueda redonda','ventana cuadrada','techo triangular'];return [index%3,(index+1)%3].map(n=>({key:forms[n],left:item('shape',forms[n],{shape:forms[n]}),right:item(objects[n],labels[n]),explanation:'Mira el contorno: '+labels[n]+'. Tiene forma de '+forms[n]+'.'}))}
 return [];
}
function question(kind,index=0){
 const alternate=index%2===1;let prompt,explanation,rule,reference=[],choices,answer;
 if(kind==='size'){rule=alternate?'small':'big';prompt=alternate?'Toca el más pequeño.':'Toca el más grande.';choices=[item('tree','árbol',{scale:.5,key:'small'}),item('tree','árbol',{scale:1,key:'big'})];answer=rule;explanation='Son dos árboles. Este es el más '+(alternate?'pequeño':'grande')+'. Compara cuánto espacio ocupa.'}
 else if(kind==='amount'){rule=alternate?'less':'more';prompt=alternate?'¿Dónde hay menos puntos?':'¿Dónde hay más puntos?';const low=index%3+1;choices=[item('dots','grupo de puntos',{count:low,key:'less'}),item('dots','grupo de puntos',{count:low+2,key:'more'})];answer=rule;explanation='Contamos los puntos de cada grupo. Este grupo tiene '+(alternate?'menos':'más')+' puntos.'}
 else if(kind==='full'){rule=alternate?'empty':'full';prompt=alternate?'Toca el vaso vacío.':'Toca el vaso lleno.';choices=[item('glass','vaso',{filled:true,key:'full'}),item('glass','vaso',{filled:false,key:'empty'})];answer=rule;explanation=alternate?'Este vaso está vacío: no tiene agua.':'Este vaso está lleno de agua.'}
 else if(kind==='same'){rule=alternate?'different':'same';prompt=alternate?'Busca el que es diferente al modelo.':'Busca uno igual al modelo.';const base=index%3===0?'círculo':'cuadrado';reference=[item('shape','modelo',{shape:base,color:'azul'})];choices=[item('shape','figura',{shape:base,color:'azul',key:'same'}),item('shape','figura',{shape:base==='círculo'?'triángulo':'círculo',color:'azul',key:'different'})];answer=rule;explanation=alternate?'Este tiene otra forma. Es diferente al modelo.':'Este tiene la misma forma y el mismo color que el modelo.'}
 else if(kind==='pattern'){rule='alternating';prompt='Mira la fila. ¿Cuál sigue?';const a=alternate?item('color','rojo',{color:'rojo',key:'a'}):item('shape','círculo',{shape:'círculo',key:'a'}),b=alternate?item('color','azul',{color:'azul',key:'b'}):item('shape','cuadrado',{shape:'cuadrado',key:'b'});reference=[a,b,a];choices=[a,b];answer='b';explanation=a.label+', '+b.label+', '+a.label+'… sigue '+b.label+'. Se repiten por turnos.'}
 else throw new Error('Unknown activity: '+kind);
 return{kind,rule,prompt,explanation,reference,choices,answer};
}
function record(state,kind,independent){state.activities=state.activities||{};const r=state.activities[kind]||{independent:0,supported:0};r[independent?'independent':'supported']++;state.activities[kind]=r;return r}
const api={names,pairs,question,record};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.Activities=api;
})(typeof globalThis!=='undefined'?globalThis:this);
