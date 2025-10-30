import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.SITEMAP_BASE_URL ?? 'https://masusono.com';
const API_ORIGIN = process.env.SITEMAP_API_ORIGIN ?? 'https://masusono.com';

const staticPaths = [
  '/',
  '/blog',
  '/podcast',
  '/games',
  '/games/run',
  '/shops',
];

function resolveEndpoint() {
  const base = API_ORIGIN.replace(/\/$/, '');
  return `${base}/api/articles`;
}

async function fetchArticles() {
  const endpoint = resolveEndpoint();
  const res = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('API did not return an array');
  }
  return data.map((article) => ({
    id: article?.id,
    publishedAt: article?.publishedAt,
  }));
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlSet(entries) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const entry of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    if (entry.changefreq) {
      lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
    }
    if (entry.priority !== undefined) {
      lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
    }
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n');
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

async function main() {
  const entries = [];

  for (const path of staticPaths) {
    entries.push({
      loc: `${BASE_URL}${path}`,
      changefreq: 'weekly',
      priority: path === '/' ? 1.0 : 0.8,
    });
  }

  const articles = await fetchArticles();
  for (const article of articles) {
    if (!article?.id) continue;
    entries.push({
      loc: `${BASE_URL}/blog/${article.id}`,
      lastmod: normalizeDate(article.publishedAt),
      changefreq: 'monthly',
      priority: 0.6,
    });
  }

  const xml = buildUrlSet(entries);
  const outputPath = resolve(__dirname, '../public/sitemap.xml');
  await writeFile(outputPath, `${xml}\n`, 'utf8');
  console.log(`Generated sitemap with ${entries.length} entries at ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
