import { Hono } from 'hono'

type Bindings = {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

const MICROCMS_API_KEY = 'H5FVIb97NuVgDcqZjUam1ixou64qInmQCh7T'
const MICROCMS_ARTICLES_ENDPOINT = 'https://masusono.microcms.io/api/v1/articles'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/api/articles', async (c) => {
  const upstreamUrl = new URL(MICROCMS_ARTICLES_ENDPOINT)
  upstreamUrl.searchParams.set('limit', '100')

  const response = await fetch(upstreamUrl.toString(), {
    headers: {
      'X-API-KEY': MICROCMS_API_KEY,
      Accept: 'application/json',
    },
  })

  const json = await response.json()
  const articles = Array.isArray(json?.contents) ? json.contents : []
  const filtered = articles.map((article) => ({
    id: article.id,
    publishedAt: article.publishedAt,
    title: article.title,
    content: article.content,
    author: article.author?.name ?? null,
  }))
  return c.json(filtered)
})

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
