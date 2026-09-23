# Contribuir

¡Gracias por ayudar! Este plugin es casi todo Markdown: los skills en
`skills/*/SKILL.md` son las instrucciones que siguen Claude Code y Codex.

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
     `.codex-plugin/`.
4. Ejecuta `node scripts/validate.mjs`.
5. Prueba el flujo en **ambos** agentes si tocas un skill.
6. Añade una línea en `CHANGELOG.md` bajo `[Unreleased]` y abre el PR.

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/)
(`feat:`, `fix:`, `docs:`…).
