# slides-dev-plugin — presentaciones Slidev desde Claude Code, Codex, Antigravity y OpenCode

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
/plugin install slides-dev-plugin@slidesdev
```

Reinicia la sesión y listo. Para actualizar, desde la terminal:

```bash
claude plugin marketplace update slidesdev
claude plugin update slides-dev-plugin@slidesdev
```

O deja que se actualice solo: en `/plugin` → **Marketplaces** → `slidesdev` →
**Enable auto-update**. Claude Code revisa en segundo plano al empezar cada
sesión y te avisa con `Run /reload-plugins to apply`.

### Codex

En la terminal:

```bash
codex plugin marketplace add ZapatoProgramming/slidesdev-plugin
codex plugin add slides-dev-plugin@slidesdev
```

Abre una sesión nueva de Codex. Para actualizar:

```bash
codex plugin marketplace upgrade slidesdev
codex plugin remove slides-dev-plugin@slidesdev && codex plugin add slides-dev-plugin@slidesdev
```

### Antigravity

En la terminal:

```bash
agy plugin install https://github.com/ZapatoProgramming/slidesdev-plugin
```

Abre una sesión nueva de `agy`. Para actualizar, vuelve a correr el mismo
comando; para quitarlo, `agy plugin uninstall slides-dev-plugin`.

### OpenCode

Añade el plugin a tu `opencode.json` (global en `~/.config/opencode/` o el
del proyecto):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["slides-dev-plugin@git+https://github.com/ZapatoProgramming/slidesdev-plugin.git"]
}
```

Reinicia OpenCode. Se queda en caché el commit que resolvió la primera
vez; para actualizar, borra
`~/.cache/opencode/packages/slides-dev-plugin@git+https:` y reinicia.

### ¿Tenías la versión anterior (`slides`)?

Desde la 0.3.0 el plugin se llama `slides-dev-plugin` y su comando es
`/slides-dev-plugin:new`. Para pasarte al nombre nuevo:

- **Claude Code:** `claude plugin marketplace update slidesdev` en la
  terminal y luego, dentro de Claude Code, `/plugin install
  slides-dev-plugin@slidesdev` una vez. El marketplace avisa del cambio de
  nombre y conserva si lo tenías activado.
- **Codex:** `codex plugin remove slides@slidesdev`, luego
  `codex plugin marketplace upgrade slidesdev` y
  `codex plugin add slides-dev-plugin@slidesdev`.
- **Antigravity:** `agy plugin uninstall slides` y vuelve a instalarlo con el
  comando de arriba.
- **OpenCode:** cambia en tu `opencode.json` `slides@git+…` por
  `slides-dev-plugin@git+…`, borra `~/.cache/opencode/packages/slides@git+https:`
  y reinicia.

---

## Uso

Abre tu agente **en la carpeta donde quieras la presentación** y pídela:

```text
Hazme una presentación de 15 minutos sobre la arquitectura de este repo para el equipo nuevo
```

En Claude Code también tienes un atajo (en OpenCode es `/slides-dev-plugin-new`):

```text
/slides-dev-plugin:new charla de 10 min sobre Docker para principiantes
```

El plugin:

1. Lee tus preferencias de `AGENTS.md` (o te hace ≤ 5 preguntas y las guarda).
2. Crea `slides.md`, `package.json`, `vite.config.ts`, `.gitignore`, `components/` y `public/`.
3. Te dice qué comandos correr (no los ejecuta por ti):

```bash
npm install      # la primera vez
npm run dev      # http://localhost:3030 con recarga en caliente
npm run export   # PDF  (--format pptx | png para otros formatos)
npm run export:html  # un solo archivo HTML que se abre con doble clic, también en iPhone/iPad
npm run build    # sitio estático en dist/
```

Las animaciones van primero en loop: se mueven solas, sin clicks. La primera
vez te pregunta si las quieres todas en loop, con clicks (aparecen paso a
paso) o variadas (loops primero y clicks donde sumen), y lo guarda en tus
preferencias. Los diagramas salen animados en loop (flechas que fluyen, un
punto que recorre el flujo); con clicks o variadas, además se revelan por
pasos. Mermaid queda para los diagramas grandes o de tipos especiales
(secuencia, estados, clases…), también con las aristas animadas.

