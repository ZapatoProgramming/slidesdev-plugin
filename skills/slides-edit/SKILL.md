---
name: slides-edit
description: Edit an existing Slidev presentation. Use whenever the working directory (or a folder the user mentions) contains a Slidev slides.md and the user asks to change anything in it — a slide's text, size, animation, layout, transition, theme, colors, images, code, diagrams, order, or to add/remove/split slides, or to export or share it ("pásamela en un HTML que se abra con doble clic", "quiero verla en el iPhone") — even if they never mention the plugin or Slidev ("haz más grande la animación de la diapo 3", "pon la slide de arquitectura a dos columnas", "quita la última diapositiva", "make the title on slide 2 bigger", "añade una slide sobre costos después de la agenda", "pon el logo de este Figma en la portada").
---

# Edit a Slidev presentation

## 1. Find the deck

- Look for `slides.md` in the working directory; if absent, check folders the
  user mentioned or one level down. If several decks exist and the request is
  ambiguous, ask which one.
- Collect imported files: any slide frontmatter `src: ./pages/x.md` means those
  slides live in that file.
- Load preferences with [`../slides-preferences/SKILL.md`](../slides-preferences/SKILL.md)
  so new or rewritten content keeps the user's style. Skip the interview here:
  if no preferences exist, mimic the existing deck's style instead.

## 2. Locate the target slide

- "Diapo/slide N" is **1-based** in presentation order. Count as described in
  the cheatsheet: slide 1 = headmatter + its content; every `---` separator
  outside code fences starts a new slide; a frontmatter block right after a
  separator belongs to that slide; `src:` imports expand in place.
- The user may name slides by title or topic ("la de arquitectura"): match
  against the `#` headings.
- Before editing, confirm to yourself the slide's title so you can name it in
  the reply ("Diapo 3 — *Arquitectura*").

## 3. Make the smallest correct change

Use [`../slides-create/references/slidev-cheatsheet.md`](../slides-create/references/slidev-cheatsheet.md)
for syntax. Guidelines:

- Edit only the target slide(s); keep everything else byte-identical.
- Vague size/intensity words ("más grande", "más lento", "más sutil") → pick a
  clear step (e.g. `text-4xl` → `text-6xl`, `scale: 1.2` → `1.5`,
  `duration: 400` → `800`, `x: -40` → `-120`) and state what you changed so
  the user can say "más" or "menos".
- Adding slides: insert with a proper `---` separator and follow the deck's
  existing layout/animation patterns.
- Reordering: move whole slide blocks including their frontmatter and notes.
- "Anima el diagrama" / "que el diagrama se mueva" / "que aparezca por
  pasos": if it has up to ~6 nodes, redraw it as a loop diagram (pattern A in
  "Diagrams" in the cheatsheet), keeping its nodes, labels and colors; if it
  is bigger or a sequence/state/class/ER/Gantt diagram, keep Mermaid and add
  animated edges (pattern B). Add click steps (`v-click`, `<v-switch>`) only
  when the user asked for steps ("que aparezca por pasos") or the
  **Animaciones:** preference is "con clicks" or "variadas". New diagrams
  follow the diagram rule in [`../slides-create/SKILL.md`](../slides-create/SKILL.md).
- New or changed animations follow "Animations: loops first, without
  JavaScript" in [`../slides-create/SKILL.md`](../slides-create/SKILL.md):
  when the user asks to animate something without saying how ("anímala",
  "dale movimiento"), write a loop, not a click, unless the **Animaciones:**
  preference is "con clicks". Write it in CSS, or SMIL when the motion is SVG
  geometry or a synchronized diagram; never JavaScript. Give a one-line
  warning before writing motion that needs JavaScript (it will look still in
  `slides-export.html`).
- Theme change: update headmatter `theme:` **and** add the theme package to
  `package.json`; tell the user to run `npm install`.
