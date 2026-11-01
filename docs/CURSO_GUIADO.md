# Mi camino de aprendizaje: clases guiadas (v5.1)

Evolución de la v5.0 aprobada (portada, imágenes de Carlos José, niveles, aventuras). **No sustituye nada**: añade un recorrido de clases que *ordena y encadena* lo que ya existe. Código: `curriculum.js` (datos y reglas puras), `course.js` (orquestador y pantallas), `audio.js` (voz, música y efectos); enganches mínimos en `games.js`, `adventures.js`, `app.js` y `shell.js`.

## 1. Qué es y qué no es
- **Es** un orquestador: una clase = bienvenida + «recordamos» + una habilidad con sus **cinco fases existentes** + un reto de aventura relacionado + comprobación + celebración. Reutiliza `openSkill`, las rondas de símbolos del módulo original y los retos de las aventuras. **No hay un segundo motor de preguntas.**
- **No es** un examen, no asigna notas ni porcentajes, no exige estudiar a diario y nunca bloquea al niño.
- Tres conceptos que **no se mezclan** (cada uno con su propio almacenamiento y su propia pantalla en el panel adulto):

| Concepto | Dónde vive | Qué responde |
|---|---|---|
| Progreso curricular | `state.course` (`curriculum.js`) | ¿En qué unidad y clase va? ¿Qué sigue? ¿Qué repasos tocan? |
| Dominio por habilidad | `progress.js` (`state.games`) | ¿Qué evidencias hay (días, formas de jugar)? Estados descubrir → consolidación |
| Nivel de aventura | insignias y niveles de `shell.js` | Motivación; no depende de las clases |

## 2. Críticas a las ideas de partida y mejoras adoptadas
| Idea o riesgo | Debilidad | Solución adoptada |
|---|---|---|
| «Una lista fija de 40 actividades» | Ordena por ruta, no enseña; no hay repaso ni progresión | 9 **unidades en espiral** (cada una mezcla ≥3 rutas) + repaso de unidad + repasos espaciados |
| Dominar todos los números antes de colores o vocales | Rígido y aburrido a los 5 años | Espiral: la unidad 1 ya combina cuerpo, colores, números, tamaños y espacio |
| Las habilidades usan números/vocales/colores/figuras ya «presentados» | **Descubrí que el motor original solo desbloquea más símbolos con las rondas de símbolos**; sin ellas, `Contar` se quedaría en 1-3 | Lecciones de **símbolos** (`numeros-a…d`, `vocales-a/b`, `colores-a/b`, `figuras-a/b`) que reutilizan esas rondas y son requisito de las habilidades que las usan |
| Ocho pantallas fijas | Alarga las clases y cansa | Pasos que se adaptan: sin recuerdo si no hay nada que recordar; sin juego si cuesta mucho la práctica o con la opción de 8 min |
| Avanzar al acertar | Un acierto aislado no es aprendizaje | Una clase solo queda «hecha» con **comprobación buena** (≥2 de 3 sin ayuda); si es floja → «otra mirada» al día siguiente; tras **2 intentos** sigue «con apoyo» (nunca se bloquea ni se frustra) |
| Evaluación diagnóstica | Puede sentirse examen; una pregunta no demuestra dominio | «La mochila misteriosa»: 12 preguntas cortas con «Todavía no lo sé»; **no entra al historial**; solo convierte la clase en **comprobación corta** («confirmar»), que si falla pasa a clase completa |
| Música «para ser más inteligente» | No hay respaldo para esa promesa (ver §8) | Música opcional solo como ambiente; no se promete nada |
| Límite diario | Presión / castigo | Solo una sugerencia de descansar tras N clases (configurable); nunca se bloquea |
| Juego libre vs curso | Riesgo de que explorar altere el orden | El juego libre **nunca escribe** en `state.course`; su evidencia se etiqueta `src:'libre'` y la de clase `src:'clase'` |

## 3. Currículo (decisión metodológica propia)
**Del Cuadernillo MINED (III Nivel) proviene el contenido** (las 8 rutas y 40 habilidades auditadas en `AUDITORIA_Y_MATRIZ.md`). **El orden, las unidades, los requisitos, los intervalos de repaso y la duración son decisiones mías**, no del Cuadernillo, que no prescribe una secuencia. El segundo PDF (Registro de valoración cualitativa) **nunca se recibió** y no se usó.

Principios: de lo concreto y cercano (mi cuerpo, colores, contar poco) a lo más abstracto; alternar rutas dentro de cada unidad; cada concepto vuelve en repasos; los requisitos son los mínimos necesarios (p. ej. `Contar` pide `Los números 1, 2 y 3`; `Antes y después` pide contar y más números).

