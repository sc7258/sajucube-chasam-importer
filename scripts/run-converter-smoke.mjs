import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const outfile = resolve(root, 'tmp', 'converter-smoke.bundle.mjs')

mkdirSync(dirname(outfile), { recursive: true })

await build({
  entryPoints: [resolve(root, 'scripts', 'converter-smoke.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  tsconfig: resolve(root, 'tsconfig.json'),
})

await import(pathToFileURL(outfile).href)
