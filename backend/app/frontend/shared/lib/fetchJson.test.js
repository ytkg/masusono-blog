import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchJson } from "./fetchJson"

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

  it("HTTP エラー時は例外を投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )

    await expect(fetchJson("/api/example.json")).rejects.toThrow("Request failed with status 503")
  })
})
