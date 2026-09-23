# slides — presentaciones Slidev desde Claude Code, Codex, Antigravity y OpenCode

Plugin para **Claude Code**, **Codex**, **Antigravity** y **OpenCode** que crea presentaciones
[Slidev](https://sli.dev) en la carpeta donde abras el agente y te deja
editarlas hablando normal: *"haz más grande la animación de la diapo 3"*.

Tus gustos (idioma, tema, tono, animaciones…) se guardan en un `AGENTS.md`,
así cada presentación sale a tu estilo sin repetirlo.

<!-- TODO: GIF de demo -->

> **English:** Claude Code / Codex / Antigravity / OpenCode plugin that scaffolds and edits Slidev decks
> in your working directory, following the style preferences stored in your
> `AGENTS.md`. Install instructions below work the same; prompts can be in any
> language.

---

## Instalación

**Requisitos:** Claude Code, Codex, Antigravity (`agy`) u OpenCode, y [Node.js](https://nodejs.org) ≥ 22.12
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

### Antigravity

En la terminal:

```bash
agy plugin install https://github.com/ZapatoProgramming/slidesdev-plugin
```

Abre una sesión nueva de `agy`. Para actualizar, vuelve a correr el mismo
comando; para quitarlo, `agy plugin uninstall slides`.

### OpenCode

Añade el plugin a tu `opencode.json` (global en `~/.config/opencode/` o el
del proyecto):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["slides@git+https://github.com/ZapatoProgramming/slidesdev-plugin.git"]
}
```

En OpenCode 2 (≥ 2.0.4) la clave es `"plugins"` en vez de `"plugin"`.
Reinicia OpenCode. OpenCode puede dejar en caché el commit que resolvió la
primera vez; para actualizar sin sorpresas, fija un tag al final y cámbialo
cuando salga otra versión (`...slidesdev-plugin.git#v0.2.0`).

---

## Uso

Abre tu agente **en la carpeta donde quieras la presentación** y pídela:

```text
Hazme una presentación de 15 minutos sobre la arquitectura de este repo para el equipo nuevo
```

En Claude Code también tienes un atajo (en OpenCode es `/slides-new`):

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
- **Diagramas:** Mermaid para flujos, animados paso a paso
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
agy plugin uninstall slides
# OpenCode: quita la línea del plugin de tu opencode.json
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

### 2c. Antigravity

`agy` copia el plugin al instalarlo, así que instálalo desde tu copia local:

```bash
agy plugin validate .                # debe decir [ok] con 3 skills y 1 comando
agy plugin install "$(pwd)"
cd playground && agy
```

- **Tras editar un skill:** vuelve a correr `agy plugin install "$(pwd)"`
  desde la raíz del repo y abre una sesión nueva.

### 2d. OpenCode

Apunta OpenCode a tu copia con un `opencode.json` dentro de `playground/`
(ruta absoluta; OpenCode no expande `~`):

```bash
echo "{ \"plugin\": [\"$(pwd)\"] }" > playground/opencode.json
cd playground
opencode debug skill | grep '"name": "slides-'   # deben salir los 3 skills
opencode
```

- **Tras editar un skill:** sal y vuelve a abrir `opencode`. Lee los skills
  directo de tu copia, sin caché.

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

En Claude Code prueba también `/slides:new charla sobre testing`, y en OpenCode
`/slides-new charla sobre testing`.

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
agy plugin uninstall slides                      # quitar la versión de desarrollo de Antigravity
```

En Claude Code con `--plugin-dir` no hay nada que limpiar. En OpenCode basta
con borrar `playground/` (el `opencode.json` vive ahí).

---

## Desarrollo

### Estructura

```text
.claude-plugin/          manifest y marketplace de Claude Code
.codex-plugin/           manifest de Codex
.agents/plugins/         marketplace de Codex
plugin.json              manifest de Antigravity
package.json, index.js   paquete del plugin de OpenCode
.opencode/plugins/       adaptador de OpenCode (registra skills/ y /slides-new)
skills/                  compartidos por todos los agentes
  slides-create/         crear presentación (+ references/ y assets/starter/)
  slides-edit/           editar slides existentes (auto-activación)
  slides-preferences/    leer/crear/actualizar AGENTS.md
commands/new.md          /slides:new (Claude Code; /slides-new en OpenCode)
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

1. Sube `version` (SemVer) en `.claude-plugin/plugin.json`,
   `.codex-plugin/plugin.json`, `plugin.json`, `package.json` y la entrada de
   `.claude-plugin/marketplace.json`.
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

## Créditos

Este plugin es solo una capa sobre **[Slidev](https://sli.dev)**, creado por
[Anthony Fu](https://github.com/antfu) y
[sus colaboradores](https://github.com/slidevjs/slidev/graphs/contributors)
bajo licencia MIT. Slidev hace todo el trabajo de verdad: render, temas,
animaciones y exportación. El plugin solo escribe el `slides.md`.

- Documentación: [sli.dev](https://sli.dev) · Código: [slidevjs/slidev](https://github.com/slidevjs/slidev)
- Si Slidev te sirve, considera [apoyar a su autor](https://github.com/sponsors/antfu).
- [`slidev-cheatsheet.md`](skills/slides-create/references/slidev-cheatsheet.md)
  está basado en la documentación oficial de Slidev.

> **Proyecto no oficial.** Este plugin no está afiliado, patrocinado ni
> respaldado por Slidev ni por sus autores. "Slidev" se usa solo para indicar
> con qué herramienta funciona.

Dependencias de terceros y sus licencias: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Licencia

[MIT](LICENSE) — cubre el código de este repositorio, no el de Slidev ni el
de otras dependencias.
