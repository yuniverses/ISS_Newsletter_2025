
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../src/config/chapters.json');
const config = require(configPath);

const BASE_URL = 'https://iss-newsletter-2025.web.app'; // Update this to your actual domain
const distDir = path.resolve(__dirname, '../dist');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Add Home
sitemap += `
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

// Add Chapters
config.chapters.forEach(chapter => {
  sitemap += `
  <url>
    <loc>${BASE_URL}/chapters/${chapter.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

sitemap += '\n</urlset>';

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
console.log('Sitemap generated at dist/sitemap.xml');
