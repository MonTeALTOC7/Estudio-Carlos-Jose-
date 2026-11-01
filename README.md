# Centro de Estudios Carlos José · 5.1
*Aprendo, juego y descubro · By Carlos Tijerino*

Continuación del ZIP aportado, conservando HTML/CSS/JavaScript y los juegos existentes. Sin dependencias de ejecución ni cuenta infantil.

## Abrir e instalar

https://montealtoc7.github.io/Estudio-Carlos-Jose-/

Publicación HTTPS verificada el 31-10-2026. Abre sin cuenta de ChatGPT.

## Uso
Primero «Empezar despacito»: mirar y escuchar; después «Ahora yo». Sesiones cortas acompañadas y objetos reales/papel fuera de pantalla. Números 1–10 graduales, vocales minúsculas con mayúsculas, colores, figuras/X, parejas, memoria de lugares, recorridos, posiciones, trazos y dibujo libre.

Lo desbloqueado permanece disponible. El avance de dos aciertos independientes es una regla del juego, no una medida validada de dominio. Las pistas se registran aparte. El pequeño reto pregunta solamente sobre símbolos enseñados. No reproduce un examen oficial del colegio.

## Voz
Usa SpeechSynthesis del dispositivo, preferentemente una voz española local. ⚙ → 4 + 3 → voz y velocidad → Guardar y escuchar. Puede ser necesario instalar una voz española en los ajustes de texto a voz del teléfono. Las voces de red no funcionan sin internet. La comprobación auditiva real sigue pendiente: el navegador remoto de pruebas no dispone de voces españolas.

## Instalar
Abrir el enlace HTTPS publicado. Android/Chrome: menú ⋮ → Instalar aplicación o Añadir a pantalla de inicio. iPhone/Safari: Compartir → Añadir a pantalla de inicio. Abrir una vez con conexión antes de probar modo avión; no se verificó instalación real ni modo avión en teléfono.

## Desarrollo
```bash
for f in app.js engine.js activities.js content.js skills-a.js skills-b.js skills-c.js progress.js coach.js games.js adventures.js shell.js build.cjs test.cjs; do node --check $f; done
node build.cjs && node test.cjs
```
El build combina page.html, style.css, engine.js, activities.js, content.js + skills-*.js, games.js y app.js en dist/index.html y copia manifest, service worker e iconos.
Pruebas en navegador (opcionales, requieren Playwright instalado aparte): `node qa/ui-smoke.cjs [--viewport=320x640]` completa las 40 habilidades con clics; `node qa/legacy-smoke.cjs` comprueba que lo anterior sigue funcionando y que el progreso antiguo se conserva; `node qa/v5-smoke.cjs` recorre la portada, las recomendaciones, la reanudación, las 5 aventuras y el panel adulto.
El progreso se guarda en localStorage (`primerosPasos3`); no se sincroniza entre dispositivos. Cambiar de dominio crea otro almacenamiento independiente.

## GitHub y publicación
Repositorio oficial: https://github.com/MonTeALTOC7/Estudio-Carlos-Jose- . Inicializado con autorización del propietario el 31-10-2026. Importación de la aplicación mediante rama `feat/primeros-pasos-basicos` y PR a main. Para mejoras futuras, conservar rama + PR y verificar main antes de editar.

Workflow de comprobaciones en PR y workflow Pages en main incluidos. Pages requiere Source: GitHub Actions. PR #1 integrado después de CI aprobado. Publicación confirmada por GitHub Actions; inicio, primera lección y recarga comprobados en el enlace público.

## Referencias
Se revisaron CONTINUAR_EN_OTRA_CUENTA.md, ambos PDF aportados y el código previo. MINED: Cuadernillo Didáctico de III Nivel (2021), pp. 6, 8–9, 14–15, 19–22 y 27; Registro informativo de valoración cualitativa III Nivel (2 páginas). Se conservan originales en el ZIP de entrada, sin redistribuirlos públicamente.
https://colegiocdj.com/preescolar/ no fue accesible mediante la consulta web en esta sesión. No se verificó temario ni examen oficial.

Ver VERIFICACION.md para pruebas ejecutadas y límites.

