# Mis primeros pasos · 4.0

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
for f in app.js engine.js activities.js content.js skills-a.js skills-b.js skills-c.js games.js build.cjs test.cjs; do node --check $f; done
node build.cjs && node test.cjs
```
El build combina page.html, style.css, engine.js, activities.js, content.js + skills-*.js, games.js y app.js en dist/index.html y copia manifest, service worker e iconos.
Pruebas en navegador (opcionales, requieren Playwright instalado aparte): `node qa/ui-smoke.cjs [--viewport=320x640]` completa las 40 habilidades con clics; `node qa/legacy-smoke.cjs` comprueba que lo anterior sigue funcionando y que el progreso antiguo se conserva.
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
