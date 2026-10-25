// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let listeners, cache, caches, fetch, worker

beforeEach(async () => {
  vi.resetModules()
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
  vi.stubGlobal("self", worker)
  vi.stubGlobal("caches", caches)
  vi.stubGlobal("fetch", fetch)
  await import("../../../public/service-worker.js")
})

afterEach(() => vi.unstubAllGlobals())

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

describe("プッシュ通知", () => {
  beforeEach(() => {
    worker.registration = { showNotification: vi.fn().mockResolvedValue() }
    worker.clients.matchAll = vi.fn().mockResolvedValue([])
    worker.clients.openWindow = vi.fn().mockResolvedValue()
  })

  it("通知のタイトル・本文・遷移先とアイコンを渡し、表示完了を待つ", async () => {
    const waitUntil = vi.fn()
    listeners.get("push")({
      data: { json: () => ({ title: "新着記事", body: "記事の概要", url: "/articles/new" }) },
      waitUntil,
    })
    expect(worker.registration.showNotification).toHaveBeenCalledWith("新着記事", {
      body: "記事の概要",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: "/articles/new" },
    })
    expect(waitUntil).toHaveBeenCalledWith(worker.registration.showNotification.mock.results[0].value)
    await waitUntil.mock.calls[0][0]
  })

  it.each([undefined, null, {}, { title: "   ", body: 42, url: "https://example.com" }, { title: 123, url: null }])(
    "不完全な通知データ %j は既定値で表示する",
    async (payload) => {
      const waitUntil = vi.fn()
      listeners.get("push")({ data: payload === undefined ? undefined : { json: () => payload }, waitUntil })
      await waitUntil.mock.calls[0][0]
      expect(worker.registration.showNotification).toHaveBeenCalledWith(
        "増田とその他！",
        expect.objectContaining({ body: "", data: { url: "/" } }),
      )
    },
  )

  it("同じURLのウィンドウがあれば通知を閉じてフォーカスする", async () => {
    const other = { url: "https://masusono.com/", focus: vi.fn() }
    const existing = { url: "https://masusono.com/articles/new", focus: vi.fn().mockResolvedValue() }
    worker.clients.matchAll.mockResolvedValue([other, existing])
    const notification = { close: vi.fn(), data: { url: "/articles/new" } }
    const waitUntil = vi.fn()
    listeners.get("notificationclick")({ notification, waitUntil })
    await waitUntil.mock.calls[0][0]
    expect(notification.close).toHaveBeenCalledOnce()
    expect(worker.clients.matchAll).toHaveBeenCalledWith({ type: "window", includeUncontrolled: true })
    expect(existing.focus).toHaveBeenCalledOnce()
    expect(other.focus).not.toHaveBeenCalled()
    expect(worker.clients.openWindow).not.toHaveBeenCalled()
  })

  it.each([
    [{ url: "/articles/new" }, "https://masusono.com/articles/new"],
    [undefined, "https://masusono.com/"],
    [{}, "https://masusono.com/"],
  ])("対象ウィンドウがなければ通知の遷移先 %j を開く", async (data, target) => {
    const waitUntil = vi.fn()
    const close = vi.fn()
    listeners.get("notificationclick")({ notification: { close, data }, waitUntil })
    await waitUntil.mock.calls[0][0]
    expect(close).toHaveBeenCalledOnce()
    expect(worker.clients.openWindow).toHaveBeenCalledWith(target)
  })
})
