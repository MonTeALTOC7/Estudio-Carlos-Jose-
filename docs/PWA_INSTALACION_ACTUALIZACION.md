# Instalación y actualización de la PWA (v5.3)

**Honestidad primero:** todo lo marcado «simulado» se probó en Chromium (Playwright) con un evento `beforeinstallprompt` fabricado y una «publicación» que reescribe build/versión en una copia de `dist/`. Lo real del navegador (service worker, caché, estado *waiting*, `controllerchange`, recarga, `localStorage`) sí se ejecuta. **Falta validar en la Samsung Galaxy Tab A9 y en un iPhone/iPad reales** (ver §6).

## 1. Una sola fuente de versión
`VERSION` (archivo de una línea) → `build.cjs` lo inyecta en: `window.APP.version`, pie de página («Versión …»), «Acerca de», diagnóstico, panel de Ajustes y `sw.js` (`VERSION` y nombre de caché `prefijo + v + versión + build`). `test.cjs` falla si reaparece un literal de versión en el código fuente. El `build` (hash del contenido, íconos, imágenes y `VERSION`) distingue publicaciones con la misma versión.

## 2. Instalación: invitación contextual en lugar de botón fijo
Se eliminó el botón «Instalar» del encabezado. Ahora (`pwa.js`):
| Situación | Qué ocurre |
|---|---|
| Chrome/Edge/Android con instalación posible (`beforeinstallprompt`) | Tarjeta **dentro de «Hoy»**, bajo la portada (no modal, no tapa nada). `prompt()` solo se llama al tocar «Instalar» (gesto del usuario). Resultado aceptado → se marca «instalando»; cancelado → «Ahora no» |
| Safari de iPhone/iPad (no existe API) | Tarjeta con instrucciones: Compartir → «Añadir a pantalla de inicio». Si es otro navegador de iOS se aclara que debe abrirse en Safari |
| Ya abierta como aplicación (`display-mode: standalone/fullscreen/minimal-ui`, `navigator.standalone`) | No se muestra nada |
| Navegador sin API ni instrucciones útiles | No se muestra tarjeta ni botón inútil; la ayuda queda en Ajustes |
| «Ahora no» / cancelar | Enfriamiento de 7 → 21 → 60 días; no insiste en cada visita |
| `appinstalled` | Se retira la tarjeta y se guarda `inst.at`; no se vuelve a invitar |
| Durante una clase, un arrastre o un trazo | **Nunca**: la tarjeta solo se monta en «Hoy» |
Además: sin permisos de notificaciones ni push; sin afirmar APK; el estado vive en `state.pwa`, **es propio de cada dispositivo, se excluye del respaldo y se conserva al restaurar**. Ajustes → «Instalación y actualización» siempre explica el estado, permite «Instalar ahora» (si el navegador lo ofrece), «Volver a mostrar la invitación» y «Buscar actualizaciones».

## 3. Actualización segura
Estado anterior (riesgo detectado): el service worker nuevo llamaba a `skipWaiting()` al instalarse y activaba código nuevo **bajo una página en marcha**; el aviso solo recargaba.
Ahora:
1. `register('./sw.js')` + comprobación al abrir y al volver a la pestaña/red (máx. cada 20 min, solo con conexión).
2. El SW nuevo se descarga completo (`cache.addAll`; si falta un archivo el SW queda *redundant* y **no se ofrece nada**) y **queda en espera**. Solo la primera instalación hace `skipWaiting()`.
3. La página lee `build/versión` del SW en espera (`GET_INFO`). Si coincide con la que ya corre (se recargó con red) se activa **en silencio** sin aviso ni recarga.
4. Si es distinta, aparece **«Hay una nueva versión de Carlos José»** con **«Actualizar ahora»** y **«Después de mi clase»**, **solo en pantallas de navegación** (nunca durante clases, juegos o trazos).
5. «Después de mi clase» oculta el aviso; vuelve a ofrecerse al terminar una clase o al abrir de nuevo. Una versión ya aplicada (`upd.applied`) no se ofrece otra vez.
6. «Actualizar ahora»: guarda el estado, marca `sessionStorage.cj_upd`, envía `SKIP_WAITING`, espera `controllerchange` (máx. 10 s) y recarga **una sola vez**. Tras recargar se verifica que el build cambió; si no, se informa y no se recarga otra vez.
7. Fallos (sin red, SW redundante, activación sin efecto): mensaje claro, se conserva la versión actual y **todos los datos** (nunca se borra `localStorage`, registros ni imágenes). Las cachés antiguas solo las elimina el `activate` del SW nuevo (solo del mismo prefijo).
8. Una clase pausada (lección, paso, fase, pregunta) vuelve exactamente al mismo punto (prueba B21).

## 4. Canal de prueba frente a definitivo
Sin cambios de diseño: prefijo de caché, clave de almacenamiento y SW separados (`cj-prueba-` / `primerosPasos3-prueba` frente a `mis-pasos-` / `primerosPasos3`), nombre e ícono «PRUEBA» solo en Cloudflare, `_headers` con `no-cache`/`noindex`. No hay migración de datos entre canales.

## 5. Pruebas automatizadas
`qa/pwa-smoke.cjs` (61 comprobaciones): A) instalación contextual; B) actualización (versión idéntica, a mitad de clase, aplazar, terminar clase, aplicar, una sola recarga, datos intactos, caché vieja eliminada, clase pausada exacta, activación silenciosa, descarga rota, sin conexión). Además `test.cjs` (versión única, sin `Notification`, SW sin `skipWaiting` automático), `qa/ci-visual.cjs` y `qa/cloudflare-check.cjs` (ciclo de actualización).
Límite conocido: Playwright no impide que el navegador compruebe la actualización del script del SW con «sin conexión» emulada; por eso la prueba sin conexión pasa por el botón de Ajustes, que respeta `navigator.onLine`.

## 6. Pendiente de dispositivo físico
- Tab A9 (Chrome): que aparezca realmente la tarjeta tras visitar la dirección HTTPS definitiva, tocar «Instalar», ver el diálogo del sistema y el ícono en el lanzador.
- iPhone/iPad (Safari): comprobar las instrucciones y que «Añadir a pantalla de inicio» funcione.
- Android: que una actualización real publicada en GitHub Pages se detecte al reabrir y el aviso se ofrezca en «Hoy».
- Sin conexión real (modo avión) tras instalar.
