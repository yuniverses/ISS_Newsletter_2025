
const fs = require('fs');
const path = require('path');

// 1. Load config
const configPath = path.resolve(__dirname, '../src/config/chapters.json');
const config = require(configPath);
const chapters = config.chapters;

// 2. Load the built index.html template
const distDir = path.resolve(__dirname, '../dist');
const indexTemplatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexTemplatePath)) {
  console.error('Error: dist/index.html not found. Please run "npm run build" first.');
  process.exit(1);
}

const indexTemplate = fs.readFileSync(indexTemplatePath, 'utf-8');

// 3. Helper to inject SEO tags
function injectSEO(html, chapter, config, content) {
  let newHtml = html;

  const title = `${chapter.title} | ${config.title}`;
  const description = chapter.description || `${config.title} - ${chapter.title}`;
  const url = `https://iss-newsletter-2025.web.app/chapters/${chapter.id}`;
  const image = 'https://iss-newsletter-2025.web.app/assets/og-image.jpg';
  const authors = chapter.authors && chapter.authors.length > 0 ? chapter.authors.join(', ') : 'ISS 服務科學研究所';

  // Replace Title
  newHtml = newHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

  // Escape quotes for meta content
  const escapeQuotes = (str) => str.replace(/"/g, '&quot;');
  const safeDesc = escapeQuotes(description);
  const safeTitle = escapeQuotes(title);

  // Build all SEO meta tags
  const seoTags = `
    <!-- Primary Meta Tags -->
    <meta name="description" content="${safeDesc}">
    <meta name="author" content="${escapeQuotes(authors)}">
    <meta name="robots" content="index, follow">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="${escapeQuotes(config.title)}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${image}">

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${escapeQuotes(chapter.title)}",
      "description": "${safeDesc}",
      "url": "${url}",
      "image": "${image}",
      "datePublished": "2025-01-01",
      "author": {
        "@type": ${chapter.authors && chapter.authors.length > 0 ? '"Person"' : '"Organization"'},
        "name": "${escapeQuotes(authors)}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "${escapeQuotes(config.title)}",
        "logo": {
          "@type": "ImageObject",
          "url": "https://iss-newsletter-2025.web.app/assets/semicolon-logo.png"
        }
      }
    }
    </script>
  `;

  // Remove existing meta description if present
  newHtml = newHtml.replace(/<meta name="description" content=".*?">/g, '');

  // Inject all SEO tags before </head>
  newHtml = newHtml.replace('</head>', `${seoTags}\n  </head>`);

  // Inject Content into a hidden div or noscript for crawlers
  // This ensures the content is physically present in the file
  const seoContent = `
  <noscript>
    <div id="seo-content-static">
      <h1>${title}</h1>
      <div class="chapter-content">
        ${content}
      </div>
    </div>
  </noscript>
  `;

  // Inject before body end
  newHtml = newHtml.replace('</body>', `${seoContent}\n</body>`);

  return newHtml;
}

// 4. Generate pages
console.log('Generating static pages for SEO...');

chapters.forEach(chapter => {
  const chapterDir = path.join(distDir, 'chapters', chapter.id);
  
  // Ensure directory exists
  if (!fs.existsSync(chapterDir)) {
    fs.mkdirSync(chapterDir, { recursive: true });
  }

  // Read content file
  // Note: content files are in public/chapters/ in source, but copied to dist/chapters/ in build
  // We should read from SOURCE to be safe, or dist if Vite copied them.
  // Vite copies public/* to dist/*. So dist/chapters/chapter-01.html should exist.
  const contentFilePath = path.join(distDir, chapter.htmlFile); // e.g., dist/chapters/chapter-01.html
  
  let content = '';
  try {
      if (fs.existsSync(contentFilePath)) {
          content = fs.readFileSync(contentFilePath, 'utf-8');
      } else {
          console.warn(`Warning: Content file not found for ${chapter.id}: ${contentFilePath}`);
      }
  } catch (e) {
      console.warn(`Error reading content for ${chapter.id}:`, e);
  }

  const finalHtml = injectSEO(indexTemplate, chapter, config, content);
  
  fs.writeFileSync(path.join(chapterDir, 'index.html'), finalHtml);
  console.log(`Generated: chapters/${chapter.id}/index.html`);
});

console.log('Static generation complete.');
