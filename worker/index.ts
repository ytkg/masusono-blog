import { Hono } from 'hono'

type Bindings = {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/api', (c) => c.text('Hello'))

app.all('*', async (c) => {
  const assetResponse = await c.env.ASSETS.fetch(c.req.raw)
  if (
    assetResponse.status !== 404 ||
    (c.req.method !== 'GET' && c.req.method !== 'HEAD')
  ) {
    return assetResponse
  }

  const accept = c.req.header('accept') ?? ''
  if (accept.includes('text/html')) {
    const indexUrl = new URL('/index.html', c.req.url)
    const indexRequest = new Request(indexUrl.toString(), c.req.raw)
    return c.env.ASSETS.fetch(indexRequest)
  }

  return assetResponse
})

export default app
