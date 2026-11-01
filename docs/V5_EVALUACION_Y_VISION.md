# v5.0 · Centro de Estudios Carlos José
Evaluación crítica, visión y decisiones. Base: v4.0 (PR #4). El PR #5 (propuesta externa en borrador) **no se usó ni se integró**.

## 1. Evaluación crítica

### Qué funcionaba en la v4.0 y se conserva
- 8 rutas, 40 habilidades, 17 tipos de interacción y las cinco fases (Aprendo → Ejemplos → Practico → Refuerzo → Compruebo).
- Comprobación sin pistas separada de la práctica; resultados descriptivos, sin notas.
- Los juegos antiguos, los trazos, las voces, el progreso (`primerosPasos3`) y la PWA.

### Qué se quedaba corto
| Hallazgo | Consecuencia | Respuesta en v5 |
|---|---|---|
| La portada era un menú de módulos, igual para cualquier niño | No motiva ni orienta; el niño no sabe «qué hago hoy» | Portada «Hoy»: saludo a Carlos José, nivel, botón **Continuar**, tres sugerencias con motivo y aventuras |
| La app registraba el **último** resultado de cada habilidad | Un solo acierto perfecto parecía dominio; un mal día parecía retroceso | Historial por sesión y estados de dominio con reglas visibles (§4) |
| Nada decidía qué jugar después | El adulto tenía que adivinar | Recomendaciones explicables (§5) |
| Sin objetivo narrativo | Cada habilidad era «otra pregunta» | 5 aventuras con historia, mecánicas propias y conclusión (§7) |
| Sin motivación más allá de «¡Bien!» | Poco deseo de volver | Racha de 3 sin ayuda, insignias, niveles y medallas, sin presión (§6) |
| La barra superior fija ocupaba mucho en teléfonos | Contenido apretado | Barra inferior de 4 secciones en pantallas de navegación; la barra de módulos solo dentro de actividades |
| Higiene personal faltaba | Hueco frente al Cuadernillo (p. 11) | Reto de hábitos en «Mi consultorio de peluches» |

### El kit visual de Work
| Recurso | Evaluación | Uso |
|---|---|---|
| A · Foto auténtica recortada | Es la opción fiel. Resolución baja (358×937) | Avatar redondo (vista previa privada) |
| B · Pequeño doctor ilustrado (PNG transparente) | Buen personaje, interpretación del rostro, no copia exacta | Personaje principal de la portada (vista previa privada) |
| C · Retrato médico generado | El rostro difiere; el propio kit lo desaconseja | Descartado |
| Composiciones con manchas pastel | Correctas, pero genéricas y desconectadas del paisaje real | Sustituidas por una identidad propia (§3) |

### Ideas propuestas y cómo se resolvieron
- **Temática médica**: queda como guiño (bata en «Consultorio» y «Laboratorio»), no como tema único. Las aventuras cubren animales, mercado, ciencia y camino al colegio.
- **Porcentajes y gráficos de avance**: se evitaron. Se muestran conteos, puntos de color por habilidad y barras de «cómo salieron las últimas comprobaciones».
- **Rachas diarias, rankings, presión diaria**: descartados. La insignia «Volví a jugar» no cuenta días seguidos.
- **IA externa**: no hace falta. Las reglas son pocas, explicables y funcionan sin conexión.
- **Confeti en cada acierto**: descartado; solo tras 3 aciertos seguidos sin ayuda y en logros grandes.

## 2. Foto de un menor y dónde queda alojada
El repositorio y el sitio de GitHub Pages son **públicos**. Aunque el padre lo autorice, subir su rostro ahí lo haría visible a cualquiera y quedaría en el historial de Git. Por eso:
1. **No se commitea ninguna foto ni personaje del kit.**
2. La app trae un **personaje dibujado propio** (SVG) que sirve sin imágenes.
3. En ⚙ → Ajustes → Personalización se puede **cargar la foto del rostro y el personaje transparente**. Se guardan reducidas **solo en el navegador de ese dispositivo** (no salen a internet, no van al repositorio, no entran en el respaldo).
4. La **vista previa privada** (artefacto visible solo para la cuenta del padre) incluye los dos recursos del kit para evaluar el diseño con su imagen real.
Si más adelante se prefiere incluir las imágenes en el repositorio, conviene hacerlo en un repositorio privado o decidirlo expresamente.

## 3. Identidad gráfica
- **Concepto: «atardecer en el campo»**, tomado de la fotografía: cielo violeta que pasa a coral y oro, surcos verdes, camiseta roja, pantalón azul marino.
- **Marca**: un sol saliendo sobre surcos con una estrella; «Centro de Estudios / **Carlos José**»; lema «Aprendo, juego y descubro»; «By Carlos Tijerino» en el pie y en Ajustes.
- **Color**: marino (texto), verde campo (acciones), oro (logros), coral (calidez), crema (fondo). Cada ruta y cada aventura tiene su tono propio.
- **Tipografía**: familia redondeada del sistema (sin descargas, funciona sin conexión).
- **Personaje**: Carlos José como protagonista visual (bata solo en las aventuras de consultorio y laboratorio).

Capturas de referencia (versión sin fotos): `docs/capturas/` · [Hoy en móvil](capturas/hoy_movil.png) · [Hoy en escritorio](capturas/hoy_escritorio.png) · [Logros](capturas/logros_movil.png) · [Aventura de curitas](capturas/aventura_curitas.png) · [Aventura del camino](capturas/aventura_camino.png).

## 4. Niveles y dominio (reglas transparentes)
Tres dimensiones, derivadas de los registros (`progress.js`, con pruebas):

**A · Nivel de aventura**: Explorador → Investigador → Descubridor → Gran Explorador → Gran Descubridor. Los puntos salen del *estado* de cada habilidad (1, 2, 4 o 6) y 3 por aventura completada. Repetir lo mismo el mismo día **no suma**. El nivel alcanzado no baja.

**B · Ruta**: habilidades descubiertas, en práctica, comprobadas y por repasar (conteos y puntos de color, sin porcentajes).

**C · Habilidad**
| Estado | Regla |
|---|---|
| Por descubrir | Nunca se ha jugado |
| Aprendiendo | Se jugó; ninguna comprobación tuvo 2 de 3 o más sin ayuda |
| Practicando | Una comprobación buena, en un solo día |
| Comprobada | Comprobaciones buenas en 2 días distintos y con 2 formas de jugar distintas |
| En consolidación | Comprobada y con comprobaciones buenas en 3 días distintos repartidos en 6 días o más |

Una comprobación perfecta **no** basta. Una mala sesión **no** quita lo logrado: solo marca «repaso». Las insignias, estrellas y el nivel ya ganados se conservan siempre. Los registros de la v4.0 se interpretan como una sesión. **El historial se recorta a las últimas 14 sesiones, pero las pruebas (días y formas con comprobación buena, días activos) se guardan aparte y solo crecen**, de modo que un estado ya demostrado no se pierde por descartar registros antiguos (prueba de regresión incluida).

## 5. Aprendizaje adaptativo (`coach.js`)
Reglas por prioridad, con el motivo en lenguaje claro para el adulto:
1. **Repasar** lo ya comprobado que falló la última vez (con ejemplos adicionales del formato que costó).
2. **Seguir** con lo que todavía se está aprendiendo.
3. **Comprobar** en otro día lo que salió bien una sola vez (repaso corto, sin pistas).
4. **Recordar** lo comprobado hace 3 días o más (10 si está en consolidación).
5. **Nuevo**: habilidades cuyos requisitos suaves ya están practicados (p. ej. «Antes y después» tras «Contar»); alterna rutas.
6. **Aventura** que usa habilidades que ya conoce.
Siempre incluye algo nuevo o una aventura (no solo repasos), una sugerencia por ruta y es estable durante el día. Aumenta la dificultad con los mismos generadores (variantes de la fase «Compruebo»). No usa servicios externos.

## 6. Recompensas
- Tres respuestas seguidas sin ayuda → mensaje breve con su nombre y confeti corto.
- Insignias (primer paso, curioso, volví a jugar, sigo intentando, me acordé, estrellas, consolidada, una por ruta y una por aventura) y niveles: celebración una sola vez.
- Sin castigos, sin rankings, sin contadores de días seguidos.
- Controles: sonido (♫) y «Animaciones y confeti» (según el dispositivo, siempre o reducir); respeta «reducir movimiento» del sistema.

## 7. Aventuras
| Aventura | Mecánicas propias | Habilidades que reutiliza |
|---|---|---|
| 🩺 Mi consultorio de peluches | Arrastrar curitas a la parte del cuerpo | Partes, contar, colores, hábitos, emociones |
| 🛒 El mercado de Carlos José | Lista de compras en dibujos y bolsa | Contar, categorías, más/menos, juntar y quitar |
| 🦁 Safari de animales | Buscar animales escondidos; memoria de tarjetas | Tamaño, cómo se mueven, adivinanzas |
| 🧪 Laboratorio de descubrimientos | Mezclar colores; rompecabezas de figuras | Series, igual/diferente, formas |
| 🚌 Mi camino al colegio | Camino con flechas; semáforo para cruzar | Transportes, orden del día, señales |

Todas tienen historia breve, voz, cinco retos, pistas, medalla y estrellas por lo que se hizo sin ayuda. Cada vez se generan retos nuevos. Sin diagnósticos ni procedimientos médicos reales.
**Propuestas que no se implementaron**: «Mi huerto» (sembrar, regar, ordenar el crecimiento), «La fiesta de cumpleaños» (contar velas, secuencias, formas) y «Cocinamos con mamá» (cantidades y secuencias).

## 8. Panel adulto
Pestañas **Resumen** (nivel, conteos, sugerencias del día con su motivo, actividad reciente), **Progreso** (por ruta y habilidad, sesiones, ayudas y evolución en barras, reglas), **En casa** (actividades para la semana, qué hacer si algo cuesta, guía fuera de pantalla), **Ajustes** (voz, nombre, animaciones, fotos locales, **respaldo descargable y restaurable**, protección de datos, créditos).

## 9. Qué cambia en el código
Archivos nuevos: `progress.js`, `coach.js`, `adventures.js`, `shell.js`, `qa/*`. `games.js` guarda historial, modos de repaso y reanuda; `app.js` solo recibe puntos de integración. La clave de guardado y la PWA no cambian.

## 10. Verificación
Ver `VERIFICACION.md` (sección v5): pruebas automáticas, recorridos en navegador a 320, 390, 768 y 1440 px y lo que sigue pendiente en un teléfono real.

## 11. Pendiente y riesgos
- Voz española real, tonos, arrastre con dedo físico, instalación y modo avión: **no verificables aquí**.
- Contenido del Cuadernillo aún sin cubrir: símbolos nacionales y escudo, moneda, reloj, clima. El segundo PDF (Registro de valoración) sigue sin recibirse.
- Los emojis dependen del sistema; para un acabado premium convendría ilustraciones propias.
- Las sesiones de aventura duran unos 5 minutos; conviene una por vez.
