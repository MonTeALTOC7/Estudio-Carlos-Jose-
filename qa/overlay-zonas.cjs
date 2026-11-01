const {chromium}=require('playwright');const serve=require('./serve.cjs');const path=require('path');
/* Dibuja cada zona táctil sobre su figura (evidencia visual de que coincide con la parte). Uso: node qa/overlay-zonas.cjs ids,separados salida.png [altoMax] */
const ids=process.argv[2]?process.argv[2].split(','):null,OUT=process.argv[3]||'/tmp/people_debug.png',MH=+process.argv[4]||520;
(async()=>{const {srv,url}=await serve(0,{'/':path.join(__dirname,'..')});const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});
 await p.goto(url+'people.js').catch(()=>{});
 await p.setContent('<html><body style="margin:0;background:#eee"><div id=o style="display:flex;flex-wrap:wrap;gap:8px"></div></body></html>');
 await p.addScriptTag({url:url+'people.js'});await p.evaluate(mh=>{window.__mh=mh},MH);
 const html=await p.evaluate((ids)=>{const P=window.People;const cols=['#e6194b','#3cb44b','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c'];
  return (ids||Object.keys(P.FIGS)).map(id=>{let s=P.svg(id,{});const f=P.FIGS[id];const parts=P.parts(id);
   if(f.art!=='dibujo'){parts.forEach((r,i)=>{s=s.replace(new RegExp('(<g class="rg zona[^"]*" data-r="'+r+'">)'),'$1<g style="--c:'+cols[i%8]+'">').replace(/(<g class="rg zona[^"]*" data-r="(\w+)">)(.*?)(<\/g>)/g,(m,a,rr,body)=>rr===r?a+body.replace(/class="zshape"/g,'style="fill:'+cols[i%8]+'66;stroke:'+cols[i%8]+';stroke-width:3"')+'</g>':m)})}
   return '<div style="width:420px;background:#fff;padding:4px"><b>'+id+'</b> '+parts.join(',')+'<div style="width:100%">'+s.replace('<svg ','<svg style="width:100%;max-height:'+(window.__mh||560)+'px" ')+'</div></div>'}).join('')},ids);
 await p.evaluate(h=>{document.getElementById('o').innerHTML=h},html);await p.waitForTimeout(600);
 await p.screenshot({path:OUT,fullPage:true});await b.close();srv.close()})();
