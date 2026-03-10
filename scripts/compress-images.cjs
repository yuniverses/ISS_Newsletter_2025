/**
 * Compress large images to WebP format.
 * - Finds all images > 500KB in public/
 * - Converts to WebP with max width 1600px, quality 80%
 * - Places .webp next to the original
 * - Updates HTML references to use .webp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const MIN_SIZE = 500 * 1024; // 500KB
const MAX_WIDTH = 1600;
const QUALITY = 80;
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

async function findLargeImages(dir) {
  const results = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          const stats = fs.statSync(fullPath);
          if (stats.size > MIN_SIZE) {
            results.push({ path: fullPath, size: stats.size });
          }
        }
      }
    }
  }

  walk(dir);
  return results;
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function compressImage(imagePath) {
  const ext = path.extname(imagePath);
  const webpPath = imagePath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');

  // Skip if webp already exists and is newer than source
  if (fs.existsSync(webpPath)) {
    const srcStat = fs.statSync(imagePath);
    const webpStat = fs.statSync(webpPath);
    if (webpStat.mtimeMs > srcStat.mtimeMs) {
      console.log(`  SKIP (webp exists): ${path.relative(PUBLIC_DIR, webpPath)}`);
      return { skipped: true };
    }
  }

  const originalSize = fs.statSync(imagePath).size;

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  let pipeline = image;
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  await pipeline.webp({ quality: QUALITY }).toFile(webpPath);

  const newSize = fs.statSync(webpPath).size;
  const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

  console.log(
    `  OK: ${path.relative(PUBLIC_DIR, imagePath)} ` +
    `${formatSize(originalSize)} -> ${formatSize(newSize)} (-${savings}%)`
  );

  return { originalSize, newSize, webpPath, skipped: false };
}

function updateHtmlReferences(dir) {
  const htmlFiles = [];

  function walkHtml(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walkHtml(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }

  walkHtml(dir);

  let totalReplacements = 0;

  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf-8');
    let modified = false;

    // Replace .jpg/.jpeg/.png references with .webp where webp exists
    const imgPattern = /(["'(])([^"'()]*?)\.(jpg|jpeg|png)(["')])/gi;
    content = content.replace(imgPattern, (match, prefix, name, ext, suffix) => {
      // Build the potential webp path relative to public
      const relativePath = `${name}.webp`;

      // Check if the referenced image has a webp version
      // Handle both absolute paths (starting with /) and relative paths
      let checkPath;
      if (name.startsWith('/')) {
        checkPath = path.join(PUBLIC_DIR, `${name}.webp`);
      } else {
        // For relative paths in HTML files, resolve from the HTML file's directory
        const htmlDir = path.dirname(htmlFile);
        checkPath = path.join(htmlDir, `${name}.webp`);
      }

      if (fs.existsSync(checkPath)) {
        modified = true;
        totalReplacements++;
        return `${prefix}${name}.webp${suffix}`;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(htmlFile, content);
      console.log(`  Updated: ${path.relative(PUBLIC_DIR, htmlFile)}`);
    }
  }

  return totalReplacements;
}

// Also update references in src/ files (TSX, JSON configs)
function updateSrcReferences(srcDir) {
  const srcFiles = [];

  function walkSrc(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walkSrc(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.tsx', '.ts', '.jsx', '.js', '.json', '.css'].includes(ext)) {
          srcFiles.push(fullPath);
        }
      }
    }
  }

  walkSrc(srcDir);

  let totalReplacements = 0;

  for (const srcFile of srcFiles) {
    let content = fs.readFileSync(srcFile, 'utf-8');
    let modified = false;

    const imgPattern = /(["'`])([^"'`]*?)\.(jpg|jpeg|png)(["'`])/gi;
    content = content.replace(imgPattern, (match, prefix, name, ext, suffix) => {
      // Only replace if the webp version exists in public/
      let checkPath;
      if (name.startsWith('/assets/') || name.startsWith('assets/')) {
        const cleanName = name.startsWith('/') ? name.slice(1) : name;
        checkPath = path.join(PUBLIC_DIR, `${cleanName}.webp`);
      } else {
        return match; // Skip non-asset references
      }

      if (fs.existsSync(checkPath)) {
        modified = true;
        totalReplacements++;
        return `${prefix}${name}.webp${suffix}`;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(srcFile, content);
      console.log(`  Updated: ${path.relative(path.resolve(__dirname, '..'), srcFile)}`);
    }
  }

  return totalReplacements;
}

async function main() {
  console.log('Finding large images (>500KB) in public/...\n');

  const images = await findLargeImages(PUBLIC_DIR);
  console.log(`Found ${images.length} images to compress.\n`);

  if (images.length === 0) {
    console.log('No images to compress.');
    return;
  }

  console.log('Compressing to WebP (max 1600px, quality 80%)...\n');

  let totalOriginal = 0;
  let totalNew = 0;
  let converted = 0;

  for (const img of images) {
    try {
      const result = await compressImage(img.path);
      if (!result.skipped) {
        totalOriginal += result.originalSize;
        totalNew += result.newSize;
        converted++;
      }
    } catch (err) {
      console.error(`  ERROR: ${path.relative(PUBLIC_DIR, img.path)}: ${err.message}`);
    }
  }

  console.log(`\nCompression complete: ${converted} images converted.`);
  console.log(`Total savings: ${formatSize(totalOriginal)} -> ${formatSize(totalNew)} (-${((1 - totalNew / totalOriginal) * 100).toFixed(1)}%)`);

  console.log('\nUpdating HTML references in public/...');
  const htmlUpdates = updateHtmlReferences(PUBLIC_DIR);
  console.log(`Updated ${htmlUpdates} image references in HTML files.`);

  console.log('\nUpdating references in src/...');
  const srcDir = path.resolve(__dirname, '../src');
  const srcUpdates = updateSrcReferences(srcDir);
  console.log(`Updated ${srcUpdates} image references in source files.`);

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
