# Preview HTTPS de la PWA (canal «prueba»)

## Qué es el canal «prueba»
`PREVIEW=1 node build.cjs` compila la misma aplicación con identidad propia:

| Aspecto | Producción | Prueba |
|---|---|---|
| Datos guardados (localStorage) | `primerosPasos3` | `primerosPasos3-prueba` |
| Cachés del service worker | `mis-pasos-…` | `cj-prueba-…` (nunca borra las de producción) |
| Instalación | «Centro de Estudios Carlos José» | «Centro Carlos José · PRUEBA» con ícono con cinta roja |
| Pantalla | normal | cinta «PRUEBA · versión · build» |

Aunque ambos sitios compartan dominio (`usuario.github.io`), no se mezclan datos, cachés ni alcances. Esto **lo verifica automáticamente** `qa/ci-visual.cjs` (mismo origen, rutas `/Estudio-Carlos-Jose-/` y `/Estudio-Carlos-Jose-preview/`).

## Dónde publicarla sin tocar producción
GitHub Pages permite **un solo sitio por repositorio**, y el de `Estudio-Carlos-Jose-` es producción. Publicar la prueba desde ese repositorio reemplazaría o alteraría el sitio en uso, así que no se hace. Una URL HTTPS independiente necesita **otro repositorio**:

1. Crear en GitHub un repositorio **público y vacío**, p. ej. `Estudio-Carlos-Jose-preview` (los repositorios privados necesitan un plan de pago para Pages).
2. En ese repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Copiar `preview/deploy-prueba.yml` a `.github/workflows/deploy-prueba.yml` en ese repositorio (o pedir que lo suba Claude una vez que el repositorio esté adjunto a la sesión).
4. Ejecutar **Actions → Publicar prueba → Run workflow** (por defecto prueba la rama `claude/centro-carlos-jose-v5`).
5. URL: `https://montealtoc7.github.io/Estudio-Carlos-Jose-preview/`

El flujo compila el canal de prueba desde la rama que se indique, ejecuta las pruebas de Node y publica. Cada nueva ejecución entrega una versión nueva y la app instalada mostrará el aviso «Actualizar».

## Mientras tanto
El artefacto privado de claude.ai permite revisar diseño, arrastre y guardado en el teléfono, pero **no** admite service worker: no se puede instalar, ni usar sin conexión, ni probar actualizaciones, y no permite descargar el respaldo.

## Cómo probar en el teléfono (con la URL real)
Abrir la URL → **⚙ → Ajustes → Diagnóstico del dispositivo**. Muestra el estado automático (HTTPS, instalada, service worker, copia sin conexión, almacenamiento, voces, táctil), tiene una prueba de arrastre y una **lista de comprobación física**, y «Copiar informe» para compartir el resultado.
