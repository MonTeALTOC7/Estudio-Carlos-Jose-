# Auditoría técnica y pedagógica · de la v3.2 a la v4.0

Base auditada: `main` en `f0744f6` (v3.2, 31-10-2026). Rama de trabajo: `claude/blissful-newton-jx8npe`.
Este documento separa tres cosas que no deben mezclarse: **lo que dice el Cuadernillo MINED** (evidencia), **lo que propone este trabajo** (buenas prácticas) y **lo que sigue sin validarse** (colegio, dispositivos, niño real).

## 1. Fuentes y límites

| Fuente | Estado |
|---|---|
| Cuadernillo Didáctico de III Nivel, MINED 2021 | **Leído completo (32 páginas)**. Es un cuaderno de actividades para hacer en casa con la familia (colorear, recortar, comentar, unir). No trae evaluación ni criterios de ingreso. |
| «Registro informativo de valoración cualitativa III Nivel» (2 páginas) | **No se recibió** en esta sesión (solo llegaron el Cuadernillo y el documento de continuidad). Sin él no se puede contrastar qué indicadores observa la docente. No se atribuye nada a ese documento. |
| Temario o examen del colegio | **No existe evidencia.** La app no simula ningún examen ni promete aprobación. |
| Estado del sitio publicado | No se volvió a abrir en un dispositivo físico. |

## 2. Auditoría técnica de la v3.2

| Hallazgo | Evidencia | Decisión en v4.0 |
|---|---|---|
| Proyecto nativo sin dependencias; `build.cjs` une los archivos en `dist/index.html` | `build.cjs`, `page.html` | Se conserva. Se añaden marcadores `/*CONTENT*/` y `/*GAMES*/`. |
| `app.js` tiene 92 líneas de hasta 5 000 caracteres: difícil de revisar | `wc -c app.js` = 45 685 B | **No se refactoriza** (riesgo de romper lo que funciona). Todo lo nuevo va en archivos aparte y legibles. |
| Pruebas: 10 grupos de lógica; ninguna recorre la interfaz | `test.cjs` | +12 grupos de contenido (ver §6) y `qa/ui-smoke.cjs`, que resuelve cada habilidad con clics reales. |
| Todas las comparaciones eran binarias (50 % de acierto al azar) y con un solo gesto (tocar) | `activities.js` (`question()`) | Formatos con 3–4 opciones, ordenar, clasificar, unir, colocar, recordar (17 tipos de interacción). |
| Series solo AB con dos elementos | `activities.js` (`pattern`) | AB, AAB, ABB, ABC, completar dos huecos y hueco en el medio, con color, forma, tamaño e imagen. |
| Solo 4 colores y 4 figuras (círculo, X, cuadrado, triángulo) | `engine.js` (`groups`) | 8 colores y 7 figuras (rectángulo, óvalo, rombo, MINED p. 14). El progreso anterior sigue válido (clave `primerosPasos3`). |
| Una sola palabra de ejemplo por vocal | `app.js` (`refs`) | 3 a 8 palabras por vocal para empezar y terminar, sílabas y rimas. |
| Sin sonidos propios; todo depende de la voz del dispositivo | `app.js` (`speak`) | Se añaden tonos suaves (WebAudio) y **todas las consignas se muestran escritas** además de leerse. La dependencia de la voz española **sigue siendo un riesgo** (ver §7). |
| Navegación: dos botones y un diálogo | `page.html` | Además, una tira de módulos siempre visible (con el módulo actual resaltado) y el diálogo agrupado. |
| Panel adulto sin guía de actividades fuera de pantalla | `app.js` (`dashboard`) | Se añade el informe por habilidad y la guía «Fuera de la pantalla» (MINED). |

## 3. Auditoría pedagógica de la v3.2

Lo que sí tenía y se conserva: números 1–10 con cantidad, vocales con mayúscula, colores, figuras, uniones, comparaciones, memoria, posiciones básicas, trazos y panel adulto.
Lo que faltaba: (a) **profundidad** (cada habilidad se practicaba con un solo gesto), (b) **transferencia** (no se pasaba de «reconozco el símbolo» a «lo uso con otras cosas»), (c) **áreas completas** del Cuadernillo (lenguaje oral, tiempo, cuerpo, entorno, seguridad), (d) **comprobación separada de la práctica**: no había una fase final sin pistas por habilidad.

## 4. Matriz de cobertura del Cuadernillo MINED (por página)

Leyenda: ✅ cubierto · ◐ parcial · ➖ fuera de pantalla (guía para el adulto) · ❌ pendiente. «v3.2» = antes; «v4.0» = esta rama.