- New images: never invent URLs; use files in `public/` or leave a TODO.
- Requests that point to Figma ("usa los colores de este Figma", "que la
  diapo 4 quede como este frame"), when Figma MCP tools are available: follow
  [`../slides-create/references/figma.md`](../slides-create/references/figma.md).
  The change still lands in `slides.md` and `public/`.
- If the request is a lasting style preference ("siempre quiero…"), also
  update AGENTS.md via slides-preferences.
- New styles, diagrams and formulas must follow "Must survive `npm run
  export` (PDF)" in [`../slides-create/SKILL.md`](../slides-create/SKILL.md).
  When the user reports that something "no sale en el PDF" or that math shows
  raw, check that list first.
- Prefer editing `slides.md` over creating new files (`style.css`,
  `components/*.vue`); add them only when Markdown + UnoCSS cannot do it.
- If a write is blocked, follow "If a write is blocked" in
  [`../slides-create/SKILL.md`](../slides-create/SKILL.md): no retries, no
  shell workarounds; tell the user and offer to paste the change.

## Known issues

Not every problem the user reports is in the deck. Rule these out **before**
touching `slides.md`:

- **"Un menú / lista de diapositivas que no se quita y tapa todo"** (top right,
  entries like "1 Título", "2 undefined"). This is Slidev's Goto dialog
  (`#slidev-goto-dialog`), not deck content: do not delete slides or blocks
  to fix it. It happens with `@slidev/client` < 52.15 plus fuse.js ≥ 7.2,
  where an empty search returns every slide. Fix:
  1. Check `node_modules/@slidev/client/package.json` → `version`. If it is
     below 52.15, suggest `npm install @slidev/cli@latest` (Slidev 53 needs
     Node ≥ 22.12).
  2. Make sure `style.css` contains the workaround block from
     [`../slides-create/assets/starter/style.css`](../slides-create/assets/starter/style.css);
     add it if missing (it keeps `g` working).
- **Slides titled "undefined"** in that list or in presenter mode: the slide
  has no `#` heading (its title is HTML). Add `title: …` to its frontmatter.
- **`npm run build` fails with `[lightningcss minify] Invalid token in pseudo
  element`**: a Slidev 53 + Vite 8 bug in Slidev's own CSS, not in the deck.
  Copy [`../slides-create/assets/starter/vite.config.ts`](../slides-create/assets/starter/vite.config.ts)
  into the deck (it sets `build.cssMinify: false`); if the deck already has a
  `vite.config.ts`, add that option to it instead.
- **"El HTML no se abre / sale en blanco en el iPhone"** or
  **"slides-ios.html sale chica / no avanza / se corta en horizontal"**
  (small in the middle of a computer screen, cut off at the bottom on a phone
  held sideways, every slide stacked in one long page, `→` does nothing): the
  deck has the export of plugin 0.3.0 or earlier. Its `slides-export.html`
  needs JavaScript, which the iPhone/iPad file preview does not run, and its
  `export:ios` had a layout bug. The deck's export is current when its
  `vite.config.ts` has `staticHtml()`. Update it as in "Decks from older
  versions" below. Do not touch `slides.md`.
- **Loops that come out mid-motion in the PDF** (a shape half faded or
  turned): the deck's `style.css` lacks the block that exports loops at rest.
  Add it from
  [`../slides-create/assets/starter/style.css`](../slides-create/assets/starter/style.css).

## Sharing the deck

When the user wants to send or show the deck outside `npm run dev`
("pásamela en un archivo", "que la puedan abrir en otra compu", "expórtala a
HTML", "quiero verla en el iPhone"), suggest `npm run export:html`. It writes
`slides-export.html`: the deck as HTML + CSS in one file with the images in
`public/` inside. It opens with a double click in any browser, without Node or
a server, and in the iPhone/iPad file preview (Files app, AirDrop), which does
not run JavaScript.

It plays as a presentation: one slide per screen, scaled to fit, and a
sideways swipe moves to the next one (← → on a computer). A double click on
the page toggles fullscreen and Esc leaves it (on a computer; on the iPhone it
does nothing). The slides are 16:9, so a phone held upright shows black bands
above and below: suggest turning the phone sideways. On a computer the
vertical mouse wheel does not advance; use ← →. On the iPhone it needs iOS 16
or later.

Clicks come out already revealed, CSS loops keep moving and `v-motion`
entrances show their final state. Motion made with JavaScript stays still,
and there are no slide transitions or presenter mode: to present with clicks
and transitions, use `npm run dev` (or `npm run build` and a hosting).
`npm run export` (PDF/PPTX) loses the animations. Google fonts and images
loaded by URL need internet; offline the fonts fall back to a system font.
Do not run the export yourself unless asked.

**Changing an export** (its script, `vite.config.ts`, or merging the
starter's into a deck): an export has to look like a presentation — each
slide fills the window and you move one slide at a time. Check it on a phone
held sideways, a phone held upright and a desktop; for `slides-export.html`,
with JavaScript off and in WebKit, not only in Chromium (the iPhone is
WebKit). Its only script is the fullscreen one: it must not touch the layout,
and the deck must work the same where it does not run (iPhone file preview)
or does nothing (iPhone Safari has no fullscreen). Anything else goes in CSS.

### Decks from older versions

Decks made with plugin 0.3.0 or earlier have no `export:html`, or one whose
file needs JavaScript (blank on the iPhone), or a separate `export:ios` that
writes `slides-ios.html`. The export is current when the deck's
`vite.config.ts` has `staticHtml()`. Decks from 0.4.0–0.5.0 have it but no
fullscreen on double click (no `dblclick` in `vite.config.ts`); when the user
asks for it, step 1 is enough. To update it:

1. Copy [`../slides-create/assets/starter/vite.config.ts`](../slides-create/assets/starter/vite.config.ts)
   into the deck. If the deck's `vite.config.ts` has options the plugin did
   not write, show the user the difference and merge instead of overwriting.
2. In `package.json`, take the `export:html` script from
   [`../slides-create/assets/starter/package.json`](../slides-create/assets/starter/package.json),
   remove `export:ios`, and add the `playwright-chromium` and
   `vite-plugin-singlefile` devDependencies if they are missing. If
   `@slidev/cli` is older than the starter's (`^53.0.0`), raise it to that
   version: the script needs `--router-mode`.
3. Add the loops-at-rest block from
   [`../slides-create/assets/starter/style.css`](../slides-create/assets/starter/style.css)
   to the deck's `style.css` if it is missing, and make sure `.gitignore`
   has `slides-export.*`. Tell the user that a leftover `slides-ios.html` is
   no longer used.
4. Check the deck's loops: any made with `setInterval` or
   `requestAnimationFrame` will look still in the HTML. Offer to rewrite
   them in CSS, or SMIL when the motion is SVG geometry or a synchronized
   diagram. Components that switch to a static layout with
   `useNav().isPrintMode` keep working as they are.
5. Tell the user to run `npm install`, then `npm run export:html`. If
   Chromium is missing, `npx playwright install chromium` once.

## 4. Reply

One or two lines: which slide(s) changed and how. If a dev server is running
(`npm run dev`), the change hot-reloads; otherwise suggest `npm run dev`.
Do not start the server yourself unless asked.
