import { Hono } from "hono"
import type { Context } from "hono"

type Bindings = {
  ORIGIN_API_BASE: string
}

const MAX_STALE_SECONDS = 24 * 60 * 60
const REVALIDATE_INTERVAL_SECONDS = 60
const ORIGIN_TIMEOUT_MS = 10_000
const MAX_CACHEABLE_BYTES = 1_000_000

const META_FETCHED_AT = "x-edge-cache-fetched-at"
const META_REVALIDATED_AT = "x-edge-cache-revalidated-at"
const META_ORIGINAL_CACHE_CONTROL = "x-edge-original-cache-control"

const USER_CONTEXT_HEADERS = ["x-user-id", "x-session-id", "x-auth-user-id"]

type AppContext = Context<{ Bindings: Bindings }>
type RevalidateResult = "success" | "failed" | "skipped"

const app = new Hono<{ Bindings: Bindings }>()

app.get("/api/:path{.+\\.json}", async (c) => {
  const request = c.req.raw
  const bypassReason = getBypassReasonFromRequest(request)

  if (bypassReason) {
    const response = await proxyRequest(request, c.env.ORIGIN_API_BASE, ORIGIN_TIMEOUT_MS)
    c.executionCtx.waitUntil(
      logEvent({
        request,
        cacheStatus: "bypass",
        reason: bypassReason,
        originStatus: response.status,
        originMs: null,
        revalidateResult: "skipped",
      }),
    )
    return response
  }

  const cache = caches.default
  const cacheKey = buildCacheKey(request)
  const keyHash = await hashText(cacheKey.url)
  const cached = await cache.match(cacheKey)

  if (!cached) {
    const miss = await fetchAndMaybeStore({
      request,
      env: c.env,
      cache,
      cacheKey,
      cached: null,
      timeoutMs: ORIGIN_TIMEOUT_MS,
      fallbackToCachedOnFailure: false,
    })
    c.executionCtx.waitUntil(
      logEvent({
        request,
        cacheStatus: "miss",
        reason: "cache_not_found",
        originStatus: miss.response.status,
        originMs: miss.originMs,
        revalidateResult: miss.revalidateResult,
        cacheKeyHash: keyHash,
      }),
    )
    return miss.response
  }

  const now = Date.now()
  const fetchedAt = parseEpochSeconds(cached.headers.get(META_FETCHED_AT))
  const revalidatedAt = parseEpochSeconds(cached.headers.get(META_REVALIDATED_AT))
  const ageSeconds = fetchedAt ? now / 1000 - fetchedAt : Number.POSITIVE_INFINITY

  if (ageSeconds > MAX_STALE_SECONDS) {
    const stale = await fetchAndMaybeStore({
      request,
      env: c.env,
      cache,
      cacheKey,
      cached,
      timeoutMs: ORIGIN_TIMEOUT_MS,
      fallbackToCachedOnFailure: false,
    })
    c.executionCtx.waitUntil(
      logEvent({
        request,
        cacheStatus: "stale",
        reason: "max_stale_exceeded",
        originStatus: stale.response.status,
        originMs: stale.originMs,
        revalidateResult: stale.revalidateResult,
        cacheKeyHash: keyHash,
      }),
    )
    return stale.response
  }

  const hitResponse = stripInternalHeaders(cached.clone())
  const shouldRevalidate = !revalidatedAt || now / 1000 - revalidatedAt >= REVALIDATE_INTERVAL_SECONDS

  if (shouldRevalidate) {
    c.executionCtx.waitUntil(
      fetchAndMaybeStore({
        request,
        env: c.env,
        cache,
        cacheKey,
        cached: cached.clone(),
        timeoutMs: ORIGIN_TIMEOUT_MS,
        fallbackToCachedOnFailure: true,
      }).then((result) =>
        logEvent({
          request,
          cacheStatus: "hit",
          reason: "revalidate_attempted",
          originStatus: result.response.status,
          originMs: result.originMs,
          revalidateResult: result.revalidateResult,
          cacheKeyHash: keyHash,
        }),
      ),
    )
  } else {
    c.executionCtx.waitUntil(
      logEvent({
        request,
        cacheStatus: "hit",
        reason: "revalidate_skipped_interval",
        originStatus: null,
        originMs: null,
        revalidateResult: "skipped",
        cacheKeyHash: keyHash,
      }),
    )
  }

  return hitResponse
})

app.all("*", async (c: AppContext) => {
  return proxyRequest(c.req.raw, c.env.ORIGIN_API_BASE, ORIGIN_TIMEOUT_MS)
})

export default app

function getBypassReasonFromRequest(request: Request): string | null {
  if (request.headers.has("authorization")) return "authorization_header"

  for (const header of USER_CONTEXT_HEADERS) {
    if (request.headers.has(header)) return `user_context_header:${header}`
  }

  for (const [header] of request.headers.entries()) {
    if (header.startsWith("x-user-")) return `user_context_header:${header}`
  }

  return null
}

function buildCacheKey(request: Request): Request {
  const url = new URL(request.url)
  return new Request(url.toString(), { method: "GET" })
}