| Pág. | Tema del Cuadernillo | v3.2 | v4.0 | Dónde |
|---|---|---|---|---|
| 5 | Vínculos afectivos, canción de buenos días, mi preescolar | ❌ | ➖ | Guía: canto y movimiento |
| 6 | Imagen corporal (pintar partes con colores indicados) | ❌ | ✅ | `pintar`, `partes` |
| 6 | Cuantificadores: mucho/poco, todo/ninguno, algunos, más/menos | ◐ | ◐ | `cuantos` (mucho, poco, ninguno, más, menos; faltan «todo» y «algunos») |
| 7 | Cinco sentidos | ❌ | ✅ | `sentidos` |
| 7 | Vocabulario y adivinanzas (frutas, cuerpo) | ❌ | ✅ | `adivinanzas` (adivinanzas propias, no copiadas) |
| 8 | Grafoplástica: modelado | ❌ | ➖ | Guía: plastilina |
| 8–9 | Nociones espaciales (arriba/abajo, dentro/fuera, encima/debajo, delante/detrás, al lado, entre, cerca/lejos, abierto/cerrado, primero/último) | ◐ (4) | ✅ (todas menos «alrededor») | `posiciones`, `posiciones2` |
| 9 | Tiempo: día/noche, mañana/tarde, antes/después, ayer/hoy/mañana | ❌ | ◐ | `dia-noche`, `orden-eventos`, `dias-semana` (falta «durante») |
| 10 | Días de la semana | ❌ | ◐ | `dias-semana` (usa palabras escritas: requiere apoyo de lectura) |
| 10 | Alimentación saludable | ❌ | ✅ | `alimentos` |
| 11 | Higiene personal | ❌ | ❌ | Solo aparece «lavarse las manos» en `orden-eventos` |
| 11 | Características físicas (colorear el cabello) | ❌ | ◐ | `pintar` (cuerpo; sin cabello) |
| 12 | Música y danza | ❌ | ➖ | Guía |
| 12 | Lateralidad izquierda–derecha | ❌ | ◐ | `izq-der` (respecto de la pantalla, no del propio cuerpo) |
| 13 | Lleno/vacío, más lleno que, igual cantidad | ◐ | ✅ | `relations` (ya existía) y `cuantos` |
| 13 | Portadores de texto (etiquetas, avisos) | ❌ | ➖ | Guía: recortar y pegar |
| 14, 28 | Nombre propio y de la familia | ❌ | ◐ | `mi-nombre` (nombre del niño; falta el de la familia) |
| 14 | Figuras: triángulo, círculo, cuadrado, rectángulo, óvalo, rombo; unir iguales | ◐ (3) | ✅ | `figuras`, `clasif-forma`, `igual-diferente` |
| 15 | Repintar figuras | ◐ | ✅ | Trazos (añade rectángulo, rombo, óvalo) |
| 15 | Tamaño: largo/corto, alto/bajo, grueso/delgado, más grande, igual; perrito y casa | ◐ | ◐ | `tamano` (falta «ancho/angosto») |
| 16 | Partes internas del cuerpo | ❌ | ◐ | Tarjetas de corazón y cerebro en `partes` (sin juego) |
| 16–17 | Trozado, arrugado, pegado | ❌ | ➖ | Guía |
| 17 | Celebraciones y costumbres familiares | ❌ | ➖ | Guía: conversación |
| 18 | Símbolos convencionales (señales, semáforo) | ❌ | ✅ | `senales`, `seguridad` |
| 18 | Símbolos creados (clima, caritas) | ❌ | ◐ | `emociones` (falta el clima) |
| 19 | Seriación con figuras y colores | ◐ (AB) | ✅ | `series` |
| 19 | Vocales (canción, tarjetas) | ◐ | ✅ | `vocal-inicial` + módulo Vocales |
| 19–20 | Grafomotricidad: recta horizontal/vertical/inclinada, curva, ondulada, punteada, cruz, bucle, mixta, quebrada | ◐ | ✅ | Trazos (+10 trazos); «punteada» y «punto» quedan para papel |
| 20 | Autocuidado y peligros sin un adulto; equidad de género | ❌ | ◐ | `seguridad` (peligros); equidad de género queda para conversación |
| 21 | Sonidos finales; sonidos iniciales; rimas | ❌ / ◐ | ✅ | `vocal-final`, `vocal-inicial`, `rimas` |
| 22 | Palabras de una o más sílabas (palmear) | ❌ | ✅ | `silabas` |
| 23 | Medios de transporte (aire, agua, tierra) | ❌ | ✅ | `transporte` |
| 23 | Seguridad vial: completar y colorear el semáforo | ❌ | ✅ | `pintar`, `seguridad` |
| 24 | Símbolos patrios: bandera; escudo; himno | ❌ | ◐ | Bandera en `pintar` (sin escudo). Escudo e himno: ❌ |
| 24–25 | Símbolos nacionales (flor, ave, árbol); fiestas patrias; cultura | ❌ | ❌ | Necesitan imágenes reales; ver §7 |
| 26 | La comunidad limpia y segura | ❌ | ◐ | `lugares`; la limpieza queda en la guía |
| 27 | Unir cantidad de objetos con su número | ✅ | ✅ | Módulo Números, `contar` |
| 28 | Antecesor y sucesor | ❌ | ✅ | `antes-despues` |
| 28 | Moneda nacional | ❌ | ❌ | Requiere imágenes exactas de las monedas |
| 29 | El reloj y el reloj solar | ❌ | ❌ | Guía (reloj real) |
| 30 | Huerto escolar; canto infantil | ❌ | ◐ | `planta`; canto en la guía |
| 31 | Derechos y deberes; educación fiscal | ❌ | ➖ | Conversación |

