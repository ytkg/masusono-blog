import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import AdminArticles from "./AdminArticles"

function jsonResponse(body) {
  return { ok: true, status: 200, json: async () => body }
}

afterEach(() => vi.unstubAllGlobals())

describe("AdminArticles", () => {
  it("タイトルと公開状態を組み合わせて検索し、続きを読み込む", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ articles: [], total_count: 0, has_more: false, page: 1 }))
      .mockResolvedValueOnce(
        jsonResponse({
          articles: [
            { id: "draft", title: "下書きタイトル", status: "PUBLISH_AND_DRAFT", updated_at: "2026-01-02T00:00:00Z" },
          ],
          total_count: 2,
          has_more: true,
          page: 1,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          articles: [{ id: "other", title: "下書きの続き", status: "DRAFT", updated_at: "2026-01-01T00:00:00Z" }],
          total_count: 2,
          has_more: false,
          page: 2,
        }),
      )
    vi.stubGlobal("fetch", fetch)

    render(<AdminArticles onBack={vi.fn()} onUnauthorized={vi.fn()} />)
    await screen.findByText("記事が見つかりませんでした。")
    fireEvent.change(screen.getByRole("textbox", { name: "タイトルで検索" }), { target: { value: "下書き" } })
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "公開状態" }))
    fireEvent.click(await screen.findByRole("option", { name: "公開中・下書きあり" }))
    fireEvent.click(screen.getByRole("button", { name: "検索" }))

    expect(await screen.findByText("下書きタイトル")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "公開状態" })).toHaveTextContent("公開中・下書きあり")
    expect(within(screen.getByRole("listitem")).getByText("公開中・下書きあり")).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      "/api/app/management/articles?page=1&status=published_and_draft&q=%E4%B8%8B%E6%9B%B8%E3%81%8D",
      expect.any(Object),
    )

    fireEvent.click(screen.getByRole("button", { name: "もっと見る" }))
    await waitFor(() => expect(screen.getByText("下書きの続き")).toBeInTheDocument())
    expect(fetch).toHaveBeenCalledWith(
      "/api/app/management/articles?page=2&status=published_and_draft&q=%E4%B8%8B%E6%9B%B8%E3%81%8D",
      { cache: "no-store" },
    )
  })
})
