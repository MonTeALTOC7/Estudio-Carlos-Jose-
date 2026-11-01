# Matriz final de mejoras (v5.3.0) · Centro de Estudios Carlos José

**Alcance:** esta etapa vive en la rama `claude/centro-carlos-jose-v5` (PR #6, sobre PR #4). No se tocó `main`, no se integró el PR #5, no se hizo merge ni publicación en GitHub Pages. Todo lo «probado» se ejecutó en Chromium emulado, **no en la tablet física**.

Convenciones de recursos: ✍️ ilustración dibujada por código (no son fotografías); 📷 fotografías auténticas ya existentes de Carlos José (`assets/avatar.webp`, `hero.webp`, fotos de cuerpo/cara); **no se fabricó ninguna fotografía** de Carlos José ni de su familia: los dibujos de mamá, papá, niña, niño y abuelo son genéricos y así se rotulan.

## A. Las cinco habilidades humanas

| # | Problema encontrado | Cambio | Por qué ayuda | Qué se conservó y por qué | Pruebas | Revisión física pendiente |
|---|---|---|---|---|---|---|
| 1 · **Los cinco sentidos** | Todo eran emojis de objetos; el niño no se veía a sí mismo ni reconocía los sentidos en una persona | Acciones con su nombre («Carlos huele una flor… ¿con qué parte lo hace?»), toques sobre ojos/orejas/nariz/boca de una cara y sobre las manos, otras personas al comprobar; adulto: caminata de sentidos y adivinar con ojos cerrados | Une sentido ↔ parte del cuerpo de personas reales; se transfiere a mamá, papá, Ana, el abuelo | Las tarjetas con emoji y las parejas parte↔objeto (aísla el concepto); la **lengua no se pregunta sobre figuras** (está oculta): se toca la boca | `test.cjs` (nombre configurado, otras personas, solo partes visibles), `qa/audit-pedagogica.cjs`, `qa/ui-smoke.cjs` | Que el niño asocie oler/probar con su propia nariz/boca; voz española |
| 2 · **Cómo me siento** | Caras de emoji genéricas; sin estrategias; situaciones sin protagonista | Seis expresiones **dibujadas** en cinco personas (✍️), misma emoción en personas distintas, situaciones con protagonista, estrategia por emoción («cuando estoy enojado respiro hondo»), al comprobar solo otras personas, juego del espejo para el adulto | Reconoce la emoción por rasgos (cejas, ojos, boca) y no por un símbolo; aprende qué hacer con ella | No se usan fotos de Carlos con emociones (no existen); todas las emociones se presentan como normales | `test.cjs` (6 expresiones distintas, opciones de la misma persona, comprobación con otras), auditoría | Que las seis expresiones se distingan en la pantalla real; reacción del niño ante asustado/enojado |
| 3 · **Primero, después y al final** | Secuencias solo de cosas (huevo→pollito) | Rutinas con una persona y su insignia (📷 Carlos solo si el nombre es Carlos; dibujo de niño si el adulto pone otro nombre; otras personas al comprobar); se conservan secuencias de cosas | Conecta el orden con su propia mañana/noche y generaliza a otros | Huevo→pollito, lluvia→arcoíris, semilla→flor para no depender de una persona | `test.cjs` (mezcla, insignia, nombre ajeno, comprobación), auditoría | Ritmo de arrastre; si reconoce su rutina real |
| 4 · **Izquierda y derecha** | Se hablaba «a la izquierda» sin ligarlo al cuerpo; riesgo de inversión con personas de frente | Manos ✍️ dibujadas **como las ve su dueño**; «Toca tu mano derecha»; pulsera siempre en la derecha (la que pone el adulto); consignas «a tu izquierda»; sin personas de frente (auditado); fase de comprobar sin pista visual | Ancla en el cuerpo propio, evita la inversión espejo, se refuerza fuera de pantalla | Las escenas objeto-caja y la ubicación de objetos (relación izquierda/derecha de un objeto) | `test.cjs`, auditoría (800 preguntas sin personas, todas con «tu») | Que la pulsera real coincida con la dibujada; giro de pantalla |
| 5 · **Mi nombre** | El nombre se cortaba a 10 letras (un nombre largo salía mal) y solo se usaba la primera palabra | Nombre del adulto respetado (acentos, mayúsculas normalizadas); nombre largo → no se ofrece cortado; **nombre completo**; nombre en letras chicas/grandes; nota para el adulto | Reconocer su nombre completo y las dos formas de escribirlo | Armar letras y buscar el nombre entre otros | `test.cjs` (nombres con acento, largo, uno y dos nombres) | Con el nombre real; trazo de letras queda pendiente (ver C) |

## B. Las ocho mejoras adicionales: clasificación y resultado

| # | Mejora | Clasificación | Qué se hizo | Justificación |
|---|---|---|---|---|
| 1 | Alimentación | **CONSERVAR** + **PENDIENTE DE RECURSO EXTERNO** | Solo el protagonista en la consigna («Carlos quiere crecer fuerte…») | Las ilustraciones aíslan el atributo (sano / de vez en cuando); fotos de Carlos comiendo requieren fotos auténticas de la familia |
| 2 | Seguridad (fuego, electricidad, autocuidado) | **IMPLEMENTAR** | Tarjetas de fuego/humo, enchufe, medicinas, estufa, calle, manos, dientes, dolor, sol; preguntas «¿qué hago?» donde la respuesta correcta siempre es alejarse o avisar a un adulto; sin imágenes de daño | Era el hueco real: solo existía semáforo y «con un adulto». Número de emergencias no se fija (varía por país): se indica al adulto |
| 3 | Mañana/tarde/noche | **IMPLEMENTAR** | Clasificar la rutina de una persona en tres momentos (con insignia; otras personas al comprobar) | Antes solo había día/noche; los tres momentos se pedían ordenados pero no vividos |
| 4 | Posiciones (arriba/abajo/dentro/fuera) | **CONSERVAR** + **PENDIENTE DE RECURSO EXTERNO** | Sin cambios | El objeto aísla la preposición; fotos de Carlos sobre/dentro de una caja requieren fotos nuevas |
| 5 | Posiciones 2 (cerca/lejos/entre/detrás) | **CONSERVAR** + **PENDIENTE DE RECURSO EXTERNO** | Sin cambios | Igual que arriba |
| 6 | Lugares de mi comunidad | **PENDIENTE DE RECURSO EXTERNO** (autorización) | Sin cambios | Fotos de su escuela/casa/parque identifican lugares reales: no se incorporan sin autorización expresa |
| 7 | Cómo crece una planta | **CONSERVAR** + **PENDIENTE DE RECURSO EXTERNO** | Sin cambios | Secuencia de ciclo ya clara; foto de Carlos regando requiere foto auténtica |
| 8 | Instrucciones (Escucha y haz) | **CONSERVAR** | Sin cambios | El estímulo es sonoro; la demostración humana mejoraría la imitación pero requiere fotos o vídeo de acciones |

## C. PWA y plataforma

| Tema | Problema | Cambio | Pruebas | Pendiente físico |
|---|---|---|---|---|
| Botón fijo «Instalar» | Botón permanente aunque no fuera posible instalar; sin explicación | Eliminado; tarjeta contextual en «Hoy» (Android/Chrome con `prompt()` solo tras un toque; iPhone/iPad con instrucciones; nada si ya instalada o sin posibilidad); cooldown 7/21/60 días; ayuda siempre en Ajustes | `qa/pwa-smoke.cjs` A1–A27 | Aparición real del diálogo en la tablet; iPhone/iPad |
| Actualizaciones | El SW nuevo se activaba bajo una página en marcha; el aviso solo recargaba | SW nuevo en espera; «Hay una nueva versión de Carlos José» con «Actualizar ahora» / «Después de mi clase»; una sola recarga; clase y datos intactos; fallos tolerados | B1–B34 | Actualización real desde GitHub Pages |
| Versión | `5.1.0` repetido en varios archivos | Archivo `VERSION` único → interfaz, SW, diagnóstico, pie | `test.cjs` | — |
| Preview vs. definitiva | — | Sin cambios de diseño: claves, cachés y SW separados; PRUEBA solo en Cloudflare | `ci-visual`, `cloudflare-check` | No instalar la preview en la tablet infantil |
| Trazar consonantes del nombre | Sin datos de trazo por letra | **PENDIENTE** (no implementado) | — | — |

## D. Identidad visual
Sin cambios: portada aprobada de Carlos José médico, ícono con el cubo, nombre «Centro de Estudios Carlos José», lema «Aprendo, juego y descubro», crédito «By Carlos Tijerino». Los nuevos recursos son dibujos simples en el mismo estilo y la foto de Carlos solo aparece donde ya existía.

## E. Capturas (`docs/capturas/final_*_390.png`)
Cinco habilidades (`emociones`, `sentidos`, `orden-eventos`, `izq-der`, `mi-nombre`), extras (`seguridad`, `dia-noche`), `final_encabezado_sin_instalar`, `final_instalar_contextual`, `final_instalar_ios`, `final_aviso_actualizacion`, `final_emociones_expresiones` (hoja de las 18 caras). Regenerables con `node qa/capturas-final.cjs`.
