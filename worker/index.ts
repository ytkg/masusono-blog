import { Hono } from 'hono'
import { fetchArticles } from './lib/articles'

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

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
