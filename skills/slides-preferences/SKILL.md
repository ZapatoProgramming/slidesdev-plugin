---
name: slides-preferences
description: Load, create or update the user's presentation style preferences stored in AGENTS.md (project first, then global ~/.config/slides/AGENTS.md). Use before creating or editing a Slidev presentation, and when the user wants to change how their slides should look ("cambia mis preferencias de presentaciones", "from now on my slides should use a dark theme", "quiero menos texto en mis slides").
---

# Slides preferences

The user's taste for presentations lives in a `## Presentaciones` section of an
`AGENTS.md` file. Every slide you write or edit must follow it.

## Where to look (first match wins, section by section)

1. `./AGENTS.md` in the current working directory → section `## Presentaciones`
   (also accept `## Slides` or `## Presentations`).
2. Global profile: `~/.config/slides/AGENTS.md` → same section names.
   On Windows use `%USERPROFILE%\.config\slides\AGENTS.md`.

Read only that section, not the whole file. If both exist, the project section
wins for any key it defines; fill the gaps from the global one.

**Precedence:** what the user asks in this conversation > project AGENTS.md >
global AGENTS.md > defaults in
[`../slides-create/references/agents-md-template.md`](../slides-create/references/agents-md-template.md).

## When no preferences exist

Do not block the user with a long interview. Ask **at most 5 short questions in
one message**, each with a suggested default so they can answer "ok":

1. Idioma de las slides (default: el de la conversación).
2. Tema Slidev (`default`, `seriph`, u otro de npm) y modo claro/oscuro.
3. Tono (técnico / divulgativo / ejecutivo) y densidad de texto (poco texto, 3-5 bullets máx.).
4. Animaciones: ninguna / sutiles (`v-click`, `fade`) / muchas (`v-motion`, transiciones).
   Los diagramas se animan por pasos salvo que elija "ninguna" o pida diagramas estáticos.
5. Colores o fuente de marca, si tiene.

Then write the section using the template file above, filled with the answers,
and ask where to save it only if it is ambiguous:

- Default: append the section to `./AGENTS.md` (create the file if missing;
  never overwrite other sections).
- If the user says the preferences are "para todas mis presentaciones", write
  to the global file instead (create `~/.config/slides/` if needed).

If the user says "usa lo que quieras" / "skip", use the template defaults
without writing anything.

## Updating preferences

When the user states a lasting preference ("de ahora en adelante…", "siempre…",
"from now on…"), edit the matching line of the section in place with a minimal
edit. A one-off request for the current deck ("esta vez en inglés") is **not**
a preference change — do not write it.
