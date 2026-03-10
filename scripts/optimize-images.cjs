const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');
const MAX_WIDTH = 1600;
const QUALITY = 80;
const MIN_SIZE = 500 * 1024; // 500KB

async function findImages(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findImages(fullPath));
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      const stat = fs.statSync(fullPath);
      if (stat.size > MIN_SIZE) {
        results.push({ path: fullPath, size: stat.size });
      }
    }
  }
  return results;
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

async function optimizeImage(imgPath, originalSize) {
  const ext = path.extname(imgPath);
  const webpPath = imgPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  // Skip if webp already exists
  if (fs.existsSync(webpPath)) {
    console.log(`  SKIP (webp exists): ${path.relative(ASSETS_DIR, imgPath)}`);
    return { skipped: true };
  }

  const image = sharp(imgPath);
  const metadata = await image.metadata();

  let pipeline = sharp(imgPath);

  // Resize if wider than MAX_WIDTH
  if (metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  // Convert to WebP
  pipeline = pipeline.webp({ quality: QUALITY });

  await pipeline.toFile(webpPath);

  const newStat = fs.statSync(webpPath);
  const savings = ((1 - newStat.size / originalSize) * 100).toFixed(1);

  return {
    skipped: false,
    originalSize,
    newSize: newStat.size,
    savings,
    width: metadata.width,
    resized: metadata.width > MAX_WIDTH,
  };
}

async function main() {
  console.log('Scanning for images > 500KB in public/assets/...\n');

  const images = await findImages(ASSETS_DIR);
  console.log(`Found ${images.length} images to optimize.\n`);

  let totalOriginal = 0;
  let totalNew = 0;
  let processed = 0;
  let skipped = 0;

  for (const img of images) {
    const rel = path.relative(ASSETS_DIR, img.path);
    process.stdout.write(`  Processing: ${rel}...`);

    try {
      const result = await optimizeImage(img.path, img.size);
      if (result.skipped) {
        skipped++;
        continue;
      }
      processed++;
      totalOriginal += result.originalSize;
      totalNew += result.newSize;

      const resizeNote = result.resized ? ` (resized from ${result.width}px to ${MAX_WIDTH}px)` : '';
      console.log(` ${formatSize(result.originalSize)} -> ${formatSize(result.newSize)} (-${result.savings}%)${resizeNote}`);
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Processed: ${processed} files`);
  console.log(`Skipped: ${skipped} files (webp already exists)`);
  console.log(`Total original: ${formatSize(totalOriginal)}`);
  console.log(`Total WebP: ${formatSize(totalNew)}`);
  console.log(`Total saved: ${formatSize(totalOriginal - totalNew)} (-${((1 - totalNew / totalOriginal) * 100).toFixed(1)}%)`);
}

main().catch(console.error);
