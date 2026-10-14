// Regression test for `npm run export:html` (staticHtml() in the starter's
// vite.config.ts). Builds a minimal deck from the starter, generates
// slides-export.html and opens it with JavaScript off, in WebKit (the iPhone)
// and Chromium: each slide must fit the screen and touch two opposite edges,
// and → must move one slide at a time.
//
// Usage: node --test tests/export-html.test.mjs
// Slow the first time: it runs `npm install` in a temporary folder and
// downloads Chromium and WebKit for Playwright. SLIDES_TEST_DECK=<folder>
// keeps the deck (and its node_modules) there to reuse between runs.

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { after, before, describe, test } from 'node:test'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const starter = join(root, 'skills', 'slides-create', 'assets', 'starter')
const keepDeck = !!process.env.SLIDES_TEST_DECK
const deck = keepDeck ? resolve(process.env.SLIDES_TEST_DECK) : mkdtempSync(join(tmpdir(), 'slides-html-'))

// Four slides: with three, a → that skipped a slide would still end on the
// last one and the scroll check could not tell.
const SLIDES = `---
theme: default
title: export:html
transition: slide-left
---

# Uno

---

# Dos

---

# Tres

---

# Cuatro
`

const VIEWPORTS = [
  { name: 'phone held sideways 844×390', options: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } },
  { name: 'desktop 1440×900', options: { viewport: { width: 1440, height: 900 } } },
]

const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: deck, stdio: 'inherit', shell: process.platform === 'win32' })

let playwright

before(() => {
  mkdirSync(deck, { recursive: true })
  // Always the starter as it is now, over whatever a reused deck had
  cpSync(starter, deck, { recursive: true })
  writeFileSync(join(deck, 'slides.md'), SLIDES)
  run('npm', ['install', '--no-audit', '--no-fund'])
  playwright = createRequire(join(deck, 'package.json'))('playwright-chromium')
  run(process.execPath, [join(deck, 'node_modules', 'playwright-chromium', 'cli.js'), 'install', 'chromium', 'webkit'])
  run('npm', ['run', 'export:html'])
})

after(() => {
  if (!keepDeck)
    rmSync(deck, { recursive: true, force: true })
})

const near = (a, b) => Math.abs(a - b) <= 1

// scrollLeft of .export-deck once it stops moving (keyboard scrolling is animated)
async function settledScrollLeft(page) {
  let last = Number.NaN
  for (let stable = 0, deadline = Date.now() + 5000; stable < 3 && Date.now() < deadline;) {
    await new Promise(r => setTimeout(r, 150))
    const value = await page.evaluate(() => document.querySelector('.export-deck').scrollLeft)
    stable = value === last ? stable + 1 : 0
    last = value
  }
  return last
}

for (const browserName of ['webkit', 'chromium']) {
  describe(`slides-export.html in ${browserName}, JavaScript off`, () => {
    let browser

    before(async () => {
      browser = await playwright[browserName].launch()
    })

    after(() => browser?.close())

    for (const { name, options } of VIEWPORTS) {
      test(name, async () => {
        const { width: vw, height: vh } = options.viewport
        const context = await browser.newContext({ ...options, javaScriptEnabled: false })
        try {
          const page = await context.newPage()
          await page.goto(pathToFileURL(join(deck, 'slides-export.html')).href)

          // (a) The slide fits the viewport and touches two opposite edges
          const rect = await page.evaluate(() => {
            const r = document.querySelector('.export-slide > #slide-content').getBoundingClientRect()
            return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
          })
          const box = `slide at ${JSON.stringify(rect)} in a ${vw}×${vh} viewport`
          assert.ok(rect.left >= -1 && rect.top >= -1 && rect.right <= vw + 1 && rect.bottom <= vh + 1,
            `the slide does not fit the viewport: ${box}`)
          assert.ok((near(rect.top, 0) && near(rect.bottom, vh)) || (near(rect.left, 0) && near(rect.right, vw)),
            `the slide does not fill the viewport (no two opposite edges touched): ${box}`)

          // (b) → moves one slide at a time, without clicking the page first
          for (const n of [1, 2]) {
            await page.keyboard.press('ArrowRight')
            const scrollLeft = await settledScrollLeft(page)
            assert.ok(near(scrollLeft, n * vw),
              `after ${n} × ArrowRight .export-deck.scrollLeft is ${scrollLeft}, expected ${n * vw}`)
          }
        }
        finally {
          await context.close()
        }
      })
    }
  })
}
