import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import AdminMedia from "./media"

vi.mock("../../shared/SeoHead", () => ({ default: () => null }))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("AdminMedia", () => {
  const first = {
    id: "first",
    url: "https://images.microcms-assets.io/assets/first.png",
    width: 100,
    height: 80,
    createdAt: "2026-09-01T00:00:00Z",
  }

  it("画像の詳細を開く", () => {
    render(<AdminMedia media={[first]} total_count={1} />)

    fireEvent.click(screen.getByRole("button", { name: "first.pngの詳細を表示" }))

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("画像サイズ: 100 × 80 px")).toBeInTheDocument()
  })

  it("次のメディアを追加する", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      redirected: false,
      json: async () => ({
        media: [{ id: "second", url: "https://example.com/second.pdf" }],
        page: 2,
        has_more: false,
      }),
    })
    vi.stubGlobal("fetch", fetchMock)
    render(<AdminMedia media={[first]} total_count={2} has_more />)

    fireEvent.click(screen.getByRole("button", { name: "もっと見る" }))

    expect(await screen.findByRole("button", { name: "second.pdfの詳細を表示" })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/admin/media.json?page=2"), expect.any(Object))
    await waitFor(() => expect(screen.queryByRole("button", { name: "もっと見る" })).not.toBeInTheDocument())
  })
})
