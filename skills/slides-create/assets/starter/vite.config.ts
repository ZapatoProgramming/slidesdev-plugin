// Configuración de Vite que Slidev carga sola. Conserva este archivo.
// - `cssMinify: false`: con Slidev 53 + Vite 8, `npm run build` falla al
//   minificar el CSS de Slidev ("lightningcss minify: Invalid token").
// - `npm run export:html` genera slides-export.html: la presentación como
//   HTML + CSS en un solo archivo con las imágenes de public/ dentro. Se abre
//   con doble clic en cualquier navegador, sin servidor, y en la vista previa
//   de archivos del iPhone/iPad (app Archivos, AirDrop), que no ejecuta
//   JavaScript. Cada slide llena la pantalla y se pasa con swipe lateral
//   (← → en la compu). Los clicks salen revelados, los loops de CSS siguen
//   moviéndose y lo que dependa de JavaScript queda quieto. Su único script
//   pone la pantalla completa con doble clic (Esc para salir); sin él la
//   presentación funciona igual.
import type { Plugin, UserConfig } from 'vite'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
}

const deckRoot = fileURLToPath(new URL('.', import.meta.url))

// Build de un solo archivo, con las imágenes de public/ dentro, para que
// staticHtml() lo abra desde el disco
function singleFileHtml(): Plugin {
  const uris = new Map<string, string>() // "img/foto.png" → data URI
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return {
    name: 'slides:single-file-html',
    enforce: 'post',
    config(config) {
      // Slidev parte el bundle en chunks; un solo HTML necesita uno único
      const out = config.build?.rollupOptions?.output
      if (out && !Array.isArray(out)) {
        delete out.manualChunks
        delete out.chunkFileNames
      }
      // `<img src="/foto.png">` y `url(/foto.png)` → data URI
      return {
        experimental: {
          renderBuiltUrl: (file, { type }) => (type === 'public' ? uris.get(file.replace(/^\//, '')) : undefined),
        },
      }
    },
    configResolved(config) {
      if (!config.publicDir || !existsSync(config.publicDir))
        return
      for (const file of readdirSync(config.publicDir, { recursive: true, encoding: 'utf8' })) {
        const mime = MIME[extname(file).toLowerCase()]
        if (mime) {
          const data = readFileSync(join(config.publicDir, file)).toString('base64')
          uris.set(file.replaceAll('\\', '/'), `data:${mime};base64,${data}`)
        }
      }
    },
    generateBundle(_, bundle) {
      for (const item of Object.values(bundle)) {
        let code = item.type === 'chunk' ? item.code : typeof item.source === 'string' ? item.source : null
        if (code === null)
          continue
        // Sin precarga de imágenes: ya van dentro del archivo, y el precargador
        // de Slidev no entiende data URIs
        code = code
          .replace(/<link rel="preload" as="image"[^>]*>/g, '')
          .replace(/\bimages:\[[^\]]*\]/g, 'images:[]')
        // Rutas que quedan como texto, p. ej. `image: /foto.png` en el frontmatter
        for (const [file, uri] of uris)
          code = code.replace(new RegExp(`(["'\`])/${escape(file)}\\1`, 'g'), `$1${uri}$1`)
        if (item.type === 'chunk')
          item.code = code
        else
          item.source = code
      }
    },
  }
}

// Código que corre dentro de la página. Va como texto porque el bundler de esta
// configuración puede añadir a las funciones helpers que el navegador no tiene.
const DECK_INFO = `(() => {
  const slide = document.querySelector('.slidev-slide-content')
  return {
    slides: [...document.querySelectorAll('[data-slidev-no]')].map(el => +el.dataset.slidevNo),
    width: Math.round(parseFloat(slide?.style.width) || 980),
    height: Math.round(parseFloat(slide?.style.height) || 552),
  }
})()`

const SLIDE_READY = `(() => {
  const page = document.querySelector('#slideshow > .slidev-page:not([style*="display: none"])')
  return !!page && !document.querySelector('.slidev-slide-loading')
    && [...page.querySelectorAll('.mermaid')].every(m => m.shadowRoot?.querySelector('svg'))
})()`

const SLIDE_HTML = `(() => {
  const content = document.querySelector('#slide-content')
  for (const page of content.querySelectorAll('#slideshow > .slidev-page'))
    if (page.style.display === 'none') page.remove()
  // outerHTML no incluye los shadow roots, y Mermaid dibuja dentro de uno
  const flatten = root => root.querySelectorAll('*').forEach((el) => {
    if (el.shadowRoot) {
      flatten(el.shadowRoot)
      el.innerHTML = el.shadowRoot.innerHTML
    }
  })
  flatten(content)
  content.querySelectorAll('script').forEach(s => s.remove())
  return content.outerHTML
})()`

const PAGE_HEAD = `({
  attrs: [...document.documentElement.attributes].filter(a => a.name !== 'style').map(a => [a.name, a.value]),
  title: document.title,
  css: [...document.querySelectorAll('style')].map(s => s.textContent).join('\\n'),
  links: [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.outerHTML),
})`

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

// Abre el build de un solo archivo en Chromium, recorre las slides en su último
// click y guarda el DOM ya dibujado, sin scripts, en slides-export.html. Solo
// le suma el script de pantalla completa, que no toca el layout
function staticHtml(): Plugin {
  let outDir = ''

  return {
    name: 'slides:static-html',
    enforce: 'post',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const index = join(outDir, 'index.html')
      if (!existsSync(index))
        return
      const url = pathToFileURL(index).href
      const { chromium } = await import('playwright-chromium')
      const browser = await chromium.launch().catch((err: Error) => {
        throw new Error(`[export:html] no se pudo abrir Chromium; ejecuta una vez \`npx playwright install chromium\`.\n${err.message}`)
      })
      try {
        // La vista de impresión lista todas las slides y su tamaño
        const probe = await browser.newPage()
        await probe.goto(`${url}?print=true#/print`)
        await probe.waitForSelector('[data-slidev-no]')
        const deck = await probe.evaluate(DECK_INFO)
        await probe.goto(`${url}#/1`)
        await probe.waitForSelector('#slide-content')
        const head = await probe.evaluate(PAGE_HEAD)
        await probe.close()

        // Modo normal (no impresión), así los loops no se congelan. Un contexto
        // por pestaña: Slidev sincroniza la slide actual entre pestañas.
        const queue = [...deck.slides] as number[]
        const slides = new Map<number, string>()
        await Promise.all([1, 2, 3].map(async () => {
          const context = await browser.newContext({ viewport: { width: deck.width, height: deck.height } })
          const page = await context.newPage()
          for (let no = queue.shift(); no !== undefined; no = queue.shift()) {
            await page.goto('about:blank')
            await page.goto(`${url}#/${no}?clicks=999999`)
            await page.waitForFunction(SLIDE_READY, null, { timeout: 15_000 })
              .catch(() => console.warn(`[export:html] la slide ${no} tardó en cargar; se guarda como esté`))
            await page.evaluate('document.fonts.ready.then(() => true)')
            await page.waitForTimeout(1200) // que terminen las entradas de v-motion
            slides.set(no, await page.evaluate(SLIDE_HTML))
          }
          await context.close()
        }))

        const attrs = (head.attrs as [string, string][]).map(([k, v]) => ` ${k}="${escapeHtml(v)}"`).join('')
        const html = `<!doctype html>
<html${attrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(head.title)}</title>
${head.links.join('\n')}
<style>${head.css}</style>
<style>
html, body { height: 100% !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; background: #000 !important; -webkit-text-size-adjust: 100%; }
/* Una slide por pantalla, en fila: swipe lateral en el iPhone, ← → en la compu.
   El scroll va en .export-deck y no en la página para que iOS no achique la
   página entera al ver contenido más ancho que la pantalla. */
.export-deck { position: fixed; inset: 0; display: flex; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: none; outline: none; }
.export-deck::-webkit-scrollbar { display: none; }
.export-slide { flex: none; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; scroll-snap-align: start; scroll-snap-stop: always; container-type: size; }
/* Escala para caber entera en la pantalla, sin JavaScript: tan(atan2(a, b)) = a / b
   como número. Si el navegador no lo entiende, la slide queda a tamaño real. */
.export-slide > #slide-content { position: relative !important; left: auto !important; top: auto !important; transform: none !important; flex: none; overflow: hidden;
  scale: min(tan(atan2(100cqw, ${deck.width}px)), tan(atan2(100cqh, ${deck.height}px))); }
</style>
</head>
<body>
<main class="export-deck" tabindex="-1" autofocus>
${deck.slides.map((no: number) => `<section class="export-slide">${slides.get(no) ?? ''}</section>`).join('\n')}
</main>
<script>
/* Doble clic: pantalla completa; Esc (lo hace el navegador) o otro doble clic
   para salir. Es un extra: donde no corre JavaScript (vista previa del iPhone)
   o no hay pantalla completa (Safari del iPhone) no hace nada, y la
   presentación funciona igual. */
(() => {
  const root = document.documentElement
  const enter = root.requestFullscreen || root.webkitRequestFullscreen
  const exit = document.exitFullscreen || document.webkitExitFullscreen
  if (!enter || !exit) return
  document.addEventListener('dblclick', () => {
    getSelection()?.removeAllRanges()
    const full = document.fullscreenElement || document.webkitFullscreenElement
    Promise.resolve(full ? exit.call(document) : enter.call(root)).catch(() => {})
  })
})()
</script>
</body>
</html>
`
        await writeFile(join(deckRoot, 'slides-export.html'), html)
        console.log(`[export:html] slides-export.html: ${deck.slides.length} slides, ${(html.length / 1024 / 1024).toFixed(1)} MB`)
      }
      finally {
        await browser.close()
      }
    },
  }
}

// npm (y pnpm, yarn, bun) exponen el nombre del script en ejecución
const htmlExport = process.env.npm_lifecycle_event === 'export:html'

const config: UserConfig = {
  build: { cssMinify: false },
  plugins: htmlExport
    ? [
        singleFileHtml(),
        (await import('vite-plugin-singlefile')).viteSingleFile(),
        staticHtml(),
      ]
    : [],
}

export default config
