# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Changed
- `slides-create`/`slides-edit`: el deck se genera en el menor número de archivos posible.
- Si el agente bloquea una escritura, el plugin se detiene y ofrece reintentar o pegar el contenido, sin rodeos por la terminal.
- README: sección "Problemas comunes".
- README: sección "Créditos" para Slidev y aviso de proyecto no oficial.
- Nuevo `THIRD_PARTY_NOTICES.md` con las dependencias de terceros y sus licencias.
- `slidev-cheatsheet.md`: atribución a la documentación de Slidev (MIT).
- Codex: el nombre visible pasa de "Slides (Slidev)" a "Slides para Slidev", para que no parezca un plugin oficial.

### Fixed
- Las presentaciones se ven igual al exportar a PDF: reglas en `slides-create` para evitar glows con `box-shadow`/`blur`, texto con gradiente y diagramas que no caben; tema de Mermaid con `setup/mermaid.ts`.
- Las fórmulas KaTeX ya no salen en crudo: el cheatsheet explica cómo escribirlas dentro de HTML (línea en blanco antes y después) y cómo darles color.

## [0.1.0] - 2026-09-23

### Added
- Skill `slides-create`: genera una presentación Slidev en el directorio actual.
- Skill `slides-edit`: edita slides existentes con lenguaje natural, sin invocar el plugin.
- Skill `slides-preferences`: lee/crea preferencias en `AGENTS.md` (proyecto > global).
- Comando `/slides:new` para Claude Code.
- Manifests y marketplaces para Claude Code y Codex.
