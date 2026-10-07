import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import AdminMedia from "./AdminMedia"
import { jsonResponse } from "@/test/jsonResponse"

function errorResponse(status, body) {
  return { ok: false, status, json: async () => body }
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
          media: [
            {
              id: "image-1",
              url: "https://example.com/first.png",
              width: 320,
              height: 240,
              createdAt: "2026-01-01T15:00:00Z",
            },
          ],
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
    expect(fetch).toHaveBeenCalledWith("/api/app/management/media?page=2&token=next", {
      cache: "no-store",
      signal: expect.any(AbortSignal),
    })

    fireEvent.click(screen.getByRole("button", { name: "first.pngの詳細を表示" }))
    expect(screen.getByText("画像サイズ: 320 × 240 px")).toBeInTheDocument()
    expect(screen.getByText("登録日時: 2026/1/2 0:00:00")).toBeInTheDocument()
  })

  it("画像をアップロード後、検索を解除して一覧を更新する", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ media: [], total_count: 0, has_more: false, page: 1 }))
      .mockResolvedValueOnce(jsonResponse({ media: { id: "new-image" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          media: [{ id: "new-image", url: "https://example.com/new.png", width: 100, height: 100 }],
          total_count: 1,
          has_more: false,
          page: 1,
        }),
      )
    vi.stubGlobal("fetch", fetch)

    const { container } = render(<AdminMedia csrfToken="csrf-token" onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    await screen.findByText("メディアが見つかりませんでした。")
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [new File(["image"], "new.png", { type: "image/png" })] } })

    expect(await screen.findByRole("button", { name: "new.pngの詳細を表示" })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      "/api/app/management/media",
      expect.objectContaining({
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-Token": "csrf-token" },
      }),
    )
    expect(fetch).toHaveBeenCalledWith("/api/app/management/media?page=1", expect.any(Object))
  })

  it("画像以外を送信せず理由を表示する", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ media: [], total_count: 0, has_more: false, page: 1 }))
    vi.stubGlobal("fetch", fetch)

    const { container } = render(<AdminMedia csrfToken="csrf-token" onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    await screen.findByText("メディアが見つかりませんでした。")
    fireEvent.change(container.querySelector('input[type="file"]'), {
      target: { files: [new File(["text"], "memo.txt", { type: "text/plain" })] },
    })

    expect(screen.getByRole("alert")).toHaveTextContent("画像ファイルを選択してください。")
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("アップロード失敗時に理由を表示し、再試行できる", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ media: [], total_count: 0, has_more: false, page: 1 }))
      .mockResolvedValueOnce(
        errorResponse(502, { error: { code: "media_upload_failed", message: "アップロードできませんでした。" } }),
      )
      .mockResolvedValueOnce(jsonResponse({ media: { id: "new-image" } }))
      .mockResolvedValueOnce(jsonResponse({ media: [], total_count: 0, has_more: false, page: 1 }))
    vi.stubGlobal("fetch", fetch)

    const { container } = render(<AdminMedia csrfToken="csrf-token" onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    await screen.findByText("メディアが見つかりませんでした。")
    const input = container.querySelector('input[type="file"]')
    const file = new File(["image"], "new.png", { type: "image/png" })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByRole("alert")).toHaveTextContent("アップロードできませんでした。")
    expect(screen.getByRole("button", { name: "アップロード" })).toBeEnabled()

    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4))
  })
  it("5MBを超える画像を送信せず、入力をリセットする", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ media: [], total_count: 0, has_more: false, page: 1 }))
    vi.stubGlobal("fetch", fetch)
    const { container } = render(<AdminMedia onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    await screen.findByText("メディアが見つかりませんでした。")
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByRole("alert")).toHaveTextContent("画像ファイルは5MB以下にしてください。")
    expect(input.value).toBe("")
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("非画像メディアの詳細情報を表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          media: [
            {
              id: "file",
              url: "https://example.com/memo.pdf",
              alt: "資料",
              tags: ["メモ"],
              createdAt: "2026-01-01T00:00:00Z",
            },
          ],
          total_count: 1,
          has_more: false,
          page: 1,
        }),
      ),
    )
    render(<AdminMedia onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    fireEvent.click(await screen.findByRole("button", { name: "memo.pdfの詳細を表示" }))
    expect(screen.getByRole("dialog", { name: "memo.pdf" })).toBeInTheDocument()
    expect(screen.getByText("代替テキスト: 資料")).toBeInTheDocument()
    expect(screen.getByText("タグ: メモ")).toBeInTheDocument()
    expect(screen.queryByText(/画像サイズ:/)).not.toBeInTheDocument()
  })
})
