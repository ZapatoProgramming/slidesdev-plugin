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

O deja que se actualice solo: en `/plugin` → **Marketplaces** → `slidesdev` →
**Enable auto-update**. Claude Code revisa en segundo plano al empezar cada
sesión y te avisa con `Run /reload-plugins to apply`.

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

Reinicia OpenCode. Se queda en caché el commit que resolvió la primera
vez; para actualizar, borra
`~/.cache/opencode/packages/slides@git+https:` y reinicia.

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
2. Crea `slides.md`, `package.json`, `vite.config.ts`, `.gitignore`, `components/` y `public/`.
3. Te dice qué comandos correr (no los ejecuta por ti):

```bash
npm install      # la primera vez
npm run dev      # http://localhost:3030 con recarga en caliente
npm run export   # PDF  (--format pptx | png para otros formatos)
npm run export:html  # un solo archivo HTML que se abre con doble clic
npm run export:ios   # un HTML para verla en iPhone/iPad
npm run build    # sitio estático en dist/
```

Los diagramas salen animados en loop (flechas que fluyen, un punto que recorre
el flujo) y se revelan por pasos. Mermaid queda para los diagramas grandes o
de tipos especiales (secuencia, estados, clases…), también con las aristas
animadas.

### Compartir la presentación

`npm run export:html` genera `slides-export.html`: un único archivo que se ve
igual que en `npm run dev`, con animaciones y transiciones, y que cualquiera
abre con doble clic en su navegador, sin Node, sin servidor y sin internet.
Las imágenes de `public/` van dentro del archivo, y las fuentes de Google
necesitan conexión (sin ella se usa una fuente del sistema).

**En iPhone o iPad** ese archivo sale en blanco: la vista previa de archivos
(app Archivos, AirDrop) no ejecuta JavaScript, y Slidev lo necesita. Para
ellos está `npm run export:ios`, que genera `slides-ios.html`: cada slide como
HTML + CSS, con los clicks ya revelados y las animaciones en loop moviéndose.
Pasas de una slide a otra deslizando. Lo que dependa de JavaScript (contadores,
efectos hechos con código) sale quieto, y por eso el plugin hace los loops con
CSS y te avisa cuando una animación necesita JavaScript.

Si prefieres un enlace, sube la carpeta `dist/` de `npm run build` a cualquier
hosting estático. El PDF (`npm run export`) abre en todos lados, pero pierde
las animaciones: los loops salen en reposo.

### Problemas comunes

- **`npm run export` sin Chromium:** npm ≥ 11 bloquea los scripts de
  instalación; ejecuta una vez `npx playwright install chromium`.
- **`npm run build` falla con `lightningcss minify: Invalid token`:** es un
  bug de Slidev 53 con Vite 8. Las presentaciones nuevas traen un
  `vite.config.ts` que lo evita; en una creada antes, pide *"arregla el
  build"* o copia ese archivo del starter.
- **Una presentación vieja no tiene `npm run export:html`:** pide *"quiero
  compartirla como un HTML"* y el agente añade lo que falta.
- **El HTML sale en blanco en el iPhone:** usa `npm run export:ios` (ver
  "Compartir la presentación"). Si tu presentación es anterior a ese comando,
  pide *"quiero verla en el iPhone"* y el agente añade lo que falta.
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

### Figma (opcional)

Si tu agente tiene conectado el MCP de Figma y le pasas el link de un frame,
el plugin puede traer de ahí:

- colores y fuentes de marca (las variables del archivo),
- logos, íconos e imágenes, que guarda en `public/`,
- el diseño de una slide hecha en Figma, rehecho en Markdown + UnoCSS.

```text
Hazme una presentación del lanzamiento con los colores y el logo de este Figma: https://www.figma.com/design/…?node-id=12-34
```

El resultado sigue siendo una presentación Slidev: Figma es solo de dónde
saca las cosas. Para no consultarlo cada vez, te ofrece guardar los colores
y el link en tu `AGENTS.md`. Sin Figma todo funciona igual.

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
- **Diagramas:** con animación en loop, revelados paso a paso; Mermaid solo para los grandes
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
| 7 | `npm run export:html` (tú) y abrir `slides-export.html` con doble clic | Se ve como en `npm run dev`, con animaciones e imágenes, sin servidor |
| 8 | `npm run export:ios` (tú) y pasar `slides-ios.html` al iPhone (AirDrop o Archivos) | Abre en la vista previa, los clicks salen revelados y los loops se mueven; se pasa de slide deslizando |
| 9 | *"Añade un diagrama del flujo de login"* | Diagrama HTML/SVG con flechas en loop, revelado con clicks; en el PDF sale completo y quieto |
| 10 | Con el MCP de Figma conectado: *"Usa los colores y el logo de este Figma: <link a un frame>"* | Guarda el logo en `public/`, aplica los colores en el deck (no crea nada en Figma) y ofrece guardarlos en `AGENTS.md` |
| 11 | La misma petición sin el MCP de Figma | Avisa en una línea que no puede leer Figma y sigue sin él |

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
package.json             paquete del plugin de OpenCode
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

Los usuarios reciben la versión nueva al actualizar el marketplace, o solos
si activaron el auto-update. Claude Code solo actualiza cuando cambia
`version`: los pushes a `main` sin subirla no le llegan a nadie.

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
