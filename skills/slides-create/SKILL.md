---
name: slides-create
description: Create a new Slidev presentation (slides.md + package.json) in the current working directory, following the user's preferences from AGENTS.md. Use when the user asks to make, create, generate or draft a presentation, slides, deck or talk ("hazme una presentación sobre…", "crea unas slides de…", "prepara una charla de 10 minutos", "make a deck about…"), including when they share a figma.com link for its colors, images or layout ("hazme una presentación con los colores de este Figma"). For changes to an existing slides.md use slides-edit instead.
---

# Create a Slidev presentation

Files live in the **current working directory** (the folder the user opened
the agent in), unless the user names another folder.

## 1. Load preferences

Follow [`../slides-preferences/SKILL.md`](../slides-preferences/SKILL.md).
Everything below must respect them.

## 2. Understand the brief

You need: **topic**, **audience**, **length** (minutes or number of slides) and
**goal** (teach, convince, report). Infer what you can from the request, the
repo you are in (README, code) and files the user points to. Ask only for what
is missing and matters, in one short message. Rule of thumb: ~1 slide per
minute of talk, plus cover and closing.

If the **Animaciones:** preference does not say "en loop", "con clicks",
"variadas" or "ninguna" (e.g. an AGENTS.md written by an older version of the
plugin), add the animation question from "Animations: loops first, without
JavaScript" below to that same message.

If the deck is about the current repository, read the relevant code/docs first
so the content is accurate, and cite real file names.

If Figma MCP tools are available and the user shares a `figma.com` link (or
the **Figma:** preference has one), read
[`references/figma.md`](references/figma.md) to bring brand colors, fonts,
images or a slide layout into the deck.

## 3. Scaffold the project

If `slides.md` **already exists** here, stop and ask whether to overwrite it,
create the new deck in a subfolder (e.g. `./<slug>/`), or edit the existing one
(then switch to slides-edit).

Otherwise copy the starter from this skill's folder:
`assets/starter/` (sibling of this SKILL.md) → the target folder. It contains
`package.json`, `slides.md`, `style.css`, `vite.config.ts`, `.gitignore`,
`components/` and `public/`. `style.css` holds two blocks: a workaround for a
Slidev bug (a slide list stuck on screen, see "Known issues" in
[`../slides-edit/SKILL.md`](../slides-edit/SKILL.md)) and the rule that
exports CSS loops at rest. Copy it as is, and whenever you rewrite `style.css`
keep both blocks. Copy `vite.config.ts` as is too: without it `npm run build`
fails and `npm run export:html` does not exist.
Do not overwrite an existing `package.json`, `.gitignore` or `vite.config.ts`;
if one exists, merge the Slidev dependencies, scripts and Vite options into it
instead and tell the user. Merging `vite.config.ts` changes the exports:
follow "Changing an export" in [`../slides-edit/SKILL.md`](../slides-edit/SKILL.md).

Then adjust:
- `package.json` → `name` (kebab-case of the title); add the theme package if
  the preferred theme is not `default` (`@slidev/theme-<name>` or
  `slidev-theme-<name>`).
- `slides.md` → replace the starter content entirely (next step).

## 4. Write the deck

Use [`references/slidev-cheatsheet.md`](references/slidev-cheatsheet.md) for
syntax. Work in two passes:

1. **Outline** — list slide titles internally following the preferred
   structure (e.g. portada → agenda → contenido → resumen → cierre).
2. **Content** — write `slides.md` in one go:
   - Headmatter with `theme`, `title`, `colorSchema`, `transition`, `mdc: true`
     and fonts from preferences.
   - One idea per slide; respect the text-density preference.
   - Every slide needs a title Slidev can read: the first `#` heading. If the
     visible title is HTML (`<h1>`, `<div>`…) or there is no `#`, add
     `title: …` to that slide's frontmatter; otherwise it shows as
     "undefined" in the slide index (`g`) and in presenter mode.
   - Vary layouts (`cover`, `section`, `two-cols`, `image-right`, `fact`,
     `center`, `end`) instead of bullet after bullet.
   - Animations according to the **Animaciones:** preference (en loop / con
     clicks / variadas / ninguna), following "Animations: loops first, without
     JavaScript" below.
   - Code blocks with stepped highlighting, when useful.
   - Diagrams, when useful. **By default, draw them in HTML/SVG with CSS
     loop animations** (arrows that flow, a packet that travels between
     nodes, a dot that goes around a cycle): pattern A in "Diagrams" in the
     cheatsheet. The looping motion is what makes them teach, so prefer this
     over Mermaid whenever the animation preference is anything but
     "ninguna". Reveal them node by node with clicks only when the preference
     is "con clicks" or "variadas"; "en loop" shows the whole diagram from the
     start, moving.
     Use **Mermaid** only when the diagram is too big to draw by hand (more
     than ~6 nodes, several branches or crossings) or is a sequence, state,
     class, ER or Gantt diagram, or when the user asks for Mermaid; then
     animate its edges (pattern B) and, with clicks or "variadas", reveal it
     in steps. Use a static diagram only when animations are off, the
     preference says "estáticos", or the user asks for it.
   - Speaker notes as the last `<!-- -->` comment of each slide, if preferred.
   - Images: never invent URLs. Use a placeholder
     (`<!-- TODO: imagen de … -->`), files the user provided in `public/`,
     or assets downloaded there from Figma
     ([`references/figma.md`](references/figma.md)).

