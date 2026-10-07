// Configuración de Vite que Slidev carga sola. Conserva este archivo.
// - `cssMinify: false`: con Slidev 53 + Vite 8, `npm run build` falla al
//   minificar el CSS de Slidev ("lightningcss minify: Invalid token").
// - `npm run export:html` empaqueta la presentación en slides-export.html: un
//   solo archivo, con las imágenes de public/ dentro, que se abre con doble
//   clic en cualquier navegador, sin servidor.
import type { Plugin, UserConfig } from 'vite'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { copyFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

function singleFileHtml(): Plugin {
  const deckRoot = fileURLToPath(new URL('.', import.meta.url))
  const uris = new Map<string, string>() // "img/foto.png" → data URI
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let outDir = ''

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
      outDir = resolve(config.root, config.build.outDir)
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
    async closeBundle() {
      const html = join(outDir, 'index.html')
      if (existsSync(html))
        await copyFile(html, join(deckRoot, 'slides-export.html'))
    },
  }
}

// npm (y pnpm, yarn, bun) exponen el nombre del script en ejecución
const singleFile = process.env.npm_lifecycle_event === 'export:html'

const config: UserConfig = {
  build: { cssMinify: false },
  plugins: singleFile
    ? [singleFileHtml(), (await import('vite-plugin-singlefile')).viteSingleFile()]
    : [],
}

export default config
