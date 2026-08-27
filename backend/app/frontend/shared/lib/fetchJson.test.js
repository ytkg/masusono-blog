import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiError, fetchJson, getApiErrorDisplayMessage, postJson } from "./fetchJson"

describe("fetchJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("no-store で JSON を取得する", async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
    }
    const fetch = vi.fn().mockResolvedValue(response)
    vi.stubGlobal("fetch", fetch)

    await expect(fetchJson("/api/example.json")).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith("/api/example.json", { cache: "no-store" })
    expect(response.json).toHaveBeenCalledTimes(1)
  })

  it("204 No Content は JSON として解析せず null を返す", async () => {
    const response = { ok: true, status: 204, json: vi.fn() }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response))

    await expect(fetchJson("/api/example.json")).resolves.toBeNull()
    expect(response.json).not.toHaveBeenCalled()
  })

  it("HTTP エラー時は例外を投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn().mockRejectedValue(new Error("invalid json")),
      }),
    )

    await expect(fetchJson("/api/example.json")).rejects.toThrow("Request failed with status 503")
  })

  it("API エラー契約を ApiError として解釈する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 504,
        json: vi.fn().mockResolvedValue({
          error: {
            code: "upstream_timeout",
            message: "Upstream service request timed out.",
            request_id: "req-123",
          },
        }),
      }),
    )

    await expect(fetchJson("/api/example.json")).rejects.toMatchObject({
      name: "ApiError",
      status: 504,
      code: "upstream_timeout",
      message: "Upstream service request timed out.",
      requestId: "req-123",
    })
  })

  it("postJson で JSON body を送る", async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({ id: "ranking-1" }),
    }
    const fetch = vi.fn().mockResolvedValue(response)
    vi.stubGlobal("fetch", fetch)

    await expect(postJson("/api/example.json", { score: 1234 })).resolves.toEqual({ id: "ranking-1" })
    expect(fetch).toHaveBeenCalledWith("/api/example.json", {
      cache: "no-store",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ score: 1234 }),
    })
  })

  it("表示用メッセージはコード別文言を優先する", () => {
    const error = new ApiError({
      status: 504,
      code: "upstream_timeout",
      message: "Upstream service request timed out.",
    })

    expect(
      getApiErrorDisplayMessage(error, "取得に失敗しました。", {
        upstream_timeout: "タイムアウトしました。",
      }),
    ).toBe("タイムアウトしました。")
  })
})
