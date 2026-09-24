#!/usr/bin/env node
// Static checks for the plugin layout: manifests agree, skills are well formed,
// and every relative link inside a SKILL.md points to a real file.
// Usage: node scripts/validate.mjs

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const fail = (msg) => errors.push(msg)

function readJson(rel) {
  const path = join(root, rel)
  if (!existsSync(path)) {
    fail(`${rel}: missing`)
    return null
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    fail(`${rel}: invalid JSON (${err.message})`)
    return null
  }
}

// --- Manifests ---------------------------------------------------------------

const claudePlugin = readJson('.claude-plugin/plugin.json')
const claudeMarket = readJson('.claude-plugin/marketplace.json')
const codexPlugin = readJson('.codex-plugin/plugin.json')
const codexMarket = readJson('.agents/plugins/marketplace.json')
const antigravityPlugin = readJson('plugin.json')
const opencodePackage = readJson('package.json')

const semver = /^\d+\.\d+\.\d+(-[\w.]+)?$/
let version = null

if (claudePlugin) {
  if (!semver.test(claudePlugin.version ?? '')) {
    fail(`.claude-plugin/plugin.json: version "${claudePlugin.version}" is not SemVer`)
  }
  version = claudePlugin.version
  for (const [file, manifest] of [
    ['.codex-plugin/plugin.json', codexPlugin],
    ['plugin.json', antigravityPlugin],
    ['package.json', opencodePackage],
  ]) {
    if (!manifest) continue
    if (manifest.name !== claudePlugin.name) {
      fail(`${file}: name "${manifest.name}" differs from .claude-plugin/plugin.json "${claudePlugin.name}"`)
    }
    if (manifest.version !== version) {
      fail(`${file}: version ${manifest.version} differs from .claude-plugin/plugin.json ${version}`)
    }
  }
}

if (codexPlugin && codexPlugin.skills !== './skills/') {
  fail('.codex-plugin/plugin.json: "skills" must be "./skills/"')
}

if (opencodePackage) {
  const main = opencodePackage.main
  if (!main || !existsSync(join(root, main))) fail(`package.json: "main" → ${main} does not exist`)
  if (opencodePackage.type !== 'module') fail('package.json: "type" must be "module"')
}

const pluginName = claudePlugin?.name
for (const [file, market] of [
  ['.claude-plugin/marketplace.json', claudeMarket],
  ['.agents/plugins/marketplace.json', codexMarket],
]) {
  if (!market) continue
  const entry = market.plugins?.find((p) => p.name === pluginName)
  if (!entry) {
    fail(`${file}: no plugin entry named "${pluginName}"`)
    continue
  }
  if (entry.version && entry.version !== version) {
    fail(`${file}: entry version ${entry.version} differs from plugin.json ${version}`)
  }
}

if (claudeMarket && codexMarket && claudeMarket.name !== codexMarket.name) {
  fail(`marketplace name differs: claude "${claudeMarket.name}" vs codex "${codexMarket.name}"`)
}

if (version) {
  const changelog = join(root, 'CHANGELOG.md')
  if (!existsSync(changelog) || !readFileSync(changelog, 'utf8').includes(`## [${version}]`)) {
    fail(`CHANGELOG.md: no "## [${version}]" section`)
  }
}

// --- Skills ------------------------------------------------------------------

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return null
  const data = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) data[kv[1]] = kv[2].trim()
  }
  return data
}

function checkLinks(file, text) {
  // Markdown links with a relative target, ignoring URLs and anchors.
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue
    const path = resolve(dirname(file), target.split('#')[0])
    if (!existsSync(path)) fail(`${file.slice(root.length + 1)}: broken link → ${target}`)
  }
}

const skillsDir = join(root, 'skills')
const skills = existsSync(skillsDir)
  ? readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory())
  : []
if (skills.length === 0) fail('skills/: no skills found')

for (const name of skills) {
  const file = join(skillsDir, name, 'SKILL.md')
  if (!existsSync(file)) {
    fail(`skills/${name}: missing SKILL.md`)
    continue
  }
  const text = readFileSync(file, 'utf8')
  const fm = parseFrontmatter(text)
  if (!fm) {
    fail(`skills/${name}/SKILL.md: missing frontmatter`)
    continue
  }
  if (fm.name !== name) fail(`skills/${name}/SKILL.md: name "${fm.name}" must match folder`)
  if (!fm.description) fail(`skills/${name}/SKILL.md: missing description`)
  else if (fm.description.length > 1024) {
    fail(`skills/${name}/SKILL.md: description is ${fm.description.length} chars (max 1024)`)
  }
  checkLinks(file, text)
}

// --- Starter template --------------------------------------------------------

const starter = join(skillsDir, 'slides-create', 'assets', 'starter')
for (const f of ['package.json', 'slides.md', 'style.css', '.gitignore']) {
  if (!existsSync(join(starter, f))) fail(`starter template: missing ${f}`)
}
readJson('skills/slides-create/assets/starter/package.json')

// --- Result ------------------------------------------------------------------

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`✓ slides ${version}: manifests, ${skills.length} skills and starter template look good`)
