import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
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
      const setRememberedState = React.useCallback(
        (nextState) => {
          setState((currentState) => {
            const resolvedState = typeof nextState === "function" ? nextState(currentState) : nextState
            rememberedStates.set(key, resolvedState)
            return resolvedState
          })
        },
        [key],
      )

      return [state, setRememberedState]
    },
  }
})

vi.mock("../shared/components/SeoHead", () => ({
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
  default: ({ articles, hasMore }) => (
    <div data-testid="sentence-feed" data-has-more={String(hasMore)}>
      articles:{articles.length}
    </div>
  ),
}))

vi.mock("@/shared/lib/userId", () => ({
  ensureUserIdCookie: vi.fn(),
}))

describe("Home page", () => {
  beforeEach(() => {
    requestJson.mockResolvedValue({ articles: [] })
  })

  it("今月を未選択で開き、日付選択・月変更・タブ間の状態保持ができる", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00+09:00"))
    requestJson.mockResolvedValue({
      groups: [
        { monthDay: "01/01", articles: [{ id: "new" }, { id: "old" }] },
        { monthDay: "02/29", articles: [{ id: "leap" }] },
      ],
    })
    render(<Home articles={[]} />)
    expect(requestJson).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("tab", { name: "こよみ" }))
    const first = await screen.findByRole("button", { name: "1月1日、記事2件" })
    expect(first).toHaveAttribute("aria-current", "date")
    expect(first).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByRole("button", { name: "1月2日、記事0件" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "1月31日、記事0件" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "1月1日" })).not.toBeInTheDocument()
    fireEvent.click(first)
    expect(first).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("heading", { name: "1月1日" })).toBeInTheDocument()
    expect(screen.getByText("articles:2")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "翌月" }))
    expect(screen.queryByRole("heading", { name: "1月1日" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "2月30日、記事0件" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "2月29日、記事1件" }))
    expect(screen.getByRole("heading", { name: "2月29日" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
    fireEvent.click(screen.getByRole("tab", { name: "こよみ" }))
    expect(requestJson).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("heading", { name: "2月29日" })).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "月" }))
    fireEvent.click(screen.getByRole("option", { name: "12月", exact: true }))
    expect(screen.queryByRole("heading", { name: "2月29日" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "翌月" }))
    expect(screen.getByRole("button", { name: "1月1日、記事2件" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "前月" }))
    expect(screen.getByRole("button", { name: "12月31日、記事0件" })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it("こよみの取得失敗から再試行し、空の一覧を表示する", async () => {
    let rejectInitialRequest
    let resolveRetryRequest
    requestJson
      .mockReturnValueOnce(
        new Promise((_, reject) => {
          rejectInitialRequest = reject
        }),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRetryRequest = resolve
        }),
      )
    render(<Home articles={[]} />)
    fireEvent.click(screen.getByRole("tab", { name: "こよみ" }))
    await act(async () => {
      rejectInitialRequest(new Error("failed"))
    })
    expect(requestJson).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "再試行" }))
    expect(requestJson).toHaveBeenCalledTimes(2)
    await act(async () => {
      resolveRetryRequest({ groups: [] })
    })
    expect(await screen.findByText("記事がありません。")).toBeInTheDocument()
    expect(requestJson).toHaveBeenCalledTimes(2)
  })

  afterEach(() => {
    rememberedStates.clear()
    window.sessionStorage.clear()
    vi.useRealTimers()
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

    expect(router.remember).toHaveBeenLastCalledWith({ mode: "feed" }, "home-state")
  })

  it("タブ変更を直ちにブラウザ履歴へ保存し、他の履歴情報を維持する", () => {
    window.history.replaceState({ page: { url: "/", rememberedState: { other: "preserved" } } }, "")
    render(<Home articles={[]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))

    expect(window.history.state.page.rememberedState).toEqual({
      other: "preserved",
      "home-state": { mode: "beginnings" },
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

  it.each([{ mode: "retired-tab", version: 1 }, {}, { mode: null }])(
    "無効なタブの履歴状態はフィードへフォールバックする: %j",
    (state) => {
      rememberedStates.set("home-state", state)

      render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

      expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    },
  )

  it("以前のバージョン付き履歴からも選んだタブを復元する", () => {
    rememberedStates.set("home-state", { mode: "beginnings", version: 1 })

    render(<Home articles={[]} />)

    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "true")
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

  it("フィードの読み込み済み記事と次の位置を履歴から復元する", async () => {
    requestJson.mockResolvedValue({ articles: [{ id: "two" }], pagination: { nextOffset: 20 } })
    const home = render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    await waitFor(() => expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2"))
    home.unmount()
    render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2")
    expect(requestJson).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    await waitFor(() => expect(requestJson.mock.calls[1][0]).toBe("/api/app/articles?offset=20"))
  })

  it("連続した下端検知でも同時リクエストを作らず、離脱すると中断する", () => {
    requestJson.mockReturnValue(new Promise(() => {}))
    const home = render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    expect(screen.getByText("記事を読み込んでいます…")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "さらに読み込む" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    expect(requestJson).toHaveBeenCalledOnce()
    const signal = requestJson.mock.calls[0][1].signal
    home.unmount()
    expect(signal.aborted).toBe(true)
    expect(requestJson).toHaveBeenCalledTimes(1)
  })

  it("書き出しを開いたときだけ全期間を取得し、フィードのページと独立して保持する", async () => {
    const all = Array.from({ length: 120 }, (_, index) => ({ id: `article-${index}`, content: "本文。" }))
    requestJson.mockResolvedValue({ articles: all })
    render(<Home articles={[all[0]]} pagination={{ nextOffset: 10 }} />)
    expect(requestJson).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    expect(screen.queryByTestId("sentence-feed")).not.toBeInTheDocument()
    expect(await screen.findByTestId("sentence-feed")).toHaveTextContent("articles:120")
    expect(screen.getByTestId("sentence-feed")).toHaveAttribute("data-has-more", "false")
    expect(screen.queryByRole("button", { name: "さらに読み込む" })).not.toBeInTheDocument()
    expect(requestJson.mock.calls[0][0]).toBe("/api/app/sentence_articles")
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    expect(screen.getByTestId("sentence-feed")).toHaveTextContent("articles:120")
    expect(requestJson).toHaveBeenCalledOnce()
  })

  it("書き出しの取得失敗時は最近の記事を表示せず再試行できる", async () => {
    requestJson.mockRejectedValueOnce(new Error("unavailable")).mockResolvedValueOnce({ articles: [] })
    render(<Home articles={[{ id: "recent" }]} />)
    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    fireEvent.click(await screen.findByRole("button", { name: "再試行" }))
    expect(await screen.findByTestId("sentence-feed")).toHaveTextContent("articles:0")
  })

  it.each([[{}], [null], [{ monthDay: 12, articles: [] }], [{ monthDay: "01/01", articles: null }]])(
    "不正なこよみグループを保存せず再試行できる: %j",
    async (...groups) => {
      requestJson.mockResolvedValueOnce({ groups }).mockResolvedValueOnce({ groups: [] })
      render(<Home articles={[]} />)
      fireEvent.click(screen.getByRole("tab", { name: "こよみ" }))
      expect(await screen.findByText("記事を読み込めませんでした。")).toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: "再試行" }))
      expect(await screen.findByText("記事がありません。")).toBeInTheDocument()
    },
  )

  describe.each([
    {
      tab: "こよみ",
      key: "home-calendar",
      field: "groups",
      endpoint: "/api/app/calendar_articles",
      collection: [{ monthDay: "01/01", articles: [] }],
      loadedText: "前月",
    },
    {
      tab: "書き出し",
      key: "home-sentence-articles",
      field: "articles",
      endpoint: "/api/app/sentence_articles",
      collection: [{ id: "current", content: "現在の記事。" }],
      loadedText: "articles:1",
    },
  ])("$tab の取得と履歴", ({ tab, key, field, endpoint, collection, loadedText }) => {
    it("離脱した取得を中断し、再取得後の画面・履歴を遅い旧応答で上書きしない", async () => {
      const { router } = await import("@inertiajs/react")
      const oldRequest = Promise.withResolvers()
      const currentRequest = Promise.withResolvers()
      requestJson.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(currentRequest.promise)
      const home = render(<Home articles={[]} />)
      fireEvent.click(screen.getByRole("tab", { name: tab }))
      const oldSignal = requestJson.mock.calls[0][1].signal
      fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
      expect(oldSignal.aborted).toBe(true)
      expect(rememberedStates.has(key)).toBe(false)
      fireEvent.click(screen.getByRole("tab", { name: tab }))
      expect(requestJson.mock.calls.map(([url]) => url)).toEqual([endpoint, endpoint])
      expect(requestJson.mock.calls[1][1].signal.aborted).toBe(false)
      window.history.replaceState({ page: { rememberedState: { other: "preserved" } } }, "")
      try {
        await act(async () => currentRequest.resolve({ [field]: collection }))
        expect(
          tab === "こよみ" ? screen.getByRole("button", { name: loadedText }) : screen.getByText(loadedText),
        ).toBeInTheDocument()
        const currentHistory = structuredClone(window.history.state)
        expect(currentHistory.page.rememberedState).toEqual({ other: "preserved", [key]: collection })
        router.remember.mockClear()

        // Abortを無視して完了する通信でも、古い結果を履歴に書き込ませない。
        await act(async () => oldRequest.resolve({ [field]: [] }))
        expect(
          tab === "こよみ" ? screen.getByRole("button", { name: loadedText }) : screen.getByText(loadedText),
        ).toBeInTheDocument()
        expect(rememberedStates.get(key)).toEqual(collection)
        expect(window.history.state).toEqual(currentHistory)
        expect(router.remember).not.toHaveBeenCalled()
        home.unmount()
        render(<Home articles={[]} />)
        expect(
          tab === "こよみ" ? screen.getByRole("button", { name: loadedText }) : screen.getByText(loadedText),
        ).toBeInTheDocument()
        expect(requestJson).toHaveBeenCalledTimes(2)
      } finally {
        window.history.replaceState(null, "")
      }
    })

    it("取得済みの空配列を復元し、未取得として再リクエストしない", () => {
      rememberedStates.set(key, [])
      render(<Home articles={[]} />)
      fireEvent.click(screen.getByRole("tab", { name: tab }))
      expect(screen.getByText(tab === "こよみ" ? "記事がありません。" : "articles:0")).toBeInTheDocument()
      expect(screen.queryByText("記事を読み込んでいます…")).not.toBeInTheDocument()
      expect(requestJson).not.toHaveBeenCalled()
    })
  })

  it.each([
    {},
    { articles: null },
    { articles: {} },
    { articles: [null] },
    { articles: [{ id: 1, content: "本文" }] },
    { articles: [{ id: "one", content: null }] },
  ])("不正な書き出し応答を履歴に保存せず、同じURLから再試行する: %j", async (payload) => {
    requestJson.mockResolvedValueOnce(payload).mockResolvedValueOnce({ articles: [] })
    render(<Home articles={[{ id: "recent" }]} />)
    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    expect(await screen.findByText("記事を読み込めませんでした。")).toBeInTheDocument()
    expect(screen.queryByTestId("sentence-feed")).not.toBeInTheDocument()
    expect(rememberedStates.has("home-sentence-articles")).toBe(false)
    fireEvent.click(screen.getByRole("button", { name: "再試行" }))
    expect(await screen.findByTestId("sentence-feed")).toHaveTextContent("articles:0")
    expect(requestJson.mock.calls.map(([url]) => url)).toEqual([
      "/api/app/sentence_articles",
      "/api/app/sentence_articles",
    ])
    expect(rememberedStates.get("home-sentence-articles")).toEqual([])
  })

  it("離脱前のフィード応答を無視し、別ページの履歴を汚さず同じ位置から再取得する", async () => {
    const oldRequest = Promise.withResolvers()
    requestJson.mockReturnValueOnce(oldRequest.promise)
    const home = render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
    fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
    const signal = requestJson.mock.calls[0][1].signal
    home.unmount()
    expect(signal.aborted).toBe(true)
    const otherPage = { page: { url: "/about", rememberedState: { other: "preserved" } } }
    window.history.replaceState(otherPage, "")
    try {
      await act(async () => oldRequest.resolve({ articles: [{ id: "stale" }], pagination: { nextOffset: null } }))
      expect(window.history.state).toEqual(otherPage)
      expect(rememberedStates.has("home-articles")).toBe(false)
      requestJson.mockResolvedValueOnce({ articles: [{ id: "two" }], pagination: { nextOffset: null } })
      render(<Home articles={[{ id: "one" }]} pagination={{ nextOffset: 10 }} />)
      fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }))
      await waitFor(() => expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2"))
      expect(requestJson.mock.calls.map(([url]) => url)).toEqual([
        "/api/app/articles?offset=10",
        "/api/app/articles?offset=10",
      ])
      expect(rememberedStates.get("home-articles")).toEqual({
        articles: [{ id: "one" }, { id: "two" }],
        nextOffset: null,
      })
    } finally {
      window.history.replaceState(null, "")
    }
  })
})
