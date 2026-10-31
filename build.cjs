const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
let html=fs.readFileSync(path.join(root,'page.html'),'utf8');
for(const [tag,file] of [['CSS','style.css'],['ENGINE','engine.js'],['APP','app.js']])html=html.replace('/*'+tag+'*/',()=>fs.readFileSync(path.join(root,file),'utf8'));
fs.writeFileSync(path.join(root,'dist/index.html'),html);
for(const f of ['manifest.webmanifest','sw.js','icon.svg','icon-192.png','icon-512.png'])fs.copyFileSync(path.join(root,f),path.join(root,'dist',f));
console.log('App preparada en dist/');
