const CACHE_PREFIX = "masusono-cache-"
const CACHE_NAME = `${CACHE_PREFIX}v6`
const OFFLINE_URL = "/offline.html"
const ROOT_PATH = "/"
const NAVIGATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const SW_CACHED_AT_HEADER = "x-sw-cached-at"
const ORIGIN_WARMUP_PATH = "/up"
const ORIGIN_WARMUP_PARAM_KEY = "sw_warm"
const ORIGIN_WARMUP_PARAM_VALUE = "1"
const ORIGIN_WARMUP_QUERY = `${ORIGIN_WARMUP_PARAM_KEY}=${ORIGIN_WARMUP_PARAM_VALUE}`
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

function normalizePathname(pathname) {
  if (pathname === "/") return pathname
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
}

function isTargetPagePath(pathname) {
  const normalizedPath = normalizePathname(pathname)
  return (
    normalizedPath === "/" ||
    normalizedPath === "/blog" ||
    normalizedPath.startsWith("/blog/") ||
    normalizedPath === "/podcast" ||
    normalizedPath.startsWith("/podcast/") ||
    normalizedPath === "/shop"
  )
}

function isInertiaRequest(request) {
  return request.headers.get("X-Inertia") === "true"
}

function isSuccessfulBasicResponse(response) {
  return response && response.status === 200 && response.type === "basic"
}

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

async function handleCachedNavigation(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  if (isFreshCachedResponse(cached, NAVIGATION_CACHE_TTL_MS)) {
    return cached
  }

  try {
    const networkResponse = await fetch(request)
    if (isSuccessfulBasicResponse(networkResponse)) {
      await cacheResponseWithTimestamp(cache, request, networkResponse)
    }
    return networkResponse
  } catch (_error) {
    if (cached) return cached

    const offline = await cache.match(OFFLINE_URL)
    return offline || Response.error()
  }
}

async function fetchAndCacheIfSuccessful(request) {
  const networkResponse = await fetch(request)
  if (isSuccessfulBasicResponse(networkResponse)) {
    const cache = await caches.open(CACHE_NAME)
    await cacheResponseWithTimestamp(cache, request, networkResponse)
  }
  return networkResponse
}

async function handleCachedInertiaRequest(event) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(event.request)
  if (cached) {
    if (!isFreshCachedResponse(cached, NAVIGATION_CACHE_TTL_MS)) {
      event.waitUntil(
        fetchAndCacheIfSuccessful(event.request).catch(() => {
          // no-op: background refresh failure should not block response
        }),
      )
    }
    return cached
  }

  try {
    return await fetchAndCacheIfSuccessful(event.request)
  } catch (_error) {
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

async function getOfflineFallbackResponse() {
  const cache = await caches.open(CACHE_NAME)
  const response = await cache.match(OFFLINE_URL)
  return response || Response.error()
}

function isPwaAssetPath(pathname) {
  return (
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/favicon")
  )
}

function isOriginWarmupRequest(requestUrl) {
  return (
    requestUrl.pathname === ORIGIN_WARMUP_PATH &&
    requestUrl.searchParams.get(ORIGIN_WARMUP_PARAM_KEY) === ORIGIN_WARMUP_PARAM_VALUE
  )
}

function isApiJsonPath(pathname) {
  return pathname.startsWith("/api/") && pathname.endsWith(".json")
}

async function handleNavigationRequest(event, isSameOrigin, requestUrl) {
  if (isSameOrigin && isApiJsonPath(requestUrl.pathname)) {
    return fetch(event.request, { cache: "no-store" })
  }

  if (isSameOrigin) {
    if (requestUrl.pathname === ROOT_PATH) {
      event.waitUntil(warmOriginInBackground())
    }
    return handleCachedNavigation(event.request)
  }

  try {
    return await fetch(event.request)
  } catch (_error) {
    return getOfflineFallbackResponse()
  }
}

async function handlePwaAssetRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (isSuccessfulBasicResponse(networkResponse)) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (_error) {
    const cached = await caches.match(request)
    return cached || Response.error()
  }
}

async function onInstall() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(PRECACHE_URLS)
  await self.skipWaiting()
}

async function onActivate() {
  const keys = await caches.keys()
  const staleKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
  await Promise.all(staleKeys.map((key) => caches.delete(key)))
  await self.clients.claim()
}

function onFetch(event) {
  if (event.request.method !== "GET") return

  const request = event.request
  const requestUrl = new URL(request.url)
  const isSameOrigin = requestUrl.origin === self.location.origin

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(event, isSameOrigin, requestUrl))
    return
  }

  if (!isSameOrigin) return

  if (isOriginWarmupRequest(requestUrl)) {
    event.respondWith(fetch(request, { cache: "no-store" }))
    return
  }

  if (isPwaAssetPath(requestUrl.pathname)) {
    event.respondWith(handlePwaAssetRequest(request))
    return
  }

  if (isInertiaRequest(request) && isTargetPagePath(requestUrl.pathname)) {
    event.respondWith(handleCachedInertiaRequest(event))
    return
  }

  if (isApiJsonPath(requestUrl.pathname)) {
    event.respondWith(fetch(request, { cache: "no-store" }))
    return
  }

  event.respondWith(fetch(request))
}

self.addEventListener("install", (event) => {
  event.waitUntil(onInstall())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(onActivate())
})

self.addEventListener("fetch", onFetch)
