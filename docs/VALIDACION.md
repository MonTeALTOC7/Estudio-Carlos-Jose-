# Validación: qué está probado automáticamente y qué requiere un teléfono

## A. Automatizado en CI (se ejecuta en cada PR; falla el flujo si algo se rompe)
| Flujo (`.github/workflows/checks.yml`) | Qué comprueba |
|---|---|
| **Lógica y distribución** (`node test.cjs`, 47 grupos; incluye currículo y planificador) | Generadores de las 40 habilidades, símbolos no enseñados, dominio, nivel, insignias, recomendaciones y **regresión del historial** (una habilidad consolidada no pierde su estado aunque el historial se recorte) |
| **Funciones visuales críticas** (`qa/ci-visual.cjs`, Playwright + Chromium) | 4 anchos (320, 390, 768, 1440 px) sin desbordes; barras fijas que no tapan contenido; **arrastre con eventos táctiles reales** (clasificar, unir, curitas, piezas y prueba de diagnóstico); persistencia y reanudar; respaldo y restauración; **manifiesto e íconos**; service worker; **instalabilidad según Chromium**; **funcionamiento sin conexión**; **actualización con aviso**; **independencia del canal de prueba frente a producción**; movimiento reducido; nombres accesibles. Sube capturas y un resumen como artefacto del flujo |
| **Recorridos de uso** | Portada, recomendaciones, reanudar, modos de repaso, 5 aventuras, panel adulto, regresión de los juegos y del progreso anteriores y una habilidad de cada tipo de interacción |
| **Modo clase guiada y audio** (`qa/course-smoke.cjs`, 10 escenarios) | Primera clase desde cero; reanudar **exactamente** (fase y pregunta, también durante el juego relacionado); finalizar y pasar a la siguiente; salir al juego libre y volver sin perder el avance; el juego libre no cambia el curso; repasos y refuerzo tras comprobación floja; adaptación; exploración inicial; conservación de datos y respaldos anteriores; mapa y panel adulto (320/390/1440 px); **voz** (automática/al tocar/desactivada), **música** (solo tras tocar, baja con la voz, calla en comprobaciones, se detiene al salir, una sola pista, sin red) y **efectos**; la composición se renderiza sin altavoz y se comprueba que no está vacía ni distorsiona |
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
- **Clases guiadas y audio (v5.1)**: oír la voz y la música por el altavoz del teléfono y juzgar si la música es agradable y no estorba a la voz; que la música no suene al bloquear la pantalla ni al cambiar de aplicación; instalar y abrir sin conexión una clase completa; si 8/10/12 minutos es la duración adecuada; si el niño entiende «Recordamos», «Jugamos» y «Comprobamos».
- **Con Carlos José**: si entiende las consignas, si disfruta y cuánto dura su atención.

## Etapa final (v5.3.0): añadidos
**Automatizado (CI):** `qa/pwa-smoke.cjs` (instalación contextual y actualización segura, 61 comprobaciones), `qa/audit-pedagogica.cjs`, nuevos grupos de `test.cjs` (versión única, emociones, sentidos, nombre, lateralidad, secuencias, seguridad, mañana/tarde/noche).
**Simulado:** `beforeinstallprompt` fabricado; versión «publicada» reescribiendo build en una copia de `dist/`; iPhone por *user agent*.
**Físico pendiente:** instalación y diálogo del sistema en la Tab A9 y en iPhone/iPad; actualización real desde GitHub Pages; voz; pulsera real frente a la dibujada; legibilidad de las expresiones; ritmo con el niño.
