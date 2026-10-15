# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

## [0.6.0] - 2026-10-14

### Added
- `slides-export.html` pone la pantalla completa con doble clic; Esc (o otro doble clic) la quita. Es su único JavaScript: un script mínimo que no toca el layout, así que la vista previa del iPhone, que no ejecuta JavaScript, la muestra igual que antes, y en Safari del iPhone, que no tiene pantalla completa, no hace nada. `tests/export-html.test.mjs` comprueba con JavaScript encendido que el doble clic entra y sale sin mover la slide ni dejar texto seleccionado, que ← → siguen andando, y que sin la API de pantalla completa no pasa nada ni hay errores.

## [0.5.0] - 2026-10-14

### Added
- `tests/export-html.test.mjs` comprueba también que SMIL se mueve en `slides-export.html` con JavaScript apagado (WebKit y Chromium) y que en la vista de impresión de Slidev queda en su estado final, con opacidad 1.

### Changed
- Regla de animaciones: de "los loops son solo CSS" a CSS primero, SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`) cuando el movimiento cambia geometría SVG (puntas de una línea, el `d` de un path, un punto que sigue una curva, engranajes) o muchos elementos necesitan un mismo reloj (un diagrama que recorre sus pasos en bucle), y JavaScript nunca. SMIL también se mueve en `slides-export.html`. El cheatsheet trae un patrón SMIL con `v-if="!isPrintMode"`, el contador con `calcMode="discrete"` y el helper `track()` para diagramas por pasos; la sección de `slides-create` pasa a llamarse "Animations: loops first, without JavaScript".

### Fixed
- Documentada la trampa de `opacity="1"` como atributo: el *attributify* de UnoCSS que trae Slidev lo convierte en `opacity-1` y el elemento queda al 1 %, cosa que se nota en el PDF. Va en "Must survive `npm run export` (PDF)" y en el cheatsheet, junto con que el bloque `animation: none` de `style.css` no detiene SMIL.

## [0.4.0] - 2026-10-14

### Added
- Regla para cualquier cambio a los exports, en `slides-edit` y `CONTRIBUTING.md`: cada slide llena la ventana y se avanza de a una; se comprueba en teléfono horizontal, vertical y escritorio, y `slides-export.html` con JavaScript apagado y en WebKit, no solo en Chromium.
- Prueba de regresión `tests/export-html.test.mjs`: genera `slides-export.html` de un deck mínimo y lo abre con JavaScript apagado en WebKit y Chromium (844×390 móvil y 1440×900) para comprobar que la slide llena la pantalla y que → avanza de a una.

### Changed
- Un solo export HTML: `npm run export:html` genera ahora `slides-export.html` como HTML + CSS sin JavaScript (lo que antes hacía `export:ios`). El mismo archivo se abre con doble clic en cualquier navegador y en la vista previa de archivos del iPhone/iPad. Los clicks salen revelados, los loops de CSS se mueven y lo que dependa de JavaScript queda quieto; no hay transiciones entre slides (para eso, `npm run dev`). `slides-edit` sabe pasar al export nuevo las presentaciones de la 0.3.0 o anteriores, sin tocar `slides.md`.
- Las animaciones van primero en loop: por defecto todo se mueve solo, sin clicks. La pregunta de animaciones de `slides-preferences` pasa a ser "¿todas en loop, con clicks o variadas?" (o ninguna; default en loop), y `slides-create` la hace una vez si el `AGENTS.md` es de una versión anterior y no la responde. Los diagramas se revelan con clicks solo con animaciones con clicks o variadas; en loop salen completos desde el inicio. `slides-edit` responde a "anímala" con un loop y no con un click. La plantilla de preferencias y el cheatsheet (que ahora pone los loops antes que los clicks) lo reflejan.

### Removed
- `npm run export:ios` y `slides-ios.html`: su HTML es ahora el de `npm run export:html`.

### Fixed
- El HTML sin JavaScript se comporta como una presentación: cada slide llena la pantalla, escalada para caber entera, y se pasa de a una con swipe lateral (← → en la compu). En `slides-ios.html` (0.2.0–0.3.0) cada slide quedaba fija en 980×552 px (chica en la compu, cortada abajo en el iPhone horizontal) y todas se apilaban en una sola página vertical sin forma de avanzar de a una. Requiere iOS 16 o posterior.

## [0.3.0] - 2026-10-14

### Changed
- El plugin se llama `slides-dev-plugin` (antes `slides`): el comando pasa a `/slides-dev-plugin:new` (en OpenCode `/slides-dev-plugin-new`), los skills a `slides-dev-plugin:slides-create`, etc., y se instala como `slides-dev-plugin@slidesdev`. En Claude Code el marketplace declara el cambio con `renames`, y basta con instalar una vez `slides-dev-plugin@slidesdev`; en Codex, Antigravity y OpenCode hay que quitar el viejo y añadir el nuevo (ver "¿Tenías la versión anterior?" en el README).

## [0.2.0] - 2026-10-14

### Added
- `npm run export:ios`: genera `slides-ios.html`, la presentación como HTML + CSS sin JavaScript para la vista previa de archivos de iPhone/iPad (app Archivos, AirDrop), que no ejecuta JavaScript y mostraba `slides-export.html` en blanco. Cada slide sale con sus clicks revelados y sus loops de CSS en movimiento, y se pasa de una a otra deslizando. `slides-edit` sabe añadirlo a presentaciones creadas antes.
- Patrones de diagramas con animación en loop en el cheatsheet: flechas cuyas líneas fluyen, un paquete que viaja entre nodos y un punto que recorre un ciclo. Para Mermaid, aristas animadas con `@{ animate: true }`.
- Integración opcional con Figma: si el agente tiene el MCP de Figma y el usuario comparte un link (o lo guarda en `AGENTS.md`), `slides-create` y `slides-edit` traen colores y fuentes de marca, logos e imágenes (a `public/`) y layouts de slides desde Figma. La presentación sigue siendo Slidev. Nuevo `references/figma.md`; la pregunta de marca en `slides-preferences` acepta un link de Figma y la plantilla tiene la línea **Figma:**.
- `npm run export:html`: exporta la presentación a `slides-export.html`, un único archivo que se abre con doble clic en cualquier navegador (sin servidor ni Node) y conserva animaciones, transiciones, Mermaid y las imágenes de `public/`. El starter incluye `vite.config.ts` y la dependencia `vite-plugin-singlefile`; `slides-edit` sabe añadirlo a presentaciones creadas antes.
- Soporte para Antigravity: `plugin.json` en la raíz; se instala con `agy plugin install <repo>`.
- Soporte para OpenCode (1.x): plugin en `.opencode/plugins/slides.js` (con `package.json`) que registra los skills y el comando `/slides-new`.
- `validate.mjs` comprueba que el nombre y la versión de `plugin.json` y `package.json` coincidan con el resto de manifests.

### Changed
- Los diagramas se hacen por defecto en HTML/SVG con animación en loop y se revelan por pasos; Mermaid queda para los grandes o de tipos especiales (secuencia, estados, clases, ER, Gantt), con las aristas animadas. Se actualizan la plantilla de preferencias, la pregunta de animaciones y `figma.md`; la línea **Diagramas:** de la plantilla anterior se trata como el default viejo.
- Animaciones primero en CSS: los loops se hacen con `@keyframes` o `animate-*` de UnoCSS, nunca con timers de JavaScript, y el agente avisa en una línea antes de escribir una animación que necesite JavaScript, porque en `slides-ios.html` saldría quieta.
- `npm run export` dibuja los loops de CSS en reposo gracias a una regla en el `style.css` del starter, en lugar de pedir a cada componente un diseño estático con `isPrintMode`.
- Los diagramas se animan por defecto (se revelan paso a paso con clicks) salvo que las animaciones estén desactivadas o se pidan estáticos. El cheatsheet incluye dos patrones: nodos HTML con `v-click` y pasos de Mermaid con `<v-switch>`. La plantilla de preferencias y la pregunta de animaciones lo reflejan.
- `slides-create`/`slides-edit`: el deck se genera en el menor número de archivos posible.
- Si el agente bloquea una escritura, el plugin se detiene y ofrece reintentar o pegar el contenido, sin rodeos por la terminal.
- README: sección "Problemas comunes".
- README: sección "Créditos" para Slidev y aviso de proyecto no oficial.
- Nuevo `THIRD_PARTY_NOTICES.md` con las dependencias de terceros y sus licencias.
- `slidev-cheatsheet.md`: atribución a la documentación de Slidev (MIT).
- Codex: el nombre visible pasa de "Slides (Slidev)" a "Slides para Slidev", para que no parezca un plugin oficial.

### Fixed
- `npm run build` ya no falla con `[lightningcss minify] Invalid token in pseudo element` (Slidev 53 + Vite 8): el `vite.config.ts` del starter desactiva la minificación de CSS. `slides-edit` lo reconoce en "Known issues".
- La lista de diapositivas del diálogo Goto ya no se queda fija tapando el contenido (Slidev < 52.15 con fuse.js ≥ 7.2): el starter incluye `style.css` con un parche y `slides-edit` tiene una sección "Known issues" para no confundirla con contenido del deck.
- Las diapositivas con título en HTML ya no salen como "undefined" en el índice y en el modo presentador: `slides-create` pide `title:` en su frontmatter.
- Las presentaciones se ven igual al exportar a PDF: reglas en `slides-create` para evitar glows con `box-shadow`/`blur`, texto con gradiente y diagramas que no caben; tema de Mermaid con `setup/mermaid.ts`.
- Las fórmulas KaTeX ya no salen en crudo: el cheatsheet explica cómo escribirlas dentro de HTML (línea en blanco antes y después) y cómo darles color.

## [0.1.0] - 2026-09-23

### Added
- Skill `slides-create`: genera una presentación Slidev en el directorio actual.
- Skill `slides-edit`: edita slides existentes con lenguaje natural, sin invocar el plugin.
- Skill `slides-preferences`: lee/crea preferencias en `AGENTS.md` (proyecto > global).
- Comando `/slides:new` para Claude Code.
- Manifests y marketplaces para Claude Code y Codex.
