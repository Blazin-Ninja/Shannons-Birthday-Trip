#!/usr/bin/env node
/**
 * Resize the master app icon into web + Android mipmap assets.
 * Usage: node scripts/generate-app-icon.mjs [path-to-master.png]
 */
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const master =
  process.argv[2] ??
  join(root, 'assets', 'app-icon-master.png')

if (!existsSync(master)) {
  console.error(`Master icon not found: ${master}`)
  process.exit(1)
}

const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
}

async function writePng(buffer, outPath, size) {
  mkdirSync(dirname(outPath), { recursive: true })
  await sharp(buffer).resize(size, size, { fit: 'cover' }).png().toFile(outPath)
  console.log(`  ${outPath} (${size}px)`)
}

async function main() {
  const input = sharp(master)
  const meta = await input.metadata()
  console.log(`Source: ${master} (${meta.width}x${meta.height})`)

  const full = await input.png().toBuffer()

  const webTargets = [
    [join(root, 'public', 'icon.png'), 512],
    [join(root, 'public', 'icon-192.png'), 192],
    [join(root, 'public', 'favicon.png'), 32],
  ]

  console.log('\nWeb icons:')
  for (const [path, size] of webTargets) {
    await writePng(full, path, size)
  }

  console.log('\nAndroid mipmaps:')
  for (const [folder, size] of Object.entries(androidSizes)) {
    const base = join(root, 'android', 'app', 'src', 'main', 'res', folder)
    for (const name of [
      'ic_launcher.png',
      'ic_launcher_round.png',
      'ic_launcher_foreground.png',
    ]) {
      await writePng(full, join(base, name), size)
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
