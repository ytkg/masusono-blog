const CACHE_PREFIX = "masusono-cache-"
const CACHE_NAME = `${CACHE_PREFIX}v9`
const OFFLINE_URL = "/offline.html"
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon-16.png",
  "/favicon-32.png",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

function isSuccessfulBasicResponse(response) {
  return response && response.status === 200 && response.type === "basic"
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

async function handleNavigationRequest(request) {
  try {
    return await fetch(request)
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
    event.respondWith(handleNavigationRequest(request))
    return
  }

  if (!isSameOrigin) return

  if (isPwaAssetPath(requestUrl.pathname)) {
    event.respondWith(handlePwaAssetRequest(request))
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
