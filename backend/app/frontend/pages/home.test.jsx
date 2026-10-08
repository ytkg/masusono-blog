import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { requestHomeFeed } from "@/shared/lib/homeNavigation"
import Home from "./home"
import { requestJson } from "@/shared/lib/fetchJson"

vi.mock("@/shared/lib/fetchJson", () => ({ requestJson: vi.fn() }))

const rememberedStates = vi.hoisted(() => new Map())

vi.mock("@inertiajs/react", async (importOriginal) => {
  const React = await import("react")

  return {
    ...(await importOriginal()),
    router: { remember: vi.fn(), on: vi.fn(() => () => {}) },
    useRemember: (initialState, key) => {
      const [state, setState] = React.useState(() => rememberedStates.get(key) ?? initialState)
      const setRememberedState = (nextState) => {
        setState((currentState) => {
          const resolvedState = typeof nextState === "function" ? nextState(currentState) : nextState
          rememberedStates.set(key, resolvedState)
          return resolvedState
        })
      }

      return [state, setRememberedState]
    },
  }
})

vi.mock("../shared/SeoHead", () => ({
  default: () => <div>seo</div>,
}))

vi.mock("../features/blog/ArticlesList", () => ({
  default: ({ articles, emptyMessage }) => (
    <div data-testid="articles-list">
      <a href="/articles/article-1" onClick={(event) => event.preventDefault()}>
        記事へ
      </a>
      <a href="/authors/author-1" onClick={(event) => event.preventDefault()}>
        著者へ
      </a>
      articles:{articles.length}
      {emptyMessage ? ` empty:${emptyMessage}` : null}
    </div>
  ),
}))

vi.mock("../features/blog/SentenceFeed", () => ({
  default: ({ articles }) => <div data-testid="sentence-feed">articles:{articles.length}</div>,
}))

vi.mock("@/shared/lib/userId", () => ({
  ensureUserIdCookie: vi.fn(),
}))

