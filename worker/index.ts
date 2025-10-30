interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)

    if (url.pathname === '/api') {
      return new Response('Hello', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })
    }

    const assetResponse = await env.ASSETS.fetch(request)
    if (
      assetResponse.status !== 404 ||
      (request.method !== 'GET' && request.method !== 'HEAD')
    ) {
      return assetResponse
    }

    const accept = request.headers.get('accept') ?? ''
    if (accept.includes('text/html')) {
      const indexUrl = new URL('/index.html', url.origin)
      const indexRequest = new Request(indexUrl.toString(), request)
      return env.ASSETS.fetch(indexRequest)
    }

    return assetResponse
  },
}
