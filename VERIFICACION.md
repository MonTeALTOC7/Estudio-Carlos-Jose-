# Verificación · 31-10-2026

## Ejecutado
- Sintaxis de app.js y engine.js; compilación sin dependencias.
- 7 grupos automatizados: inicio gradual; aciertos/ayudas; opciones únicas; trazos vacíos/equivocados; garabatos; recursos PWA; desbloqueo permanente hasta 10 y compatibilidad del estado anterior.
- Navegador Chromium remoto con marcos de 320 y 768 px: revisión visual del inicio y vocal a/A con avión; sin desbordamiento horizontal en las pantallas medidas de teléfono (inicio, cantidades y trazos).
- Número 1: error seguido de acierto se registra con ayuda. Paso siguiente enseña 2 antes de preguntar; la práctica muestra dos manzanas para relacionar cantidad y número.
- Unir: círculo con dos clics; X con arrastre de ratón; ambas parejas completadas y líneas dibujadas. No equivale a prueba táctil física.
- Trazo X: vacío rechazado; dos diagonales con arrastre aceptadas.
- Progreso: el registro de respuesta con ayuda persiste tras recargar y aparece en panel adulto.
- Memoria: se ocultan tarjetas y se recupera una pareja de casas. Recorrido parque → casa: pregunta primera y segunda parada y completa recorrido.
- Voz: llamadas ejecutadas; el navegador remoto no ofrece voces españolas y devuelve fallo. Aviso visible comprobado; se redujo a un aviso por sesión y sin bloquear toques.

## Pendiente en dispositivo real
- Audio español inteligible, repetición, volumen y cancelación en Chrome Android y Safari iOS.
- Arrastre táctil, cancelación y varios dedos; giro del dispositivo durante trazo.
- Instalación efectiva en pantalla de inicio, apertura en modo independiente, recarga en modo avión y actualización del service worker.
- Uso con el niño para ajustar dificultad, tolerancia de trazo y duración. No se afirma aprendizaje logrado ni preparación certificada para admisión.

## Cambios principales frente al ZIP
Se conserva la aplicación. Desbloqueos permanentes; cantidades en prácticas; reto de contenido visto; parejas según progreso hasta 10; captura/cancelación de puntero; memoria con negocios; recorrido por todas sus paradas y distinción de ayuda; mejoras de 320 px y avisos de voz; icono Apple; build y pruebas antes de publicar Pages.

## Publicación GitHub
- PR #1 integrado con autorización del propietario; CI aprobado.
- Commit de aplicación: fb860b33ea6fb39b4ae254cfaeff53c743dc8758.
- Los 22 archivos de main se verificaron contra los blobs locales de entrega.
- Pages configurado con GitHub Actions y HTTPS; despliegue 41230167366 aprobado.
- https://montealtoc7.github.io/Estudio-Carlos-Jose-/ abierto en navegador: inicio, primera lección y recarga correctos, sin iniciar sesión.
- Se mantiene pendiente la prueba física de voz, instalación y modo avión.

## Ampliación 3.2 · navegación y relaciones
- Main verificado antes de modificar: 77fbd3b07b85a90e7b4029cba17e3f52badc3a9b; 22 archivos coincidentes con la copia de trabajo.
- 10 grupos de pruebas automatizadas: se añaden claves únicas y colores coincidentes, respuestas únicas de comparaciones/series y registro de ayudas separado del progreso de símbolos.
- Navegador: cambio directo desde lección a Relacionamos mediante selector superior; error de color, pareja correcta por clic y otra por arrastre completadas.
- Tamaños: sesión completa con una pista; resultado observado 5 sin ayuda y 1 con ayuda, y comprobación 2/2 independiente.
- Tablet 768 px: enseñanza y respuesta correcta de más/menos, lleno/vacío, igual/diferente y serie; ancho de contenido igual al disponible, sin desbordamiento horizontal.
- Teléfono 320 px: lección de color–animal sin desbordamiento; se corrigió el reparto de título/etiqueta para evitar partir palabras.
- Persisten los límites: no audio español real disponible en el navegador remoto, no dispositivo táctil físico, no instalación ni modo avión físicos.
- Figura–objeto: círculo–rueda y cuadrado–ventana completados por clic; registro de dos respuestas independientes visible en el panel adulto.

## Versión 4.0 · rutas de aprendizaje (rama `claude/blissful-newton-jx8npe`, base `main` f0744f6)

### Automatizadas (`node test.cjs`, también en CI)
- 22 grupos (10 anteriores + 12 nuevos): estructura de las 40 habilidades; variedad de interacciones; más de 20 000 preguntas generadas en tres niveles de avance sin errores ni textos rotos; no se muestran números/vocales no enseñados; la respuesta correcta cae en todas las posiciones; sesión de 5 fases sin repetir estímulos; semilla reproducible; compatibilidad con progreso anterior y colores/figuras ampliados; trazos nuevos; ayer/hoy/mañana con fecha real; nombre; distribución.
- La prueba de variedad detectó 8 habilidades que practicaban con un solo gesto y una que repetía el mismo ejercicio de nombre; se corrigieron antes de entregar.