| Unidad | Clases (en orden) |
|---|---|
| 1 ¡Empecemos! | Mi cuerpo · Mis primeros colores · Los números 1-3 · Grande y pequeño · Arriba/abajo/dentro/fuera · **Repaso** |
| 2 Cuento y comparo | Contar objetos · Igual y diferente · Mis primeras vocales · Agrupar por color · Mis cinco sentidos · **Repaso** |
| 3 Formas y patrones | Mis primeras figuras · Figuras geométricas · Series y patrones · Mucho/poco/ninguno · Cómo me siento · **Repaso** |
| 4 Palabras y sonidos | El primer sonido · Palmadas de las palabras · Rimas · Grupos y categorías · Primero/después/al final · Más números · **Repaso** |
| 5 Mi día y mi cuidado | Alimentos · Mañana/tarde/noche · Me cuido · Antes y después · Izquierda y derecha · **Repaso** |
| 6 Pienso, busco y recuerdo | ¿Qué falta? · Agrupar por forma · Juntar y quitar · Escucha y haz · Usar los colores · Todos los colores · **Repaso** |
| 7 Más palabras, más días | El último sonido · Todas las vocales · Mi nombre · Repite los colores · Cosas que van juntas · Ayer/hoy/mañana · Números más grandes · **Repaso** |
| 8 Mi comunidad y mi mundo | Lugares · Señales · Transportes · Cómo se mueven los animales · Cómo crece una planta · Adivinanzas · **Repaso** |
| 9 Descubro más | Cerca/lejos/al lado · Une los puntos · Pinta como se indica · Todas las figuras · Hasta el diez · **Gran repaso** |

59 lecciones: 40 de habilidad, 10 de símbolos y 9 de repaso. Las validaciones (`CUR.validate`) comprueban en cada ejecución: cada habilidad aparece una vez, requisitos siempre anteriores, cada unidad combina ≥3 rutas y tiene repaso.

## 4. Estructura de una clase (8-12 min de referencia, sin cronómetro)
1. **Bienvenida** personalizada por voz con su nombre y lo que haremos.
2. **Recordamos**: 2 preguntas de lo que *toca repasar* (vencido) o, si no hay nada, de la última clase. Si no hay nada que recordar, se omite.
3. **Aprendemos** (fase «Aprendo» + «Ejemplos» del motor existente).
4. **Practicamos con ayudas** (fases «Practico» y «Refuerzo»).
5. **Jugamos**: un reto real de aventura (curitas, bolsa del mercado, buscar, memoria, mezclar colores, rompecabezas, camino con flechas, semáforo) justo **antes** de comprobar. Se omite si la práctica costó (≥3 ayudas/errores) o con la opción de 8 min.
6. **Comprobamos** (3 preguntas sin pista).
7. **Celebramos**: esfuerzo, no nota; muestra la siguiente clase; tras N clases sugiere descansar.
- Las clases de **símbolos** reutilizan la ronda de 5 preguntas del módulo original; si no se alcanzó el objetivo se ofrece «Otra ronda» en el momento.
- Las clases de **repaso de unidad** recuerdan 3 habilidades (2 preguntas cada una); el **gran repaso** elige entre todo lo visto lo que más conviene repasar.
- **Controles grandes**, voz en cada pantalla y botón «Escuchar» siempre disponible; las clases ocultan los atajos que sacarían al niño del camino.

## 5. Progreso, repasos y adaptación (`curriculum.js`)
- **Hecha / refuerzo / con apoyo**: ver §2. Un éxito posterior sube a «hecha» y un fallo posterior no la baja.
- **Siguiente clase**: 1) la que quedó a medias (con su posición exacta); 2) un refuerzo de un día anterior; 3) la primera clase nueva disponible; 4) un refuerzo del mismo día; si no queda nada, el curso está completo. Cada recomendación guarda su motivo (se ve en el panel adulto).
- **La siguiente unidad abre tras el repaso de la anterior**: evita saltar a lo complejo por un acierto.
- **Repaso espaciado**: tras cada clase (y repaso) se programa un repaso a 1, 3, 7, 14 y 30 días (se alarga si sale bien; vuelve al primero si sale mal). El resultado del repaso **no cambia el dominio**, solo la agenda; sí queda como evidencia etiquetada `clase` en el historial.
- **Confirmar**: si la exploración inicial o el juego libre indican que ya lo sabe, la clase es solo la comprobación; si falla, pasa a clase completa. Incluso una comprobación perfecta programa repasos (no es dominio permanente).
- **Interrupciones**: la posición exacta (fase y pregunta, con las preguntas ya generadas) se guarda en `state.course.cur` y sobrevive a cerrar la aplicación; «Dejar esta clase» no castiga. El **juego libre interrumpido** tiene su propio `state.resume` y se recupera con una opción secundaria que no desplaza el camino.

## 6. Datos y migración no destructiva
`state.course` (versión 1) se crea **aparte** al abrir un guardado anterior (v3/v4/v5): no se toca ningún campo existente; `ensure()` solo añade lo que falta. `state.audio` hereda el antiguo `sound` (apagado → voz y efectos desactivados). El respaldo descargable incluye `course` y `audio`; un respaldo anterior sin curso se restaura y crea el curso vacío. Reiniciar el camino no toca dominio, insignias, nivel ni juego libre.