## 5. Lo que incorpora la v4.0

**Método en cada habilidad** (`games.js`, función `openSkill`): 1) *Aprendo*: tarjetas tocables con voz y nota para el adulto; 2) *Ejemplos*: 2 problemas ya resueltos y explicados; 3) *Practico*: 3 preguntas con pista (la pista cuenta como ayuda); 4) *Refuerzo*: 2 preguntas con **otro formato**, más una extra del formato fallado si hubo error; 5) *Compruebo*: 3 preguntas **sin pista** con estímulos nuevos. Equivocarse no penaliza: se puede reintentar, pero ya no cuenta como «sin ayuda».

**Qué no hace:** no asigna notas ni «dominio»; muestra «x de y sin ayuda» y lo llama muestra de hoy. No desbloquea números ni vocales (eso sigue siendo del módulo de símbolos), y **nunca muestra un número o una vocal que el niño no haya visto** (lo verifica una prueba automática).

**Variedad:** 40 habilidades en 8 rutas, 137 formatos de pregunta, 17 tipos de interacción, y las preguntas se generan al azar sin repetir estímulos dentro de una sesión ni dar pistas por posición.

| Ruta | Habilidad | Formas de interacción |
|---|---|---|
| 🔢 Números y cantidades | **Contar objetos** (`contar`) | elegir, poner la cantidad |
| 🔢 Números y cantidades | **Mucho, poco y ninguno** (`cuantos`) | elegir, ordenar, clasificar |
| 🔢 Números y cantidades | **Antes y después** (`antes-despues`) | elegir, ordenar |
| 🔢 Números y cantidades | **Juntar y quitar** (`juntar`) | elegir, poner la cantidad |
| 🔤 Palabras y sonidos | **Con qué vocal empieza** (`vocal-inicial`) | elegir, clasificar |
| 🔤 Palabras y sonidos | **Con qué vocal termina** (`vocal-final`) | elegir, clasificar |
| 🔤 Palabras y sonidos | **Palmadas de las palabras** (`silabas`) | aplaudir sílabas, clasificar, elegir |
| 🔤 Palabras y sonidos | **Palabras que suenan igual** (`rimas`) | elegir, unir parejas |
| 🔤 Palabras y sonidos | **Adivinanzas y sonidos** (`adivinanzas`) | elegir, seguir instrucción |
| 🔤 Palabras y sonidos | **Mi nombre** (`mi-nombre`) | ordenar, elegir |
| 🧺 Clasificar y comparar | **Agrupar por color** (`clasif-color`) | clasificar, tocar todos, elegir |
| 🧺 Clasificar y comparar | **Agrupar por forma** (`clasif-forma`) | clasificar, tocar todos, elegir |
| 🧺 Clasificar y comparar | **Tamaños y medidas** (`tamano`) | clasificar, ordenar, unir parejas, elegir |
| 🧺 Clasificar y comparar | **Grupos y categorías** (`categorias`) | clasificar, elegir |
| 🧺 Clasificar y comparar | **Cómo se mueven los animales** (`donde-viven`) | clasificar, elegir |
| 🧺 Clasificar y comparar | **Medios de transporte** (`transporte`) | clasificar, elegir, unir parejas |
| 🔷 Formas y colores | **Figuras geométricas** (`figuras`) | elegir, tocar todos, unir parejas |
| 🔷 Formas y colores | **Usar los colores** (`colores-uso`) | elegir, unir parejas |
| 🔷 Formas y colores | **Pinta como se indica** (`pintar`) | pintar, elegir |
| 🧩 Pienso y descubro | **Series y patrones** (`series`) | elegir, completar la fila |
| 🧩 Pienso y descubro | **Igual y diferente** (`igual-diferente`) | elegir, tocar todos, unir parejas |
| 🧩 Pienso y descubro | **¿Qué falta? ¿Qué cambió?** (`que-falta`) | recordar y elegir, recordar el orden |
| 🧩 Pienso y descubro | **Escucha y haz** (`instrucciones`) | seguir instrucción, ordenar |
| 🧩 Pienso y descubro | **Repite los colores** (`simon`) | repetir secuencia, recordar el orden |
| 🧩 Pienso y descubro | **Une los puntos** (`une-puntos`) | unir puntos, seguir instrucción |
| 🧩 Pienso y descubro | **Cosas que van juntas** (`parejas-func`) | unir parejas, elegir |
| 🧭 Dónde y cuándo | **Arriba, abajo, dentro y fuera** (`posiciones`) | colocar en la escena, elegir |
| 🧭 Dónde y cuándo | **Al lado, delante, detrás y entre** (`posiciones2`) | colocar en la escena, elegir |
| 🧭 Dónde y cuándo | **Izquierda y derecha** (`izq-der`) | elegir, colocar en la escena |
| 🧭 Dónde y cuándo | **Día y noche** (`dia-noche`) | clasificar, elegir, ordenar |
| 🧭 Dónde y cuándo | **Primero, después y al final** (`orden-eventos`) | ordenar, elegir |
| 🧭 Dónde y cuándo | **Los días de la semana** (`dias-semana`) | elegir, ordenar |
| 🧍 Mi cuerpo y yo | **Partes de mi cuerpo** (`partes`) | tocar la parte, elegir, pintar |
| 🧍 Mi cuerpo y yo | **Los cinco sentidos** (`sentidos`) | unir parejas, elegir |
| 🧍 Mi cuerpo y yo | **Alimentos que me ayudan a crecer** (`alimentos`) | clasificar, elegir |
| 🧍 Mi cuerpo y yo | **Cómo me siento** (`emociones`) | elegir, unir parejas |
| 🧍 Mi cuerpo y yo | **Me cuido y me cuidan** (`seguridad`) | clasificar, elegir |
| 🌎 Mi mundo | **Lugares de mi comunidad** (`lugares`) | elegir, unir parejas |
| 🌎 Mi mundo | **Señales que nos cuidan** (`senales`) | elegir, unir parejas |
| 🌎 Mi mundo | **Cómo crece una planta** (`planta`) | ordenar, tocar todos, elegir |

