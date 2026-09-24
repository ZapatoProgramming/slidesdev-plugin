// Adapter for OpenCode (https://opencode.ai). The skills in skills/ stay the
// single source of truth; this file only tells OpenCode where they are and
// exposes commands/new.md as the /slides-new command, both from the `config`
// hook.

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
    // Recent 1.x builds may hand over skills as a flat list of paths.
    if (Array.isArray(config.skills)) {
      if (!config.skills.includes(skillsDir)) config.skills.push(skillsDir)
    } else {
      config.skills = config.skills || {}
      config.skills.paths = config.skills.paths || []
      if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir)
    }

    // User-defined commands with the same name win.
    config.command = { ...readCommands(), ...config.command }
  },
})

export default { id: 'slides', server: SlidesPlugin }