## Ampliación 3.2
- Navegación superior permanente: Inicio y Cambiar módulo, sin recorrer pantallas hacia atrás.
- Relacionamos: color con animales/objetos, figura con objeto, grande/pequeño, más/menos, lleno/vacío, igual/diferente y series AB.
- Los colores de los animales y objetos son ilustraciones SVG propias y estables entre dispositivos; representan el color de ese dibujo, no una característica universal de la especie.
- Las comparaciones tienen ejemplo de cada concepto, cuatro prácticas y dos comprobaciones. Las ayudas se guardan aparte en el panel adulto, sin desbloquear símbolos automáticamente ni asignar una nota de admisión.
- Las parejas nuevas enseñan dos relaciones antes de unirlas; Otras parejas introduce otros colores/objetos. Las respuestas ya terminadas se conservan al cambiar módulo; la ronda incompleta y el dibujo sin guardar no se reanudan.
- activities.js contiene modelos independientes y deterministas; el build lo incorpora al HTML y no requiere conexión para cargarlo.

La app es un apoyo. Conviene acompañarla con conversación, instrucciones sencillas, juegos con objetos y trazos en papel. El contenido requerido por el colegio sigue sin verificarse.


## Versión 4.0 · rutas de aprendizaje
Auditoría completa y matriz de cobertura del Cuadernillo MINED en [`docs/AUDITORIA_Y_MATRIZ.md`](docs/AUDITORIA_Y_MATRIZ.md).

- **8 rutas y 40 habilidades**: Números y cantidades · Palabras y sonidos · Clasificar y comparar · Formas y colores · Pienso y descubro · Dónde y cuándo · Mi cuerpo y yo · Mi mundo. Se entra desde el inicio, el diálogo «Cambiar módulo» o la tira de módulos de la barra superior, que se ve en todas las pantallas.
- **Método en cada habilidad**: Aprendo → Ejemplos → Practico → Refuerzo → Compruebo. El refuerzo usa otro formato y repite el que costó; la comprobación son 3 preguntas sin pista.
- **17 tipos de interacción** (elegir, tocar todos, clasificar, unir, ordenar, poner la cantidad, colocar en una escena, seguir instrucciones, completar filas, unir puntos, pintar, tocar partes del cuerpo, aplaudir sílabas, recordar, repetir secuencias con sonido) y 137 formatos de pregunta generados al azar sin repetir estímulos ni dar pistas por posición.
- **Reto variado**: mezcla preguntas de comprobación de varias habilidades.
- **Más colores y figuras** en los módulos básicos (naranja, morado, rosado, café; rectángulo, óvalo, rombo) y **10 trazos nuevos** (vertical, inclinada, cruz, curva, zigzag, bucle, mixta, rectángulo, rombo, óvalo). El progreso anterior se conserva.
- **Panel adulto**: informe por habilidad («x de y sin ayuda», sin notas) y guía «Fuera de la pantalla» con actividades del Cuadernillo.
- Nunca se muestra un número o una vocal que el niño no haya visto en su módulo. «Mi nombre» usa el nombre que se escribe en ⚙ o al abrir la habilidad.
- Los resultados son una muestra de lo que hizo hoy con y sin ayuda. No son notas ni diagnóstico, y no equivalen a un examen de admisión.

Limitaciones conocidas: ver §7 de la auditoría (voz española, pruebas en teléfonos reales, emojis como ilustraciones, contenido nacional pendiente, Registro de valoración no recibido).


## Versión 5.2 · Identidad personalizada, Galaxy Tab A9 y Partes de mi cuerpo
Documentos: [`docs/PERSONALIZACION_HUMANA.md`](docs/PERSONALIZACION_HUMANA.md), [`docs/TABLET_GALAXY_TAB_A9.md`](docs/TABLET_GALAXY_TAB_A9.md). Portada y navegación sin cambios.
- **Ícono y cabecera** con Carlos José y su cubo (recorte limpio de su fotografía; 192/512, `maskable`, favicon). El distintivo PRUEBA existe solo en el canal de Cloudflare.
- **Partes de mi cuerpo** con fotos auténticas de Carlos José, su ilustración y otras personas ilustradas (mamá, papá, niña, abuelo): zonas táctiles sobre la propia imagen, comprobación en otras personas y sin resaltar la respuesta.
- **Tablet de 8,7"**: riel lateral y preguntas en dos columnas en apaisado bajo; diagnóstico con el área visible y la densidad reales; pruebas táctiles emuladas en 6 viewports.
- Auditoría de las 40 habilidades y 5 aventuras: qué personalizar y qué conservar, y un guion de fotos para la familia.

