import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import AdminMedia from "./AdminMedia"

function jsonResponse(body) {
  return { ok: true, status: 200, json: async () => body }
}

afterEach(() => vi.unstubAllGlobals())

describe("AdminMedia", () => {
  it("ファイル名で検索してもページを移動しない", async () => {
    const initialPath = window.location.pathname
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ media: [], total_count: 0, has_more: false, page: 1 }))
      .mockResolvedValueOnce(
        jsonResponse({
          media: [{ id: "logo", url: "https://example.com/logo.png", width: 100, height: 100 }],
          total_count: 1,
          has_more: false,
          page: 1,
        }),
      )
    vi.stubGlobal("fetch", fetch)

    render(<AdminMedia onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    await screen.findByText("メディアが見つかりませんでした。")
    fireEvent.change(screen.getByRole("textbox", { name: "ファイル名で検索" }), { target: { value: "logo" } })
    fireEvent.click(screen.getByRole("button", { name: "検索" }))

    expect(await screen.findByRole("button", { name: "logo.pngの詳細を表示" })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith("/api/app/management/media?page=1&q=logo", expect.any(Object))
    expect(window.location.pathname).toBe(initialPath)
  })

  it("画像を開き、追加ページを読み込む", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          media: [{ id: "image-1", url: "https://example.com/first.png", width: 320, height: 240 }],
          total_count: 2,
          has_more: true,
          next_token: "next",
          page: 1,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          media: [{ id: "image-2", url: "https://example.com/second.png", width: 320, height: 240 }],
          total_count: 2,
          has_more: false,
          page: 2,
        }),
      )
    vi.stubGlobal("fetch", fetch)

    render(<AdminMedia onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    await screen.findByRole("button", { name: "first.pngの詳細を表示" })
    fireEvent.click(screen.getByRole("button", { name: "もっと見る" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "second.pngの詳細を表示" })).toBeInTheDocument())
    expect(fetch).toHaveBeenCalledWith("/api/app/management/media?page=2&token=next", { cache: "no-store" })

    fireEvent.click(screen.getByRole("button", { name: "first.pngの詳細を表示" }))
    expect(screen.getByText("画像サイズ: 320 × 240 px")).toBeInTheDocument()
  })
})
