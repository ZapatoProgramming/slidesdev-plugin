# Contribuir

¡Gracias por ayudar! Este plugin es casi todo Markdown: los skills en
`skills/*/SKILL.md` son las instrucciones que siguen Claude Code, Codex, Antigravity y OpenCode.

1. Haz fork y clona el repo.
2. Instálalo en modo desarrollo (ver [README → Probar el plugin en modo desarrollo](README.md#probar-el-plugin-en-modo-desarrollo)).
3. Haz tu cambio. Reglas:
   - Un skill = una carpeta en `skills/` con `SKILL.md`; el `name` del
     frontmatter debe coincidir con la carpeta.
   - La `description` decide cuándo se activa el skill: incluye frases de
     ejemplo reales, en español y en inglés.
   - No dupliques documentación de Slidev: amplía
     `skills/slides-create/references/slidev-cheatsheet.md`.
   - No añadas nada específico de un solo agente a los skills; lo específico
     de Claude va en `commands/` o `.claude-plugin/`, lo de Codex en
     `.codex-plugin/`, lo de Antigravity en `plugin.json` y lo de OpenCode en
     `.opencode/`.
   - Un export tiene que verse como una presentación: cada slide llena la
     ventana y se avanza de a una. Si tocas uno, compruébalo en un teléfono
     horizontal, un teléfono vertical y un escritorio; para
     `slides-export.html`, con JavaScript apagado y en WebKit, no solo en
     Chromium (el iPhone es WebKit), y corre
     `node --test tests/export-html.test.mjs`. Su único script es el de
     pantalla completa: no toca el layout, y la presentación tiene que
     funcionar igual donde no corre (vista previa del iPhone) o no hace nada
     (Safari del iPhone). Lo demás va en CSS.
4. Ejecuta `node scripts/validate.mjs`.
5. Si tocas un skill, prueba el flujo en todos los agentes que puedas.
6. Añade una línea en `CHANGELOG.md` bajo `[Unreleased]` y abre el PR.

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/)
(`feat:`, `fix:`, `docs:`…).
