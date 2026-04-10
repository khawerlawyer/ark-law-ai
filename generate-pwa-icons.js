// generate-pwa-icons.js
// Run once from your project root: node generate-pwa-icons.js
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, 'public', 'ark-logo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

// Create icons directory
fs.mkdirSync(outputDir, { recursive: true });

console.log('Generating PWA icons from ark-logo.png...\n');

sizes.forEach((size) => {
  const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
  sharp(inputFile)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 27, g: 46, b: 26, alpha: 1 }, // #1B2E1A (matches app theme)
    })
    .png()
    .toFile(outputFile, (err) => {
      if (err) {
        console.error(`❌ Failed ${size}x${size}:`, err.message);
      } else {
        console.log(`✅ Generated icon-${size}x${size}.png`);
      }
    });
});
