#!/usr/bin/env node

/**
 * Icon generation script
 * Converts SVG icons to PNG format for Chrome Extension
 *
 * Usage: npm install sharp && node scripts/generate-icons.js
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to use sharp for conversion (most reliable)
let sharp
try {
  const sharpModule = await import('sharp')
  sharp = sharpModule.default
} catch (error) {
  console.warn('Sharp not available. Install with: npm install sharp')
}

const ICONS_DIR = path.join(__dirname, '../public/icons')
const SIZES = [16, 32, 48, 128]

async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    if (sharp) {
      // Using Sharp (recommended)
      await sharp(svgPath).resize(size, size).png().toFile(pngPath)
      console.log(`✅ Generated ${path.basename(pngPath)} (${size}x${size}) using Sharp`)
    } else {
      // Fallback: Create a simple colored PNG using Canvas API simulation
      console.log(`⚠️  Cannot convert ${svgPath} - Sharp not available`)
      console.log('   Install Sharp with: npm install sharp')
      console.log('   Or use online converter: https://cloudconvert.com/svg-to-png')
    }
  } catch (error) {
    console.error(`❌ Error converting ${svgPath}:`, error.message)
  }
}

async function generateIcons() {
  console.log('🎨 Generating Chrome Extension icons...\n')

  const svgPath = path.join(ICONS_DIR, 'icon.svg')

  try {
    // Check if main SVG file exists
    await fs.access(svgPath)
    
    // Generate all sizes from the main SVG
    for (const size of SIZES) {
      const pngPath = path.join(ICONS_DIR, `icon${size}.png`)
      await convertSvgToPng(svgPath, pngPath, size)
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`❌ Main SVG file not found: ${svgPath}`)
    } else {
      console.error(`❌ Error processing SVG:`, error.message)
    }
  }

  console.log('\n🎉 Icon generation complete!')
  console.log("\nIf you don't have Sharp installed, you can:")
  console.log('1. Install Sharp: npm install sharp')
  console.log('2. Use online converter: https://cloudconvert.com/svg-to-png')
  console.log('3. Use any SVG to PNG converter tool')
}

// Run the script
generateIcons().catch(console.error)
