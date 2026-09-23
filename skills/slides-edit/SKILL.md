---
name: slides-edit
description: Edit an existing Slidev presentation. Use whenever the working directory (or a folder the user mentions) contains a Slidev slides.md and the user asks to change anything in it — a slide's text, size, animation, layout, transition, theme, colors, images, code, diagrams, order, or to add/remove/split slides — even if they never mention the plugin or Slidev ("haz más grande la animación de la diapo 3", "pon la slide de arquitectura a dos columnas", "quita la última diapositiva", "make the title on slide 2 bigger", "añade una slide sobre costos después de la agenda").
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
- Theme change: update headmatter `theme:` **and** add the theme package to
  `package.json`; tell the user to run `npm install`.
- New images: never invent URLs; use files in `public/` or leave a TODO.
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

## 4. Reply

One or two lines: which slide(s) changed and how. If a dev server is running
(`npm run dev`), the change hot-reloads; otherwise suggest `npm run dev`.
Do not start the server yourself unless asked.