describe("Home page", () => {
  it("カレンダーを開いたときだけ全期間を取得し、切り替え後も取得済み一覧を維持する", async () => {
    requestJson.mockResolvedValue({
      groups: [
        { monthDay: "01/01", articles: [{ id: "new" }, { id: "old" }] },
        { monthDay: "02/29", articles: [{ id: "leap" }] },
      ],
    })
    render(<Home articles={[]} pagination={{ nextOffset: 10 }} />)
    expect(requestJson).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("tab", { name: "カレンダー" }))
    expect(await screen.findByRole("heading", { name: "1月1日" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "2月29日" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "さらに読み込む" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
    fireEvent.click(screen.getByRole("tab", { name: "カレンダー" }))
    expect(requestJson).toHaveBeenCalledTimes(1)
  })

  it("カレンダーの取得失敗から再試行し、空の一覧を表示する", async () => {
    requestJson.mockRejectedValueOnce(new Error("failed")).mockResolvedValueOnce({ groups: [] })
    render(<Home articles={[]} />)
    fireEvent.click(screen.getByRole("tab", { name: "カレンダー" }))
    fireEvent.click(await screen.findByRole("button", { name: "再試行" }))
    expect(await screen.findByText("記事がありません。")).toBeInTheDocument()
    expect(requestJson).toHaveBeenCalledTimes(2)
  })

  afterEach(() => {
    rememberedStates.clear()
    window.sessionStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    requestJson.mockReset()
  })

  it("ブログ記事一覧を表示し user_id cookie を確保する", async () => {
    const { ensureUserIdCookie } = await import("@/shared/lib/userId")

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(ensureUserIdCookie).toHaveBeenCalledTimes(1)
    expect(screen.getByText("seo")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "ブログ" })).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "false")
    expect(screen.queryByRole("textbox", { name: "記事を検索" })).not.toBeInTheDocument()
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
  })

  it("タブを切り替えた時点でホームの表示状態を履歴へ保存する", async () => {
    const { router } = await import("@inertiajs/react")
    router.remember.mockClear()

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))

    expect(router.remember).toHaveBeenLastCalledWith({ mode: "feed", version: 2 }, "home-state")
  })

  it("タブ変更を直ちにブラウザ履歴へ保存し、他の履歴情報を維持する", () => {
    window.history.replaceState({ page: { url: "/", rememberedState: { other: "preserved" } } }, "")
    render(<Home articles={[]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))

    expect(window.history.state.page.rememberedState).toEqual({
      other: "preserved",
      "home-state": { mode: "beginnings", version: 2 },
    })
    window.history.replaceState(null, "")
  })

  it("履歴から戻ったホームでも直前に選んだタブを復元する", () => {
    const screenOne = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    screenOne.unmount()
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "true")
  })

  it("削除済みタブの履歴状態はフィードへフォールバックする", () => {
    rememberedStates.set("home-state", {
      mode: "retired-tab",
      version: 1,
    })

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  })

  it("書き出しからフィードへ切り替えた後に別ページから戻るとフィードを復元する", () => {
    const home = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
    home.unmount() // 著者ページへ遷移
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />) // 戻る

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  })

  it("別ページからホームを明示的に開く場合はフィードから表示する", () => {
    rememberedStates.set("home-state", {
      mode: "beginnings",
      version: 1,
    })
    requestHomeFeed()

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "false")

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))

    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "true")
  })

  it("明示的なホーム遷移の初期化後も、次の戻るではフィードを復元する", () => {
    rememberedStates.set("home-state", {
      mode: "beginnings",
      version: 1,
    })
    requestHomeFeed()
    const home = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    home.unmount() // 記事ページへ遷移
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />) // 戻る

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  })

  it("下端付近で次のページを取得し、重複記事を除いて追加する", async () => {
    let onIntersect
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback) {
          onIntersect = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    requestJson.mockResolvedValue({ articles: [{ id: "one" }, { id: "two" }], pagination: { nextOffset: null } })
    render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)

    await act(async () => {
      onIntersect([{ isIntersecting: true }])
      onIntersect([{ isIntersecting: true }])
    })

    expect(requestJson).toHaveBeenCalledTimes(1)

    expect(requestJson).toHaveBeenCalledWith(
      "/api/app/articles?offset=10",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2")
    expect(screen.queryByRole("button", { name: "さらに読み込む" })).not.toBeInTheDocument()
  })

  it("通信失敗で既存記事を維持し、同じ位置から再試行できる", async () => {
    requestJson
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ articles: [{ id: "two" }], pagination: { nextOffset: null } })
    render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)

    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    await screen.findByText("記事を読み込めませんでした。")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
    fireEvent.click(screen.getByRole("button", { name: "再試行" }))
    await waitFor(() => expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2"))
    expect(requestJson.mock.calls.map(([url]) => url)).toEqual([
      "/api/app/articles?offset=10",
      "/api/app/articles?offset=10",
    ])
  })

  it("読み込み済みの記事と次の位置を履歴から復元し、タブ間で共有する", async () => {
    requestJson.mockResolvedValue({ articles: [{ id: "two" }], pagination: { nextOffset: 20 } })
    const home = render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    await waitFor(() => expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2"))
    home.unmount()
    render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2")
    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    expect(screen.getByTestId("sentence-feed")).toHaveTextContent("articles:2")
    expect(requestJson).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    await waitFor(() => expect(requestJson.mock.calls[1][0]).toBe("/api/app/articles?offset=20"))
  })

  it("連続した下端検知でも同時リクエストを作らず、離脱すると中断する", () => {
    requestJson.mockReturnValue(new Promise(() => {}))
    const home = render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    expect(screen.getByText("記事を読み込んでいます…")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "さらに読み込む" })).not.toBeInTheDocument()
    const signal = requestJson.mock.calls[0][1].signal
    home.unmount()
    expect(signal.aborted).toBe(true)
    expect(requestJson).toHaveBeenCalledTimes(1)
  })
})
