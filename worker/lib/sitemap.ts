import { fetchArticles } from './articles'

type SitemapStaticEntry = {
  path: string
  changefreq: string
  priority: number
}

type SitemapEntry = {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

const staticEntries: SitemapStaticEntry[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/blog', changefreq: 'weekly', priority: 0.8 },
  { path: '/about', changefreq: 'monthly', priority: 0.7 },
  { path: '/podcast', changefreq: 'weekly', priority: 0.8 },
  { path: '/shops', changefreq: 'weekly', priority: 0.8 },
]

export async function generateSitemapXml(origin: string): Promise<string> {
  const baseUrl = origin.replace(/\/$/, '')
  const entries: SitemapEntry[] = staticEntries.map((entry) => ({
    loc: `${baseUrl}${entry.path}`,
    changefreq: entry.changefreq,
    priority: entry.priority,
  }))

  const articles = await fetchArticles()
  for (const article of articles) {
    if (!article.id) continue
    entries.push({
      loc: `${baseUrl}/blog/${article.id}`,
      lastmod: article.publishedAt ?? undefined,
      changefreq: 'monthly',
      priority: 0.6,
    })
  }

  return buildSitemapXml(entries)
}

function buildSitemapXml(entries: SitemapEntry[]) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  for (const entry of entries) {
    lines.push('  <url>')
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`)
    const lastmod = normalizeDate(entry.lastmod)
    if (lastmod) {
      lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`)
    }
    if (entry.changefreq) {
      lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`)
    }
    if (entry.priority !== undefined) {
      lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`)
    }
    lines.push('  </url>')
  }
  lines.push('</urlset>')
  return `${lines.join('\n')}\n`
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}
