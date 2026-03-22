// temporary test script — delete after use
import { createRequire } from 'module'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

// Use vite to build a tiny test
const code = readFileSync('./src/utils/calculationModule.ts', 'utf8')
  .replace(/^export \{[^}]+\}.*$/m, '')
  .replace(/^export /gm, '')

// fallback: just print what we know
console.log('Need tsx to run. Checking...')
