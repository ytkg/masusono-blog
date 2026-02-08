import { Hono } from "hono"
import type { Context } from "hono"
import { cache } from "hono/cache"

type Bindings = {
  ORIGIN_API_BASE: string
}

const app = new Hono<{ Bindings: Bindings }>()
const JSON_PATH = "/:path{.+\\.json}"
const CACHE_NAME = "masusono-api-cache-v3"
const EDGE_TTL_SECONDS = 43200

app.get(
  JSON_PATH,
  (c, next) =>
    cache({
      cacheName: CACHE_NAME,
      cacheControl: buildCacheControl(),
      vary: ["origin"],
      keyGenerator: (ctx) => {
        const keyUrl = new URL(ctx.req.url)
        const origin = ctx.req.header("origin") ?? ""
        keyUrl.searchParams.set("__cache_method", ctx.req.method)
        keyUrl.searchParams.set("__cache_origin", origin)
        return keyUrl.toString()
      },
    })(c, next),
  proxyToOriginForCache,
)

app.all("*", proxyToOriginPassthrough)

async function proxyToOriginForCache(c: Context<{ Bindings: Bindings }>): Promise<Response> {
  const upstream = await proxyRequest(c.req.raw, c.env.ORIGIN_API_BASE)
  const response = new Response(upstream.body, upstream)
  response.headers.delete("cache-control")
  return response
}

async function proxyToOriginPassthrough(c: Context<{ Bindings: Bindings }>): Promise<Response> {
  return proxyRequest(c.req.raw, c.env.ORIGIN_API_BASE)
}

function proxyRequest(request: Request, originBase: string): Promise<Response> {
  const incomingUrl = new URL(request.url)
  const upstreamUrl = new URL(originBase)
  upstreamUrl.pathname = incomingUrl.pathname
  upstreamUrl.search = incomingUrl.search
  return fetch(new Request(upstreamUrl.toString(), request))
}

function buildCacheControl(): string {
  const browserTtl = EDGE_TTL_SECONDS
  const staleSeconds = 300
  return `public, max-age=${browserTtl}, s-maxage=${EDGE_TTL_SECONDS}, stale-while-revalidate=${staleSeconds}, must-revalidate`
}

export default app