For decks over ~25 slides, split sections into `pages/*.md` and import them
with `src:`.

### Animations: loops first, without JavaScript

Loops come before clicks. The **Animaciones:** preference picks the mode:

- **en loop** (default): everything is on screen from the start and the
  motion is continuous — arrows that flow, a packet that travels, a dot
  around a cycle, a highlight that pulses. No `v-click`/`v-clicks`; diagrams
  appear complete and keep moving.
- **con clicks**: content appears step by step (`v-clicks` in lists,
  diagrams revealed node by node); what is already visible keeps its loops.
  The steps play in `npm run dev`; `slides-export.html` shows them already
  revealed.
- **variadas**: loops by default; clicks only where the order is the point
  (an argument that builds up, a process told step by step), never on every
  list.
- **ninguna**: no loops and no clicks; static diagrams.

If the preference names none of these, ask once, in the same message as any
other brief question: "¿Quieres todas las animaciones en loop (se mueven
solas, sin clicks), con clicks (aparecen paso a paso) o variadas (loops
primero y clicks donde sumen)? Si no me dices nada, van en loop." Then offer
to save the answer in **Animaciones:** (see
[`../slides-preferences/SKILL.md`](../slides-preferences/SKILL.md)).

Write the loops without JavaScript. `npm run export:html` turns the deck into
`slides-export.html`, HTML + CSS without the deck's JavaScript, the file the
user shares: it opens in any browser and in the iPhone's file preview, one
slide per screen, scaled to fit, swiped sideways. CSS and SMIL animations keep
moving there; anything driven by JavaScript stays still. So:

- **CSS first**: `@keyframes` in a slide's `<style>` or UnoCSS
  `animate-spin`, `animate-pulse`, `animate-bounce`, `animate-ping`, for
  anything that is `opacity`, `transform` or `stroke-dashoffset` on separate
  elements: arrows that flow, a packet that travels in a straight line, a
  pulse, a ring that turns.
- **SMIL** (`<animate>`, `<animateTransform>`, `<animateMotion>` inside the
  `<svg>`) when the motion changes SVG geometry — a line's `x1`/`y1`, a
  path's `d`, a dot that follows a curve (`<animateMotion path>`), gears
  that turn together — or when many elements must share one timeline, like
  a diagram that loops through its steps (color, width and opacity changing
  on many elements at once). All SMIL in one `<svg>` shares a clock; CSS
  starts counting when each element is shown. Patterns: "SMIL" in "Diagrams"
  in the cheatsheet. Two rules:
  - Render the animation elements only outside print:
    `v-if="!isPrintMode"`, with `const { isPrintMode } = useNav()` from
    `@slidev/client` in a `<script setup>`. The `animation: none` block in
    `style.css` does not stop SMIL, so the static attributes of the SVG must
    be the complete final state: that is what the PDF shows.
  - Each `<svg>` starts its clock when it is mounted, not when its slide is
    shown, and Slidev mounts neighboring slides early, so a loop may be
    mid-cycle when you get there. Keep all the steps of a diagram in the same
    `<svg>`, with the same `dur`.
- **JavaScript never for loops**: no `setInterval`, `requestAnimationFrame`,
  JS timers or JS animation libraries.
- **Entrances and steps are fine as they are**: `v-click`, `v-clicks`,
  `v-motion` and `<v-switch>` use JavaScript, but every export shows their
  final state, so the content is all there; only the step-by-step is left to
  `npm run dev`.
- **When the motion itself is the content** (a counter, a typing effect, a
  simulation, an algorithm that computes its steps), first try CSS
  (`steps()`, one `animation-delay` per element, several `@keyframes`) or
  SMIL (a counter as several `<text>` switched with `calcMode="discrete"`). If it
  really needs JavaScript, say so in one line before writing it — e.g. "Esta
  animación necesita JavaScript: se ve en `npm run dev` y en el link, pero
  en el HTML (`npm run export:html`) saldrá quieta." — and go ahead with it.

