import { Hono } from 'hono'
import { fetchArticles } from './lib/articles'
import { generateSitemapXml } from './lib/sitemap'

type Bindings = {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/api/articles', async (c) => {
  const articles = await fetchArticles()
  return c.json(articles)
})

app.get('/sitemap.xml', async (c) => {
  const xml = await generateSitemapXml(new URL(c.req.url).origin)
  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8' })
})

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
