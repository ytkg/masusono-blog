const CACHE_PREFIX = "masusono-cache-"
const CACHE_NAME = `${CACHE_PREFIX}v5`
const OFFLINE_URL = "/offline.html"
const ROOT_PATH = "/"
const ROOT_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const SW_CACHED_AT_HEADER = "x-sw-cached-at"
const ORIGIN_WARMUP_PATH = "/up"
const ORIGIN_WARMUP_QUERY = "sw_warm=1"
const ORIGIN_WARMUP_COOLDOWN_MS = 10 * 60 * 1000
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon-16.png",
  "/favicon-32.png",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]
let lastOriginWarmupAt = 0

async function cacheResponseWithTimestamp(cache, request, response) {
  const headers = new Headers(response.headers)
  headers.set(SW_CACHED_AT_HEADER, String(Date.now()))
  const body = await response.clone().blob()
  const cachedResponse = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
  await cache.put(request, cachedResponse)
}

function isFreshCachedResponse(cachedResponse, ttlMs) {
  if (!cachedResponse) return false
  const cachedAt = Number(cachedResponse.headers.get(SW_CACHED_AT_HEADER))
  if (!Number.isFinite(cachedAt)) return false
  return Date.now() - cachedAt <= ttlMs
}

async function handleRootNavigation(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  if (isFreshCachedResponse(cached, ROOT_CACHE_TTL_MS)) {
    return cached
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
      await cacheResponseWithTimestamp(cache, request, networkResponse)
    }
    return networkResponse
  } catch (_error) {
    if (cached) return cached

    const offline = await cache.match(OFFLINE_URL)
    return offline || Response.error()
  }
}

function shouldWarmOrigin(now) {
  return now - lastOriginWarmupAt >= ORIGIN_WARMUP_COOLDOWN_MS
}

async function warmOriginInBackground() {
  const now = Date.now()
  if (!shouldWarmOrigin(now)) return
  lastOriginWarmupAt = now

  try {
    await fetch(`${ORIGIN_WARMUP_PATH}?${ORIGIN_WARMUP_QUERY}`, {
      cache: "no-store",
    })
  } catch (_error) {
    // no-op: warmup failure should not affect user requests
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  const requestUrl = new URL(event.request.url)
  const isSameOrigin = requestUrl.origin === self.location.origin

  if (event.request.mode === "navigate") {
    if (isSameOrigin && requestUrl.pathname === ROOT_PATH) {
      event.respondWith(handleRootNavigation(event.request))
      event.waitUntil(warmOriginInBackground())
      return
    }

    event.respondWith(
      fetch(event.request).catch(() =>
        caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL).then((response) => response || Response.error())),
      ),
    )
    return
  }

  if (!isSameOrigin) return

  if (requestUrl.pathname === ORIGIN_WARMUP_PATH && requestUrl.searchParams.get("sw_warm") === "1") {
    event.respondWith(fetch(event.request, { cache: "no-store" }))
    return
  }

  const isPwaAsset =
    requestUrl.pathname === "/manifest.webmanifest" ||
    requestUrl.pathname.startsWith("/icons/") ||
    requestUrl.pathname.startsWith("/favicon")

  if (isPwaAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse
          }
          const copy = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          return networkResponse
        })
        .catch(() => caches.match(event.request).then((cached) => cached || Response.error())),
    )
    return
  }

  event.respondWith(fetch(event.request))
})
