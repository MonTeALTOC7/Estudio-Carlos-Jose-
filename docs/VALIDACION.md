# Validación: qué está probado automáticamente y qué requiere un teléfono

## A. Automatizado en CI (se ejecuta en cada PR; falla el flujo si algo se rompe)
| Flujo (`.github/workflows/checks.yml`) | Qué comprueba |
|---|---|
| **Lógica y distribución** (`node test.cjs`, 36 grupos) | Generadores de las 40 habilidades, símbolos no enseñados, dominio, nivel, insignias, recomendaciones y **regresión del historial** (una habilidad consolidada no pierde su estado aunque el historial se recorte) |
| **Funciones visuales críticas** (`qa/ci-visual.cjs`, Playwright + Chromium) | 4 anchos (320, 390, 768, 1440 px) sin desbordes; barras fijas que no tapan contenido; **arrastre con eventos táctiles reales** (clasificar, unir, curitas, piezas y prueba de diagnóstico); persistencia y reanudar; respaldo y restauración; **manifiesto e íconos**; service worker; **instalabilidad según Chromium**; **funcionamiento sin conexión**; **actualización con aviso**; **independencia del canal de prueba frente a producción**; movimiento reducido; nombres accesibles. Sube capturas y un resumen como artefacto del flujo |
| **Recorridos de uso** | Portada, recomendaciones, reanudar, modos de repaso, 5 aventuras, panel adulto, regresión de los juegos y del progreso anteriores y una habilidad de cada tipo de interacción |
| **Recorrido completo** (`visual-completa.yml`, manual y semanal) | Las 40 habilidades completas a 4 anchos |

## B. Simulado (Chromium con pantalla táctil emulada)
Lo anterior usa un navegador real pero **no un teléfono**: los toques se generan con el protocolo de depuración. Es una buena señal, no una prueba definitiva de cómo responde un dedo de cinco años sobre un cristal real.

## C. Requiere teléfono físico (no automatizable aquí)
La aplicación incluye **⚙ → Ajustes → Diagnóstico del dispositivo** con detección automática y una lista de comprobación:
- Instalar en la pantalla de inicio y abrir como aplicación.
- Abrir con modo avión y jugar.
- Arrastrar con el dedo (precisión, falsos toques, desplazamiento accidental de la página).
- Voz española, volumen y tonos.
- Descargar el respaldo y restaurarlo en el mismo teléfono (o en otro).
- Recibir una versión nueva y actualizar.
- Cerrar y abrir la aplicación: el avance sigue ahí.
- Aspecto de los emojis, rendimiento y duración de batería.
- **Con Carlos José**: si entiende las consignas, si disfruta y cuánto dura su atención.
