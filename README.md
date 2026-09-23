# slides — presentaciones Slidev desde Claude Code y Codex

Plugin para **Claude Code** y **Codex** que crea presentaciones
[Slidev](https://sli.dev) en la carpeta donde abras el agente y te deja
editarlas hablando normal: *"haz más grande la animación de la diapo 3"*.

Tus gustos (idioma, tema, tono, animaciones…) se guardan en un `AGENTS.md`,
así cada presentación sale a tu estilo sin repetirlo.

<!-- TODO: GIF de demo -->

> **English:** Claude Code / Codex plugin that scaffolds and edits Slidev decks
> in your working directory, following the style preferences stored in your
> `AGENTS.md`. Install instructions below work the same; prompts can be in any
> language.

---

## Instalación

**Requisitos:** Claude Code o Codex, y [Node.js](https://nodejs.org) ≥ 22.12
para ver las presentaciones (lo pide Slidev).

### Claude Code

Dentro de Claude Code:

```text
/plugin marketplace add ZapatoProgramming/slidesdev-plugin
/plugin install slides@slidesdev
```

Reinicia la sesión y listo. Para actualizar, desde la terminal:

```bash
claude plugin marketplace update slidesdev
claude plugin update slides@slidesdev
```

### Codex

En la terminal:

```bash
codex plugin marketplace add ZapatoProgramming/slidesdev-plugin
codex plugin add slides@slidesdev
```

Abre una sesión nueva de Codex. Para actualizar:

```bash
codex plugin marketplace upgrade slidesdev
codex plugin remove slides@slidesdev && codex plugin add slides@slidesdev
```

---

## Uso

Abre Claude Code o Codex **en la carpeta donde quieras la presentación** y pídela:

```text
Hazme una presentación de 15 minutos sobre la arquitectura de este repo para el equipo nuevo
```

En Claude Code también tienes un atajo:

```text
/slides:new charla de 10 min sobre Docker para principiantes
```

El plugin:

1. Lee tus preferencias de `AGENTS.md` (o te hace ≤ 5 preguntas y las guarda).
2. Crea `slides.md`, `package.json`, `.gitignore`, `components/` y `public/`.
3. Te dice qué comandos correr (no los ejecuta por ti):

```bash
npm install      # la primera vez
npm run dev      # http://localhost:3030 con recarga en caliente
npm run export   # PDF  (--format pptx | png para otros formatos)
npm run build    # sitio estático en dist/
```

### Problemas comunes

- **`npm run export` sin Chromium:** npm ≥ 11 bloquea los scripts de
  instalación; ejecuta una vez `npx playwright install chromium`.
- **Escritura bloqueada ("auto mode classifier gave no verdict" o similar):**
  es el control de permisos del agente, no del plugin. El plugin no intenta
  esquivarlo: se detiene, te dice qué archivo faltó y te ofrece reintentar o
  mostrarte el contenido para que lo pegues. Para seguir, aprueba la escritura
  o cambia de modo de permisos y pide "sigue".

### Editar sin llamar al plugin

Con `slides.md` en la carpeta, pide cambios en lenguaje natural. El agente
activa el skill de edición solo:

- *"Haz más grande la animación de la diapo 3"*
- *"Pon la slide de arquitectura a dos columnas con el diagrama a la derecha"*
- *"Añade una slide de costos después de la agenda"*
- *"Cambia el tema a seriph"*

Si `npm run dev` está corriendo, los cambios se ven al instante.

---

## Preferencias (`AGENTS.md`)

El plugin busca una sección `## Presentaciones` en este orden:

1. `./AGENTS.md` — preferencias de **este proyecto**.
2. `~/.config/slides/AGENTS.md` — tu perfil **global** para todas las presentaciones.

Lo que pidas en la conversación manda sobre ambos, y el proyecto manda sobre
el global. Si no hay ninguno, el plugin te pregunta y lo crea. También puedes
decir *"de ahora en adelante quiero mis slides en modo oscuro"* y actualiza la
sección.

Ejemplo:

```markdown
## Presentaciones

- **Idioma:** español
- **Tema Slidev:** seriph
- **Modo de color:** oscuro
- **Tono:** técnico pero cercano
- **Densidad:** poco texto; máximo 4 bullets por slide
- **Animaciones:** sutiles — `v-clicks` en listas y transición `fade`
- **Código:** resaltado por pasos cuando haya más de 8 líneas
- **Diagramas:** Mermaid para flujos
- **Notas del presentador:** sí
- **Estructura:** portada → agenda → contenido → resumen → preguntas
- **Colores/fuentes de marca:** primario #2B90B6, fuente Inter
```

Plantilla completa: [`skills/slides-create/references/agents-md-template.md`](skills/slides-create/references/agents-md-template.md).

---

## Probar el plugin en modo desarrollo

Así pruebas tu copia local del plugin, con tus cambios, sin publicar nada.

### 1. Prepara el entorno

```bash
git clone https://github.com/ZapatoProgramming/slidesdev-plugin.git
cd slidesdev-plugin
mkdir -p playground          # carpeta de pruebas, ignorada por git
```

Si ya tenías instalada la versión publicada, desinstálala antes para no tener
dos copias activas:

```bash
claude plugin uninstall slides@slidesdev
codex plugin remove slides@slidesdev
```

### 2a. Claude Code

Arranca Claude Code dentro de `playground/` cargando el plugin desde tu copia.
Solo vale para esa sesión y no instala nada:

```bash
cd playground
claude --plugin-dir ..
```

- **¿Cargó?** Escribe `/slides:` y debe autocompletar `/slides:new`.
- **Tras editar un skill:** sal (`/exit`) y vuelve a lanzar el mismo comando.
  Los skills se leen al iniciar la sesión.

### 2b. Codex

Registra el repo como marketplace local e instala el plugin:

```bash
codex plugin marketplace add "$(pwd)"
codex plugin add slides@slidesdev
codex plugin list | grep slides     # debe salir: slides@slidesdev  installed, enabled
```

Luego abre Codex en `playground/`:

```bash
cd playground && codex
```

- **Tras editar un skill:** Codex trabaja con una copia en caché, así que
  reinstala y abre una sesión nueva:

  ```bash
  codex plugin remove slides@slidesdev && codex plugin add slides@slidesdev
  ```

### 3. Qué probar

Haz estas pruebas en orden, en cada agente, con `playground/` vacía:

| # | Prompt | Resultado esperado |
|---|---|---|
| 1 | *"Hazme una presentación de 5 minutos sobre Git"* | Hace ≤ 5 preguntas de estilo, crea `AGENTS.md` con `## Presentaciones`, `slides.md`, `package.json`, `.gitignore`, `components/`, `public/`, y sugiere los comandos sin ejecutarlos |
| 2 | `npm install && npm run dev` (tú, en otra terminal) | La presentación abre en http://localhost:3030 |
| 3 | *"Haz más grande el título de la diapo 2"* (sin nombrar el plugin) | Solo cambia esa slide y dice qué cambió; el navegador se actualiza solo |
| 4 | *"Pon la diapo 3 a dos columnas"* | Usa `layout: two-cols` con `::right::` |
| 5 | *"De ahora en adelante quiero modo oscuro"* | Actualiza la línea en `AGENTS.md` |
| 6 | *"Hazme otra presentación sobre Docker"* | No pregunta preferencias (ya existen) y pregunta antes de sobrescribir `slides.md` |

En Claude Code prueba también `/slides:new charla sobre testing`.

### 4. Probar las preferencias globales

El perfil global `~/.config/slides/AGENTS.md` afecta todas tus pruebas. Para
probar el flujo "sin preferencias", apártalo mientras tanto:

```bash
mv ~/.config/slides/AGENTS.md ~/.config/slides/AGENTS.md.bak   # y luego al revés
```

Para probar que el proyecto manda sobre el global, crea ambos con valores
distintos (p. ej. idioma) y comprueba que gana el de `playground/AGENTS.md`.

### 5. Limpiar

```bash
rm -rf playground && mkdir playground          # empezar de cero
codex plugin remove slides@slidesdev             # quitar la versión de desarrollo de Codex
codex plugin marketplace remove slidesdev
```

En Claude Code con `--plugin-dir` no hay nada que limpiar.

---

## Desarrollo

### Estructura

```text
.claude-plugin/          manifest y marketplace de Claude Code
.codex-plugin/           manifest de Codex
.agents/plugins/         marketplace de Codex
skills/                  compartidos por ambos agentes
  slides-create/         crear presentación (+ references/ y assets/starter/)
  slides-edit/           editar slides existentes (auto-activación)
  slides-preferences/    leer/crear/actualizar AGENTS.md
commands/new.md          /slides:new (solo Claude Code)
scripts/validate.mjs     chequeos estáticos (manifests, skills, links)
```

Los skills son la única fuente de verdad: todo lo que hace el plugin está en
`skills/*/SKILL.md`. La `description` del frontmatter decide cuándo se activa
cada uno.

### Validar

```bash
node scripts/validate.mjs     # versiones iguales, skills bien formados, links válidos
claude plugin validate .      # validador oficial de Claude Code
```

CI (`.github/workflows/ci.yml`) corre ambos en cada push y PR.

### Publicar una versión

1. Sube `version` en `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`
   y la entrada de `.claude-plugin/marketplace.json` (SemVer).
2. Mueve lo de `[Unreleased]` en `CHANGELOG.md` a la nueva versión.
3. `node scripts/validate.mjs`
4. Commit, tag y release:

   ```bash
   git commit -am "chore: release v0.2.0"
   git tag -a v0.2.0 -m "v0.2.0" && git push --follow-tags
   gh release create v0.2.0 --generate-notes
   ```

Los usuarios reciben la versión nueva al actualizar el marketplace.

---

## Contribuir

Issues y PRs bienvenidos — lee [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

[MIT](LICENSE)