### Compartir la presentación

`npm run export:html` genera `slides-export.html`: la presentación como
HTML + CSS en un único archivo que cualquiera abre con doble clic en su
navegador, sin Node y sin servidor. También se abre en el iPhone o
el iPad desde la vista previa de archivos (app Archivos, AirDrop), que no
ejecuta JavaScript; ahí necesita iOS 16 o posterior. Las imágenes de `public/`
van dentro del archivo, y las fuentes de Google necesitan conexión (sin ella
se usa una fuente del sistema).

Se ve como una presentación: una slide por pantalla, escalada para caber
entera, y pasas a la siguiente con un swipe lateral (← → en la compu). En la
compu, doble clic pone la pantalla completa y Esc la quita; es el único
JavaScript del archivo y en el iPhone no hace nada. Las slides son 16:9, así
que con el teléfono vertical quedan franjas negras arriba y abajo: gíralo. En
la compu la rueda vertical del mouse no avanza. Los clicks
salen ya revelados y las animaciones en loop se mueven; lo que dependa de
JavaScript (contadores, efectos hechos con código) sale quieto, y no hay
transiciones entre slides. Por eso el plugin hace los loops con CSS y te
avisa cuando una animación necesita JavaScript.

Para presentar con clicks y transiciones usa `npm run dev`, o sube la carpeta
`dist/` de `npm run build` a cualquier hosting estático si prefieres un
enlace. El PDF (`npm run export`) abre en todos lados, pero pierde las
animaciones: los loops salen en reposo.

### Problemas comunes

- **`npm run export` sin Chromium:** npm ≥ 11 bloquea los scripts de
  instalación; ejecuta una vez `npx playwright install chromium`.
- **`npm run build` falla con `lightningcss minify: Invalid token`:** es un
  bug de Slidev 53 con Vite 8. Las presentaciones nuevas traen un
  `vite.config.ts` que lo evita; en una creada antes, pide *"arregla el
  build"* o copia ese archivo del starter.