### Must survive `npm run export` (PDF)

The PDF is made by Chromium's print pipeline, which renders some effects
differently from the screen. Design so the deck looks the same in both:

- **No blurred `box-shadow` / `filter: blur()` / `drop-shadow` with
  transparency** for glows: in the PDF they turn into opaque rectangles that
  cover charts and buttons. Fake glows with a `radial-gradient(...,
  transparent)` background or pseudo-element instead (pattern in the
  cheatsheet). Also skip `backdrop-filter`.
- **No gradient text** (`background-clip: text` + `color: transparent`): it
  exports as a solid block of color. Use a solid `color`.
- **Diagrams must fit the slide**: keep flowcharts to ~4–5 nodes per row
  (`LR`) and lower `{scale: …}` if needed. Wide diagrams are clipped at the
  slide edge. Theme Mermaid with `%%{init}%%` or `setup/mermaid.ts`, never
  with CSS alone.
- **Animations**: `v-motion` and `v-click` are fine; Slidev exports their final
  state. CSS loops are exported **at rest** (`animation: none`, from the block
  in `style.css`), so each loop must look complete without motion: lines and
  nodes visible in their base style, and anything that only exists while
  moving (a traveling packet) starts at `opacity: 0` in its base
  style. That block does not stop SMIL: render `<animate>`,
  `<animateTransform>` and `<animateMotion>` with `v-if="!isPrintMode"` and
  make the SVG's static attributes the complete final state. Animated
  diagrams export as their last step, so that step must be the complete
  diagram.
- **Never `opacity="1"` as an attribute**, on any element: Slidev's UnoCSS
  attributify turns it into the `opacity-1` utility
  (`[opacity~="1"]{opacity:0.01}`), so the element ends up at 1 %. On screen
  a running SMIL animation can hide it; in the PDF it shows. For 1, leave the
  attribute out (`:opacity="on ? undefined : 0"`); `opacity="0"` is fine.
- **Math only in Markdown context**: `$…$`/`$$…$$` are not rendered inside
  an HTML element on the same line (`<div>$x$</div>` shows the raw LaTeX).
  Close the HTML, leave a blank line, write the formula, leave a blank line
  (see "Math" in the cheatsheet).

To check the export, look at the PDF itself: `--format png` screenshots the
screen rendering and does **not** reproduce the PDF-only bugs above.

**Keep the deck in as few files as possible.** Put everything in `slides.md`
by default: style with UnoCSS classes and per-slide `<style>` blocks. Add to
`style.css` only styles repeated across many slides (keeping its two
blocks), and create a
`components/*.vue` file only for something Markdown + UnoCSS cannot do (loop
diagrams fit in `slides.md` with a `<style>` block; a SMIL diagram that loops
through many steps, built with a helper like `track()`, is a fair reason for
a component). Every extra file is one
more write that can be
blocked (see "If a write is blocked" below).

## If a write is blocked

The agent's permission system (e.g. Claude Code's auto mode) may deny a file
write or fail to evaluate it. When that happens:

- Do **not** retry the same write, and do **not** work around it by writing
  the file another way (shell redirection, `cat > file`, scripts). That
  bypasses a safety check.
- Stop and tell the user in one or two lines which file could not be written
  and what is already on disk.
- Offer two ways forward: retry after they approve the write or change the
  permission mode, or paste the file contents in the reply so they can save it
  themselves.

## 5. Finish

Do **not** run `npm install` or the dev server unless the user asks. Reply
with a short summary (number of slides, structure) and the commands:

```bash
npm install        # la primera vez (requiere Node >= 22.12)
npm run dev        # abre http://localhost:3030 con recarga en caliente
npm run export     # exporta a PDF (slides-export.pdf)
                   # si falla por falta de Chromium: npx playwright install chromium
npm run export:html  # slides-export.html: un solo archivo que se abre con doble clic, también en iPhone/iPad
npm run build      # genera un sitio estático en dist/
```

`slides-export.html` is the way to share the deck with someone who has no
Node: HTML + CSS in one file that opens from disk in any browser, with no
server, and in the iPhone/iPad file preview (Files app, AirDrop), which runs
no JavaScript. Clicks come out already revealed and CSS loops keep moving; one
slide per screen, scaled to fit, and a sideways swipe moves to the next one
(← → on a computer). On a computer a double click toggles fullscreen and Esc
leaves it; on the iPhone that does nothing. On a phone held upright the 16:9
slides leave black bands, so suggest turning it sideways; on a computer the
vertical mouse wheel does not advance. Images in `public/` are embedded in the
file; images loaded by URL still need internet.

Mention they can now ask for changes in plain language ("cambia la diapo 4
a dos columnas") without naming the plugin.
