/* Personas para aprender las partes del cuerpo (datos + dibujo SVG; sin pantalla ni estado).
   Principio visual: fotos o ilustraciones fieles de Carlos José cuando aportan al aprendizaje; otras personas ilustradas para que generalice;
   ilustración limpia cuando una foto no permite ver bien una parte. Cada figura declara SOLO las partes que se ven (no se inventan partes
   ocultas o fuera del encuadre). Las zonas táctiles de las imágenes reales son polígonos/elipses sobre la propia imagen y se verifican con
   superposiciones (docs/capturas/personas_zonas_*.png) y pruebas automáticas. Para agregar fotos nuevas basta una entrada en FIGS. */
(function(root){
'use strict';
const P={};
const STK='#4a3a30';
const E=(cx,cy,rx,ry)=>({e:[cx,cy,rx,ry]}),Y=pts=>({p:pts});
/* ---- figuras con imagen real o ilustración (zonas en coordenadas de la imagen) ---- */
const IMG={
 'carlos-campo':{who:'Carlos José',de:'de Carlos José',art:'foto',scene:'body',src:'assets/people/carlos-campo.webp',w:358,h:937,aria:'Foto de Carlos José de cuerpo entero',
  parts:{
   cabeza:[E(180,88,62,72)],
   brazo:[Y([[88,248],[128,236],[150,296],[285,312],[300,334],[300,345],[150,350],[112,318]]),Y([[262,192],[300,206],[310,300],[302,334],[272,330],[258,260]])],
   mano:[E(252,184,42,50)],
   barriga:[Y([[128,350],[268,350],[272,445],[124,445]])],
   pierna:[Y([[78,640],[150,640],[142,742],[100,748],[84,705]]),Y([[152,632],[214,632],[208,735],[166,740]])],
   pie:[Y([[66,765],[140,805],[152,832],[110,842],[72,812]]),Y([[135,728],[205,735],[218,790],[160,800],[132,760]])]}},
 'carlos-doctor':{who:'Carlos José',de:'de Carlos José',art:'ilustracion',scene:'body',src:'assets/hero.webp',w:973,h:1507,aria:'Ilustración de Carlos José vestido de médico',
  parts:{
   cabeza:[E(479,139,128,134)],
   brazo:[Y([[300,345],[385,335],[395,420],[340,540],[420,590],[470,620],[470,690],[400,700],[300,680],[230,690],[195,640],[205,560],[250,440]]),Y([[625,350],[690,345],[700,400],[775,440],[800,560],[760,610],[690,600],[640,520],[620,430]])],
   mano:[E(462,642,80,56),E(735,408,66,80)],
   barriga:[Y([[470,640],[610,640],[622,790],[480,800]])],
   pierna:[Y([[330,1108],[485,1108],[468,1332],[360,1337]]),Y([[505,1098],[640,1098],[628,1312],[528,1318]])],
   pie:[Y([[320,1340],[470,1340],[470,1495],[320,1490]]),Y([[505,1305],[705,1350],[710,1440],[540,1450]])]}},
 'carlos-cara':{who:'Carlos José',de:'de Carlos José',art:'foto',scene:'face',src:'assets/avatar.webp',w:768,h:855,aria:'Foto de la cara de Carlos José',
  view:[110,20,520,520],
  parts:{
   cabello:[Y([[190,230],[185,150],[215,85],[300,55],[390,60],[470,110],[510,170],[520,240],[470,220],[430,160],[350,130],[280,130],[230,170]])],
   orejas:[E(194,380,24,48),E(526,325,26,52)],
   ojos:[E(297,292,38,26),E(433,270,36,25)],
   nariz:[E(375,324,42,36)],
   boca:[E(385,405,58,32)]}},
 'carlos-doctor-cara':{who:'Carlos José',de:'de Carlos José',art:'ilustracion',scene:'face',src:'assets/hero.webp',w:973,h:1507,aria:'Ilustración de la cara de Carlos José',
  view:[330,0,300,290],
  parts:{
   cabello:[Y([[350,150],[352,70],[400,15],[480,0],[560,15],[600,80],[600,150],[560,110],[500,85],[430,95],[385,120]])],
   orejas:[E(374,188,22,38),E(585,184,22,38)],
   ojos:[E(432,165,36,22),E(519,149,36,22)],
   nariz:[E(492,192,26,26)],
   boca:[E(492,232,50,22)]}}
};
/* ---- personas ilustradas por el código (zonas = las propias formas) ---- */
const SK={mama:'#d9a07a',papa:'#b97a52',nina:'#e3b08c',abuelo:'#ecc5a3'};
const SPEC={
 mama:{who:'mamá',de:'de mamá',skin:SK.mama,hair:'#2b1a14',style:'larga',top:'#3b7ea8',bottom:'#7a5ea8',skirt:true,shoe:'#8a3b3b',adult:true},
 papa:{who:'papá',de:'de papá',skin:SK.papa,hair:'#1d1612',style:'corto',top:'#3f8f5e',bottom:'#40507a',skirt:false,shoe:'#3b3b3b',adult:true,shorts:true},
 nina:{who:'una niña',de:'de la niña',skin:SK.nina,hair:'#4a2f1d',style:'colitas',top:'#f2b134',bottom:'#e4577e',skirt:true,shoe:'#7a4aa8',adult:false},
 nino:{who:'un niño',de:'del niño',skin:'#f1c9a8',hair:'#5a3a26',style:'corto',top:'#d9d9d9',bottom:'#d9d9d9',skirt:false,shoe:'#d9d9d9',adult:false,shorts:true},
 abuelo:{who:'el abuelo',de:'del abuelo',skin:SK.abuelo,hair:'#f1f1ec',style:'blanco',top:'#e4803f',bottom:'#7f8a96',skirt:false,shoe:'#5a4636',adult:true,glasses:true,long:true}};
const sh=(tag,a,fill,extra)=>'<'+tag+' '+a+' fill="'+fill+'" stroke="'+STK+'" stroke-width="2.2" stroke-linejoin="round" '+(extra||'')+'/>';
const padE=(cx,cy,rx,ry)=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#0000" stroke="none" pointer-events="all"/>';   // zona de toque ampliada e invisible (dedos de cinco años)
const grp=(id,inner,cls)=>'<g class="rg'+(cls||'')+'" data-r="'+id+'">'+inner+'</g>';
/* peinado: devuelve [detrás de la cabeza, delante] */
function hairParts(s,cx,cy,rx,ry){const h=s.hair,top=(Math.round(cy-ry*.05));
 const cap=sh('path','d="M'+(cx-rx*1.04)+' '+(cy-ry*.1)+' Q'+(cx-rx*1.1)+' '+(cy-ry*1.2)+' '+cx+' '+(cy-ry*1.12)+' Q'+(cx+rx*1.1)+' '+(cy-ry*1.2)+' '+(cx+rx*1.04)+' '+(cy-ry*.1)+' Q'+(cx+rx*.75)+' '+(cy-ry*.62)+' '+cx+' '+(cy-ry*.62)+' Q'+(cx-rx*.75)+' '+(cy-ry*.62)+' '+(cx-rx*1.04)+' '+(cy-ry*.1)+'Z"',h);
 let back='';
 if(s.style==='larga')back=sh('path','d="M'+(cx-rx*1.08)+' '+(cy-ry*.2)+' Q'+(cx-rx*1.2)+' '+(cy+ry*1.15)+' '+(cx-rx*.8)+' '+(cy+ry*1.3)+' L'+(cx+rx*.8)+' '+(cy+ry*1.3)+' Q'+(cx+rx*1.2)+' '+(cy+ry*1.15)+' '+(cx+rx*1.08)+' '+(cy-ry*.2)+'Z"',h);
 if(s.style==='colitas')back=sh('ellipse','cx="'+(cx-rx*1.2)+'" cy="'+(cy+ry*.25)+'" rx="'+(rx*.3)+'" ry="'+(ry*.7)+'"',h)+sh('ellipse','cx="'+(cx+rx*1.2)+'" cy="'+(cy+ry*.25)+'" rx="'+(rx*.3)+'" ry="'+(ry*.7)+'"',h);
 if(s.style==='blanco')back=sh('path','d="M'+(cx-rx*1.06)+' '+(cy-ry*.1)+' Q'+(cx-rx*1.12)+' '+(cy+ry*.45)+' '+(cx-rx*.88)+' '+(cy+ry*.5)+' L'+(cx-rx*.8)+' '+(cy-ry*.1)+'Z M'+(cx+rx*1.06)+' '+(cy-ry*.1)+' Q'+(cx+rx*1.12)+' '+(cy+ry*.45)+' '+(cx+rx*.88)+' '+(cy+ry*.5)+' L'+(cx+rx*.8)+' '+(cy-ry*.1)+'Z"',h);
 return[back,cap]}
/* cuerpo entero: viewBox 0 0 200 400. ids: 'sing' (brazo,mano,pierna,pie) o 'plur' (brazos,manos,piernas,pies); fill: pintar por regiones (línea) */
function bodyFig(s,o){o=o||{};const pl=o.ids==='plur',id=n=>pl?({brazo:'brazos',mano:'manos',pierna:'piernas',pie:'pies'})[n]||n:n,F=o.fill||null,line=!!o.line,
 hl=r=>o.hl===r?' hl':'',skin=r=>line?((F&&F[r])||'#f7f5ee'):s.skin,shirt=r=>line?'#f7f5ee':s.top,pants=r=>line?'#f7f5ee':s.bottom,shoe=r=>line?((F&&F[r])||'#f7f5ee'):s.shoe;
 const k=s.adult?1:.8,hr=s.adult?1:1.16;const cx=100,cy=50,rx=27*hr,ry=31*hr,[hb,hf]=hairParts(line?Object.assign({},s,{hair:(F&&F.cabeza)||'#f7f5ee'}):s,cx,cy,rx,ry);
 const legEnd=348,fy=364;
 const arm=(side)=>{const x=side<0?60:140,x2=side<0?44:156;return sh('path','d="M'+x+' 106 L'+x2+' 196" stroke-linecap="round" fill="none" stroke-width="19"',shirt('brazo'),'style="fill:none;stroke:'+STK+'"')+''};
 const armSkin=(side)=>{const x=side<0?60:140,x2=side<0?44:156;return '<path d="M'+x+' 106 L'+x2+' 196" stroke-linecap="round" fill="none" stroke="#0000" stroke-width="36" pointer-events="stroke"/><path d="M'+x+' 106 L'+x2+' 196" stroke-linecap="round" fill="none" stroke="'+STK+'" stroke-width="21"/><path d="M'+x+' 106 L'+x2+' 196" stroke-linecap="round" fill="none" stroke="'+skin('brazo')+'" stroke-width="17"/><path d="M'+x+' 104 L'+(side<0?55:145)+' 142" stroke-linecap="round" fill="none" stroke="'+shirt('brazo')+'" stroke-width="19"/>'};
 const legPath=(x)=>'<path d="M'+x+' 214 L'+(x<100?x-2:x+2)+' '+legEnd+'" stroke-linecap="round" fill="none" stroke="#0000" stroke-width="38" pointer-events="stroke"/><path d="M'+x+' 214 L'+(x<100?x-2:x+2)+' '+legEnd+'" stroke-linecap="round" fill="none" stroke="'+STK+'" stroke-width="27"/><path d="M'+x+' 214 L'+(x<100?x-2:x+2)+' '+legEnd+'" stroke-linecap="round" fill="none" stroke="'+skin('pierna')+'" stroke-width="23"/>';
 const lowerCloth=s.skirt?sh('path','d="M62 198 L138 198 L152 268 Q100 280 48 268Z"',pants('barriga')):s.long?'<path d="M64 200 L136 200 L132 340 L104 340 L100 262 L96 340 L68 340Z" fill="'+pants('pierna')+'" stroke="'+STK+'" stroke-width="2.2" stroke-linejoin="round"/>':sh('path','d="M62 198 L138 198 L142 262 L104 262 L100 236 L96 262 L58 262Z"',pants('barriga'));
 const legs=s.long?grp(id('pierna'),'<path d="M68 340 L132 340" stroke="none"/>'+'<path d="M64 200 L136 200 L132 340 L104 340 L100 262 L96 340 L68 340Z" fill="'+pants('pierna')+'" stroke="'+STK+'" stroke-width="2.2" stroke-linejoin="round"/>',hl('pierna')):grp(id('pierna'),legPath(82)+legPath(118),hl('pierna'));
 const trunk=sh('path','d="M62 100 Q100 88 138 100 L146 204 Q100 214 54 204Z"',shirt('barriga'));
 const barriga=grp('barriga','<ellipse cx="100" cy="170" rx="38" ry="30" fill="'+(line?((F&&F.barriga)||'#f7f5ee'):s.top)+'" stroke="'+(line?STK:'none')+'" stroke-width="2" '+(line?'stroke-dasharray="5 4"':'')+'/>',hl('barriga'));
 const head=grp('cabeza',hb+sh('ellipse','cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'"',skin('cabeza'))+hf+'<g pointer-events="none"><ellipse cx="'+(cx-rx*.38)+'" cy="'+(cy+ry*.05)+'" rx="3" ry="3.6" fill="#2b1d17"/><ellipse cx="'+(cx+rx*.38)+'" cy="'+(cy+ry*.05)+'" rx="3" ry="3.6" fill="#2b1d17"/><path d="M'+(cx-rx*.32)+' '+(cy+ry*.5)+' Q'+cx+' '+(cy+ry*.8)+' '+(cx+rx*.32)+' '+(cy+ry*.5)+'" fill="none" stroke="#8a3b3b" stroke-width="2.4" stroke-linecap="round"/>'+(s.glasses?'<circle cx="'+(cx-rx*.38)+'" cy="'+(cy+ry*.05)+'" r="9" fill="none" stroke="#5a5a5a" stroke-width="2"/><circle cx="'+(cx+rx*.38)+'" cy="'+(cy+ry*.05)+'" r="9" fill="none" stroke="#5a5a5a" stroke-width="2"/>':'')+'</g>',hl('cabeza'));
 const manos=grp(id('mano'),sh('circle','cx="43" cy="205" r="12"',skin('mano'))+sh('circle','cx="157" cy="205" r="12"',skin('mano'))+padE(43,205,19,19)+padE(157,205,19,19),hl('mano'));
 const pies=grp(id('pie'),sh('ellipse','cx="76" cy="'+fy+'" rx="21" ry="11"',shoe('pie'))+sh('ellipse','cx="124" cy="'+fy+'" rx="21" ry="11"',shoe('pie'))+padE(76,fy,23,20)+padE(124,fy,23,20),hl('pie'));
 const brazos=grp(id('brazo'),armSkin(-1)+armSkin(1),hl('brazo'));
 const neck='<rect x="91" y="'+(cy+ry-6)+'" width="18" height="16" rx="6" fill="'+skin('cabeza')+'" stroke="'+STK+'" stroke-width="2"/>';
 const inner=(s.adult?'':'')+legs+(s.skirt||!s.long?lowerCloth:'')+neck+trunk+barriga+brazos+manos+pies+head;
 return '<svg class="gscene pfig psvg pfull" viewBox="'+(s.adult?'0 0 200 392':'0 74 200 318')+'" role="group" aria-label="'+(o.aria||'Dibujo de una persona')+'"><g transform="translate(100 380) scale('+k+') translate(-100 -380)">'+inner+'</g></svg>'}
/* cara grande: viewBox 0 0 200 200 */
/* Expresiones de los rostros dibujados (solo dibujos: nunca se fabrican «fotos» de Carlos José con emociones). Devuelve ojos, boca, cejas y detalles. */
const EXPR=['contento','triste','enojado','asustado','con sueño','sorprendido'];
function exprParts(e,s,cx,cy){const brow=(d,w)=>'<path d="'+d+'" fill="none" stroke="'+((s.hair||'#4a3426').toLowerCase()==='#f1f1ec'?'#8a8a84':(s.hair||'#4a3426'))+'" stroke-width="'+(w||5)+'" stroke-linecap="round" pointer-events="none"/>',
 ojo=(x,rx,ry,pr,dy)=>sh('ellipse','cx="'+x+'" cy="'+(cy-4)+'" rx="'+rx+'" ry="'+ry+'"','#ffffff')+'<circle cx="'+x+'" cy="'+(cy-4+(dy||0))+'" r="'+pr+'" fill="#3a2a20"/><circle cx="'+(x+2)+'" cy="'+(cy-6+(dy||0))+'" r="1.8" fill="#fff"/>',
 shut=x=>'<path d="M'+(x-14)+' '+(cy-4)+' Q'+x+' '+(cy+8)+' '+(x+14)+' '+(cy-4)+'" fill="none" stroke="#3a2a20" stroke-width="3.4" stroke-linecap="round"/>',
 mo=(d,fill)=>'<path d="'+d+'" fill="'+(fill||'none')+'" stroke="'+(fill?STK:'#8a3b3b')+'" stroke-width="'+(fill?2.2:4)+'" stroke-linecap="round" stroke-linejoin="round"/>',
 L=cx-27,R=cx+27;let eyes,mouth,extra='';
 if(e==='contento'){eyes=ojo(L,14,10,6)+ojo(R,14,10,6)+brow('M'+(L-12)+' '+(cy-26)+' Q'+L+' '+(cy-34)+' '+(L+12)+' '+(cy-26))+brow('M'+(R-12)+' '+(cy-26)+' Q'+R+' '+(cy-34)+' '+(R+12)+' '+(cy-26));mouth=mo('M'+(cx-32)+' '+(cy+44)+' Q'+cx+' '+(cy+90)+' '+(cx+32)+' '+(cy+44)+' Q'+cx+' '+(cy+52)+' '+(cx-32)+' '+(cy+44)+'Z','#c8504f')}
 else if(e==='triste'){eyes=ojo(L,14,10,6,3)+ojo(R,14,10,6,3)+brow('M'+(L-14)+' '+(cy-20)+' L'+(L+12)+' '+(cy-30))+brow('M'+(R+14)+' '+(cy-20)+' L'+(R-12)+' '+(cy-30));mouth=mo('M'+(cx-24)+' '+(cy+66)+' Q'+cx+' '+(cy+46)+' '+(cx+24)+' '+(cy+66));extra='<path d="M'+(L-6)+' '+(cy+14)+' q-6 12 0 16 q6 -4 0 -16z" fill="#6bb6ee" stroke="#2f7fc0" stroke-width="1.6" pointer-events="none"/>'}
 else if(e==='enojado'){eyes=ojo(L,13,8,5)+ojo(R,13,8,5)+brow('M'+(L-14)+' '+(cy-34)+' L'+(L+14)+' '+(cy-20),6)+brow('M'+(R+14)+' '+(cy-34)+' L'+(R-14)+' '+(cy-20),6);mouth=mo('M'+(cx-26)+' '+(cy+64)+' Q'+cx+' '+(cy+48)+' '+(cx+26)+' '+(cy+64));extra=''}
 else if(e==='asustado'){eyes=ojo(L,17,15,3.6)+ojo(R,17,15,3.6)+brow('M'+(L-14)+' '+(cy-32)+' Q'+L+' '+(cy-46)+' '+(L+14)+' '+(cy-32))+brow('M'+(R-14)+' '+(cy-32)+' Q'+R+' '+(cy-46)+' '+(R+14)+' '+(cy-32));mouth=mo('M'+(cx-15)+' '+(cy+52)+' Q'+cx+' '+(cy+44)+' '+(cx+15)+' '+(cy+52)+' Q'+(cx+14)+' '+(cy+70)+' '+cx+' '+(cy+70)+' Q'+(cx-14)+' '+(cy+70)+' '+(cx-15)+' '+(cy+52)+'Z','#7a2a2f');extra='<path d="M'+(cx+58)+' '+(cy-50)+' q8 10 0 16 q-8 -6 0 -16z" fill="#6bb6ee" stroke="#2f7fc0" stroke-width="1.6" pointer-events="none"/>'}
 else if(e==='con sueño'){eyes=shut(L)+shut(R);mouth=mo('M'+(cx-11)+' '+(cy+56)+' Q'+cx+' '+(cy+48)+' '+(cx+11)+' '+(cy+56)+' Q'+(cx+10)+' '+(cy+70)+' '+cx+' '+(cy+70)+' Q'+(cx-10)+' '+(cy+70)+' '+(cx-11)+' '+(cy+56)+'Z','#7a2a2f');extra='<text x="'+(cx+56)+'" y="'+(cy-44)+'" font-size="26" font-weight="800" fill="#4a5a9a" pointer-events="none" aria-hidden="true">z</text><text x="'+(cx+76)+'" y="'+(cy-64)+'" font-size="20" font-weight="800" fill="#6a7ab5" pointer-events="none" aria-hidden="true">z</text>'}
 else{eyes=ojo(L,16,16,5)+ojo(R,16,16,5)+brow('M'+(L-13)+' '+(cy-30)+' Q'+L+' '+(cy-44)+' '+(L+13)+' '+(cy-30))+brow('M'+(R-13)+' '+(cy-30)+' Q'+R+' '+(cy-44)+' '+(R+13)+' '+(cy-30));mouth=mo('M'+cx+' '+(cy+50)+' Q'+(cx+13)+' '+(cy+50)+' '+(cx+13)+' '+(cy+60)+' Q'+(cx+13)+' '+(cy+72)+' '+cx+' '+(cy+72)+' Q'+(cx-13)+' '+(cy+72)+' '+(cx-13)+' '+(cy+60)+' Q'+(cx-13)+' '+(cy+50)+' '+cx+' '+(cy+50)+'Z','#7a2a2f')}
 return{eyes,mouth,extra}}
function faceFig(s,o){o=o||{};const F=o.fill||null,hl=r=>o.hl===r?' hl':'',cx=100,cy=104,rx=60,ry=72,[hb,hf]=hairParts(s,cx,cy,rx,ry);
 const ears=grp('orejas',sh('ellipse','cx="'+(cx-rx-6)+'" cy="'+(cy+10)+'" rx="12" ry="19"',s.skin)+sh('ellipse','cx="'+(cx+rx+6)+'" cy="'+(cy+10)+'" rx="12" ry="19"',s.skin),hl('orejas'));
 const ojo=(x)=>sh('ellipse','cx="'+x+'" cy="'+(cy-4)+'" rx="14" ry="10"','#ffffff')+'<circle cx="'+x+'" cy="'+(cy-4)+'" r="6" fill="#3a2a20"/><circle cx="'+(x+2)+'" cy="'+(cy-6)+'" r="1.8" fill="#fff"/>';
 const X=o.expr?exprParts(o.expr,s,cx,cy):null;
 const eyes=grp('ojos',(X?X.eyes:ojo(cx-27)+ojo(cx+27))+padE(cx-27,cy-4,22,13)+padE(cx+27,cy-4,22,13),hl('ojos'));
 const nose=grp('nariz','<path d="M'+cx+' '+(cy+4)+' L'+(cx-11)+' '+(cy+32)+' Q'+cx+' '+(cy+40)+' '+(cx+11)+' '+(cy+32)+'Z" fill="'+(s.skin)+'" stroke="'+STK+'" stroke-width="2.2" stroke-linejoin="round"/><path d="M'+(cx-9)+' '+(cy+34)+' Q'+cx+' '+(cy+40)+' '+(cx+9)+' '+(cy+34)+'" fill="none" stroke="#9a6a50" stroke-width="2"/>'+padE(cx,cy+23,17,15),hl('nariz'));
 const mouth=grp('boca',(X?X.mouth:'<path d="M'+(cx-28)+' '+(cy+48)+' Q'+cx+' '+(cy+74)+' '+(cx+28)+' '+(cy+48)+' Q'+cx+' '+(cy+56)+' '+(cx-28)+' '+(cy+48)+'Z" fill="#c8504f" stroke="'+STK+'" stroke-width="2.2" stroke-linejoin="round"/>')+padE(cx,cy+57,34,15),hl('boca'));
 const hair=grp('cabello',hf,hl('cabello'));
 const extra=(s.glasses?'<g pointer-events="none"><circle cx="'+(cx-27)+'" cy="'+(cy-4)+'" r="17" fill="none" stroke="#5a5a5a" stroke-width="2.4"/><circle cx="'+(cx+27)+'" cy="'+(cy-4)+'" r="17" fill="none" stroke="#5a5a5a" stroke-width="2.4"/><path d="M'+(cx-10)+' '+(cy-4)+'h20" stroke="#5a5a5a" stroke-width="2.4"/></g>':'')+(s.who==='el abuelo'?'<path pointer-events="none" d="M'+(cx-24)+' '+(cy+44)+' Q'+cx+' '+(cy+36)+' '+(cx+24)+' '+(cy+44)+'" fill="none" stroke="#e7e7e0" stroke-width="5" stroke-linecap="round"/>':'');
 return '<svg class="gscene pfig psvg pface" viewBox="0 0 200 200" role="group" aria-label="'+(o.aria||'Dibujo de una cara')+'">'+hb+ears+sh('ellipse','cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'"',s.skin,'pointer-events="none"')+eyes+nose+mouth+hair+extra+(X?X.extra:'')+'</svg>'}
const BODY_PARTS=['cabeza','brazo','mano','barriga','pierna','pie'],FACE_PARTS=['cabello','orejas','ojos','nariz','boca'];
const FIGS={};
for(const k of Object.keys(IMG)){const f=IMG[k];FIGS[k]=Object.assign({id:k,kind:'carlos',parts_:Object.keys(f.parts)},f);FIGS[k].partList=Object.keys(f.parts)}
for(const k of Object.keys(SPEC)){const s=SPEC[k];FIGS[k+'-cuerpo']={id:k+'-cuerpo',who:s.who,de:s.de,art:'dibujo',scene:'body',kind:'otra',spec:s,partList:BODY_PARTS.slice(),aria:'Dibujo de '+s.who};
 FIGS[k+'-cara']={id:k+'-cara',who:s.who,de:s.de,art:'dibujo',scene:'face',kind:'otra',spec:s,partList:FACE_PARTS.slice(),aria:'Dibujo de la cara de '+s.who}}
P.FIGS=FIGS;P.EXPR=EXPR;
const shapeSvg=(sp,cls)=>sp.e?'<ellipse cx="'+sp.e[0]+'" cy="'+sp.e[1]+'" rx="'+sp.e[2]+'" ry="'+sp.e[3]+'" class="'+cls+'"/>':'<polygon points="'+sp.p.map(q=>q.join(',')).join(' ')+'" class="'+cls+'"/>';
/* Dibujo de una figura. opts: hl (parte resaltada, solo para enseñar), ids ('plur' para pintar), fill, line (contorno para colorear) */
P.svg=(figId,o)=>{o=o||{};const f=typeof figId==='string'?FIGS[figId]:figId;if(!f)throw new Error('figura inexistente '+figId);
 if(f.art==='dibujo')return f.scene==='face'?faceFig(f.spec,Object.assign({aria:f.aria},o)):bodyFig(f.spec,Object.assign({aria:f.aria},o));
 const v=f.view||[0,0,f.w,f.h],hl=r=>o.hl===r?' hl':'';
 /* detrás los hallazgos grandes y encima los pequeños (ojos sobre cabeza…): el orden de ALL define cuál recibe el toque */
 const order=f.scene==='face'?['cabello','orejas','ojos','nariz','boca']:['barriga','pierna','brazo','cabeza','pie','mano'];
 return '<svg class="gscene pfig pimg '+(f.scene==='face'?'pface':'pfull')+' '+f.art+'" viewBox="'+v.join(' ')+'" role="group" aria-label="'+f.aria+'"><image href="'+f.src+'" x="0" y="0" width="'+f.w+'" height="'+f.h+'" preserveAspectRatio="xMidYMid meet"/>'+
  order.filter(r=>f.parts[r]).map(r=>'<g class="rg zona'+hl(r)+'" data-r="'+r+'">'+f.parts[r].map(sp=>shapeSvg(sp,'zshape')).join('')+'</g>').join('')+'</svg>'};
/* Pintura de partes del cuerpo (regiones en plural, como la actividad «Pinta como se indica») */
P.paint=fill=>bodyFig(SPEC.nino,{ids:'plur',fill:fill||{},line:true,aria:'Dibujo de una persona para colorear'});
/* ¿qué figura se usa en cada fase? Aprendo/ejemplos: fotos de Carlos; práctica: su ilustración; refuerzo: mezcla; comprobación: otras personas y fotos distintas. */
const POOLS={body:{learn:['carlos-campo'],examples:['carlos-campo','carlos-doctor'],practice:['carlos-doctor','carlos-campo'],reinforce:['carlos-doctor','carlos-campo','mama-cuerpo','papa-cuerpo'],
  check:['mama-cuerpo','papa-cuerpo','nina-cuerpo','abuelo-cuerpo']},
 face:{learn:['carlos-cara'],examples:['carlos-cara','carlos-doctor-cara'],practice:['carlos-doctor-cara','carlos-cara'],reinforce:['carlos-cara','mama-cara','papa-cara','nina-cara'],
  check:['mama-cara','papa-cara','nina-cara','abuelo-cara','carlos-cara','carlos-doctor-cara']}};
P.pool=(scene,phase)=>(POOLS[scene]&&(POOLS[scene][phase]||POOLS[scene].practice)).slice();
P.pick=(scene,phase,rng,avoid)=>{const pool=P.pool(scene,phase).filter(x=>x!==avoid);const p=pool.length?pool:P.pool(scene,phase);return p[Math.floor(rng()*p.length)]};
P.parts=figId=>FIGS[figId].partList.slice();
P.who=figId=>FIGS[figId].who;P.de=figId=>FIGS[figId].de;P.carlos=figId=>FIGS[figId].kind==='carlos';
if(typeof module!=='undefined'&&module.exports)module.exports=P;root.People=P;
})(typeof globalThis!=='undefined'?globalThis:this);
