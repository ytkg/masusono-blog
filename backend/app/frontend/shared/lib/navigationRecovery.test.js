import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { dismissNavigationFailure, getNavigationFailure, installNavigationRecovery } from "./navigationRecovery"

let events, router, remove
const visit = (overrides = {}) => ({
  id: "visit-1",
  url: new URL("/authors?q=secret", window.location.href),
  prefetch: false,
  async: false,
  ...overrides,
})
function emit(name, detail) {
  const event = { detail, preventDefault: vi.fn() }
  events[name](event)
  if (name === "before" && detail.visit.prefetch) events.start(event)
  return event
}
function reportBody() {
  return JSON.parse(fetch.mock.calls.at(-1)[1].body).failure
}

beforeEach(() => {
  events = {}
  router = {
    on: vi.fn((name, handler) => {
      events[name] = handler
      return vi.fn()
    }),
  }
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
  remove = installNavigationRecovery(router)
  dismissNavigationFailure()
})
afterEach(() => {
  remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("navigation recovery", () => {
  it("空の200応答で白い枠を抑止し、遷移先を再読み込みできる状態にする", () => {
    emit("before", { visit: visit({ id: "prefetch-1", prefetch: true, async: true }) })
    emit("before", { visit: visit() })
    const event = emit("httpException", {
      response: {
        status: 200,
        data: "",
        headers: { "x-request-id": "request-1", "content-type": "text/html; charset=utf-8" },
      },
    })
    expect(event.preventDefault).toHaveBeenCalled()
    expect(getNavigationFailure()).toMatchObject({ url: visit().url.href, kind: "http_exception" })
    expect(reportBody()).toMatchObject({
      path: "/authors",
      status: 200,
      response_request_id: "request-1",
      prefetch_in_flight: true,
      content_type: "text/html",
    })
    expect(fetch.mock.calls[0][1].body).not.toContain("secret")
  })

  it("先読みの異常応答は記録し、表示中のページを邪魔しない", () => {
    emit("prefetched", {
      visit: visit({ prefetch: true }),
      response: { status: 502, data: "private error", headers: {} },
    })
    expect(getNavigationFailure()).toBeNull()
    expect(reportBody()).toMatchObject({ status: 502, prefetch: true })
    expect(fetch.mock.calls[0][1].body).not.toContain("private error")
  })

  it("正規のInertiaエラーページとバージョン更新を妨げない", () => {
    const event = emit("httpException", { response: { status: 404, headers: { "x-inertia": "true" } } })
    emit("prefetched", {
      visit: visit({ prefetch: true }),
      response: { status: 409, headers: { "x-inertia-location": visit().url.href } },
    })
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expect(getNavigationFailure()).toBeNull()
  })

  it("遷移中の通信失敗を捕捉し、キャンセルはエラー扱いしない", () => {
    emit("before", { visit: visit() })
    const cancelled = emit("networkError", { error: { code: "ERR_CANCELLED", url: visit().url.href } })
    expect(fetch).not.toHaveBeenCalled()
    expect(cancelled.preventDefault).not.toHaveBeenCalled()
    const event = emit("networkError", { error: { code: "ERR_NETWORK", url: visit().url.href } })
    expect(event.preventDefault).toHaveBeenCalled()
    expect(getNavigationFailure()).toMatchObject({ kind: "network_error" })
  })

  it("別ページの先読み通信失敗は遷移先と混同せず、Inertiaの失敗処理を継続する", () => {
    emit("before", {
      visit: visit({ id: "prefetch-1", prefetch: true, async: true, url: new URL("/numbers", window.location.href) }),
    })
    emit("before", { visit: visit() })
    const event = emit("networkError", { error: { url: new URL("/numbers", window.location.href).href } })
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(getNavigationFailure()).toBeNull()
    expect(reportBody()).toMatchObject({ path: "/numbers", prefetch: true })
  })

  it("先読み中のタップ後に通信が失敗しても復旧案内を出し、先読みの後始末を妨げない", () => {
    emit("before", { visit: visit({ id: "prefetch-1", prefetch: true, async: true }) })
    emit("before", { visit: visit() })
    const event = emit("networkError", { error: { url: visit().url.href } })
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(getNavigationFailure()).toMatchObject({ url: visit().url.href, kind: "network_error" })
    expect(reportBody()).toMatchObject({ prefetch_in_flight: true, prefetch: false })
  })

  it("オフラインの記録は通信復帰時に送り、記録失敗で画面復旧を妨げない", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    emit("before", { visit: visit() })
    emit("networkError", { error: { url: visit().url.href } })
    expect(fetch).not.toHaveBeenCalled()
    expect(getNavigationFailure()).not.toBeNull()
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
    fetch.mockRejectedValueOnce(new Error("offline"))
    window.dispatchEvent(new Event("online"))
    await Promise.resolve()
    fetch.mockResolvedValue({ ok: true })
    window.dispatchEvent(new Event("online"))
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("連続失敗でも記録送信数を制限し、次の遷移で案内を閉じる", () => {
    emit("before", { visit: visit() })
    for (let i = 0; i < 15; i++) emit("httpException", { response: { status: 503, headers: {} } })
    expect(fetch).toHaveBeenCalledTimes(10)
    emit("before", { visit: visit({ id: "next" }) })
    expect(getNavigationFailure()).toBeNull()
  })
})
