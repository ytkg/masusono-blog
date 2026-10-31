import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleActions from "./ArticleActions"
import { ensureUserIdCookie } from "@/shared/lib/userId"

vi.mock("@/shared/lib/userId", () => ({ ensureUserIdCookie: vi.fn() }))

describe("ArticleActions", () => {
  function openArticleMenu() {
    fireEvent.click(screen.getByRole("button", { name: "記事メニューを開く" }))
  }

  function mockClipboard(writeText) {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
  }

  it("記事URLをコピーして完了メッセージを表示する", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)

    render(<ArticleActions article={{ id: "article-1" }} />)

    openArticleMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: "記事URLをコピー" }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("http://localhost:3000/articles/article-1")
    })
    expect(await screen.findByText("記事URLをコピーしました")).toBeInTheDocument()
  })

  it("コピーに失敗した場合はエラーメッセージを表示する", async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error("denied")))

    render(<ArticleActions article={{ id: "article-1" }} />)

    openArticleMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: "記事URLをコピー" }))

    expect(await screen.findByText("記事URLをコピーできませんでした")).toBeInTheDocument()
  })
  it("失敗が時間経過と外側のクリックで消えず、再試行できる", async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValue(undefined)
    mockClipboard(writeText)
    render(<ArticleActions article={{ id: "article-1" }} />)
    openArticleMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: "記事URLをコピー" }))
    await screen.findByText("記事URLをコピーできませんでした")
    vi.useFakeTimers()
    try {
      await vi.advanceTimersByTimeAsync(4000)
      fireEvent.click(document.body)
      expect(screen.getByRole("alert")).toHaveTextContent("失敗")
    } finally {
      vi.useRealTimers()
    }
    fireEvent.click(screen.getByRole("button", { name: "再試行" }))
    expect(await screen.findByText("記事URLをコピーしました")).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument())
  })
  it("タイトルと省略されていない本文をコピーする", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const body = "長い本文".repeat(40)
    render(
      <ArticleActions article={{ id: "article-1", title: "記事タイトル", content: `<p>${body}</p><p>続き</p>` }} />,
    )
    openArticleMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: "記事全文をコピー" }))
    expect(await screen.findByText("記事全文をコピーしました")).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(`記事タイトル\n\n${body}\n\n続き`)
  })

  it("全文コピーに失敗したときは全文コピーを再試行する", async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValue(undefined)
    mockClipboard(writeText)
    render(<ArticleActions article={{ id: "article-1", title: "タイトル", content: "<p>本文</p>" }} />)
    openArticleMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: "記事全文をコピー" }))
    expect(await screen.findByText("記事全文をコピーできませんでした")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "再試行" }))
    expect(await screen.findByText("記事全文をコピーしました")).toBeInTheDocument()
    expect(writeText).toHaveBeenNthCalledWith(2, "タイトル\n\n本文")
  })
})

it("連続コピーの成功通知を新しいコピーから3秒間保持する", async () => {
  vi.useFakeTimers()
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue() },
  })
  const { unmount } = render(<ArticleActions article={{ id: "repeat" }} />)
  const copy = async () => {
    fireEvent.click(screen.getByRole("button", { name: "記事メニューを開く" }))
    fireEvent.click(screen.getByRole("menuitem", { name: "記事URLをコピー" }))
    await act(async () => Promise.resolve())
  }
  try {
    await copy()
    await act(async () => vi.advanceTimersByTimeAsync(2500))
    await copy()
    await act(async () => vi.advanceTimersByTimeAsync(1000))
    expect(screen.getByRole("alert")).toHaveTextContent("コピーしました")
    await act(async () => vi.advanceTimersByTimeAsync(2250))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  } finally {
    unmount()
    vi.useRealTimers()
  }
})

it.each([false, true])("古いコピーの完了は新しい全文コピー通知を上書きしない reject=%s", async (reject) => {
  let finishOld
  const pending = new Promise((resolve, fail) => {
    finishOld = () => (reject ? fail(new Error("old failure")) : resolve())
  })
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockReturnValueOnce(pending).mockResolvedValue(undefined) },
  })
  render(<ArticleActions article={{ id: "a", title: "題名", content: "<p>本文</p>" }} />)
  fireEvent.click(screen.getByRole("button", { name: "記事メニューを開く" }))
  fireEvent.click(screen.getByRole("menuitem", { name: "記事URLをコピー" }))
  fireEvent.click(screen.getByRole("button", { name: "記事メニューを開く" }))
  fireEvent.click(screen.getByRole("menuitem", { name: "記事全文をコピー" }))
  expect(await screen.findByText("記事全文をコピーしました")).toBeInTheDocument()
  await act(async () => finishOld())
  expect(screen.getByRole("alert")).toHaveTextContent("記事全文をコピーしました")
})

it("Cookieを取得できない場合は遷移せず理由を表示する", async () => {
  ensureUserIdCookie.mockReturnValue(null)
  render(<ArticleActions article={{ id: "a" }} />)
  fireEvent.click(screen.getByRole("button", { name: "記事メニューを開く" }))
  fireEvent.click(screen.getByRole("menuitem", { name: "広告を出稿する" }))
  expect(await screen.findByRole("alert")).toHaveTextContent("ブラウザのCookie設定を確認してください。")
  expect(screen.queryByRole("button", { name: "再試行" })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "閉じる" }))
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument())
})
