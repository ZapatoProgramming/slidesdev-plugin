// Regression test for `npm run export:html` (staticHtml() in the starter's
// vite.config.ts). Builds a minimal deck from the starter, generates
// slides-export.html and opens it with JavaScript off, in WebKit (the iPhone)
// and Chromium: each slide must fit the screen and touch two opposite edges,
// → must move one slide at a time, and SMIL must keep moving. With JavaScript
// on, its only script must toggle fullscreen on double click without moving
// the slide, and do nothing where the Fullscreen API is missing (iPhone
// Safari). It also opens Slidev's print view (what `npm run export` prints) to
// check that SMIL elements rest at their final state there.
//
// Usage: node --test tests/export-html.test.mjs
// Slow the first time: it runs `npm install` in a temporary folder and
// downloads Chromium and WebKit for Playwright. SLIDES_TEST_DECK=<folder>
// keeps the deck (and its node_modules) there to reuse between runs.

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
// last one and the scroll check could not tell. Slide 1 has SMIL written as
// slides-create asks: animations only outside print, static attributes = final
// state, and no opacity="1".
const SLIDES = `---
theme: default
title: export:html
transition: slide-left
---

# Uno

<script setup>
import { useNav } from '@slidev/client'
const { isPrintMode } = useNav()
</script>

<svg id="smil-test" viewBox="0 0 200 40" width="200" height="40">
  <circle id="smil-dot" cx="180" cy="20" r="8" fill="#14b8a6">
    <animate v-if="!isPrintMode" attributeName="cx" values="20;180" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle id="smil-fade" cx="100" cy="20" r="8" fill="#fbbf24">
    <animate v-if="!isPrintMode" attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
  </circle>
</svg>

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

// Waits until .export-deck has scrolled to `expected` (needs JavaScript on)
async function scrollsTo(page, expected) {
  await page.waitForFunction(x => Math.abs(document.querySelector('.export-deck').scrollLeft - x) <= 1, expected, { timeout: 5000 })
    .catch(() => {})
  return page.evaluate(() => document.querySelector('.export-deck').scrollLeft)
}

const fullscreen = page => page.evaluate(() => !!(document.fullscreenElement || document.webkitFullscreenElement))

test('the only script is the fullscreen one', () => {
  const html = readFileSync(join(deck, 'slides-export.html'), 'utf8')
  const scripts = html.match(/<script\b/g) ?? []
  assert.equal(scripts.length, 1, `slides-export.html has ${scripts.length} <script> tags, expected only the fullscreen one`)
  assert.match(html, /addEventListener\('dblclick'/, 'the script does not listen for double clicks')
})

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

    test('SMIL keeps moving', async () => {
      const context = await browser.newContext({ javaScriptEnabled: false })
      try {
        const page = await context.newPage()
        await page.goto(pathToFileURL(join(deck, 'slides-export.html')).href)
        const cxAt = t => page.evaluate((t) => {
          const svg = document.querySelector('#smil-test')
          svg.pauseAnimations()
          svg.setCurrentTime(t)
          return document.querySelector('#smil-dot').cx.animVal.value
        }, t)
        const early = await cxAt(0.3)
        const later = await cxAt(1.3)
        assert.ok(Math.abs(later - early) > 1,
          `the SMIL dot did not move: cx is ${early} at 0.3 s and ${later} at 1.3 s`)
      }
      finally {
        await context.close()
      }
    })
  })

  // Esc is the browser's own way out of fullscreen; headless Chromium has no
  // browser UI to handle it, so only the double click is checked here.
  describe(`slides-export.html in ${browserName}, JavaScript on`, () => {
    let browser

    before(async () => {
      browser = await playwright[browserName].launch()
    })

    after(() => browser?.close())

    test('double click toggles fullscreen and keeps the slide', async () => {
      const vw = 1440
      const context = await browser.newContext({ viewport: { width: vw, height: 900 } })
      try {
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', e => errors.push(e.message))
        await page.goto(pathToFileURL(join(deck, 'slides-export.html')).href)
        await page.keyboard.press('ArrowRight')
        assert.ok(near(await scrollsTo(page, vw), vw), 'ArrowRight did not reach slide 2')

        // On a title, where a double click would also select a word
        const title = await page.locator('.export-slide h1').nth(1).boundingBox()
        await page.mouse.dblclick(title.x + 10, title.y + title.height / 2)
        await page.waitForFunction(() => !!(document.fullscreenElement || document.webkitFullscreenElement), null, { timeout: 5000 })
          .catch(() => {})
        assert.ok(await fullscreen(page), 'double click did not enter fullscreen')
        assert.equal(await page.evaluate(() => String(getSelection())), '', 'double click left text selected')
        assert.ok(near(await page.evaluate(() => document.querySelector('.export-deck').scrollLeft), vw),
          'entering fullscreen moved away from slide 2')

        // ← → still work in fullscreen
        await page.keyboard.press('ArrowRight')
        assert.ok(near(await scrollsTo(page, 2 * vw), 2 * vw), 'ArrowRight did not move one slide in fullscreen')

        await page.mouse.dblclick(vw / 2, 450)
        await page.waitForFunction(() => !(document.fullscreenElement || document.webkitFullscreenElement), null, { timeout: 5000 })
          .catch(() => {})
        assert.ok(!await fullscreen(page), 'a second double click did not leave fullscreen')
        assert.deepEqual(errors, [], 'the page threw errors')
      }
      finally {
        await context.close()
      }
    })

    test('without the Fullscreen API (iPhone Safari) double click changes nothing', async () => {
      const vw = 844
      const context = await browser.newContext({ viewport: { width: vw, height: 390 }, isMobile: true, hasTouch: true })
      try {
        await context.addInitScript(() => {
          for (const k of ['requestFullscreen', 'webkitRequestFullscreen'])
            delete Element.prototype[k]
          for (const k of ['exitFullscreen', 'webkitExitFullscreen'])
            delete Document.prototype[k]
        })
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', e => errors.push(e.message))
        await page.goto(pathToFileURL(join(deck, 'slides-export.html')).href)
        await page.mouse.dblclick(vw / 2, 195)
        await page.keyboard.press('ArrowRight')
        assert.ok(near(await scrollsTo(page, vw), vw), 'ArrowRight did not move one slide after a double click')
        assert.ok(!await fullscreen(page), 'entered fullscreen without the Fullscreen API')
        assert.deepEqual(errors, [], 'the page threw errors')
      }
      finally {
        await context.close()
      }
    })
  })
}

// Slidev's print view, the one `npm run export` turns into the PDF. It needs
// JavaScript and prints with Chromium.
describe('print view in chromium', () => {
  test('SMIL rests at its final state', async () => {
    const browser = await playwright.chromium.launch()
    try {
      const page = await browser.newPage()
      await page.emulateMedia({ media: 'print' })
      await page.goto(`${pathToFileURL(join(deck, '.slidev', 'html', 'index.html')).href}?print=true#/print`)
      await page.waitForSelector('#smil-fade', { state: 'attached' })
      const fade = await page.evaluate(() => {
        const el = document.querySelector('#smil-fade')
        return { animations: el.querySelectorAll('animate').length, opacity: getComputedStyle(el).opacity }
      })
      assert.equal(fade.animations, 0, 'the <animate> is still there in print mode (missing v-if="!isPrintMode")')
      assert.equal(fade.opacity, '1', `the animated element prints at opacity ${fade.opacity}, expected 1`)
    }
    finally {
      await browser.close()
    }
  })
})
