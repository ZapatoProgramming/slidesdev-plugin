# Slidev cheatsheet

Quick reference for writing and editing `slides.md`. Full docs: https://sli.dev

> Based on the [Slidev documentation](https://sli.dev)
> ([source](https://github.com/slidevjs/slidev/tree/main/docs)),
> MIT License, Copyright (c) 2020-PRESENT Anthony Fu.

## File anatomy

```md
---
# headmatter: the first frontmatter configures the whole deck AND slide 1
theme: default            # or seriph, apple-basic… (npm: @slidev/theme-<name> or slidev-theme-<name>)
title: Mi charla
info: Descripción corta
colorSchema: auto         # auto | light | dark
transition: slide-left    # default transition for every slide
mdc: true                 # enables [texto]{.clase} and ::component:: syntax
fonts:
  sans: Inter
  mono: Fira Code
layout: cover
---

# Título de la portada

---
layout: center
transition: fade
---

# Slide 2

<!--
Notas del presentador: el último comentario HTML de una slide.
-->
```

- Slides are separated by a line containing only `---`. A `---` block
  immediately followed by `key: value` lines and another `---` is that slide's
  frontmatter, not an extra slide.
- **Counting slides:** slide 1 is the headmatter + its content; each following
  `---` separator starts a new slide. Code fences can contain `---`; ignore
  anything inside ``` fences when counting.
- Split long decks: a slide with frontmatter `src: ./pages/intro.md` imports
  that file's slides in place.

## Layouts (`layout:` in slide frontmatter)

| Layout | Use |
|---|---|
| `cover` | Title slide |
| `intro` | Speaker/intro |
| `section` | Section divider |
| `center` | Centered content |
| `default` | Normal content |
| `two-cols` | Two columns; put `::right::` where the right column starts |
| `two-cols-header` | Header row + `::left::` / `::right::` |
| `image-right` / `image-left` | Content + image; `image: /foto.png` (from `public/`) or a URL |
| `image` | Full-bleed image; `image:` + optional `backgroundSize: contain` |
| `statement` / `fact` / `quote` | Big single message / number / quote |
| `iframe` / `iframe-right` | `url:` embed |
| `end` | Closing slide |

Other per-slide keys: `class: text-center`, `background: /bg.jpg`,
`transition:`, `clicks: 3`, `hide: true`, `zoom: 0.8`.

## Click animations

```md
<v-clicks>

- Aparece primero
- Luego este

</v-clicks>

<v-click>Aparece al hacer click</v-click>
<div v-click="3">Aparece en el click 3</div>
<div v-after>Aparece junto con el anterior</div>
<div v-click.hide>Se oculta al hacer click</div>
<v-clicks depth="2">…</v-clicks>   <!-- listas anidadas -->
```

Blank lines around the markdown inside `<v-clicks>` are required.

## Motion (`@vueuse/motion`, built in)

```html
<div
  v-motion
  :initial="{ x: -80, opacity: 0 }"
  :enter="{ x: 0, opacity: 1, transition: { duration: 600, delay: 100 } }"
  :click-1="{ scale: 1.5 }"
  :leave="{ y: 30, opacity: 0 }"
>
  Contenido
</div>
```

- "Bigger animation" usually means larger `x`/`y` distance, larger `scale`,
  longer `duration`, or making the element itself bigger (`text-6xl`,
  `w-120`, `scale-150`). Ask only if genuinely ambiguous; otherwise pick the
  most literal reading and say what you changed.
- `:click-N` states animate on click N.

## Slide transitions

`fade`, `fade-out`, `slide-left`, `slide-right`, `slide-up`, `slide-down`,
`view-transition`. Different forward/back: `transition: slide-left | slide-right`.

## Loops (CSS)

Continuous motion is CSS only, so it keeps moving in `npm run export:ios`
(iPhone). Never `setInterval` or `requestAnimationFrame` for it.

- UnoCSS: `animate-spin`, `animate-pulse`, `animate-bounce`, `animate-ping`.
  Slower or faster: `style="animation-duration: 4s"` on the element.
- Custom: `@keyframes` in the slide's `<style>` and
  `animation: nombre 2s linear infinite`.
- `npm run export` draws them at rest (`animation: none`, from `style.css`):
  the base style must be the complete picture. Things that only exist while
  moving start at `opacity: 0` and their keyframes fade them in.
- Loop diagrams: see "Diagrams".

## Styling

- UnoCSS (Tailwind-compatible) classes work everywhere:
  `text-4xl`, `font-bold`, `text-red-500`, `grid grid-cols-2 gap-4`,
  `absolute bottom-10 right-10`, `opacity-50`, `rounded-xl shadow`.
- With `mdc: true`: `[importante]{.text-red-500 .font-bold}`.
- Per-slide CSS: a `<style>` block inside the slide is scoped to it.
- Global CSS: `style.css` at the project root (auto-loaded).

## Code

`````md
```ts {2|4-6|all}
// stepped line highlighting per click
```

```ts {lines:true,startLine:5}
```

```ts {monaco}
// editable editor in the slide
```

````md magic-move
```js
const a = 1
```
```js
const a = 1
const b = 2
```
````
`````

## Diagrams

Diagrams loop by default: the motion shows how things flow, and CSS loops keep
moving in `npm run export:ios` (iPhone). Pick by size:

**A. Default — HTML/SVG with CSS loops.** Nodes are HTML boxes; each
connector is a small inline SVG whose dashes flow, with a packet traveling
along it. Each click shows an arrow and the next node together (`v-click` +
`v-after`). Up to ~6 nodes; for vertical flows use `flex-col`, a vertical SVG
(`viewBox="0 0 20 100"`, line from `10,0` to `10,88`) and `translateY` in the
packet's keyframes.

```html
<div class="flujo">
  <div class="nodo">Cliente</div>
  <svg v-click class="flecha" viewBox="0 0 100 20"><line x1="0" y1="10" x2="88" y2="10" /><path d="M88 4 L100 10 L88 16 Z" /><circle class="paquete" cx="4" cy="10" r="5" /></svg>
  <div v-after class="nodo">API</div>
  <svg v-click class="flecha" viewBox="0 0 100 20"><line x1="0" y1="10" x2="88" y2="10" /><path d="M88 4 L100 10 L88 16 Z" /><circle class="paquete" cx="4" cy="10" r="5" /></svg>
  <div v-after class="nodo">Base de datos</div>
</div>

<style>
.flujo { display: flex; align-items: center; justify-content: center; gap: .5rem; margin-top: 4rem; font-size: 1.25rem; }
.nodo { padding: .75rem 1.25rem; border: 2px solid #14b8a6; border-radius: .5rem; }
.flecha { width: 100px; height: 20px; overflow: visible; }
.flecha line { stroke: #14b8a6; stroke-width: 3; stroke-dasharray: 8 6; animation: fluir .8s linear infinite; }
.flecha path { fill: #14b8a6; }
.flecha .paquete { fill: #fbbf24; opacity: 0; animation: viajar 1.6s ease-in-out infinite; }
@keyframes fluir { to { stroke-dashoffset: -14; } }
@keyframes viajar { 0% { transform: translateX(0); opacity: 0 } 15%, 85% { opacity: 1 } 100% { transform: translateX(80px); opacity: 0 } }
</style>
```

Cycles (PDCA, lifecycles, loops of a process): the steps around a dashed ring
that turns, carrying a dot. Keep the steps outside the ring so it never
crosses their text.

```html
<div class="ciclo">
  <div class="anillo"><span class="punto" /></div>
  <div class="paso" style="left: 50%; top: 0">Planear</div>
  <div class="paso" style="left: 100%; top: 50%">Hacer</div>
  <div class="paso" style="left: 50%; top: 100%">Revisar</div>
  <div class="paso" style="left: 0; top: 50%">Ajustar</div>
</div>

<style>
.ciclo { position: relative; width: 300px; height: 300px; margin: 3rem auto 0; }
.anillo { position: absolute; inset: 60px; border: 2px dashed #64748b; border-radius: 50%; animation: girar 6s linear infinite; }
.punto { position: absolute; top: -8px; left: calc(50% - 8px); width: 16px; height: 16px; border-radius: 50%; background: #fbbf24; }
.paso { position: absolute; transform: translate(-50%, -50%); padding: .4rem .9rem; border: 2px solid #14b8a6; border-radius: .5rem; white-space: nowrap; }
@keyframes girar { to { transform: rotate(360deg); } }
</style>
```

Building blocks to mix:

- **Flowing line**: `stroke-dasharray: 8 6` and `@keyframes { to {
  stroke-dashoffset: -14 } }`. The offset must equal dash + gap so the loop
  has no jump.
- **Traveling packet**: a `<circle>` with `opacity: 0` in its base style;
  its keyframes move it along the arrow and fade it in and out.
- **Active node**: `animate-pulse` on the node (it fades a little and back).
- Use the deck's colors instead of the teal/amber above, and keep class
  names unique per slide (`.flujo-auth`, `.flujo-pago`) when two slides
  differ.

**B. Big or special diagrams → Mermaid with animated edges.** More than ~6
nodes, several branches or crossings, or a sequence, state, class, ER or
Gantt diagram. Name each edge (`e1@-->`) and set `animate: true` so its dashes
flow (Mermaid ≥ 11.6, bundled with Slidev 53):

````md
```mermaid {scale: 0.8}
flowchart LR
  A[Pedido] e1@--> B{¿Pagado?}
  B e2@-->|sí| C[Enviar]
  B e3@-->|no| D[Recordatorio]
  D e4@--> B
  e1@{ animate: true }
  e2@{ animate: true }
  e3@{ animate: true }
  e4@{ animate: true }
```
````

Mermaid draws inside a shadow root, so slide CSS cannot style or animate its
parts: use Mermaid's own syntax (`animate`, `classDef`, `%%{init}%%`).

To reveal it in steps, wrap it in `<v-switch>`: each step is the previous one
plus the next nodes, one step is shown per click, and the last one is the
complete diagram.

`````md
<v-switch>
<template #1>

```mermaid {scale: 0.8}
flowchart LR
  A[Pedido] e1@--> B{¿Pagado?}
  e1@{ animate: true }
```

</template>
<template #2>

```mermaid {scale: 0.8}
flowchart LR
  A[Pedido] e1@--> B{¿Pagado?}
  B e2@-->|sí| C[Enviar]
  B e3@-->|no| D[Recordatorio]
  e1@{ animate: true }
  e2@{ animate: true }
  e3@{ animate: true }
```

</template>
</v-switch>
`````

- Blank lines around each code fence inside `<template>` are required.
- Keep the same node IDs, labels, declaration order, direction and `scale`
  in every step, so earlier nodes stay in place as new ones appear.
- The first step appears on the first click. Put the slide's title or a
  one-line lead above `<v-switch>` so the slide does not open empty.
- The PDF export shows the last step, so that step must be the full diagram.
- 2–4 steps is enough; group related nodes into one step.

## Mermaid

````md
```mermaid {scale: 0.8}
flowchart LR
  A --> B
```
````

- Keep it narrow enough for the slide (~4–5 nodes per row). Clipped diagrams
  are the most common export bug.
- One themed diagram → `%%{init: {'theme':'base','themeVariables':{…}}}%%` as
  the first line of the block. Several → one `setup/mermaid.ts` for the whole
  deck:

```ts
// setup/mermaid.ts
import { defineMermaidSetup } from '@slidev/types'

export default defineMermaidSetup(() => ({
  theme: 'base',
  themeVariables: {
    background: 'transparent',
    primaryColor: '#241809', primaryTextColor: '#fff4dc',
    primaryBorderColor: '#f5a524', lineColor: '#ffd27a',
    pie1: '#f5a524', pie2: '#ffd27a', pie3: '#7a4a14', pieOpacity: '1',
  },
}))
```

## Math (KaTeX)

Inline `$E = mc^2$`, block `$$ … $$`. **Formulas only render in Markdown
context.** Inside an HTML element on the same line they show as raw LaTeX:

```md
<!-- ❌ sale en crudo -->
<div class="card">$6 \times n$</div>

<!-- ✅ línea en blanco antes y después de la fórmula -->
<div class="card">
<div class="label">Con un six</div>

$$\textcolor{#f5a524}{6} \times n$$

</div>
```

- Rules for the ✅ form: HTML lines not indented more than 3 spaces, and a
  blank line before and after the formula.
- For a nicer look: `\textcolor{#hex}{…}` for accent colors,
  `\underbrace{x}_{\text{label}}` for labels, `\;` for spacing, and size it
  from a wrapper (`<div class="text-3xl">` + blank line + `$$…$$`).
- Tweak spacing per slide:
  `<style>.katex-display { margin: .4em 0 }</style>`.

## Export-safe styling (PDF)

`slidev export` prints with Chromium. These render fine on screen but break in
the PDF:

| Avoid | Use instead |
|---|---|
| `box-shadow: 0 0 40px rgba(…)` (glow) | radial-gradient glow (below) |
| `filter: blur()` / `drop-shadow()` / `backdrop-filter` | nothing, or a gradient |
| `background-clip: text` (gradient text) | solid `color` |
| a loop whose base style is incomplete (it only looks right mid-animation) | base style = complete picture; `style.css` exports loops at rest |

```css
/* glow that survives PDF export */
.glow { position: relative; isolation: isolate; }
.glow::before {
  content: ''; position: absolute; inset: -35%; z-index: -1;
  pointer-events: none;
  background: radial-gradient(closest-side, rgba(245,165,36,.45), transparent);
}
```

`v-motion` and `v-click` are safe: export renders their final state.

## Assets & components

- Files in `public/` are served from `/` → `![](/diagram.png)`. They are
  embedded in `npm run export:html`; images loaded by URL still need internet.
- `.vue` files in `components/` are auto-imported: `<MiComponente />`.
- Built-ins: `<Arrow x1 y1 x2 y2 />`, `<Tweet id="…"/>`, `<Youtube id="…"/>`,
  `<Toc />`, `<SlideCurrentNo />`, `<Transform :scale="0.8">`.

## Commands (suggest them; do not run them for the user)

- `npm install` — once.
- `npm run dev` — dev server with hot reload (http://localhost:3030).
- `npm run export` — PDF (needs `playwright-chromium`, already in the starter).
  If it fails because Chromium is missing (newer npm blocks install scripts),
  suggest `npx playwright install chromium` once.
  `npm run export -- --format pptx` or `--format png` for other formats.
- `npm run export:html` — `slides-export.html`, a single file that opens with a
  double click (no server, no Node) and keeps animations. Needs
  `vite.config.ts` and `vite-plugin-singlefile` from the starter. The
  iPhone/iPad file preview shows it blank (it does not run JavaScript).
- `npm run export:ios` — `slides-ios.html`, the deck as HTML + CSS without
  JavaScript for the iPhone/iPad file preview: clicks revealed, CSS loops
  moving, swipe between slides. Needs the starter's `vite.config.ts` and
  Chromium (like `npm run export`).
- `npm run build` — static SPA in `dist/` for hosting.
