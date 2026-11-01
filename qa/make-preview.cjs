/* Genera una vista previa PRIVADA (para publicar como artefacto): quita el esqueleto HTML, desactiva el service worker
   y usa imágenes personales de una carpeta local. Uso: node qa/make-preview.cjs <carpeta-con-hero.webp-y-avatar.webp> <salida.html>
   Las imágenes NO se agregan al repositorio. */
const fs=require('node:fs'),path=require('node:path');
const [,, assets, out]=process.argv;
let h=fs.readFileSync(path.join(__dirname,'..','dist','index.html'),'utf8');
h=h.replace(/<!doctype html>\s*<html[^>]*>\s*<head>/i,'').replace(/<\/head>\s*<body>/i,'').replace(/<\/body>\s*<\/html>\s*$/i,'')
 .replace(/<meta charset="utf-8">/i,'').replace(/<meta name="viewport"[^>]*>/i,'').replace(/<link rel="manifest"[^>]*>/i,'').replace(/<link rel="apple-touch-icon"[^>]*>/i,'').replace(/<link rel="icon"[^>]*>/i,'');
const hasAssets=assets&&fs.existsSync(path.join(assets,'hero.webp'));
const boot='<script>window.CJ_PREVIEW=true;'+(hasAssets?"window.CJ_ASSETS={hero:'assets/hero.webp',face:'assets/avatar.webp'};":'')+'</script><style>body{font-size:16px;line-height:1.4}</style>';
h=h.replace(/(<title>[^<]*<\/title>)/,'$1'+boot);
fs.writeFileSync(out,h);console.log('Vista previa',out,(h.length/1024).toFixed(0)+' KB','imágenes:',hasAssets);
