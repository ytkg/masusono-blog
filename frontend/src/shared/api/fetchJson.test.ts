import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchJson } from "./fetchJson"

describe("fetchJson", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("正常レスポンス時はJSONを返し、no-storeでfetchする", async () => {
    const payload = { ok: true }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchJson<typeof payload>("https://example.com/api")

    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api", { cache: "no-store" })
  })

  it("非200レスポンス時はステータス付きエラーを投げる", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(fetchJson("https://example.com/api")).rejects.toThrow("APIリクエスト失敗: 500 Internal Server Error")
  })
})