## 7. Panel adulto → pestaña «Mi camino»
Dónde va (unidad, clase en curso, siguiente), clases finalizadas (modo y resultado), habilidades **en tres cifras distintas** (introducidas en clase / comprobación buena en clase / dominio demostrado), dificultades, próximos contenidos, repasos pendientes, registro diferenciado clase/juego libre (7 días), actividades en casa, exploración inicial y preferencias (duración, clases por día, juego). Sin porcentajes de dominio.

## 8. Audio
| Canal | Control | Reglas |
|---|---|---|
| Voz | Automática · Solo al tocar «Escuchar» · Desactivada | Los botones «Escuchar» funcionan siempre salvo que el adulto desactive la voz; ya no hay botón de sonido en la cabecera |
| Música | Solo en clases · Siempre · Desactivada + volumen | Empieza tras un toque; baja a ¼ mientras se habla; se calla en comprobación, memoria y secuencias; se detiene al ocultar la pestaña, salir de la clase o cerrar; una sola pista |
| Efectos | Activados/desactivados + volumen | Tonos breves; independientes de la voz |

**Música**: composición **original generada por el código** (acordes suaves de pad en do–la menor–fa–sol y melodía pentatónica dispersa con sonido de piano; semilla fija). No usa archivos de audio, no necesita red ni licencias de terceros; funciona sin conexión. Se evaluaron piano grabado y música clásica libre: obligan a incluir archivos (peso, licencias, atribuciones) y no aportan frente a una pieza ambiental sencilla. **No se afirma que la música aumente la inteligencia ni el coeficiente intelectual**: la literatura sobre el «efecto Mozart» no sostiene esa promesa (Pietschnig, Voracek y Formann, 2010, citado de memoria; conviene verificarlo antes de reproducirlo). El único objetivo es un ambiente agradable que no distraiga.

**Actividades musicales interactivas (evaluación)**: ya existe `Repite los colores` (memoria de secuencias con sonido). Propuesta futura, no implementada porque exige validar contenido y objetivos con el adulto: «Sonidos y ritmos» (fuerte/suave, agudo/grave, rápido/lento y repetir un patrón de palmadas) como habilidad nueva con las cinco fases. Objetivo real: discriminación auditiva y ritmo, base de la conciencia fonológica que trabajan `Palmadas de las palabras` y `Rimas`.

## 9. Buenas prácticas en las que se apoya el diseño
Citadas **de memoria; no las he vuelto a consultar en esta sesión**, así que conviene verificarlas antes de usarlas fuera de este documento. Son principios, no promesas de resultado:
- **Práctica de recuperación** (recordar activamente mejora la retención frente a releer; Roediger y Karpicke, 2006) → pasos «Recordamos» y comprobaciones sin pista.
- **Repaso espaciado con intervalos crecientes** (Cepeda et al., 2006) → agenda 1-3-7-14-30 días.
- **Ejemplos resueltos y andamiaje** (Sweller; Wood, Bruner y Ross, 1976; zona de desarrollo próximo de Vygotsky) → «Ejemplos» antes de practicar, pistas que se retiran en la comprobación.
- **Currículo en espiral** (Bruner, 1960) → conceptos que vuelven con más dificultad, unidades que mezclan rutas.
- **Juego guiado** (Weisberg, Hirsh-Pasek y Golinkoff, 2013) → retos de aventura con objetivo concreto antes de comprobar.
- **Sesiones cortas**: «8–12 minutos» es una referencia práctica, no un resultado de investigación; por eso es ajustable (8/10/12) y sin cronómetro.

## 10. Qué está comprobado y qué no
Ver `VALIDACION.md`. Resumen: las reglas del currículo (Node, 10 grupos nuevos) y todos los flujos del niño y del adulto (Playwright, `qa/course-smoke.cjs`) están automatizados. **Requiere un teléfono real**: oír la voz española y la música por el altavoz, comprobar que la música no se mezcla de forma molesta con la voz, el arrastre con el dedo dentro de las clases, el tiempo real de una clase con Carlos José y si la sugerencia de pausa funciona para su atención.

## 11. Pendiente / propuestas
Símbolos nacionales, moneda, reloj y clima (no cubiertos del Cuadernillo); actividad «Sonidos y ritmos»; trazos de números y vocales dentro de las clases de símbolos; aventura «Mi huerto»; el segundo PDF del MINED.

## 12. Cómo deshacerlo
Cada etapa es un commit aparte en la rama del PR #6. Revertir `feat: curso guiado…` quita el camino; `feat: audio…` restaura el botón único de sonido. `state.course` y `state.audio` son campos nuevos: un navegador con una versión anterior los ignora.
