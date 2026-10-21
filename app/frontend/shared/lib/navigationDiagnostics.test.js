import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { installNavigationDiagnostics, recordNavigationCommit, tracePageResolution } from "./navigationDiagnostics"

const KEY = "footer-navigation-diagnostic-v1"
let remove, events, router, clock, frames, resourceCallback
const payloads = () => fetch.mock.calls.map(([, options]) => JSON.parse(options.body).failure)
const saved = () => JSON.parse(localStorage.getItem(KEY) || "null")
const emit = (name, detail) => events[name]({ detail })
function click(path = "/authors") {
  document.body.innerHTML = `<nav aria-label="メインナビゲーション"><a href="${path}">著者</a></nav>`
  // Prevent jsdom's native navigation after the capture listener records the tap.
  document.querySelector("a").addEventListener("click", (event) => event.preventDefault())
  document.querySelector("a").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }))
  emit("before", { visit: { id: "visit", url: new URL(path, location.href), prefetch: false, async: false } })
}
function advance(ms) {
  clock += ms
  vi.advanceTimersByTime(ms)
}
function paint() {
  for (let i = 0; i < 2; i++) {
    const current = [...frames.values()]
    frames.clear()
    current.forEach((callback) => callback())
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  clock = 0
  frames = new Map()
  let frameId = 0
  vi.spyOn(performance, "now").mockImplementation(() => clock)
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible")
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true })),
  )
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb) => {
      frames.set(++frameId, cb)
      return frameId
    }),
  )
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id) => frames.delete(id)),
  )
  vi.stubGlobal(
    "PerformanceObserver",
    class {
      constructor(callback) {
        resourceCallback = callback
      }
      observe() {}
      disconnect() {}
    },
  )
  localStorage.clear()
  sessionStorage.clear()
  events = {}
  router = {
    on: vi.fn((name, callback) => {
      events[name] = callback
      return vi.fn()
    }),
    getCached: vi.fn(() => null),
    getPrefetching: vi.fn(() => null),
  }
  remove = installNavigationDiagnostics(router)
})
afterEach(() => {
  remove()
  document.body.innerHTML = ""
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("footer navigation diagnostics", () => {
  it("通常遷移は段階ごとの時刻を保存し、描画後に消して送信しない", async () => {
    click()
    advance(100)
    resourceCallback({
      getEntries: () => [
        { name: new URL("/authors", location.href).href, initiatorType: "xmlhttprequest", responseEnd: 100 },
      ],
    })
    advance(20)
    emit("beforeUpdate", { page: { url: "/authors" } })
    await tracePageResolution(async () => "page")
    recordNavigationCommit("/authors")
    expect(saved().payload).toMatchObject({
      tap_ms: 0,
      request_ms: 0,
      response_ms: 100,
      data_ready_ms: 120,
      module_start_ms: 120,
      module_end_ms: 120,
      commit_ms: 120,
      data_source: "network",
    })
    paint()
    expect(saved()).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("遅い遷移で先読み利用・ビルド番号・描画時刻を報告する", async () => {
    router.getCached.mockReturnValue({})
    click()
    advance(3100)
    emit("beforeUpdate", { page: { url: "/authors" } })
    await tracePageResolution(async () => "page")
    recordNavigationCommit("/authors")
    paint()
    expect(payloads()).toEqual([
      expect.objectContaining({
        kind: "navigation_slow",
        stage: "frame",
        elapsed_ms: 3100,
        frame_ms: 3100,
        response_ms: 0,
        data_source: "cached",
        standalone: true,
        build_version: expect.stringMatching(/^\d{12}$/),
      }),
    ])
  })

  it("データ待ちとモジュール待ちの停止を区別し、同じ停止を繰り返し送らない", async () => {
    router.getPrefetching.mockReturnValue({})
    click()
    advance(5000)
    expect(payloads()[0]).toMatchObject({
      kind: "navigation_stalled",
      stage: "request",
      data_source: "in_flight",
      elapsed_ms: 5000,
    })
    click("/numbers")
    emit("beforeUpdate", { page: { url: "/numbers" } })
    let finish
    const resolving = tracePageResolution(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    advance(5000)
    expect(payloads()[1]).toMatchObject({ kind: "navigation_stalled", stage: "module_start", module_start_ms: 0 })
    advance(20000)
    expect(fetch).toHaveBeenCalledTimes(2)
    finish("page")
    await resolving
  })

  it("遅延importの拒否を再throwし、本文や例外メッセージを送らない", async () => {
    click("/authors?q=private#private")
    emit("beforeUpdate", { page: { url: "/authors?q=private" } })
    const error = new Error("secret module URL")
    await expect(tracePageResolution(() => Promise.reject(error))).rejects.toBe(error)
    window.dispatchEvent(new Event("vite:preloadError"))
    expect(payloads()).toHaveLength(1)
    expect(payloads()[0]).toMatchObject({ kind: "module_load_error", path: "/authors", stage: "module_start" })
    expect(fetch.mock.calls[0][1].body).not.toMatch(/private|secret/)
  })

  it("未完了記録をPWAの次回起動で再送し、受理後に消す", async () => {
    click()
    advance(200)
    emit("beforeUpdate", { page: { url: "/authors" } })
    window.dispatchEvent(new Event("pagehide"))
    remove()
    remove = installNavigationDiagnostics(router)
    expect(payloads()[0]).toMatchObject({
      kind: "navigation_interrupted",
      recovered: true,
      stage: "data_ready",
      elapsed_ms: 200,
      standalone: true,
    })
    await Promise.resolve()
    expect(saved()).toBeNull()
  })

  it("オフラインの失敗記録は再起動後も残り、接続復帰時に送る", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    await expect(tracePageResolution(() => Promise.reject(new Error("offline")))).rejects.toThrow()
    remove()
    remove = installNavigationDiagnostics(router)
    expect(fetch).not.toHaveBeenCalled()
    expect(saved().payload.kind).toBe("module_load_error")
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
    window.dispatchEvent(new Event("online"))
    await Promise.resolve()
    expect(payloads()[0]).toMatchObject({ kind: "module_load_error", recovered: true })
    expect(saved()).toBeNull()
  })

  it("古い送信の完了で、新しい未完了記録を消さない", async () => {
    let deliver
    fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          deliver = resolve
        }),
    )
    click()
    advance(5000)
    click("/numbers")
    deliver({ ok: true })
    await Promise.resolve()
    expect(saved().payload.path).toBe("/numbers")
  })

  it("背景にいた時間を停止時間から除外し、復帰後の計測を続ける", () => {
    click()
    advance(100)
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
    document.dispatchEvent(new Event("visibilitychange"))
    advance(60000)
    expect(fetch).not.toHaveBeenCalled()
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible")
    document.dispatchEvent(new Event("visibilitychange"))
    advance(4900)
    expect(payloads()[0]).toMatchObject({ elapsed_ms: 5000, backgrounded: true })
  })

  it("取消・履歴移動は停止扱いせず、次の遷移のフレームも計測できる", () => {
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    recordNavigationCommit("/authors")
    emit("finish", { visit: { id: "visit", cancelled: true } })
    click("/numbers")
    emit("beforeUpdate", { page: { url: "/numbers" } })
    recordNavigationCommit("/numbers")
    paint()
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
    expect(saved()).toBeNull()
    click()
    window.dispatchEvent(new Event("popstate"))
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
  })

  it("改変された保存値の未知キー・非公開URL・無効時刻を送らない", () => {
    remove()
    localStorage.setItem(
      KEY,
      JSON.stringify({
        id: "local",
        saved_at: Date.now(),
        payload: {
          kind: "navigation_interrupted",
          stage: "module_start",
          path: "/authors?q=secret",
          source_path: "/api/private",
          module_start_ms: -1,
          response_ms: "secret",
          elapsed_ms: 50,
          body: "secret",
          build_version: "secret",
          service_worker: "secret",
        },
      }),
    )
    remove = installNavigationDiagnostics(router)
    expect(payloads()).toEqual([
      { kind: "navigation_interrupted", path: "/authors", stage: "module_start", recovered: true, elapsed_ms: 50 },
    ])
  })

  it("24時間前の記録を破棄し、保存不可でも遷移計測を続ける", () => {
    remove()
    localStorage.setItem(KEY, JSON.stringify({ id: "old", saved_at: Date.now() - 86400001, payload: {} }))
    remove = installNavigationDiagnostics(router)
    expect(saved()).toBeNull()
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    click()
    advance(5000)
    expect(payloads()[0]).toMatchObject({ kind: "navigation_stalled" })
  })

  it("ブラウザの記録はタブ内に保存し、別のページ解決や修飾クリックを計測しない", async () => {
    remove()
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    )
    remove = installNavigationDiagnostics(router)
    await tracePageResolution(async () => "initial page")
    expect(sessionStorage.getItem(KEY)).toBeNull()
    click()
    expect(saved()).toBeNull()
    expect(JSON.parse(sessionStorage.getItem(KEY)).payload.standalone).toBe(false)
    window.dispatchEvent(new Event("popstate"))
    document
      .querySelector("a")
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true }))
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
  })
})
