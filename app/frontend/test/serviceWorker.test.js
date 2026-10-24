// @vitest-environment node
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import { beforeEach, describe, expect, it, vi } from "vitest"

const source = readFileSync(new URL("../../../public/service-worker.js", import.meta.url), "utf8")
let listeners, cache, caches, fetch, worker

beforeEach(() => {
  listeners = new Map()
  cache = { addAll: vi.fn().mockResolvedValue(), match: vi.fn(), put: vi.fn().mockResolvedValue() }
  caches = {
    open: vi.fn().mockResolvedValue(cache),
    match: vi.fn(),
    keys: vi.fn(),
    delete: vi.fn().mockResolvedValue(true),
  }
  fetch = vi.fn()
  worker = {
    location: { origin: "https://masusono.com" },
    addEventListener: (name, listener) => listeners.set(name, listener),
    skipWaiting: vi.fn().mockResolvedValue(),
    clients: { claim: vi.fn().mockResolvedValue() },
  }
  // Execute the shipped script through its registered events without a live browser or network.
  runInNewContext(source, { self: worker, caches, fetch, URL, Response })
})

function request(path, options = {}) {
  const event = {
    request: { url: new URL(path, worker.location.origin).href, method: "GET", mode: "cors", ...options },
    respondWith: vi.fn(),
  }
  listeners.get("fetch")(event)
  return event
}

async function lifecycle(name) {
  const waitUntil = vi.fn()
  listeners.get(name)({ waitUntil })
  expect(waitUntil).toHaveBeenCalledOnce()
  await waitUntil.mock.calls[0][0]
}

function expectNoCacheAccess() {
  expect(caches.open).not.toHaveBeenCalled()
  expect(caches.match).not.toHaveBeenCalled()
}

describe("記事・APIの鮮度とオフライン境界", () => {
  it.each([200, 404, 503])("ナビゲーションのHTTP %s応答をキャッシュせずそのまま返す", async (status) => {
    const response = new Response("network article", { status })
    fetch.mockResolvedValue(response)
    const event = request("/articles/example", { mode: "navigate" })
    await expect(event.respondWith.mock.calls[0][0]).resolves.toBe(response)
    expect(fetch).toHaveBeenCalledWith(event.request)
    expectNoCacheAccess()
  })

  it("ナビゲーションの通信失敗時だけ保存済みoffline画面を返す", async () => {
    fetch.mockRejectedValue(new TypeError("offline"))
    const offline = new Response("offline page")
    cache.match.mockResolvedValue(offline)
    const event = request("/articles/example", { mode: "navigate" })
    await expect(event.respondWith.mock.calls[0][0]).resolves.toBe(offline)
    expect(cache.match).toHaveBeenCalledWith("/offline.html")
    expect(cache.put).not.toHaveBeenCalled()
  })

  it("offline画面もない場合はネットワークエラーを返す", async () => {
    fetch.mockRejectedValue(new TypeError("offline"))
    const event = request("/", { mode: "navigate" })
    const response = await event.respondWith.mock.calls[0][0]
    expect(response.type).toBe("error")
    expect(response.status).toBe(0)
  })

  it.each(["/api/app/users.json", "/api/app/articles.json", "/vite/assets/app.js"])(
    "%sはオンラインでもオフラインでもキャッシュを使用しない",
    async (path) => {
      const response = new Response("fresh response")
      Object.defineProperty(response, "type", { value: "basic" })
      const offline = new TypeError("offline")
      fetch.mockResolvedValueOnce(response).mockRejectedValueOnce(offline)
      const onlineEvent = request(path)
      await expect(onlineEvent.respondWith.mock.calls[0][0]).resolves.toBe(response)
      const offlineEvent = request(path)
      await expect(offlineEvent.respondWith.mock.calls[0][0]).rejects.toBe(offline)
      expectNoCacheAccess()
    },
  )

  it.each([
    ["/api/app/users.json", { method: "POST" }],
    ["/icons/icon-192.png", { method: "HEAD" }],
    ["https://example.com/image.png", {}],
  ])("%s %jには介入しない", (path, options) => {
    expect(request(path, options).respondWith).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expectNoCacheAccess()
  })
})

