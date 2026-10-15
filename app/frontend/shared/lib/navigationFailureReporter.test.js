import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createNavigationFailureReporter } from "./navigationFailureReporter"

let reporter
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
  reporter = createNavigationFailureReporter()
})
afterEach(() => {
  reporter.dispose()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
const visit = { url: "/authors?q=secret#private", prefetch: true }

describe("navigation failure reporter", () => {
  it("private queryや本文を含めず、既存のPOST契約で送る", () => {
    reporter.report(visit, "http_exception", {
      status: 503,
      data: "private-body",
      headers: { "x-request-id": "request-1", "content-type": "text/html; charset=utf-8" },
    })
    expect(fetch).toHaveBeenCalledWith(
      "/api/app/navigation_failures",
      expect.objectContaining({
        method: "POST",
        credentials: "omit",
        keepalive: true,
      }),
    )
    const body = fetch.mock.calls[0][1].body
    expect(body).not.toMatch(/secret|private/)
    expect(JSON.parse(body).failure).toMatchObject({
      path: "/authors",
      status: 503,
      response_request_id: "request-1",
      content_type: "text/html",
      prefetch: true,
    })
  })

  it("外部URLは送らず、上限枠も消費しない", () => {
    reporter.report({ url: "https://example.com/authors" }, "network_error")
    for (let i = 0; i < 11; i++) reporter.report(visit, "network_error")
    expect(fetch).toHaveBeenCalledTimes(10)
  })

  it("オフラインで10件まで保持し、通信失敗だけを再送する", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    for (let i = 0; i < 11; i++) reporter.report(visit, "network_error")
    expect(fetch).not.toHaveBeenCalled()
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
    fetch.mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ ok: false })
    window.dispatchEvent(new Event("online"))
    await Promise.resolve()
    expect(fetch).toHaveBeenCalledTimes(10)
    window.dispatchEvent(new Event("online"))
    await Promise.resolve()
    expect(fetch).toHaveBeenCalledTimes(11)
    window.dispatchEvent(new Event("online"))
    expect(fetch).toHaveBeenCalledTimes(11)
  })

  it("解除時はキューを捨て、実行中送信の失敗も再登録しない", async () => {
    let reject
    fetch.mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail
        }),
    )
    reporter.report(visit, "network_error")
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    reporter.report(visit, "network_error")
    reporter.dispose()
    reject(new Error("late offline"))
    await Promise.resolve()
    window.dispatchEvent(new Event("online"))
    reporter.report(visit, "network_error")
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