async function fetchAndMaybeStore(params: {
  request: Request
  env: Bindings
  cache: Cache
  cacheKey: Request
  cached: Response | null
  timeoutMs: number
  fallbackToCachedOnFailure: boolean
}): Promise<{ response: Response; originMs: number | null; revalidateResult: RevalidateResult }> {
  const { request, env, cache, cacheKey, cached, timeoutMs, fallbackToCachedOnFailure } = params
  const revalidateHeaders = new Headers(request.headers)

  if (cached) {
    const etag = cached.headers.get("etag")
    if (etag) revalidateHeaders.set("if-none-match", etag)
  }

  const started = Date.now()
  let upstream: Response

  try {
    upstream = await proxyRequest(request, env.ORIGIN_API_BASE, timeoutMs, revalidateHeaders)
  } catch {
    if (cached && fallbackToCachedOnFailure) {
      return { response: stripInternalHeaders(cached.clone()), originMs: Date.now() - started, revalidateResult: "failed" }
    }

    return {
      response: new Response(JSON.stringify({ error: { code: "upstream_timeout", message: "Upstream request timed out." } }), {
        status: 504,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      }),
      originMs: Date.now() - started,
      revalidateResult: "failed",
    }
  }

  const originMs = Date.now() - started

  if (upstream.status === 304 && cached) {
    const refreshed = withCacheMeta(cached.clone(), Math.floor(Date.now() / 1000))
    await cache.put(cacheKey, refreshed.clone())
    return { response: stripInternalHeaders(refreshed), originMs, revalidateResult: "success" }
  }

  const isCacheable = await isResponseCacheable(upstream)
  if (isCacheable) {
    const enriched = withCacheMeta(upstream, Math.floor(Date.now() / 1000))
    await cache.put(cacheKey, enriched.clone())
    return { response: stripInternalHeaders(enriched), originMs, revalidateResult: "success" }
  }

  const isPrivateResponse = (upstream.headers.get("cache-control")?.toLowerCase() ?? "").includes("private")
  if (isPrivateResponse) {
    await cache.delete(cacheKey)
  }

  if (cached && fallbackToCachedOnFailure) {
    return { response: stripInternalHeaders(cached.clone()), originMs, revalidateResult: "failed" }
  }

  return { response: upstream, originMs, revalidateResult: "failed" }
}

async function isResponseCacheable(response: Response): Promise<boolean> {
  if (response.status !== 200) return false

  const cacheControl = response.headers.get("cache-control")?.toLowerCase() ?? ""
  if (cacheControl.includes("private")) return false

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""
  if (!contentType.includes("application/json")) return false

  const contentLengthHeader = response.headers.get("content-length")
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10)
    if (Number.isFinite(contentLength) && contentLength > MAX_CACHEABLE_BYTES) return false
    if (Number.isFinite(contentLength)) return true
  }

  const size = (await response.clone().arrayBuffer()).byteLength
  return size <= MAX_CACHEABLE_BYTES
}

function withCacheMeta(response: Response, epochSeconds: number): Response {
  const headers = new Headers(response.headers)
  const originalCacheControl = headers.get("cache-control")

  if (originalCacheControl) {
    headers.set(META_ORIGINAL_CACHE_CONTROL, originalCacheControl)
  }

  // Cache API はレスポンスヘッダの max-age を見て freshness 判定するため、
  // オリジンの max-age=0 をそのまま保存すると毎回即失効する。
  headers.set("cache-control", `public, max-age=${MAX_STALE_SECONDS}`)
  headers.set(META_FETCHED_AT, String(epochSeconds))
  headers.set(META_REVALIDATED_AT, String(epochSeconds))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function stripInternalHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  const originalCacheControl = headers.get(META_ORIGINAL_CACHE_CONTROL)

  if (originalCacheControl) {
    headers.set("cache-control", originalCacheControl)
  }

  headers.delete(META_FETCHED_AT)
  headers.delete(META_REVALIDATED_AT)
  headers.delete(META_ORIGINAL_CACHE_CONTROL)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function parseEpochSeconds(value: string | null): number | null {
  if (!value) return null

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

async function proxyRequest(
  request: Request,
  originBase: string,
  timeoutMs: number,
  requestHeaders?: Headers,
): Promise<Response> {
  const incomingUrl = new URL(request.url)
  const upstreamUrl = new URL(originBase)
  upstreamUrl.pathname = incomingUrl.pathname
  upstreamUrl.search = incomingUrl.search

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: requestHeaders ?? request.headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
      signal: controller.signal,
    })

    return rewriteRedirectLocation(upstreamResponse, incomingUrl, upstreamUrl)
  } finally {
    clearTimeout(timeout)
  }
}

function rewriteRedirectLocation(response: Response, incomingUrl: URL, upstreamUrl: URL): Response {
  const location = response.headers.get("location")
  if (!location) return response

  let parsedLocation: URL
  try {
    parsedLocation = new URL(location, upstreamUrl.toString())
  } catch {
    return response
  }

  if (parsedLocation.host !== upstreamUrl.host) {
    return response
  }

  parsedLocation.protocol = incomingUrl.protocol
  parsedLocation.host = incomingUrl.host

  const headers = new Headers(response.headers)
  headers.set("location", parsedLocation.toString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

async function logEvent(params: {
  request: Request
  cacheStatus: "hit" | "miss" | "bypass" | "stale"
  reason: string
  originStatus: number | null
  originMs: number | null
  revalidateResult: RevalidateResult
  cacheKeyHash?: string
}): Promise<void> {
  const { request, cacheStatus, reason, originStatus, originMs, revalidateResult, cacheKeyHash } = params
  const payload = {
    path: new URL(request.url).pathname,
    method: request.method,
    cache_status: cacheStatus,
    cache_key_hash: cacheKeyHash ?? null,
    origin_status: originStatus,
    origin_ms: originMs,
    revalidate_result: revalidateResult,
    reason,
  }

  console.log(JSON.stringify(payload))
}

async function hashText(text: string): Promise<string> {
  const input = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest("SHA-256", input)
  const bytes = new Uint8Array(digest)

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
