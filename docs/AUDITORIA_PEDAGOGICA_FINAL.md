# Auditoría pedagógica final (v5.3.0)

Ejecutable: `node qa/audit-pedagogica.cjs [--verbose]` (corre en CI). Una máquina no puede juzgar la calidad de la voz ni la claridad percibida por un niño de 5 años; eso queda en la lista humana del final.

| Criterio | Cómo se comprueba | Resultado |
|---|---|---|
| Progresión de números/vocales/colores/figuras: el texto de cada lección coincide con lo que desbloquea | Compara `reach` de cada lección de símbolos con los números/letras/nombres de su texto | **Defecto corregido:** «1, 2 y 3» desbloqueaba hasta el 4; «hasta el 5» → 6; «hasta el 7» → 8; figuras sin la X; colores sin nombrarse. Ahora coinciden las 10 lecciones |
| Explicación antes de evaluar | Cada habilidad tiene título, voz y tarjetas/figuras de «Aprendo» | 40/40 |
| Variedad | Fases con ≥1 formato; comprobación con ≥2 formatos | 40/40 (avisos con `--verbose` donde varios formatos producen el mismo tipo de pregunta) |
| Consignas cortas con voz | ≤ 20 palabras por consigna o por paso (pintar muestra un paso por vez) | Sin consignas largas |
| Lateralidad | 800 preguntas generadas: sin personas de frente, consignas con «tu» | OK |
| Seguridad | Pruebas en `test.cjs`: respuesta correcta siempre alejarse/avisar/cuidarse; sin imágenes ni palabras de daño | OK |
| Emociones | Lenguaje que no juzga; estrategia por emoción | OK |
| Práctica fuera de pantalla | `learn.adult` y `home` presentes y no vacíos | 40/40 |
| Sin anatomía oculta | Toda pregunta táctil es sobre una parte visible; no se pregunta lengua/corazón/cerebro sobre figuras | OK |
| Sin resaltados prematuros | El único `hl:q.answer` está en el ejemplo resuelto | OK |
| Transferencia | Al comprobar, ≤ 40 % de las figuras son las del aprendizaje | Partes 18 %, Sentidos 28 %, Emociones 7 %, Primero/después 0 %, Mañana/tarde/noche 0 % |

## Requiere revisión humana (con Carlos José)
- Que la voz española de la tablet se entienda y no tropiece con «¿Con qué parte del cuerpo lo hace?».
- Si las opciones de solo emoji se entienden con «Escuchar las opciones» (seguridad: «un adulto» como 🧑).
- Si las seis expresiones se distinguen a su tamaño real y si «asustado» no resulta inquietante.
- Ritmo y duración de las clases con las preguntas nuevas.