- **Una presentación vieja no tiene `npm run export:html`, el HTML sale en
  blanco en el iPhone o `slides-ios.html` sale chica, se corta o no avanza:**
  tu presentación tiene el export de la versión 0.3.0 o anterior. Pide
  *"actualiza el export a HTML"*: el agente cambia el `vite.config.ts` y los
  scripts de `package.json`, sin tocar tus slides. Luego corre
  `npm install` y `npm run export:html`; el `slides-ios.html` viejo ya no se
  usa.
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
- **Animaciones:** variadas — loops primero, `v-clicks` solo en listas que se construyen paso a paso; transición `fade`
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
claude plugin uninstall slides-dev-plugin@slidesdev
codex plugin remove slides-dev-plugin@slidesdev
agy plugin uninstall slides-dev-plugin
# OpenCode: quita la línea del plugin de tu opencode.json
```

### 2a. Claude Code

Arranca Claude Code dentro de `playground/` cargando el plugin desde tu copia.
Solo vale para esa sesión y no instala nada:

```bash
cd playground
claude --plugin-dir ..
```

- **¿Cargó?** Escribe `/slides-dev-plugin:` y debe autocompletar `/slides-dev-plugin:new`.
- **Tras editar un skill:** sal (`/exit`) y vuelve a lanzar el mismo comando.
  Los skills se leen al iniciar la sesión.

### 2b. Codex

Registra el repo como marketplace local e instala el plugin:

```bash
codex plugin marketplace add "$(pwd)"
codex plugin add slides-dev-plugin@slidesdev
codex plugin list | grep slides-dev-plugin     # debe salir: slides-dev-plugin@slidesdev  installed, enabled
```

Luego abre Codex en `playground/`:

```bash
cd playground && codex
```

- **Tras editar un skill:** Codex trabaja con una copia en caché, así que
  reinstala y abre una sesión nueva:

  ```bash
  codex plugin remove slides-dev-plugin@slidesdev && codex plugin add slides-dev-plugin@slidesdev
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
| 1 | *"Hazme una presentación de 5 minutos sobre Git"* | Hace ≤ 5 preguntas de estilo (una: animaciones en loop, con clicks o variadas; default en loop), crea `AGENTS.md` con `## Presentaciones`, `slides.md`, `package.json`, `.gitignore`, `components/`, `public/`, y sugiere los comandos sin ejecutarlos |
| 2 | `npm install && npm run dev` (tú, en otra terminal) | La presentación abre en http://localhost:3030 |
| 3 | *"Haz más grande el título de la diapo 2"* (sin nombrar el plugin) | Solo cambia esa slide y dice qué cambió; el navegador se actualiza solo |
| 4 | *"Pon la diapo 3 a dos columnas"* | Usa `layout: two-cols` con `::right::` |
| 5 | *"De ahora en adelante quiero modo oscuro"* | Actualiza la línea en `AGENTS.md` |
| 6 | *"Hazme otra presentación sobre Docker"* | No pregunta preferencias (ya existen) y pregunta antes de sobrescribir `slides.md` |
| 7 | `npm run export:html` (tú) y abrir `slides-export.html` con doble clic en la compu | Abre sin servidor, con imágenes; cada slide llena la ventana sin cortarse, ← → pasan de a una slide y los loops se mueven; doble clic pone la pantalla completa sin cambiar de slide, ← → siguen andando y Esc la quita |
| 8 | Pasar ese `slides-export.html` al iPhone (AirDrop o Archivos) | Abre en la vista previa, los clicks salen revelados y los loops se mueven; en horizontal cada slide llena la pantalla sin cortarse; el swipe lateral pasa de a una slide; un doble toque no rompe nada; en la compu ← → también |
| 9 | *"Añade un diagrama del flujo de login"* | Diagrama HTML/SVG con flechas en loop; con animaciones en loop sale completo desde el inicio, con clicks o variadas se revela por pasos; en el PDF sale completo y quieto |
| 10 | Con el MCP de Figma conectado: *"Usa los colores y el logo de este Figma: <link a un frame>"* | Guarda el logo en `public/`, aplica los colores en el deck (no crea nada en Figma) y ofrece guardarlos en `AGENTS.md` |
| 11 | La misma petición sin el MCP de Figma | Avisa en una línea que no puede leer Figma y sigue sin él |

En Claude Code prueba también `/slides-dev-plugin:new charla sobre testing`, y en OpenCode
`/slides-dev-plugin-new charla sobre testing`.

Si cambias un export (el `vite.config.ts` del starter o el script
`export:html`), corre también la prueba automática de `slides-export.html`:

```bash
node --test tests/export-html.test.mjs   # la primera vez tarda: instala un deck mínimo
SLIDES_TEST_DECK=/tmp/deck-html node --test tests/export-html.test.mjs   # reutiliza el deck entre corridas
```

Abre el HTML con JavaScript apagado en WebKit y Chromium, como teléfono en
horizontal (844×390) y como escritorio (1440×900), y comprueba que la slide
llena la pantalla sin salirse y que dos → la dejan en la slide 3. Con
JavaScript encendido comprueba que el doble clic entra y sale de pantalla
completa sin mover la slide, y que sin la API de pantalla completa (Safari del
iPhone) no hace nada. No cubre Esc (en Chromium sin ventana no hay quién lo
atienda), el teléfono vertical, el swipe ni la vista previa real del iPhone:
eso sigue en las filas 7 y 8.

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
codex plugin remove slides-dev-plugin@slidesdev             # quitar la versión de desarrollo de Codex
codex plugin marketplace remove slidesdev
agy plugin uninstall slides-dev-plugin           # quitar la versión de desarrollo de Antigravity
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
.opencode/plugins/       adaptador de OpenCode (registra skills/ y /slides-dev-plugin-new)
skills/                  compartidos por todos los agentes
  slides-create/         crear presentación (+ references/ y assets/starter/)
  slides-edit/           editar slides existentes (auto-activación)
  slides-preferences/    leer/crear/actualizar AGENTS.md
commands/new.md          /slides-dev-plugin:new (Claude Code; /slides-dev-plugin-new en OpenCode)
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
