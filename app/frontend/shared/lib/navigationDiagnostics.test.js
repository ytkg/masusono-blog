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
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
  vi.useRealTimers()
})

describe("footer navigation diagnostics", () => {
  function pointerEvent(type, extra = {}) {
    const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: 20, clientY: 20, ...extra })
    Object.defineProperty(event, "pointerId", { value: 1 })
    document.querySelector("a").dispatchEvent(event)
  }
  function prepareLink() {
    document.body.innerHTML = '<nav aria-label="メインナビゲーション"><a href="/authors">著者</a></nav>'
    document.querySelector("a").addEventListener("click", (event) => event.preventDefault())
  }

  it("指を離してもクリックが来ない停止を記録し、次回起動でも回収する", () => {
    prepareLink()
    pointerEvent("pointerdown")
    advance(100)
    expect(saved()).toBeNull()
    pointerEvent("pointerup")
    expect(saved().payload).toMatchObject({ stage: "release", release_ms: 0 })
    advance(5000)
    expect(payloads()[0]).toMatchObject({ kind: "navigation_stalled", stage: "release", elapsed_ms: 5000 })
    remove()
    remove = installNavigationDiagnostics(router)
    expect(payloads()[1]).toMatchObject({ stage: "release", recovered: true })
  })

  it("クリック後にInertiaの受付が来ない停止を区別する", () => {
    prepareLink()
    pointerEvent("pointerdown")
    pointerEvent("pointerup")
    advance(50)
    document.querySelector("a").click()
    advance(4950)
    expect(payloads()[0]).toMatchObject({ stage: "tap", release_ms: 0, tap_ms: 50 })
    expect(payloads()[0]).not.toHaveProperty("request_ms")
  })

  it("遷移受付前の先読み応答でクリック待ちの段階を上書きしない", () => {
    prepareLink()
    pointerEvent("pointerdown")
    pointerEvent("pointerup")
    resourceCallback({
      getEntries: () => [{ name: new URL("/authors", location.href).href, initiatorType: "fetch", responseEnd: 100 }],
    })
    emit("beforeUpdate", { page: { url: "/authors" } })
    window.dispatchEvent(new Event("vite:preloadError"))
    advance(5000)
    expect(payloads()[0]).toMatchObject({ kind: "navigation_stalled", stage: "release" })
    expect(payloads()[0]).not.toHaveProperty("response_ms")
    expect(payloads()[0]).not.toHaveProperty("data_ready_ms")
  })

  it.each(["scroll", "cancel", "longpress", "modified"])("%s は停止として記録しない", (action) => {
    prepareLink()
    pointerEvent("pointerdown", action === "modified" ? { metaKey: true } : {})
    if (action === "scroll") pointerEvent("pointermove", { clientY: 60 })
    if (action === "cancel") pointerEvent("pointercancel")
    if (action === "longpress") advance(1200)
    pointerEvent("pointerup")
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
    expect(saved()).toBeNull()
  })

  it("通常のページ移動は再起動時の未完了記録にしない", () => {
    document.body.innerHTML = '<nav aria-label="メインナビゲーション"><a href="/authors">著者</a></nav>'
    document.querySelector("a").addEventListener("click", (event) => event.preventDefault())
    document.querySelector("a").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    window.dispatchEvent(new Event("pagehide"))
    advance(10000)
    expect(saved()).toBeNull()
    remove()
    remove = installNavigationDiagnostics(router)
    expect(fetch).not.toHaveBeenCalled()
  })

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
  it("過大な保存データを送らず削除し、その後の遷移を計測できる", () => {
    remove()
    localStorage.setItem(KEY, "x".repeat(2049))
    remove = installNavigationDiagnostics(router)
    expect(saved()).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
    click()
    advance(5000)
    expect(payloads()[0]).toMatchObject({ kind: "navigation_stalled", path: "/authors" })
  })

  it.each([
    { age: 86400000, id: "expired", stage: "request" },
    { age: -1, id: "future", stage: "request" },
    { age: 0, id: "x".repeat(101), stage: "request" },
    { age: 0, id: "bad-stage", stage: "private" },
  ])("復元できない保存値%jを送信しない", ({ age, id, stage }) => {
    remove()
    localStorage.setItem(
      KEY,
      JSON.stringify({
        id,
        saved_at: Date.now() - age,
        payload: { kind: "navigation_interrupted", path: "/authors", stage },
      }),
    )
    remove = installNavigationDiagnostics(router)
    expect(saved()).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("bfcacheから復帰した後の最初のタップに復帰からの時間を付ける", () => {
    advance(1000)
    window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }))
    advance(50)
    click()
    advance(5000)
    expect(payloads()[0]).toMatchObject({ since_resume_ms: 50, kind: "navigation_stalled" })
  })

  it("別の遷移が始まったら前のタップの停止タイマーを破棄する", () => {
    click()
    emit("before", { visit: { id: "other", url: new URL("/numbers", location.href), prefetch: false, async: false } })
    advance(5000)
    expect(saved()).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("別のリクエストの取消で現在の前景遷移を破棄しない", () => {
    click()
    emit("finish", { visit: { id: "background", cancelled: true } })
    advance(5000)
    expect(payloads()[0]).toMatchObject({ kind: "navigation_stalled", path: "/authors" })
  })

  it.each(["localStorage", "sessionStorage"])("%sへのアクセスが拒否されても停止を記録する", (name) => {
    remove()
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: name === "localStorage" })),
    )
    vi.spyOn(window, name, "get").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError")
    })
    remove = installNavigationDiagnostics(router)
    click()
    advance(5000)
    expect(payloads()).toEqual([expect.objectContaining({ kind: "navigation_stalled", path: "/authors" })])
  })

  it("Storage読込みが失敗してもメモリ内の遷移を計測する", () => {
    remove()
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied")
    })
    remove = installNavigationDiagnostics(router)
    click()
    advance(5000)
    expect(payloads()[0]).toMatchObject({ kind: "navigation_stalled", elapsed_ms: 5000 })
  })

  it("壊れた保存JSONを送信せず、次の遷移を記録する", () => {
    remove()
    localStorage.setItem(KEY, "{private invalid JSON")
    remove = installNavigationDiagnostics(router)
    expect(fetch).not.toHaveBeenCalled()
    click()
    advance(5000)
    expect(payloads()[0]).toMatchObject({ path: "/authors", stage: "request" })
    expect(fetch.mock.calls[0][1].body).not.toContain("private")
  })

  it("保存記録の削除に失敗しても描画完了後のタイマーを止め、次の遷移を計測する", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("denied")
    })
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    recordNavigationCommit("/authors")
    paint()
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
    click("/numbers")
    advance(5000)
    expect(payloads()).toEqual([expect.objectContaining({ path: "/numbers", kind: "navigation_stalled" })])
  })

  it.each(["success", "failure"])("古いmoduleの%sを新しい前景遷移へ関連付けない", async (outcome) => {
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    const loading = Promise.withResolvers()
    const task = tracePageResolution(() => loading.promise)
    click("/numbers")
    emit("beforeUpdate", { page: { url: "/numbers" } })
    if (outcome === "success") {
      loading.resolve("old page")
      await expect(task).resolves.toBe("old page")
    } else {
      const error = new Error("old failure")
      loading.reject(error)
      await expect(task).rejects.toBe(error)
    }
    expect(saved().payload).toMatchObject({ path: "/numbers", stage: "data_ready" })
    expect(saved().payload).not.toHaveProperty("module_end_ms")
    expect(fetch).not.toHaveBeenCalled()
    advance(5000)
    expect(payloads()).toEqual([expect.objectContaining({ path: "/numbers", kind: "navigation_stalled" })])
  })

  it.each(["absent", "unsupported"])("PerformanceObserverが%sでもデータ受領後の停止を記録する", (mode) => {
    remove()
    vi.stubGlobal(
      "PerformanceObserver",
      mode === "absent"
        ? undefined
        : class {
            observe() {
              throw new Error("resource timing unsupported")
            }
            disconnect() {}
          },
    )
    remove = installNavigationDiagnostics(router)
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    expect(saved().payload).not.toHaveProperty("response_ms")
    advance(5000)
    expect(payloads()[0]).toMatchObject({ kind: "navigation_stalled", stage: "data_ready" })
  })

  it("重複commitは描画を二重予約せず、ちょうど3秒の遷移を一度だけ報告する", () => {
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    recordNavigationCommit("/authors")
    recordNavigationCommit("/authors")
    expect(requestAnimationFrame).toHaveBeenCalledOnce()
    advance(3000)
    paint()
    paint()
    advance(5000)
    expect(payloads()).toEqual([expect.objectContaining({ kind: "navigation_slow", elapsed_ms: 3000 })])
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it.each([12, 13])("指の移動距離%i pxでタップとスクロールを区別する", (distance) => {
    prepareLink()
    pointerEvent("pointerdown")
    pointerEvent("pointermove", { clientX: 20 + distance })
    pointerEvent("pointerup")
    advance(5000)
    expect(payloads()).toHaveLength(distance === 12 ? 1 : 0)
  })

  it.each([999, 1000])("押下時間%i msでタップと長押しを区別する", (duration) => {
    prepareLink()
    pointerEvent("pointerdown")
    advance(duration)
    pointerEvent("pointerup")
    advance(5000)
    expect(payloads()).toHaveLength(duration === 999 ? 1 : 0)
  })

  it.each([0, 86400000, -1, 86400001, 0.5, true, "1"])("復元した計測値%jの型と上下限を適用する", (value) => {
    remove()
    const fields = [
      "release_ms",
      "tap_ms",
      "request_ms",
      "response_ms",
      "data_ready_ms",
      "module_start_ms",
      "module_end_ms",
      "commit_ms",
      "frame_ms",
      "elapsed_ms",
      "since_resume_ms",
    ]
    const timings = Object.fromEntries(fields.map((key) => [key, value]))
    localStorage.setItem(
      KEY,
      JSON.stringify({
        id: "bounds",
        saved_at: Date.now(),
        payload: {
          kind: "navigation_interrupted",
          path: "/authors",
          stage: "request",
          ...timings,
        },
      }),
    )
    remove = installNavigationDiagnostics(router)
    const expected = { kind: "navigation_interrupted", path: "/authors", stage: "request", recovered: true }
    if (value === 0 || value === 86400000) Object.assign(expected, timings)
    expect(payloads()).toEqual([expected])
  })

  it.each([true, false])("保存された任意項目の型と列挙値を検証する（有効=%s）", (valid) => {
    remove()
    const fields = valid
      ? {
          standalone: false,
          service_worker: true,
          backgrounded: false,
          online: false,
          build_version: "202611050000",
          visibility: "hidden",
          controller_state: "activated",
          data_source: "in_flight",
        }
      : {
          standalone: "false",
          service_worker: 1,
          backgrounded: null,
          online: "true",
          build_version: "private",
          visibility: "private",
          controller_state: "private",
          data_source: "private",
        }
    localStorage.setItem(
      KEY,
      JSON.stringify({
        id: "optional",
        saved_at: Date.now(),
        payload: {
          kind: "navigation_interrupted",
          path: "/authors",
          stage: "request",
          ...fields,
        },
      }),
    )
    remove = installNavigationDiagnostics(router)
    expect(payloads()).toEqual([
      {
        kind: "navigation_interrupted",
        path: "/authors",
        stage: "request",
        recovered: true,
        ...(valid ? fields : {}),
      },
    ])
  })

  it.each([
    ["/articles/" + "a".repeat(502), true],
    ["/articles/" + "a".repeat(503), false],
    ["/api/private", false],
  ])("復元対象URL %s を公開パスと512文字制限で検証する", (path, accepted) => {
    remove()
    localStorage.setItem(
      KEY,
      JSON.stringify({
        id: "x".repeat(100),
        saved_at: Date.now(),
        payload: {
          kind: "navigation_interrupted",
          path,
          stage: "request",
        },
      }),
    )
    remove = installNavigationDiagnostics(router)
    expect(payloads()).toHaveLength(accepted ? 1 : 0)
    if (accepted) expect(payloads()[0].path).toBe(path)
    else expect(saved()).toBeNull()
  })

  it("解除すると停止タイマー・観測・購読が止まり、その後のタップを記録しない", () => {
    const disconnect = vi.spyOn(PerformanceObserver.prototype, "disconnect")
    click()
    remove()
    expect(disconnect).toHaveBeenCalledOnce()
    router.on.mock.results.forEach(({ value }) => expect(value).toHaveBeenCalledOnce())
    prepareLink()
    document.querySelector("a").click()
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([0, 1])("解除時は描画予約を破棄する（経過フレーム%i）", (elapsed) => {
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    recordNavigationCommit("/authors")
    if (elapsed) {
      const callback = [...frames.values()][0]
      frames.clear()
      callback()
    }
    remove()
    expect(frames.size).toBe(0)
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
  })

  it("古い登録の解除で新しい診断APIを無効にしない", async () => {
    const removeOld = remove
    remove = installNavigationDiagnostics(router)
    removeOld()
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    await tracePageResolution(async () => "new page")
    expect(saved().payload).toHaveProperty("module_end_ms", 0)
    recordNavigationCommit("/authors")
    paint()
    expect(saved()).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each(["blank", "download", "current", "external", "private"])(
    "%sのリンクは前景遷移の停止として記録しない",
    (kind) => {
      prepareLink()
      const link = document.querySelector("a")
      if (kind === "blank") link.target = "_blank"
      if (kind === "download") link.setAttribute("download", "")
      if (kind === "current") link.href = location.href
      if (kind === "external") link.href = "https://example.com/authors"
      if (kind === "private") link.href = "/api/private"
      pointerEvent("pointerdown")
      pointerEvent("pointerup")
      link.click()
      advance(5000)
      expect(saved()).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    },
  )

  it("副ポインターの押下をタップとして計測しない", () => {
    prepareLink()
    const event = new MouseEvent("pointerdown", { bubbles: true, button: 0, clientX: 20, clientY: 20 })
    Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: false } })
    document.querySelector("a").dispatchEvent(event)
    pointerEvent("pointerup")
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
  })

  it("別の指の解放を押下中のポインターと混同しない", () => {
    prepareLink()
    pointerEvent("pointerdown")
    const event = new MouseEvent("pointerup", { bubbles: true, button: 0, clientX: 20, clientY: 20 })
    Object.defineProperty(event, "pointerId", { value: 2 })
    document.querySelector("a").dispatchEvent(event)
    advance(5000)
    expect(fetch).not.toHaveBeenCalled()
  })

  it("遅いResourceTimingの通知で段階や観測済み時刻を戻さず、別取得の応答を無視する", async () => {
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    await tracePageResolution(async () => "page")
    const name = new URL("/authors", location.href).href
    resourceCallback({
      getEntries: () => [
        { name, initiatorType: "img", responseEnd: 1 },
        { name, initiatorType: "fetch", responseEnd: -1 },
        { name: new URL("/numbers", location.href).href, initiatorType: "fetch", responseEnd: 1 },
      ],
    })
    expect(saved().payload).not.toHaveProperty("response_ms")
    advance(20)
    resourceCallback({ getEntries: () => [{ name, initiatorType: "fetch", responseEnd: 1 }] })
    expect(saved().payload).toMatchObject({ stage: "module_end", module_end_ms: 0, response_ms: 20 })
    advance(30)
    resourceCallback({ getEntries: () => [{ name, initiatorType: "fetch", responseEnd: 1 }] })
    expect(saved().payload.response_ms).toBe(20)
  })

  it("ちょうど2048文字の保存JSONを復元する", () => {
    remove()
    const raw = JSON.stringify({
      id: "size-bound",
      saved_at: Date.now(),
      payload: {
        kind: "navigation_interrupted",
        path: "/authors",
        stage: "request",
      },
    }).padEnd(2048, " ")
    localStorage.setItem(KEY, raw)
    remove = installNavigationDiagnostics(router)
    expect(payloads()).toEqual([
      {
        kind: "navigation_interrupted",
        path: "/authors",
        stage: "request",
        recovered: true,
      },
    ])
  })

  it("初期表示・データ受領前・別URLのcommitで現在の遷移を完了扱いにしない", () => {
    recordNavigationCommit("/")
    click()
    recordNavigationCommit("/authors")
    emit("beforeUpdate", { page: { url: "/authors" } })
    recordNavigationCommit("/numbers")
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    advance(5000)
    expect(payloads()[0]).toMatchObject({ path: "/authors", stage: "data_ready", kind: "navigation_stalled" })
  })

  it.each([{ prefetch: true }, { async: true }])("背景の受付%jで前景遷移を破棄しない", (background) => {
    click()
    emit("before", { visit: { id: "background", url: new URL("/numbers", location.href), ...background } })
    advance(5000)
    expect(payloads()).toEqual([expect.objectContaining({ path: "/authors", kind: "navigation_stalled" })])
  })

  it.each([true, false])("一致するfinishは中断時だけ描画予約を取り消す（interrupted=%s）", (interrupted) => {
    click()
    emit("beforeUpdate", { page: { url: "/authors" } })
    recordNavigationCommit("/authors")
    emit("finish", { visit: { id: "visit", interrupted } })
    expect(frames.size).toBe(interrupted ? 0 : 1)
    paint()
    advance(5000)
    expect(saved()).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("重複したvisibility通知でも背景時間を二重計上せず、復帰後の閾値を保つ", () => {
    click()
    advance(100)
    const visibility = vi.spyOn(document, "visibilityState", "get")
    visibility.mockReturnValue("hidden")
    document.dispatchEvent(new Event("visibilitychange"))
    advance(20000)
    document.dispatchEvent(new Event("visibilitychange"))
    advance(20000)
    visibility.mockReturnValue("visible")
    document.dispatchEvent(new Event("visibilitychange"))
    document.dispatchEvent(new Event("visibilitychange"))
    advance(4899)
    expect(fetch).not.toHaveBeenCalled()
    advance(1)
    expect(payloads()[0]).toMatchObject({ elapsed_ms: 5000, backgrounded: true })
  })
})
