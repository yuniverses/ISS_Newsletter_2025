
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
function injectSEO(html, title, description, content) {
  let newHtml = html;
  
  // Replace Title
  newHtml = newHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  
  // Replace or Add Description
  const descTag = `<meta name="description" content="${description}">`;
  if (newHtml.includes('<meta name="description"')) {
      newHtml = newHtml.replace(/<meta name="description" content=".*?">/, descTag);
  } else {
      newHtml = newHtml.replace('</head>', `${descTag}\n</head>`);
  }

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

  const pageTitle = `${chapter.title} | ${config.title}`;
  const pageDesc = chapter.description || `${config.title} - ${chapter.title}`;
  
  const finalHtml = injectSEO(indexTemplate, pageTitle, pageDesc, content);
  
  fs.writeFileSync(path.join(chapterDir, 'index.html'), finalHtml);
  console.log(`Generated: chapters/${chapter.id}/index.html`);
});

console.log('Static generation complete.');
