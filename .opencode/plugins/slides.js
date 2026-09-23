// Adapter for OpenCode (https://opencode.ai). The skills in skills/ stay the
// single source of truth; this file only tells OpenCode where they are and
// exposes commands/new.md as the /slides-new command.
//
// V1 (opencode 1.x): the named export's `config` hook adds skills/ to
// `skills.paths` and registers the command.
// V2 (opencode 2.0.4+): `setup()` registers each skill through
// ctx.skill.transform(); V2 has no command registration here yet.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const skillsDir = path.join(root, 'skills')
const commandsDir = path.join(root, 'commands')

// Enough YAML for our own frontmatter: one `key: value` per line.
function splitFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: text }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) data[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, '$2')
  }
  return { data, body: match[2] }
}

// commands/<name>.md → { "slides-<name>": { template, description } }
function readCommands() {
  const commands = {}
  if (!fs.existsSync(commandsDir)) return commands
  for (const file of fs.readdirSync(commandsDir)) {
    if (!file.endsWith('.md')) continue
    const { data, body } = splitFrontmatter(fs.readFileSync(path.join(commandsDir, file), 'utf8'))
    commands[`slides-${file.slice(0, -3)}`] = {
      template: body.trim(),
      ...(data.description ? { description: data.description } : {}),
    }
  }
  return commands
}

export const SlidesPlugin = async () => ({
  config: async (config) => {
    // V2 passes skills as a flat array and registers them in setup().
    if (Array.isArray(config.skills)) return

    config.skills = config.skills || {}
    config.skills.paths = config.skills.paths || []
    if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir)

    // User-defined commands with the same name win.
    config.command = { ...readCommands(), ...config.command }
  },
})

async function setup(ctx) {
  // V1 also calls setup() with a context that lacks these domains.
  if (typeof ctx?.skill?.transform !== 'function') return

  const skills = []
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    const file = path.join(skillsDir, entry.name, 'SKILL.md')
    if (!entry.isDirectory() || !fs.existsSync(file)) continue
    const { data, body } = splitFrontmatter(fs.readFileSync(file, 'utf8'))
    skills.push({
      id: entry.name,
      name: data.name || entry.name,
      ...(data.description ? { description: data.description } : {}),
      path: file,
      content: body,
    })
  }

  try {
    await ctx.skill.transform((draft) => {
      // A throw inside this callback makes the host disable the whole plugin,
      // so skip a rejected skill instead of propagating.
      for (const skill of skills) {
        try {
          draft.add(skill)
        } catch (err) {
          console.error(`[slides] skill "${skill.id}" rejected by OpenCode:`, err)
        }
      }
    })
  } catch (err) {
    console.error('[slides] skill registration failed:', err)
  }
}

export default { id: 'slides', server: SlidesPlugin, setup }
