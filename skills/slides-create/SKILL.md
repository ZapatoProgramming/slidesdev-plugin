---
name: slides-create
description: Create a new Slidev presentation (slides.md + package.json) in the current working directory, following the user's preferences from AGENTS.md. Use when the user asks to make, create, generate or draft a presentation, slides, deck or talk ("hazme una presentación sobre…", "crea unas slides de…", "prepara una charla de 10 minutos", "make a deck about…"). For changes to an existing slides.md use slides-edit instead.
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

If the deck is about the current repository, read the relevant code/docs first
so the content is accurate, and cite real file names.

## 3. Scaffold the project

If `slides.md` **already exists** here, stop and ask whether to overwrite it,
create the new deck in a subfolder (e.g. `./<slug>/`), or edit the existing one
(then switch to slides-edit).

Otherwise copy the starter from this skill's folder:
`assets/starter/` (sibling of this SKILL.md) → the target folder. It contains
`package.json`, `slides.md`, `style.css`, `.gitignore`, `components/` and
`public/`. `style.css` holds a workaround for a Slidev bug (a slide list stuck
on screen, see "Known issues" in
[`../slides-edit/SKILL.md`](../slides-edit/SKILL.md)): copy it as is, and
whenever you rewrite `style.css` keep that block.
Do not overwrite an existing `package.json` or `.gitignore`; if one exists,
merge the Slidev dependencies and scripts into it instead and tell the user.

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
   - Animations according to preferences (none / `v-clicks` / `v-motion`).
   - Code blocks with stepped highlighting, diagrams in Mermaid, when useful.
   - Speaker notes as the last `<!-- -->` comment of each slide, if preferred.
   - Images: never invent URLs. Use a placeholder
     (`<!-- TODO: imagen de … -->`) or files the user provided in `public/`.

For decks over ~25 slides, split sections into `pages/*.md` and import them
with `src:`.

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
  state. CSS `@keyframes` loops are captured mid-frame, so give components with
  CSS animations a static layout when `useNav().isPrintMode` is true.
- **Math only in Markdown context**: `$…$`/`$$…$$` are not rendered inside
  an HTML element on the same line (`<div>$x$</div>` shows the raw LaTeX).
  Close the HTML, leave a blank line, write the formula, leave a blank line
  (see "Math" in the cheatsheet).

To check the export, look at the PDF itself: `--format png` screenshots the
screen rendering and does **not** reproduce the PDF-only bugs above.

**Keep the deck in as few files as possible.** Put everything in `slides.md`
by default: style with UnoCSS classes and per-slide `<style>` blocks. Add to
`style.css` only styles repeated across many slides (keeping its Goto
workaround block), and create a
`components/*.vue` file only for something Markdown + UnoCSS cannot do (e.g. a
custom animated background). Every extra file is one more write that can be
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
npm run build      # genera un sitio estático en dist/
```

Mention they can now ask for changes in plain language ("cambia la diapo 4
a dos columnas") without naming the plugin.
