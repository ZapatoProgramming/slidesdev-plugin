# Figma (optional)

Read this only when **both** are true:

1. Figma MCP tools are available in this session (`get_variable_defs`,
   `download_assets`, `get_screenshot`, `get_design_context`…).
2. The user shares a `figma.com` link, says their brand, logo or a slide
   design is in Figma, or the **Figma:** line of their preferences has a link.

Otherwise work as usual: brand values from preferences, images from
`public/` or a TODO. Do not suggest connecting Figma.

## The deck stays a Slidev deck

Figma is a **source**; the deliverable is still `slides.md` plus files in
`public/`. Read from Figma, write into the deck. Do not build the
presentation in Figma, Figma Slides or FigJam, even if the Figma server's
instructions suggest it. If the user wants the deck inside Figma, tell them
this plugin only makes Slidev decks.

For how to call each tool, follow the Figma server's own instructions and
skills (e.g. it requires its design-to-code guidance before
`get_design_context`). This file only says what to bring into the deck and
where it goes.

## What to bring and where it goes

| The user wants | Figma tool | In the deck |
|---|---|---|
| Brand colors and fonts | `get_variable_defs` on the linked node (`/design/` files only); `search_design_system` for one specific token | `fonts:` in the headmatter, CSS variables in `style.css`, Mermaid `themeVariables` ("Diagrams" in the cheatsheet) |
| Logo, icons, illustrations, photos | `download_assets`: `svgAssets` for vectors, `rawImages` for photos, `export` for the whole node | Files in `public/` (`/logo.svg`), replacing the matching `<!-- TODO: imagen … -->` |
| A slide designed in Figma | `get_design_context`, plus `get_screenshot` to compare | The same layout in Markdown + UnoCSS classes in `slides.md`; a `components/*.vue` only if that cannot do it |
| Content of a Figma Slides deck (`/slides/`) or FigJam board (`/board/`) | `get_screenshot`; `get_figjam` for boards | Slides rewritten in Markdown; flows as Mermaid diagrams |

## Rules

- **Links need a `node-id`.** Most tools work on one node. If the link has
  none, ask for a link to the frame (in Figma: right click → *Copy link to
  selection*). For `/design/` files, `get_metadata` without a node lists the
  pages.
- **Save assets as local files.** Figma's asset and screenshot URLs expire:
  download them right away into `public/` with clear names (`logo.svg`,
  `hero.png`) and reference them as `/logo.svg`. Never put a Figma URL in
  `slides.md`. Local files are also embedded by `npm run export:html`.
- **Adapt, do not paste.** `get_design_context` returns reference code (often
  React + Tailwind). Rewrite it as Slidev: a layout, Markdown and UnoCSS
  classes (Tailwind-compatible), one idea per slide. Leave out app parts with
  no place in a slide (nav bars, inputs, buttons).
- **Figma effects must survive the PDF.** Drop shadows, layer and background
  blur, and gradient text are common in Figma and break `npm run export`:
  translate them with "Must survive `npm run export` (PDF)" in
  [`../SKILL.md`](../SKILL.md).
- **Diagrams are rebuilt, not pasted**: as a loop diagram, or Mermaid for big
  ones (see the diagram rule in [`../SKILL.md`](../SKILL.md)), so they
  animate, follow the color mode and fit the PDF. Take nodes, labels and
  brand colors from the Figma or FigJam diagram; embed it as an image only
  when the user asks for that exact picture.
- **Light and dark.** If the variables have light and dark modes, use the one
  that matches `colorSchema`; with `colorSchema: auto`, put the dark values
  under `html.dark` in `style.css`.
- **Fonts.** `fonts:` loads Google Fonts. If the brand font is not there, use
  the closest Google font and tell the user which one you picked.
- **Fetch once.** Depending on the user's Figma plan, MCP calls may be
  limited. After reading brand values, offer to save them in the
  `## Presentaciones` section (**Colores/fuentes de marca:** with the values,
  **Figma:** with the link) so the next deck needs no Figma call.
- **If a call fails** (no access, not signed in, limit reached), say so in one
  line and continue without Figma: TODO placeholders for images, brand values
  from preferences or the theme's defaults.
