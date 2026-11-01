# Personalización con Carlos José: auditoría, criterio y sistema visual (v5.2 · actualizado en v5.3)

Objetivo: que Carlos José se reconozca en la aplicación **sin** convertirla en un collage de fotos y **sin** perder la capacidad de generalizar (reconocer lo aprendido en otras personas y contextos).

## 1. Criterio de decisión
Se personaliza **solo cuando mejora el aprendizaje**:

| Personalizar con Carlos José | Mantener una representación general |
|---|---|
| El concepto trata de personas, cuerpo, emociones, rutinas o acciones (el niño puede **verse** haciéndolo) | El concepto es abstracto: número, cantidad, letra, sonido, forma, color, serie |
| Una foto real aporta el contexto que un dibujo no da (cara, postura, gesto) | La **variación** del estímulo es lo que enseña (clasificar, comparar, completar patrones) |
| Hay una acción que puede repetir después fuera de la pantalla | El dibujo esquemático aísla mejor el atributo (p. ej. un círculo que es solo círculo) |

Regla de generalización: Carlos José es el protagonista habitual de **aprender y practicar**, pero **comprobar** incluye siempre otras personas, para que reconozca el concepto y no a un dibujo memorizado.

## 2. Qué se implementó en esta etapa: «Partes de mi cuerpo»
| Fase | Recurso | Detalle |
|---|---|---|
| Aprendo | Foto auténtica de Carlos José de cuerpo entero y foto de su cara | Cada parte se toca para oír su nombre y se escribe; no se resalta ninguna respuesta porque no hay pregunta |
| Ejemplos | Foto o ilustración de Carlos José | «Mira cómo se hace»: la parte pedida se resalta y se explica |
| Practico | Ilustración fiel de Carlos José (médico) y fotos suyas | Con pista (resalta la parte); zonas táctiles sobre la propia imagen |
| Refuerzo | Uso de cada parte; **pintar** un dibujo humano para colorear | Conserva la actividad existente; el dibujo ahora es una persona, no figuras geométricas |
| Compruebo | **Otras personas ilustradas** (mamá, papá, niña, abuelo) y caras de Carlos José | **Sin pista y sin resaltar**; el cuerpo siempre se comprueba en otra persona |
| Fuera de pantalla | Texto para el adulto | «Pídanle que señale su propia cabeza, manos, pies y brazos, y también los de mamá o papá» |

Garantías (automatizadas, ver `qa/partes-smoke.cjs` y `test.cjs`):
- Cada figura declara **solo las partes visibles** (en las fotos no se pregunta por partes ocultas ni fuera de encuadre). La barriga se toma como la zona del abdomen con la ropa puesta; en la foto de la cara no hay cuerpo.
- Las zonas de las fotos son polígonos/elipses **verificados visualmente** (`docs/capturas/personas_zonas_*.png`) y con pruebas de **orden anatómico** (cabeza sobre barriga, piernas y pies; cabello sobre ojos, nariz y boca).
- Las imágenes no se deforman (`preserveAspectRatio`) y cada zona se amplía de forma invisible 7 px por lado para dedos pequeños; se mide cada zona en pantalla real (≥30 px).
- Se conservan el motor, las cinco fases, las ayudas, la voz y el registro de resultados.

## 3. Auditoría de las 40 habilidades
Leyenda: **✅ hecho** · **A** personalizar con prioridad · **B** personalizar si hay fotos · **C** conservar tal cual.

| Ruta | Habilidad | Decisión | Por qué / recurso necesario |
|---|---|---|---|
| Cuerpo | Partes de mi cuerpo | ✅ | Ver §2 |
| Cuerpo | Los cinco sentidos | **A** | Fotos de Carlos oliendo una flor, probando un limón, tocando un peluche, escuchando música |
| Cuerpo | Cómo me siento (emociones) | **A** | Hoy son caras de emoji. Rostros **reales** (Carlos y otras personas) con 5-6 emociones enseñan a reconocer expresiones verdaderas |
| Cuerpo | Alimentos que me ayudan a crecer | **B** | Carlos comiendo fruta/verdura; mantener las ilustraciones de alimentos para comparar |
| Cuerpo | Me cuido y me cuidan (seguridad) | **B** | Carlos cruzando con un adulto; el semáforo y las señales se conservan |
| Dónde y cuándo | Primero, después y al final | **A** | Secuencias con personas (levantarse → desayunar → ir a la escuela); conservar también «huevo → pollito» para generalizar |
| Dónde y cuándo | Mañana, tarde y noche | **B** | Carlos en cada momento del día |
| Dónde y cuándo | Izquierda y derecha | **A** | Carlos levantando su mano derecha/izquierda (con pulsera); conservar escenas con objetos |
| Dónde y cuándo | Arriba/abajo/dentro/fuera y Cerca/lejos… | **B** | Carlos encima/dentro/fuera de una caja, detrás de un árbol; conservar escenas de objetos |
| Dónde y cuándo | Ayer, hoy y mañana | C | Texto con ayuda para leer; no necesita fotos |
| Palabras y sonidos | Mi nombre | **A** | Tarjeta con su foto y su nombre (muy personal y útil); las letras se conservan |
| Palabras y sonidos | Vocales, sílabas, rimas, adivinanzas | C | El estímulo es sonoro o escrito |
| Mi mundo | Lugares de mi comunidad | **B** | Fotos de su escuela, su casa y su parque (lugares reales) |
| Mi mundo | Cómo crece una planta | **B** | Carlos regando una planta |
| Mi mundo | Señales que nos cuidan | C | Las señales deben verse exactamente como en la calle |
| Pienso y descubro | Escucha y haz | **B** | Carlos demostrando acciones (salta, aplaude); el audio es lo central |
| Pienso y descubro | Cosas que van juntas, Series, Igual y diferente, ¿Qué falta?, Repite los colores, Une los puntos | C | Lógica y percepción: los objetos claros aíslan el atributo |
| Clasificar | Agrupar por color/forma, Tamaños, Categorías, Cómo se mueven, Transportes | C | La variación es la enseñanza; las fotos añadirían ruido |
| Formas y colores | Figuras, Usar los colores, Pinta como se indica | C | Excepto el dibujo del cuerpo para colorear, que ya es humano |
| Números | Contar, Mucho/poco, Antes y después, Juntar y quitar | C | Cantidad y número son abstractos |