## 6. Pruebas y validación

- `node test.cjs`: 22 grupos (10 anteriores + 12 nuevos): estructura de cada habilidad; **más de 20 000 preguntas generadas** en tres niveles de avance sin errores ni textos rotos; símbolos no enseñados; posición de la respuesta; sesión de cinco fases sin repetir estímulos; semilla reproducible; compatibilidad con el progreso anterior; trazos nuevos; fecha real para ayer/hoy/mañana; nombre.
- `node qa/ui-smoke.cjs`: abre la aplicación en Chromium, entra a cada habilidad y la completa con clics (incluyendo errores a propósito), comprueba que el avance se guarda y que nada se sale de la pantalla. Resultados en `VERIFICACION.md`.

## 7. Pendiente y riesgos (no resueltos)

1. **Voz española**: si el teléfono no tiene voz de texto a voz en español, el niño no oye las consignas. Las consignas siempre están escritas, pero el niño aún no lee. Mejor solución: grabar audios (requiere decidir quién los graba y su peso en la app).
2. **Pruebas en dispositivos reales** (audio, arrastre con el dedo, instalación, modo avión): pendientes. Lo probado fue Chromium con pantalla táctil emulada.
3. **Emojis como ilustraciones**: se ven distinto según el sistema y necesitan un teléfono reciente (Android 9 / iOS 12.1 o superior). Se evitó usar emojis posteriores a 2018. Alternativa futura: dibujos propios en SVG.
4. **Contenido nacional** (símbolos nacionales, escudo, himno, moneda, reloj): necesita imágenes exactas que no se inventaron.
5. **Registro de valoración cualitativa**: reenviar el PDF para comparar indicadores.
6. **Examen o temario del colegio**: preguntar al colegio qué evalúa.
7. **Higiene personal, clima, ancho/angosto, «todo/algunos», «alrededor», «durante»**: temas del Cuadernillo que quedaron para la siguiente iteración.
8. **Uso real con el niño**: ajustar dificultad y duración; las sesiones de 8–9 preguntas pueden ser largas para 5 años: conviene jugar una habilidad por sesión.
