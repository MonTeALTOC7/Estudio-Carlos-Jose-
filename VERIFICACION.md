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