**Total:** 1 habilidad hecha (más el dibujo de pintar), 5 de prioridad alta, 8 condicionadas a fotos, el resto se conserva. No se reescribieron las 40 por obligación.

## 4. Las cinco aventuras
| Aventura | Decisión |
|---|---|
| Mi consultorio de peluches | Ya usa a Carlos con bata como anfitrión; el paciente es un peluche (conservar) |
| El mercado de Carlos José | Ya lo tiene como protagonista; conservar productos ilustrados |
| Safari de animales | Conservar (animales) |
| Laboratorio de descubrimientos | Ya usa a Carlos con bata; conservar |
| Mi camino al colegio | Opcional: sustituir el muñeco que camina por su ilustración; no urgente |

## 5. Guion de fotos para la familia (opcional; no es obligatorio)
Todas con permiso del adulto responsable. Fondo sencillo, buena luz, cuerpo completo cuando sea posible y sin texto. **Recuerden que el repositorio y el sitio son públicos**: lo que se incorpore queda visible en internet y en el historial de Git.
1. **Emociones** (6 caras): contento, triste, enojado, sorprendido, con sueño, asustado (actuadas, en juego).
2. **Sentidos**: oliendo una flor, probando un limón (o fruta), tocando un peluche, con la mano en la oreja.
3. **Izquierda/derecha**: levantando solo la mano derecha y solo la izquierda, de frente.
4. **Posiciones**: encima, dentro y fuera de una caja; detrás de una silla; entre dos cajas.
5. **Rutinas**: despertándose, desayunando, lavándose los dientes, yéndose a la escuela, durmiendo (para secuencias).
6. **Otras personas** (con su permiso): mamá, papá, abuelos o amigos de pie, de frente, para «Compruebo».
7. **Mi nombre**: una foto de la cara cerca del nombre escrito.

## 6. Sistema visual reutilizable
| Nivel | Dónde | Imagen |
|---|---|---|
| Identidad | Ícono instalado, favicon y cabecera | Medallón de Carlos José con su cubo (`qa/make-icons.py`) |
| Portada | «Hoy» | Carlos vestido de médico (aprobado; sin cambios) |
| Clases y actividades humanas | Partes del cuerpo (hoy); futuras | Fotos o ilustraciones fieles (`assets/people/`, `people.js`) |
| Didáctico | Números, formas, lógica, objetos | Dibujos claros y precisos (sin cambios) |

**Para agregar una foto nueva**: copiar la imagen (WebP, sin textos) a `assets/people/`, añadir una entrada en `people.js` con el tamaño y las zonas de cada parte visible (elipses o polígonos en coordenadas de la imagen), dibujar el contorno con `node qa/overlay-zonas.cjs ids salida.png` y revisarlo, y ejecutar `node test.cjs` y `node qa/partes-smoke.cjs`. El manifiesto del service worker incluye automáticamente todo lo que haya en `assets/`.

## 7. Actualización v5.3.0
Se implementaron las cinco habilidades marcadas **A**: Los cinco sentidos, Cómo me siento, Primero/después/al final, Izquierda y derecha y Mi nombre; ver `docs/MATRIZ_MEJORAS_FINAL.md`. Las filas **B** que dependían de fotos nuevas (alimentos, posiciones, lugares, planta, instrucciones) se conservan: **no se fabricaron fotografías** y los lugares identificables requieren autorización. Cambio de criterio respecto al §3: «Cómo me siento» usa **rostros dibujados** (no fotos de Carlos) porque no hay fotos suyas con esas emociones.
