
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../src/config/chapters.json');
const config = require(configPath);

const BASE_URL = 'https://iss-news-0f834ef85b23.herokuapp.com';
const distDir = path.resolve(__dirname, '../dist');
const lastmod = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Add Home
sitemap += `
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

// Add Chapters
config.chapters.forEach(chapter => {
  sitemap += `
  <url>
    <loc>${BASE_URL}/chapters/${chapter.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

sitemap += '\n</urlset>';

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
console.log('Sitemap generated at dist/sitemap.xml');