### En navegador (Chromium con pantalla táctil emulada; `qa/ui-smoke.cjs` y `qa/legacy-smoke.cjs`)
- Recorrido completo (aprender → ejemplos → practicar con pista y error deliberado → reforzar → comprobar → resultado → progreso guardado) de las **40 habilidades**, con clics reales y revisión de desbordamiento horizontal y elementos fuera de pantalla en cada pantalla: ver resultados por tamaño en la sección «Resultado de las corridas».
- Regresión de lo anterior (`qa/legacy-smoke.cjs`, 390 px): módulos básicos, 5 relaciones, 5 uniones, memoria, recorrido, posiciones, 14 trazos (incluye 9 nuevos), pequeño reto, diálogo de módulos agrupado, tira superior, panel adulto, **progreso de la v3.2 conservado** (nombre, desbloqueos, registros, actividades) y reinicio. 0 fallas.
- Defectos encontrados y corregidos durante la QA: la lista de trazos ampliada empujaba el lienzo fuera de la pantalla (ahora es una tira de una fila); botón «Cambiar módulo» partido en dos líneas a 320 px (ahora «Módulos»); elementos colocados en un grupo heredaban fondo gris; nombre con espacios iniciales dejaba el juego vacío.

### Sigue pendiente (no verificable en este entorno)
- Audio con voz española real, volumen y cancelación (el navegador de pruebas no tiene voces españolas: se vio el aviso, no la voz). Los tonos de WebAudio tampoco se escucharon.
- Arrastre con dedo real, varios dedos, giro del dispositivo, rendimiento en teléfonos modestos.
- Instalación como app, modo avión y actualización del service worker (el caché pasó a `mis-pasos-v4.0.0`).
- Cómo se ven los emojis en el teléfono concreto del niño.
- Uso real con el niño: dificultad, duración y si entiende las consignas. No se afirma aprendizaje logrado ni preparación para admisión.

### Resultado de las corridas (versión final de esta rama, con prueba de «Ver una pista» en cada habilidad)
| Pantalla | Habilidades completadas | Fallas | Errores de consola |
|---|---|---|---|
| 320 × 640 (teléfono chico) | 40 de 40 | 0 | 0 |
| 390 × 844 (teléfono) | 40 de 40 | 0 | 0 |
| 768 × 1024 (tablet) | 40 de 40 | 0 | 0 |
| Regresión de lo anterior a 390 px y a 320 px | todas las comprobaciones | 0 | 0 |


## Versión 5.0 · Centro de Estudios Carlos José (rama `claude/centro-carlos-jose-v5`, apilada sobre la v4.0)

### Automatizadas (`node test.cjs`, también en CI): 32 grupos
Los 22 anteriores más 10 nuevos: transiciones de dominio (una comprobación perfecta no es dominio; días y formas distintas; consolidación), una mala sesión no quita logros, compatibilidad con registros de la v4.0, nivel que no depende de repetir y no baja, resumen por ruta, insignias, y recomendaciones (inicio, repaso, refuerzo, confirmar y recordar, aventuras, determinismo por fecha, requisitos suaves).

### En navegador (Chromium con pantalla táctil emulada)
| Prueba | 320 × 640 | 390 × 844 | 768 × 1024 | 1440 × 900 |
|---|---|---|---|---|
| Las 40 habilidades completas con clics (`ui-smoke`)* | 40/40 | 40/40 | 40/40 | 40/40 |
| Portada, sugerencias, racha, insignia, reanudar, modos «extra» y «repaso», 5 aventuras, panel adulto, respaldo, foto local, reducción de movimiento (`v5-smoke`) | 0 fallas | 0 fallas | 0 fallas | 0 fallas |
| Regresión de los juegos y trazos anteriores y del progreso de la v3.2/v4.0 (`legacy-smoke`) | 0 fallas | 0 fallas | — | 0 fallas |
Sin errores de consola en ninguna corrida. *Las corridas completas de las 40 habilidades se hicieron antes del último ajuste de `scroll-padding`; después se repitieron 8 habilidades con elementos tocables a 320 px (0 fallas) y `v5-smoke` completo a 320, 390 y 1440 px.

### Defectos encontrados y corregidos en esta etapa
- El personaje heredaba una clase antigua (`.hero`) y aparecía dentro de una caja verde.
- El botón «¡Cruzar!» no mostraba texto por una colisión con la clase antigua `.big` (se renombró a `.xl`).
- Si el formato que falló ya estaba entre los ejemplos, el modo «extra» no añadía ejemplos (ahora añade variantes del mismo formato).
- A 320 px el desplazamiento automático dejaba la figura de las curitas **detrás de la barra fija superior** (ahora hay `scroll-padding`).
- El carrusel de aventuras desbordaba en las revisiones de pantalla (se exime: se desplaza a propósito).

### Vista previa HTTPS
Artefacto privado (solo la cuenta del padre) con las imágenes del kit. Limitaciones de ese entorno: no instala la PWA, no tiene modo sin conexión y no permite descargas (el respaldo solo funciona en la app real o instalada).

### Pendiente en un teléfono real (no verificable aquí)
Voz española y volumen; tonos; arrastre con el dedo (curitas, clasificar, unir, piezas); aspecto de los emojis; instalación y modo avión; rendimiento en equipos modestos; y, sobre todo, que Carlos José entienda las consignas, disfrute y se sostenga la atención.
