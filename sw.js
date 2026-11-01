const BUILD='dev';const VERSION='0.0.0';const PREFIX='mis-pasos-';const CACHE=PREFIX+'v'+VERSION+'-'+BUILD;
const ASSETS=['./','./index.html','./manifest.webmanifest'];/*lo completa build.cjs*/
/* Actualización segura: una versión nueva se descarga y queda EN ESPERA; solo se activa cuando la página lo pide (mensaje SKIP_WAITING) o cuando se cierran todas las ventanas.
   Así nunca se cambia de versión por debajo de una clase o actividad en curso. La primera instalación (sin versión anterior) sí se activa de inmediato. */
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>{if(!self.registration.active)return self.skipWaiting()})));
/* Solo se borran cachés propias de este canal (prefijo): la prueba no toca las de producción. */
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{const d=e.data||{};
 if(d.type==='SKIP_WAITING')self.skipWaiting();
 else if(d.type==='GET_INFO'&&e.ports&&e.ports[0])e.ports[0].postMessage({build:BUILD,version:VERSION,cache:CACHE})});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.open(CACHE).then(c=>c.match(e.request)).then(r=>r||(e.request.mode==='navigate'?caches.open(CACHE).then(c=>c.match('./index.html')):Response.error()))))});
