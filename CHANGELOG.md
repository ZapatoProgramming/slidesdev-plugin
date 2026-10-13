# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Integración opcional con Figma: si el agente tiene el MCP de Figma y el usuario comparte un link (o lo guarda en `AGENTS.md`), `slides-create` y `slides-edit` traen colores y fuentes de marca, logos e imágenes (a `public/`) y layouts de slides desde Figma. La presentación sigue siendo Slidev. Nuevo `references/figma.md`; la pregunta de marca en `slides-preferences` acepta un link de Figma y la plantilla tiene la línea **Figma:**.
- `npm run export:html`: exporta la presentación a `slides-export.html`, un único archivo que se abre con doble clic en cualquier navegador (sin servidor ni Node) y conserva animaciones, transiciones, Mermaid y las imágenes de `public/`. El starter incluye `vite.config.ts` y la dependencia `vite-plugin-singlefile`; `slides-edit` sabe añadirlo a presentaciones creadas antes.
- Soporte para Antigravity: `plugin.json` en la raíz; se instala con `agy plugin install <repo>`.
- Soporte para OpenCode (1.x): plugin en `.opencode/plugins/slides.js` (con `package.json`) que registra los skills y el comando `/slides-new`.
- `validate.mjs` comprueba que el nombre y la versión de `plugin.json` y `package.json` coincidan con el resto de manifests.

### Changed
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