## Versión 5.1 · Mi camino de aprendizaje (clases guiadas) y audio
Diseño y decisiones: [`docs/CURSO_GUIADO.md`](docs/CURSO_GUIADO.md). Sobre la v5.0 aprobada (portada, imágenes, niveles, aventuras), sin rediseñarla:
- **Mi camino**: 9 unidades en espiral y 59 lecciones (40 habilidades, 10 de símbolos y 9 de repaso) que *reutilizan* las cinco fases, las rondas de símbolos y los retos de aventura. Una clase: bienvenida por voz, recordamos, aprendemos, practicamos, jugamos, comprobamos y celebramos.
- **Portada**: el botón principal es la clase («Empezar mi primera clase», «Continuar mi clase», «Mi siguiente clase»); el juego libre interrumpido se recupera con una opción secundaria. Nueva pestaña **Camino**.
- **Exploración inicial** «La mochila misteriosa» (sin nota; solo ajusta el punto de partida), **repasos espaciados**, refuerzo tras una comprobación floja y **reanudación exacta** aunque se cierre la aplicación.
- **El juego libre nunca mueve el camino**; su evidencia se registra aparte (`libre`/`clase`).
- **Panel adulto → Mi camino** y **Ajustes → Sonido**: voz, música ambiental (composición original generada por la app, sin archivos ni servicios externos) y efectos, independientes y persistentes; se quitó el botón de sonido de la cabecera.

## Versión 5.0 · Centro de Estudios Carlos José
Evaluación, visión y decisiones: [`docs/V5_EVALUACION_Y_VISION.md`](docs/V5_EVALUACION_Y_VISION.md).

- **Portada «Hoy»** personalizada (saludo, nivel, botón **Continuar**, tres sugerencias del día con su motivo y aventuras) y navegación **Hoy · Aprender · Jugar · Logros**. Dentro de las actividades se conserva la barra superior con Inicio, Módulos y la tira de módulos.
- **Dominio por habilidad** con reglas visibles (por descubrir, aprendiendo, practicando, comprobada, en consolidación): una comprobación perfecta no basta y una mala sesión no quita lo logrado. Nivel general de aventura y avance por ruta sin porcentajes.
- **Recomendaciones explicables** (repasar, seguir, comprobar, recordar, nuevo, aventura) sin servicios externos.
- **Motivación sin presión**: confeti tras 3 aciertos seguidos sin ayuda, insignias, niveles y medallas; sin rankings ni días seguidos; control de animaciones.
- **5 aventuras** con historia y mecánicas propias (curitas arrastradas, lista de compras, buscar y memoria, mezclar colores y rompecabezas, camino con flechas y semáforo).
- **Panel adulto** con Resumen, Progreso, En casa y Ajustes (respaldo descargable y restaurable, personalización).
- **Carlos José por defecto**: `assets/hero.webp` (ilustración vestido de médico) y `assets/avatar.webp` (foto de avatar), incluidas con autorización expresa del padre; se muestran en toda instalación limpia y funcionan sin conexión. Repositorio y sitio son públicos. En ⚙ → Ajustes se pueden cambiar (se guardan solo en ese dispositivo) y «Usar las predeterminadas» las restaura.
- Todo lo de la v4.0 se conserva (8 rutas, 40 habilidades, 5 fases, trazos, juegos antiguos, guardado `primerosPasos3`, PWA).

### Canal de prueba, actualización y validación
- `PREVIEW=1 node build.cjs` compila el **canal de prueba** (datos, cachés e instalación separados de producción); ver [`docs/PREVIEW_HTTPS.md`](docs/PREVIEW_HTTPS.md).
- La aplicación avisa cuando hay una versión nueva y tiene **⚙ → Ajustes → Diagnóstico del dispositivo** para validar en un teléfono real.
- El historial de cada habilidad se recorta, pero las pruebas de dominio se conservan aparte: **un estado demostrado no baja por acumular sesiones fallidas**.
- Validación automatizada en CI con Playwright y qué requiere teléfono físico: [`docs/VALIDACION.md`](docs/VALIDACION.md).