describe("PWAアセットのキャッシュ", () => {
  it.each([
    ["open", false],
    ["open", true],
    ["put", false],
    ["put", true],
  ])("%s失敗・既存キャッシュ有無=%sでも取得済みの応答を返す", async (operation, hasCachedAsset) => {
    const response = new Response("fresh asset")
    Object.defineProperty(response, "type", { value: "basic" })
    fetch.mockResolvedValue(response)
    caches.match.mockResolvedValue(hasCachedAsset ? new Response("stale asset") : undefined)
    const failure = new DOMException("Cache unavailable", "QuotaExceededError")
    if (operation === "open") caches.open.mockRejectedValue(failure)
    else cache.put.mockRejectedValue(failure)

    const event = request("/icons/icon-192.png")
    await expect(event.respondWith.mock.calls[0][0]).resolves.toBe(response)
    expect(await response.text()).toBe("fresh asset")
    expect(caches.match).not.toHaveBeenCalled()
  })

  it.each(["/manifest.webmanifest", "/icons/icon-192.png", "/favicon-32.png"])(
    "%sの成功した同一オリジン応答だけを複製して保存する",
    async (path) => {
      const response = new Response("asset")
      Object.defineProperty(response, "type", { value: "basic" })
      fetch.mockResolvedValue(response)
      const event = request(path)
      await expect(event.respondWith.mock.calls[0][0]).resolves.toBe(response)
      const [cachedRequest, cachedResponse] = cache.put.mock.calls[0]
      expect(cachedRequest).toBe(event.request)
      expect(cachedResponse).not.toBe(response)
      expect(await cachedResponse.text()).toBe("asset")
      expect(await response.text()).toBe("asset")
    },
  )

  it.each([
    [404, "basic"],
    [503, "basic"],
    [200, "opaque"],
    [200, "cors"],
  ])("HTTP %s / %s応答は保存・既存キャッシュへの差替えをしない", async (status, type) => {
    const response = { status, type }
    fetch.mockResolvedValue(response)
    const event = request("/icons/icon-192.png")
    await expect(event.respondWith.mock.calls[0][0]).resolves.toBe(response)
    expectNoCacheAccess()
  })

  it.each([true, false])("通信失敗時のキャッシュ有無=%sで応答を選ぶ", async (hasCachedAsset) => {
    const cached = hasCachedAsset ? new Response("cached asset") : undefined
    caches.match.mockResolvedValue(cached)
    fetch.mockRejectedValue(new TypeError("offline"))
    const event = request("/icons/icon-192.png")
    const response = await event.respondWith.mock.calls[0][0]
    expect(caches.match).toHaveBeenCalledWith(event.request)
    if (hasCachedAsset) expect(response).toBe(cached)
    else expect(response.type).toBe("error")
    expect(cache.put).not.toHaveBeenCalled()
  })
})

describe("Service Workerの更新", () => {
  it("offline画面を事前取得してから新workerへ切り替える", async () => {
    const precache = Promise.withResolvers()
    const started = Promise.withResolvers()
    cache.addAll.mockImplementation(() => {
      started.resolve()
      return precache.promise
    })
    const installation = lifecycle("install")
    await started.promise
    expect(cache.addAll).toHaveBeenCalledWith(
      expect.arrayContaining(["/offline.html", "/manifest.webmanifest", "/icons/icon-192.png"]),
    )
    expect(worker.skipWaiting).not.toHaveBeenCalled()
    precache.resolve()
    await installation
    expect(worker.skipWaiting).toHaveBeenCalledOnce()
  })

  it("事前取得に失敗したworkerへ切り替えない", async () => {
    const failure = new Error("precache failed")
    cache.addAll.mockRejectedValue(failure)
    await expect(lifecycle("install")).rejects.toBe(failure)
    expect(worker.skipWaiting).not.toHaveBeenCalled()
  })

  it("当アプリの旧キャッシュだけを削除し現行・他用途は残す", async () => {
    await lifecycle("install")
    const currentCache = caches.open.mock.calls[0][0]
    caches.keys.mockResolvedValue([currentCache, "masusono-cache-old", "other-app-cache", "masusono-unrelated"])
    await lifecycle("activate")
    expect(caches.delete.mock.calls).toEqual([["masusono-cache-old"]])
    expect(worker.clients.claim).toHaveBeenCalledOnce()
  })
})
