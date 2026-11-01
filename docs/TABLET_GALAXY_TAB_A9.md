# Galaxy Tab A9 (SM-X115): optimización y validación

**Importante:** todo lo de este documento se probó por **emulación** en Chromium (viewport, densidad y eventos táctiles generados con el protocolo de depuración). **No se probó la tablet física.** La lista de lo que falta validar en ella está al final.

## 1. Datos del dispositivo y por qué no se asumen píxeles CSS
- Pantalla de 8,7 pulgadas, **800 × 1340 píxeles físicos** (≈179 ppp), Android.
- Los píxeles CSS que ve la página son `píxeles físicos ÷ densidad` (`devicePixelRatio`), y además hay barras del sistema (estado y navegación) que restan alto. Android decide la densidad; no está fijada en el hardware. Por eso se audita un conjunto de combinaciones razonables, no una sola:

| Densidad | Vertical (CSS) | Horizontal (CSS, restando barras) |
|---|---|---|
| 1,0 | 800 × 1260 | 1340 × 700 |
| 1,33 | 600 × 950 | 1005 × 540 |
| 1,5 | 533 × 830 | 893 × 470 |

(Alturas con ~80 px menos para barras del sistema. El caso más exigente es el horizontal de 893 × 470.)
- **Para saber el valor real**: en la tablet, ⚙ → Ajustes → *Diagnóstico del dispositivo* ahora muestra **«Área visible (píxeles CSS)»** y **«Densidad de píxeles → pantalla física ≈ …»** y avisa si coincide con 800 × 1340. «Copiar informe» lo incluye.

## 2. Qué se mejoró para esta pantalla
- **Apaisado bajo** (≥640 px de ancho y ≤620 px de alto): la barra inferior pasa a **riel lateral**, para dejar toda la altura al contenido; los encabezados de actividad se compactan; la bienvenida de la clase muestra los pasos en dos columnas; la tira de módulos se oculta en juego libre.
- **Partes del cuerpo**: en apaisado bajo el enunciado va a la izquierda y la figura a la derecha, con la altura máxima posible. Cada zona se amplía de forma invisible (7 px por lado en las fotos; zonas de relleno en los dibujos).
- **Zona de adultos**: casillas de verificación, «Para el adulto» y demás controles con área táctil de al menos 44 px.
- **Íconos**: variante *maskable* con margen de seguridad para el recorte circular o redondeado de Android.

## 3. Qué se comprueba automáticamente (`qa/tablet-smoke.cjs`, 6 viewports)
En cada uno de los seis viewports: Hoy, Camino, Aprender, Jugar, Logros, mochila, bienvenida/Aprendo/Ejemplo/Practico de una clase y los tres paneles de adultos:
1. Sin desbordamiento horizontal ni controles fuera de pantalla.
2. Todos los botones y controles táctiles de ≥ 44 px de lado menor (salvo enlaces de texto y la tira de módulos).
3. Las barras fijas no ocupan más del 30-35 % del alto.
4. **Con eventos táctiles reales**: arrastrar para clasificar, unir parejas arrastrando, trazar el círculo guiado con el dedo y tocar una parte del cuerpo.
5. Sin errores de consola.

Además `qa/partes-smoke.cjs` mide, en la pantalla real de cada viewport, que cada zona que hay que tocar mide al menos 30 px de lado.

## 4. Instalación definitiva (después de tu aprobación)
La tablet debe instalar **solo** la versión de GitHub Pages: `https://montealtoc7.github.io/Estudio-Carlos-Jose-/`. Cloudflare Pages (`carlos-jose-preview.pages.dev`) es únicamente el entorno de revisión: no se instala en la tablet ni se le conecta ninguna actualización. La compilación de producción **no menciona Cloudflare ni PRUEBA** (comprobado en `test.cjs`) y el ícono con el distintivo PRUEBA solo existe en el canal de prueba.

## 5. Pendiente de la tablet física
- Valores reales de «Área visible» y «Densidad» (con Chrome y ya instalada).
- Tamaño real percibido de botones y zonas con los dedos de Carlos José; falsos toques y desplazamiento accidental al arrastrar.
- Cómo se ve el ícono en el lanzador de Samsung (One UI aplica su propio recorte).
- Giro de pantalla en medio de una clase.
- Voz española instalada en la tablet, volumen y música por su altavoz.
- Rendimiento y consumo con la música activada.
